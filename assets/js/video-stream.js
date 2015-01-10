VideoStream = function( options ){
	this.el = options.el;
	// this is executed when the tag is inserted
	var video = this.el;

	// organize available streams
	this._sources();

	this._setupSizes();

	// load the first stream
	video.src = this.loadStream();

	// events
	window.addEventListener('resize', _.bind( this._resize, this ), false);
	video.addEventListener('progress', _.bind( this._progress, this ), false);
	video.addEventListener('playing', function(){ video.isPlaying }, false);
	// update isPlaying on stop?
}

VideoStream.prototype = {

	constructor: VideoStream,

	// params
	_size: {
		window: 0, // this is the size of the video container
		max: 0, // this is the maximum resolution from the available sources
		min: 0, // this is the smallest resolution from the available sources
		target: 0, // this is the optimal video source (based on resolution)
		active: 0 // this is the running video source
	},
	_speed: {
		buffered: 0,
		timestamp: 0,
		rate: 0,
		percent: 0
	},
	// public methods
	// - update window size
	refresh: function(){
		this.loadStream();
		this.updateStream();
	},

	// - returns video dimensions
	getSize: function(){
		var video = this.el;
		// initially video size is set to the max dimensions
		var target = this._size.max;
		// get video dimensions
		var window = {
			width: video.offsetWidth || video.clientWidth || 0,
			height: video.offsetHeight || video.clientHeight || 0,
		}
		// if the video container has dimensions use that as a reference
		if( window.width && window.height ){
			target = window;
		}
		// check memory
		var memory = this._memory();
		// * convention - if reaching memory limits cut (max) resolution to half
		if( memory > 90 ){
			target.width = target.width/2;
			target.height = target.height/2;
		}
		// * convention - if download rate is <= zero downgrade to min
		if( video.isPlaying && this._speed.rate <= 0 ){
			target = this._size.min;
		}
		// save sizes for later
		this._size.window = window;
		this._size.target = target;

		return target;
	},

	// - picks a source
	loadStream: function( quality ){
		// fallbacks
		quality = quality || false;
		// variables
		var sources = this.sources;
		// if quality selected pick a subset
		//...
		var stream = this._pickStream( sources );
		// save selected steam
		this.selectedStream = stream;
		// check if selected stream is cached
		//...
		// check against the max resolution that can play...

		// if not cached play a lower res until buffered
		if( !this.activeStream ) this.activeStream = this.selectedStream;

		// return source location
		return this.activeStream.src;
	},
	// - switches between streams
	updateStream: function(){
		var video = this.el;
		// get the active stream and the selected stream
		var active = this.activeStream;
		var selected = this.selectedStream;
		// update (based on conditions)
		if( active === selected ){
			// do nothing?
		} else {
			// find cursor
			var time = video.currentTime;
			// update source
			video.src = selected.src;
			video.onloadedmetadata = function(){
				// resume
				video.currentTime = time;
				//video.play();
			}
			// update active stream
			this.activeStream = selected;
		}

	},
	// internal methods
	// - organizes sources
	_sources: function(){
		var sources = [];
		var dom = this.el.getElementsByTagName('source');
		// save dimensions
		for (var i in dom) {
			var tag = dom[i];
			// better way to check for an element?
			if( !tag.attributes ) continue;
			// first check type (only include files that can be used)
			var supported = this._checkType( tag.attributes['type'].value );
			if( !supported ) continue;
			// support other methods (other than attributes) for setting resolution?
			var source = {
				width: parseInt( tag.attributes['width'].value ) || 0,
				height: parseInt( tag.attributes['height'].value ) || 0,
				src: tag.attributes['src'].value || ""
			};
			sources.push( source );
		}

		this.sources = sources;

		//console.log("sources:", this.sources);
	},

	_progress: function( e ){
		// update download rate
		this._calculateSpeed();
		// check if we're running the "optimal"  resolution
		if( this.selectedStream !== this.activeStream){
			// re-calulate the window size
			console.log("recalculate");
			this.loadStream();
			this.updateStream();
		}
	},

	_setupSizes: function(){
		var sources = this.sources || [];
		var max = { width: 0, height: 0 };
		var min = { width: 10000, height: 10000 };
		for( var i in sources ){
			// find the smallest resolution
			if( sources[i].width <= min.width && sources[i].height <= min.height ){
				min = sources[i];
			}
			if( sources[i].width > max.width && sources[i].height > max.height ){
				max = sources[i];
			}
		}
		// save the sizes
		this._size.min = min;
		this._size.max = max;
	},

	_calculateSpeed: _.debounce( function(){
		// since video.bufferedBytes & video.bytesTotal are removed from media elements
		// we'll need to work with buffered seconds...
		var video = this.el;
		// If finished buffering quit now
		if( this._speed.percent == 100 ) return;
		// variables
		// time
		var now = (new Date()).getTime();
		var timestamp = this._speed.timestamp || now; // fallback to now...
		var duration = (now - timestamp) / 1000; //Math.round()
		// data
		var loaded = ( video.buffered && video.buffered.length ) ? video.buffered.end(0) : 0;
		var total = video.duration;
		var buffered = this._speed.buffered || loaded;
		var percent = Math.round(100 * loaded / total);
		// if rate is < 1 the playback rate is greater than the buffering rate
		var rate = (duration) ? ((loaded - buffered) / duration) : 0; // in buffered seconds per sec
		// save data
		this._speed = {
			buffered: loaded,
			timestamp: now,
			rate: rate,
			percent: percent
		}

		//console.log( "speed:", this._speed );

	}, 1000), // trigger not more than once every second

	_memory: function(){
		return (console.memory) ? Math.round( 100 * (console.memory.usedJSHeapSize / console.memory.totalJSHeapSize)) : 0;
	},

	_resize: _.debounce( function( e ){
		// re-calulate the window size
		this.loadStream();
		this.updateStream();
	}, 1000),

	_checkType: function( type ){
		// empty string means no support - other options: maybe, probably
		return ( document.createElement("video").canPlayType( type ) !== "" );
	},

	_pickStream: function( sources ){
		// fallbacks
		sources = sources || this.sources || [];
		// variables
		var selected = {};
		var sizes = this._size;
		// get size based on params
		var size = this.getSize();

		// loop through streams
		for( var i in sources ){
			// only change the selected source if it is a different size
			if( selected.width == sources[i].width && selected.height == sources[i].height ) continue;
			// compare against the "allowed" size
			if( sources[i].width <= size.width && sources[i].height <= size.height ){
				selected = sources[i];
			}
		}
		// FIX: if video size smaller that smallest resolution, use that.
		if( !selected.width ) selected = sizes.min;

		//console.log( "selected:", selected );
		return selected;
	}
}