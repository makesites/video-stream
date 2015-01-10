Polymer('video-stream', {
	created: function() {
		// create view
		this.view = new VideoStream({
			el: this
		});
	},

	refresh: function(){
		this.view.refresh();
	}
});
