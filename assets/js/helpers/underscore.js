// this is executed on import
// (underscore) helpers
// underscore.js > v1.60 required....
var _ = window._ || {
	// Based on Underscode.js bind: http://underscorejs.org/#bind
	bind: function(func, context) {
		var args, bound;
		// alias
		var nativeBind = Function.prototype.bind;
		var slice = Array.prototype.slice;
		//
		if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
		if (!_.isFunction(func)) throw new TypeError;
		args = slice.call(arguments, 2);
		return bound = function() {
			if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
			ctor.prototype = func.prototype;
			var self = new ctor;
			ctor.prototype = null;
			var result = func.apply(self, args.concat(slice.call(arguments)));
			if (Object(result) === result) return result;
			return self;
		};
	},
	// Based on Underscore.js debounce: http://underscorejs.org/#debounce
	debounce: function(func, wait, immediate) {
		var timeout, args, context, timestamp, result;

		var later = function() {
			var last = _.now() - timestamp;
			if (last < wait) {
				timeout = setTimeout(later, wait - last);
			} else {
				timeout = null;
				if (!immediate) {
					result = func.apply(context, args);
					context = args = null;
				}
			}
		};

		return function() {
			context = this;
			args = arguments;
			timestamp = _.now();
			var callNow = immediate && !timeout;
			if (!timeout) {
				timeout = setTimeout(later, wait);
			}
			if (callNow) {
				result = func.apply(context, args);
				context = args = null;
			}

			return result;
		};
	},
	now: Date.now || function() { return new Date().getTime(); },

	isFunction: function(obj) {
		return typeof obj === 'function';
	}

};
