(function() {
	// Creates an object based in the HTML Element prototype
	var el = Object.create(HTMLElement.prototype);

	// Fires when an instance of the element is created
	el.createdCallback = function() {
		// gather attributes
		//...
		// set options
		var options = {
		};
		// ...
		options.el = this;
		// instantiate view
		this.view = new VideoStream( options );

	};

	el.refresh = function(){
		this.view.refresh();
	};

	// Fires when an instance was inserted into the document
	el.attachedCallback = function() {};

	// Fires when an instance was removed from the document
	el.detachedCallback = function() {
		this.view.destroy();
	};

	// Fires when an attribute was added, removed, or updated
	el.attributeChangedCallback = function(attr, oldVal, newVal) {};

	document.registerElement('video-stream', {
		prototype: el,
		extends: 'video'
	});
}());
