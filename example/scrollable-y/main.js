;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * index.js
 */

var Q = require('q'),
    qstart = require('qstart'),
    IScroll = require('iscroll'),
    MButton = require('../../lib/index.js');

function main() {
    var h1 = document.querySelector('h1'),
        scrollView = new IScroll('#wrapper', {
            mouseWheel: true
        }),
        backBtn = new MButton.Touchend({
            el : document.getElementById('back'),
            f : function () {
                window.location = '../index.html';
            }
        }),
        btn1 = new MButton.ScrollableY.Touchend({
            tolerance: 10,
            el : document.getElementById('btn1'),
            f : function () {
                h1.style.color = 'rgb(219, 96, 96)';
            }
        }),
        btn2 = new MButton.ScrollableY.Touchend({
            tolerance: 10,
            el : document.getElementById('btn2'),
            f : function () {
                 h1.style.color = 'rgb(77, 158, 77)';
            }
        }),
        btn3 = new MButton.ScrollableY.Touchend({
            tolerance: 10,
            el : document.getElementById('btn3'),
            f : function () {
                h1.style.color = 'rgb(77, 136, 182)';
            }
        });

    backBtn.bind();
    btn1.bind();
    btn2.bind();
    btn3.bind();

}

qstart.then(main).done();

},{"../../lib/index.js":5,"iscroll":9,"q":10,"qstart":11}],2:[function(require,module,exports){
/*
 * button.js - the base of all buttons
 *
 * All buttons share two elements: a function, the callback of the button
 * and a DOM element.
 *
 * If the callback function returns a promise, the button will
 * keep is active state until the promise is resolved;
 */

"use strict";

var Button = function Button (options) {
    options = options || {};

    /* the callback function */
    this.f = null;
    /* the dom element representing the button */
    this.el = null;

    /* the state of the button */
    this.binded = false;
    this.active = false;

    /* default active css class*/
    this.activeCls = 'active';

    if(typeof options.activeCls === 'string') this.activeCls = options.activeCls;
    if(options.el instanceof HTMLElement) this.el = options.el;
    if(typeof options.f === 'function') this.f = options.f;
};

Button.prototype.setEl = function (el) {
    if(this.active) throw new Error("Can't change dom element, button is active.");
    if(this.binded) this.unbind();
    if(el instanceof HTMLElement) {
        this.el = el;
        return this;
    }
    else {
        throw new Error("Button setEl method needs a dom element as argument.");
    }
};

Button.prototype.setActive = function (active) {
    if (active) this.el.classList.add(this.activeCls);
    else this.el.classList.remove(this.activeCls);
    this.active = active;
};

Button.prototype.setF = function (f) {
    if (typeof f !== 'function')
        throw new Error("Button setF method needs a f function as argument.");
    this.f = f;
    return this;
};

/* impl. not completed, a child will redefine the bind method, call this one and set this.binded to true*/
Button.prototype.bind = function () {
    if(!this.el || !this.f) throw new Error("Can't bind an uninitialized button.");
    if(this.binded) throw new Error("Can't bind an already binded button.");
};

/* impl. not completed, a child will redefine the bind method, call this one and set this.binded to false*/
Button.prototype.unbind = function () {
    if(!this.el || !this.f) throw new Error("Can't unbind an uninitialized button.");
    if(!this.binded) throw new Error("Can't unbind a unbinded button.");
};

module.exports = Button;

},{}],3:[function(require,module,exports){
/*
 * default/touchend-button.js
 */

"use strict";

var Q = require('q'),
    Button = require('./../button');

var TouchendButton = function (options) {
    Button.prototype.constructor.call(this, options);
    this.activeBorder = options.activeBorder || 50;
    this.boundaries = { minX : 0, maxX : 0, minY : 0, maxY : 0 };
    this.identifier = null;
};

TouchendButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(Button.prototype);

TouchendButton.prototype.constructor = TouchendButton;

TouchendButton.prototype.setActiveBorder = function (len) {
    this.activeBorder = len;
};

TouchendButton.prototype._getTouch = function (changedTouches) {
    for (var i = 0; i < changedTouches.length; i++) {
        if (changedTouches[i].identifier === this.identifier) {
            return changedTouches[i];
        }
    }
    return null;
};

TouchendButton.prototype._isInActiveZone = function (touch) {
    var x = touch.clientX,
        y = touch.clientY,
        b = this.boundaries;
    return x < b.maxX && x > b.minX && y < b.maxY && y > b.minY;
};

TouchendButton.prototype._removeCls = function () {
    if (this.el.classList.contains(this.activeCls))
        this.el.classList.remove(this.activeCls);
};

TouchendButton.prototype._addCls = function () {
    if (!this.el.classList.contains(this.activeCls))
        this.el.classList.add(this.activeCls);
};

TouchendButton.prototype.bind = function () {
    Button.prototype.bind.call(this);
    this.el.addEventListener('touchstart', this, false);
    this.el.addEventListener('touchmove', this, false);
    this.el.addEventListener('touchend', this, false);
    this.el.addEventListener('touchcancel', this, false);
    this.binded = true;
    return this;
};

TouchendButton.prototype.unbind = function () {
    Button.prototype.unbind.call(this);
    this.el.removeEventListener('touchstart', this, false);
    this.el.removeEventListener('touchmove', this, false);
    this.el.removeEventListener('touchend', this, false);
    this.el.removeEventListener('touchcancel', this, false);
    this.binded = false;
    return this;
};

TouchendButton.prototype.handleEvent = function (evt) {
    switch(evt.type) {
        case 'touchstart':
            this.onTouchstart(evt);
            break;
        case 'touchmove':
            this.onTouchmove(evt);
            break;
        case 'touchend':
            this.onTouchend(evt);
            break;
        case 'touchcancel':
            this.onTouchcancel(evt);
            break;
    }
};

TouchendButton.prototype.onTouchstart = function (evt) {
    if(!this.active) {
        this.active = true;
        this.triggerOnTouchend = true;
        this.identifier = evt.changedTouches[0].identifier;
        var boundingRect = this.el.getBoundingClientRect();
        this.boundaries.minX = boundingRect.left - this.activeBorder;
        this.boundaries.maxX = boundingRect.left + boundingRect.width + this.activeBorder;
        this.boundaries.minY = boundingRect.top - this.activeBorder;
        this.boundaries.maxY = boundingRect.bottom +  this.activeBorder;
        this.el.classList.add(this.activeCls);
    }
};

TouchendButton.prototype.onTouchmove = function (evt) {
    if(this.active) {
        var touch = this._getTouch(evt.changedTouches);
        if (touch) {
            evt.preventDefault();
            if(this._isInActiveZone(touch)) {
                this.triggerOnTouchend = true;
                this._addCls();
            }
            else {
                this.triggerOnTouchend = false;
                this._removeCls();
            }
        }
    }
};

TouchendButton.prototype.onTouchend = function (evt) {
    if(this.active) {
        if (this._getTouch(evt.changedTouches)) {
            if (this.triggerOnTouchend) {
                var btn = this;
                Q(evt).then(this.f).done(function () {
                    btn.onTouchcancel(evt);
                });
            }
            else {
                this.onTouchcancel(evt);
            }
        }
    }
};

TouchendButton.prototype.onTouchcancel = function (evt) {
    this._removeCls();
    if(this.active) this.active = false;
};

module.exports = TouchendButton;

},{"./../button":2,"q":10}],4:[function(require,module,exports){
/*
 * default/touchstart-button.js
 */

"use strict";

var Q = require('q'),
    Button = require('./../button');

var TouchstartButton = function (options) {
    Button.prototype.constructor.call(this, options);
    this.delay = options.delay > 0 ? options.delay : 0;
};

TouchstartButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(Button.prototype);

TouchstartButton.prototype.constructor = TouchstartButton;

TouchstartButton.prototype.bind = function () {
    Button.prototype.bind.call(this);
    this.el.addEventListener('touchstart', this, false);
    this.binded = true;
    return this;
};

TouchstartButton.prototype.unbind = function () {
    Button.prototype.unbind.call(this);
    this.el.removeEventListener('touchstart', this, false);
    this.binded = false;
    return this;
};

TouchstartButton.prototype.handleEvent = function (evt) {
    switch(evt.type) {
        case 'touchstart':
            this.onTouchstart(evt);
            break;
    }
};

TouchstartButton.prototype.onTouchstart = function (evt) {
    if (!this.active) {
        var btn = this;
        btn.setActive(true);
        Q.delay(evt, btn.delay).then(btn.f).done(function () {
            btn.setActive(false);
        });
    }
};

module.exports = TouchstartButton;

},{"./../button":2,"q":10}],5:[function(require,module,exports){
/*
 * index.js - mobile-button module
 */

"use strict";

module.exports = {

    Touchstart : require('./default/touchstart-button'),
    Touchend : require('./default/touchend-button'),
    ScrollableY : {
        Touchend : require('./scrollable-y/touchend-button')
    },
    ScrollableX : {
        Touchend : require('./scrollable-x/touchend-button')
    }
};

},{"./default/touchend-button":3,"./default/touchstart-button":4,"./scrollable-x/touchend-button":6,"./scrollable-y/touchend-button":7}],6:[function(require,module,exports){
/*
 * scrollable-x/touchend-button.js
 */

"use strict";

var TouchendButton = require('./../default/touchend-button');

var ScrollableXTouchendButton = function (options) {
    TouchendButton.prototype.constructor.call(this, options);
    this.tolerance = options.tolerance || 10;
};

ScrollableXTouchendButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(TouchendButton.prototype);

ScrollableXTouchendButton.prototype.constructor = ScrollableXTouchendButton;

ScrollableXTouchendButton.prototype.onTouchstart = function (evt) {
    if(!this.active) this.startX = evt.changedTouches[0].clientX;
    TouchendButton.prototype.onTouchstart.call(this, evt);
};

ScrollableXTouchendButton.prototype._isInActiveZone = function (touch) {
    var y = touch.clientY,
        d = Math.abs(touch.clientX - this.startX),
        b = this.boundaries;
    return y < b.maxY && y > b.minY && d < this.tolerance;
};

ScrollableXTouchendButton.prototype.onTouchmove = function (evt) {
    if(this.active) {
        var touch = this._getTouch(evt.changedTouches);
        if (touch) {
            evt.preventDefault();
            if(this._isInActiveZone(touch)) this._addCls();
            else this.onTouchcancel.call(this, evt);
        }
    }
};

module.exports = ScrollableXTouchendButton;

},{"./../default/touchend-button":3}],7:[function(require,module,exports){
/*
 * scrollable-y/touchend-button.js
 */

"use strict";

var TouchendButton = require('./../default/touchend-button');

var ScrollableYTouchendButton = function (options) {
    TouchendButton.prototype.constructor.call(this, options);
    this.tolerance = options.tolerance || 10;
};

ScrollableYTouchendButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(TouchendButton.prototype);

ScrollableYTouchendButton.prototype.constructor = ScrollableYTouchendButton;

ScrollableYTouchendButton.prototype.onTouchstart = function (evt) {
    if(!this.active) this.startY = evt.changedTouches[0].clientY;
    TouchendButton.prototype.onTouchstart.call(this, evt);
};

ScrollableYTouchendButton.prototype._isInActiveZone = function (touch) {
    var x = touch.clientX,
        d = Math.abs(touch.clientY - this.startY),
        b = this.boundaries;
    return x < b.maxX && x > b.minX && d < this.tolerance;
};

ScrollableYTouchendButton.prototype.onTouchmove = function (evt) {
    if(this.active) {
        var touch = this._getTouch(evt.changedTouches);
        if (touch) {
            evt.preventDefault();
            if(this._isInActiveZone(touch)) this._addCls();
            else this.onTouchcancel.call(this, evt);
        }
    }
};

module.exports = ScrollableYTouchendButton;

},{"./../default/touchend-button":3}],8:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],9:[function(require,module,exports){
/*! iScroll v5.1.1 ~ (c) 2008-2014 Matteo Spinelli ~ http://cubiq.org/license */
(function (window, document, Math) {
var rAF = window.requestAnimationFrame	||
	window.webkitRequestAnimationFrame	||
	window.mozRequestAnimationFrame		||
	window.oRequestAnimationFrame		||
	window.msRequestAnimationFrame		||
	function (callback) { window.setTimeout(callback, 1000 / 60); };

var utils = (function () {
	var me = {};

	var _elementStyle = document.createElement('div').style;
	var _vendor = (function () {
		var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
			transform,
			i = 0,
			l = vendors.length;

		for ( ; i < l; i++ ) {
			transform = vendors[i] + 'ransform';
			if ( transform in _elementStyle ) return vendors[i].substr(0, vendors[i].length-1);
		}

		return false;
	})();

	function _prefixStyle (style) {
		if ( _vendor === false ) return false;
		if ( _vendor === '' ) return style;
		return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
	}

	me.getTime = Date.now || function getTime () { return new Date().getTime(); };

	me.extend = function (target, obj) {
		for ( var i in obj ) {
			target[i] = obj[i];
		}
	};

	me.addEvent = function (el, type, fn, capture) {
		el.addEventListener(type, fn, !!capture);
	};

	me.removeEvent = function (el, type, fn, capture) {
		el.removeEventListener(type, fn, !!capture);
	};

	me.momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration) {
		var distance = current - start,
			speed = Math.abs(distance) / time,
			destination,
			duration;

		deceleration = deceleration === undefined ? 0.0006 : deceleration;

		destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
		duration = speed / deceleration;

		if ( destination < lowerMargin ) {
			destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
			distance = Math.abs(destination - current);
			duration = distance / speed;
		} else if ( destination > 0 ) {
			destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
			distance = Math.abs(current) + destination;
			duration = distance / speed;
		}

		return {
			destination: Math.round(destination),
			duration: duration
		};
	};

	var _transform = _prefixStyle('transform');

	me.extend(me, {
		hasTransform: _transform !== false,
		hasPerspective: _prefixStyle('perspective') in _elementStyle,
		hasTouch: 'ontouchstart' in window,
		hasPointer: navigator.msPointerEnabled,
		hasTransition: _prefixStyle('transition') in _elementStyle
	});

	// This should find all Android browsers lower than build 535.19 (both stock browser and webview)
	me.isBadAndroid = /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion));

	me.extend(me.style = {}, {
		transform: _transform,
		transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
		transitionDuration: _prefixStyle('transitionDuration'),
		transitionDelay: _prefixStyle('transitionDelay'),
		transformOrigin: _prefixStyle('transformOrigin')
	});

	me.hasClass = function (e, c) {
		var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
		return re.test(e.className);
	};

	me.addClass = function (e, c) {
		if ( me.hasClass(e, c) ) {
			return;
		}

		var newclass = e.className.split(' ');
		newclass.push(c);
		e.className = newclass.join(' ');
	};

	me.removeClass = function (e, c) {
		if ( !me.hasClass(e, c) ) {
			return;
		}

		var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
		e.className = e.className.replace(re, ' ');
	};

	me.offset = function (el) {
		var left = -el.offsetLeft,
			top = -el.offsetTop;

		// jshint -W084
		while (el = el.offsetParent) {
			left -= el.offsetLeft;
			top -= el.offsetTop;
		}
		// jshint +W084

		return {
			left: left,
			top: top
		};
	};

	me.preventDefaultException = function (el, exceptions) {
		for ( var i in exceptions ) {
			if ( exceptions[i].test(el[i]) ) {
				return true;
			}
		}

		return false;
	};

	me.extend(me.eventType = {}, {
		touchstart: 1,
		touchmove: 1,
		touchend: 1,

		mousedown: 2,
		mousemove: 2,
		mouseup: 2,

		MSPointerDown: 3,
		MSPointerMove: 3,
		MSPointerUp: 3
	});

	me.extend(me.ease = {}, {
		quadratic: {
			style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			fn: function (k) {
				return k * ( 2 - k );
			}
		},
		circular: {
			style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',	// Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
			fn: function (k) {
				return Math.sqrt( 1 - ( --k * k ) );
			}
		},
		back: {
			style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
			fn: function (k) {
				var b = 4;
				return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
			}
		},
		bounce: {
			style: '',
			fn: function (k) {
				if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
					return 7.5625 * k * k;
				} else if ( k < ( 2 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
				} else if ( k < ( 2.5 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
				} else {
					return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
				}
			}
		},
		elastic: {
			style: '',
			fn: function (k) {
				var f = 0.22,
					e = 0.4;

				if ( k === 0 ) { return 0; }
				if ( k == 1 ) { return 1; }

				return ( e * Math.pow( 2, - 10 * k ) * Math.sin( ( k - f / 4 ) * ( 2 * Math.PI ) / f ) + 1 );
			}
		}
	});

	me.tap = function (e, eventName) {
		var ev = document.createEvent('Event');
		ev.initEvent(eventName, true, true);
		ev.pageX = e.pageX;
		ev.pageY = e.pageY;
		e.target.dispatchEvent(ev);
	};

	me.click = function (e) {
		var target = e.target,
			ev;

		if ( !(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName) ) {
			ev = document.createEvent('MouseEvents');
			ev.initMouseEvent('click', true, true, e.view, 1,
				target.screenX, target.screenY, target.clientX, target.clientY,
				e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
				0, null);

			ev._constructed = true;
			target.dispatchEvent(ev);
		}
	};

	return me;
})();

function IScroll (el, options) {
	this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
	this.scroller = this.wrapper.children[0];
	this.scrollerStyle = this.scroller.style;		// cache style for better performance

	this.options = {

		resizeScrollbars: true,

		mouseWheelSpeed: 20,

		snapThreshold: 0.334,

// INSERT POINT: OPTIONS 

		startX: 0,
		startY: 0,
		scrollY: true,
		directionLockThreshold: 5,
		momentum: true,

		bounce: true,
		bounceTime: 600,
		bounceEasing: '',

		preventDefault: true,
		preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ },

		HWCompositing: true,
		useTransition: true,
		useTransform: true
	};

	for ( var i in options ) {
		this.options[i] = options[i];
	}

	// Normalize options
	this.translateZ = this.options.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';

	this.options.useTransition = utils.hasTransition && this.options.useTransition;
	this.options.useTransform = utils.hasTransform && this.options.useTransform;

	this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
	this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;

	// If you want eventPassthrough I have to lock one of the axes
	this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY;
	this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX;

	// With eventPassthrough we also need lockDirection mechanism
	this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
	this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;

	this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;

	this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;

	if ( this.options.tap === true ) {
		this.options.tap = 'tap';
	}

	if ( this.options.shrinkScrollbars == 'scale' ) {
		this.options.useTransition = false;
	}

	this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1;

// INSERT POINT: NORMALIZATION

	// Some defaults	
	this.x = 0;
	this.y = 0;
	this.directionX = 0;
	this.directionY = 0;
	this._events = {};

// INSERT POINT: DEFAULTS

	this._init();
	this.refresh();

	this.scrollTo(this.options.startX, this.options.startY);
	this.enable();
}

IScroll.prototype = {
	version: '5.1.1',

	_init: function () {
		this._initEvents();

		if ( this.options.scrollbars || this.options.indicators ) {
			this._initIndicators();
		}

		if ( this.options.mouseWheel ) {
			this._initWheel();
		}

		if ( this.options.snap ) {
			this._initSnap();
		}

		if ( this.options.keyBindings ) {
			this._initKeys();
		}

// INSERT POINT: _init

	},

	destroy: function () {
		this._initEvents(true);

		this._execEvent('destroy');
	},

	_transitionEnd: function (e) {
		if ( e.target != this.scroller || !this.isInTransition ) {
			return;
		}

		this._transitionTime();
		if ( !this.resetPosition(this.options.bounceTime) ) {
			this.isInTransition = false;
			this._execEvent('scrollEnd');
		}
	},

	_start: function (e) {
		// React to left mouse button only
		if ( utils.eventType[e.type] != 1 ) {
			if ( e.button !== 0 ) {
				return;
			}
		}

		if ( !this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated) ) {
			return;
		}

		if ( this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
			e.preventDefault();
		}

		var point = e.touches ? e.touches[0] : e,
			pos;

		this.initiated	= utils.eventType[e.type];
		this.moved		= false;
		this.distX		= 0;
		this.distY		= 0;
		this.directionX = 0;
		this.directionY = 0;
		this.directionLocked = 0;

		this._transitionTime();

		this.startTime = utils.getTime();

		if ( this.options.useTransition && this.isInTransition ) {
			this.isInTransition = false;
			pos = this.getComputedPosition();
			this._translate(Math.round(pos.x), Math.round(pos.y));
			this._execEvent('scrollEnd');
		} else if ( !this.options.useTransition && this.isAnimating ) {
			this.isAnimating = false;
			this._execEvent('scrollEnd');
		}

		this.startX    = this.x;
		this.startY    = this.y;
		this.absStartX = this.x;
		this.absStartY = this.y;
		this.pointX    = point.pageX;
		this.pointY    = point.pageY;

		this._execEvent('beforeScrollStart');
	},

	_move: function (e) {
		if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
			return;
		}

		if ( this.options.preventDefault ) {	// increases performance on Android? TODO: check!
			e.preventDefault();
		}

		var point		= e.touches ? e.touches[0] : e,
			deltaX		= point.pageX - this.pointX,
			deltaY		= point.pageY - this.pointY,
			timestamp	= utils.getTime(),
			newX, newY,
			absDistX, absDistY;

		this.pointX		= point.pageX;
		this.pointY		= point.pageY;

		this.distX		+= deltaX;
		this.distY		+= deltaY;
		absDistX		= Math.abs(this.distX);
		absDistY		= Math.abs(this.distY);

		// We need to move at least 10 pixels for the scrolling to initiate
		if ( timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
			return;
		}

		// If you are scrolling in one direction lock the other
		if ( !this.directionLocked && !this.options.freeScroll ) {
			if ( absDistX > absDistY + this.options.directionLockThreshold ) {
				this.directionLocked = 'h';		// lock horizontally
			} else if ( absDistY >= absDistX + this.options.directionLockThreshold ) {
				this.directionLocked = 'v';		// lock vertically
			} else {
				this.directionLocked = 'n';		// no lock
			}
		}

		if ( this.directionLocked == 'h' ) {
			if ( this.options.eventPassthrough == 'vertical' ) {
				e.preventDefault();
			} else if ( this.options.eventPassthrough == 'horizontal' ) {
				this.initiated = false;
				return;
			}

			deltaY = 0;
		} else if ( this.directionLocked == 'v' ) {
			if ( this.options.eventPassthrough == 'horizontal' ) {
				e.preventDefault();
			} else if ( this.options.eventPassthrough == 'vertical' ) {
				this.initiated = false;
				return;
			}

			deltaX = 0;
		}

		deltaX = this.hasHorizontalScroll ? deltaX : 0;
		deltaY = this.hasVerticalScroll ? deltaY : 0;

		newX = this.x + deltaX;
		newY = this.y + deltaY;

		// Slow down if outside of the boundaries
		if ( newX > 0 || newX < this.maxScrollX ) {
			newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
		}
		if ( newY > 0 || newY < this.maxScrollY ) {
			newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
		}

		this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
		this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

		if ( !this.moved ) {
			this._execEvent('scrollStart');
		}

		this.moved = true;

		this._translate(newX, newY);

/* REPLACE START: _move */

		if ( timestamp - this.startTime > 300 ) {
			this.startTime = timestamp;
			this.startX = this.x;
			this.startY = this.y;
		}

/* REPLACE END: _move */

	},

	_end: function (e) {
		if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
			return;
		}

		if ( this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
			e.preventDefault();
		}

		var point = e.changedTouches ? e.changedTouches[0] : e,
			momentumX,
			momentumY,
			duration = utils.getTime() - this.startTime,
			newX = Math.round(this.x),
			newY = Math.round(this.y),
			distanceX = Math.abs(newX - this.startX),
			distanceY = Math.abs(newY - this.startY),
			time = 0,
			easing = '';

		this.isInTransition = 0;
		this.initiated = 0;
		this.endTime = utils.getTime();

		// reset if we are outside of the boundaries
		if ( this.resetPosition(this.options.bounceTime) ) {
			return;
		}

		this.scrollTo(newX, newY);	// ensures that the last position is rounded

		// we scrolled less than 10 pixels
		if ( !this.moved ) {
			if ( this.options.tap ) {
				utils.tap(e, this.options.tap);
			}

			if ( this.options.click ) {
				utils.click(e);
			}

			this._execEvent('scrollCancel');
			return;
		}

		if ( this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100 ) {
			this._execEvent('flick');
			return;
		}

		// start momentum animation if needed
		if ( this.options.momentum && duration < 300 ) {
			momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : { destination: newX, duration: 0 };
			momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : { destination: newY, duration: 0 };
			newX = momentumX.destination;
			newY = momentumY.destination;
			time = Math.max(momentumX.duration, momentumY.duration);
			this.isInTransition = 1;
		}


		if ( this.options.snap ) {
			var snap = this._nearestSnap(newX, newY);
			this.currentPage = snap;
			time = this.options.snapSpeed || Math.max(
					Math.max(
						Math.min(Math.abs(newX - snap.x), 1000),
						Math.min(Math.abs(newY - snap.y), 1000)
					), 300);
			newX = snap.x;
			newY = snap.y;

			this.directionX = 0;
			this.directionY = 0;
			easing = this.options.bounceEasing;
		}

// INSERT POINT: _end

		if ( newX != this.x || newY != this.y ) {
			// change easing function when scroller goes out of the boundaries
			if ( newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY ) {
				easing = utils.ease.quadratic;
			}

			this.scrollTo(newX, newY, time, easing);
			return;
		}

		this._execEvent('scrollEnd');
	},

	_resize: function () {
		var that = this;

		clearTimeout(this.resizeTimeout);

		this.resizeTimeout = setTimeout(function () {
			that.refresh();
		}, this.options.resizePolling);
	},

	resetPosition: function (time) {
		var x = this.x,
			y = this.y;

		time = time || 0;

		if ( !this.hasHorizontalScroll || this.x > 0 ) {
			x = 0;
		} else if ( this.x < this.maxScrollX ) {
			x = this.maxScrollX;
		}

		if ( !this.hasVerticalScroll || this.y > 0 ) {
			y = 0;
		} else if ( this.y < this.maxScrollY ) {
			y = this.maxScrollY;
		}

		if ( x == this.x && y == this.y ) {
			return false;
		}

		this.scrollTo(x, y, time, this.options.bounceEasing);

		return true;
	},

	disable: function () {
		this.enabled = false;
	},

	enable: function () {
		this.enabled = true;
	},

	refresh: function () {
		var rf = this.wrapper.offsetHeight;		// Force reflow

		this.wrapperWidth	= this.wrapper.clientWidth;
		this.wrapperHeight	= this.wrapper.clientHeight;

/* REPLACE START: refresh */

		this.scrollerWidth	= this.scroller.offsetWidth;
		this.scrollerHeight	= this.scroller.offsetHeight;

		this.maxScrollX		= this.wrapperWidth - this.scrollerWidth;
		this.maxScrollY		= this.wrapperHeight - this.scrollerHeight;

/* REPLACE END: refresh */

		this.hasHorizontalScroll	= this.options.scrollX && this.maxScrollX < 0;
		this.hasVerticalScroll		= this.options.scrollY && this.maxScrollY < 0;

		if ( !this.hasHorizontalScroll ) {
			this.maxScrollX = 0;
			this.scrollerWidth = this.wrapperWidth;
		}

		if ( !this.hasVerticalScroll ) {
			this.maxScrollY = 0;
			this.scrollerHeight = this.wrapperHeight;
		}

		this.endTime = 0;
		this.directionX = 0;
		this.directionY = 0;

		this.wrapperOffset = utils.offset(this.wrapper);

		this._execEvent('refresh');

		this.resetPosition();

// INSERT POINT: _refresh

	},

	on: function (type, fn) {
		if ( !this._events[type] ) {
			this._events[type] = [];
		}

		this._events[type].push(fn);
	},

	off: function (type, fn) {
		if ( !this._events[type] ) {
			return;
		}

		var index = this._events[type].indexOf(fn);

		if ( index > -1 ) {
			this._events[type].splice(index, 1);
		}
	},

	_execEvent: function (type) {
		if ( !this._events[type] ) {
			return;
		}

		var i = 0,
			l = this._events[type].length;

		if ( !l ) {
			return;
		}

		for ( ; i < l; i++ ) {
			this._events[type][i].apply(this, [].slice.call(arguments, 1));
		}
	},

	scrollBy: function (x, y, time, easing) {
		x = this.x + x;
		y = this.y + y;
		time = time || 0;

		this.scrollTo(x, y, time, easing);
	},

	scrollTo: function (x, y, time, easing) {
		easing = easing || utils.ease.circular;

		this.isInTransition = this.options.useTransition && time > 0;

		if ( !time || (this.options.useTransition && easing.style) ) {
			this._transitionTimingFunction(easing.style);
			this._transitionTime(time);
			this._translate(x, y);
		} else {
			this._animate(x, y, time, easing.fn);
		}
	},

	scrollToElement: function (el, time, offsetX, offsetY, easing) {
		el = el.nodeType ? el : this.scroller.querySelector(el);

		if ( !el ) {
			return;
		}

		var pos = utils.offset(el);

		pos.left -= this.wrapperOffset.left;
		pos.top  -= this.wrapperOffset.top;

		// if offsetX/Y are true we center the element to the screen
		if ( offsetX === true ) {
			offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
		}
		if ( offsetY === true ) {
			offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
		}

		pos.left -= offsetX || 0;
		pos.top  -= offsetY || 0;

		pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
		pos.top  = pos.top  > 0 ? 0 : pos.top  < this.maxScrollY ? this.maxScrollY : pos.top;

		time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x-pos.left), Math.abs(this.y-pos.top)) : time;

		this.scrollTo(pos.left, pos.top, time, easing);
	},

	_transitionTime: function (time) {
		time = time || 0;

		this.scrollerStyle[utils.style.transitionDuration] = time + 'ms';

		if ( !time && utils.isBadAndroid ) {
			this.scrollerStyle[utils.style.transitionDuration] = '0.001s';
		}


		if ( this.indicators ) {
			for ( var i = this.indicators.length; i--; ) {
				this.indicators[i].transitionTime(time);
			}
		}


// INSERT POINT: _transitionTime

	},

	_transitionTimingFunction: function (easing) {
		this.scrollerStyle[utils.style.transitionTimingFunction] = easing;


		if ( this.indicators ) {
			for ( var i = this.indicators.length; i--; ) {
				this.indicators[i].transitionTimingFunction(easing);
			}
		}


// INSERT POINT: _transitionTimingFunction

	},

	_translate: function (x, y) {
		if ( this.options.useTransform ) {

/* REPLACE START: _translate */

			this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;

/* REPLACE END: _translate */

		} else {
			x = Math.round(x);
			y = Math.round(y);
			this.scrollerStyle.left = x + 'px';
			this.scrollerStyle.top = y + 'px';
		}

		this.x = x;
		this.y = y;


	if ( this.indicators ) {
		for ( var i = this.indicators.length; i--; ) {
			this.indicators[i].updatePosition();
		}
	}


// INSERT POINT: _translate

	},

	_initEvents: function (remove) {
		var eventType = remove ? utils.removeEvent : utils.addEvent,
			target = this.options.bindToWrapper ? this.wrapper : window;

		eventType(window, 'orientationchange', this);
		eventType(window, 'resize', this);

		if ( this.options.click ) {
			eventType(this.wrapper, 'click', this, true);
		}

		if ( !this.options.disableMouse ) {
			eventType(this.wrapper, 'mousedown', this);
			eventType(target, 'mousemove', this);
			eventType(target, 'mousecancel', this);
			eventType(target, 'mouseup', this);
		}

		if ( utils.hasPointer && !this.options.disablePointer ) {
			eventType(this.wrapper, 'MSPointerDown', this);
			eventType(target, 'MSPointerMove', this);
			eventType(target, 'MSPointerCancel', this);
			eventType(target, 'MSPointerUp', this);
		}

		if ( utils.hasTouch && !this.options.disableTouch ) {
			eventType(this.wrapper, 'touchstart', this);
			eventType(target, 'touchmove', this);
			eventType(target, 'touchcancel', this);
			eventType(target, 'touchend', this);
		}

		eventType(this.scroller, 'transitionend', this);
		eventType(this.scroller, 'webkitTransitionEnd', this);
		eventType(this.scroller, 'oTransitionEnd', this);
		eventType(this.scroller, 'MSTransitionEnd', this);
	},

	getComputedPosition: function () {
		var matrix = window.getComputedStyle(this.scroller, null),
			x, y;

		if ( this.options.useTransform ) {
			matrix = matrix[utils.style.transform].split(')')[0].split(', ');
			x = +(matrix[12] || matrix[4]);
			y = +(matrix[13] || matrix[5]);
		} else {
			x = +matrix.left.replace(/[^-\d.]/g, '');
			y = +matrix.top.replace(/[^-\d.]/g, '');
		}

		return { x: x, y: y };
	},

	_initIndicators: function () {
		var interactive = this.options.interactiveScrollbars,
			customStyle = typeof this.options.scrollbars != 'string',
			indicators = [],
			indicator;

		var that = this;

		this.indicators = [];

		if ( this.options.scrollbars ) {
			// Vertical scrollbar
			if ( this.options.scrollY ) {
				indicator = {
					el: createDefaultScrollbar('v', interactive, this.options.scrollbars),
					interactive: interactive,
					defaultScrollbars: true,
					customStyle: customStyle,
					resize: this.options.resizeScrollbars,
					shrink: this.options.shrinkScrollbars,
					fade: this.options.fadeScrollbars,
					listenX: false
				};

				this.wrapper.appendChild(indicator.el);
				indicators.push(indicator);
			}

			// Horizontal scrollbar
			if ( this.options.scrollX ) {
				indicator = {
					el: createDefaultScrollbar('h', interactive, this.options.scrollbars),
					interactive: interactive,
					defaultScrollbars: true,
					customStyle: customStyle,
					resize: this.options.resizeScrollbars,
					shrink: this.options.shrinkScrollbars,
					fade: this.options.fadeScrollbars,
					listenY: false
				};

				this.wrapper.appendChild(indicator.el);
				indicators.push(indicator);
			}
		}

		if ( this.options.indicators ) {
			// TODO: check concat compatibility
			indicators = indicators.concat(this.options.indicators);
		}

		for ( var i = indicators.length; i--; ) {
			this.indicators.push( new Indicator(this, indicators[i]) );
		}

		// TODO: check if we can use array.map (wide compatibility and performance issues)
		function _indicatorsMap (fn) {
			for ( var i = that.indicators.length; i--; ) {
				fn.call(that.indicators[i]);
			}
		}

		if ( this.options.fadeScrollbars ) {
			this.on('scrollEnd', function () {
				_indicatorsMap(function () {
					this.fade();
				});
			});

			this.on('scrollCancel', function () {
				_indicatorsMap(function () {
					this.fade();
				});
			});

			this.on('scrollStart', function () {
				_indicatorsMap(function () {
					this.fade(1);
				});
			});

			this.on('beforeScrollStart', function () {
				_indicatorsMap(function () {
					this.fade(1, true);
				});
			});
		}


		this.on('refresh', function () {
			_indicatorsMap(function () {
				this.refresh();
			});
		});

		this.on('destroy', function () {
			_indicatorsMap(function () {
				this.destroy();
			});

			delete this.indicators;
		});
	},

	_initWheel: function () {
		utils.addEvent(this.wrapper, 'wheel', this);
		utils.addEvent(this.wrapper, 'mousewheel', this);
		utils.addEvent(this.wrapper, 'DOMMouseScroll', this);

		this.on('destroy', function () {
			utils.removeEvent(this.wrapper, 'wheel', this);
			utils.removeEvent(this.wrapper, 'mousewheel', this);
			utils.removeEvent(this.wrapper, 'DOMMouseScroll', this);
		});
	},

	_wheel: function (e) {
		if ( !this.enabled ) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		var wheelDeltaX, wheelDeltaY,
			newX, newY,
			that = this;

		if ( this.wheelTimeout === undefined ) {
			that._execEvent('scrollStart');
		}

		// Execute the scrollEnd event after 400ms the wheel stopped scrolling
		clearTimeout(this.wheelTimeout);
		this.wheelTimeout = setTimeout(function () {
			that._execEvent('scrollEnd');
			that.wheelTimeout = undefined;
		}, 400);

		if ( 'deltaX' in e ) {
			wheelDeltaX = -e.deltaX;
			wheelDeltaY = -e.deltaY;
		} else if ( 'wheelDeltaX' in e ) {
			wheelDeltaX = e.wheelDeltaX / 120 * this.options.mouseWheelSpeed;
			wheelDeltaY = e.wheelDeltaY / 120 * this.options.mouseWheelSpeed;
		} else if ( 'wheelDelta' in e ) {
			wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * this.options.mouseWheelSpeed;
		} else if ( 'detail' in e ) {
			wheelDeltaX = wheelDeltaY = -e.detail / 3 * this.options.mouseWheelSpeed;
		} else {
			return;
		}

		wheelDeltaX *= this.options.invertWheelDirection;
		wheelDeltaY *= this.options.invertWheelDirection;

		if ( !this.hasVerticalScroll ) {
			wheelDeltaX = wheelDeltaY;
			wheelDeltaY = 0;
		}

		if ( this.options.snap ) {
			newX = this.currentPage.pageX;
			newY = this.currentPage.pageY;

			if ( wheelDeltaX > 0 ) {
				newX--;
			} else if ( wheelDeltaX < 0 ) {
				newX++;
			}

			if ( wheelDeltaY > 0 ) {
				newY--;
			} else if ( wheelDeltaY < 0 ) {
				newY++;
			}

			this.goToPage(newX, newY);

			return;
		}

		newX = this.x + Math.round(this.hasHorizontalScroll ? wheelDeltaX : 0);
		newY = this.y + Math.round(this.hasVerticalScroll ? wheelDeltaY : 0);

		if ( newX > 0 ) {
			newX = 0;
		} else if ( newX < this.maxScrollX ) {
			newX = this.maxScrollX;
		}

		if ( newY > 0 ) {
			newY = 0;
		} else if ( newY < this.maxScrollY ) {
			newY = this.maxScrollY;
		}

		this.scrollTo(newX, newY, 0);

// INSERT POINT: _wheel
	},

	_initSnap: function () {
		this.currentPage = {};

		if ( typeof this.options.snap == 'string' ) {
			this.options.snap = this.scroller.querySelectorAll(this.options.snap);
		}

		this.on('refresh', function () {
			var i = 0, l,
				m = 0, n,
				cx, cy,
				x = 0, y,
				stepX = this.options.snapStepX || this.wrapperWidth,
				stepY = this.options.snapStepY || this.wrapperHeight,
				el;

			this.pages = [];

			if ( !this.wrapperWidth || !this.wrapperHeight || !this.scrollerWidth || !this.scrollerHeight ) {
				return;
			}

			if ( this.options.snap === true ) {
				cx = Math.round( stepX / 2 );
				cy = Math.round( stepY / 2 );

				while ( x > -this.scrollerWidth ) {
					this.pages[i] = [];
					l = 0;
					y = 0;

					while ( y > -this.scrollerHeight ) {
						this.pages[i][l] = {
							x: Math.max(x, this.maxScrollX),
							y: Math.max(y, this.maxScrollY),
							width: stepX,
							height: stepY,
							cx: x - cx,
							cy: y - cy
						};

						y -= stepY;
						l++;
					}

					x -= stepX;
					i++;
				}
			} else {
				el = this.options.snap;
				l = el.length;
				n = -1;

				for ( ; i < l; i++ ) {
					if ( i === 0 || el[i].offsetLeft <= el[i-1].offsetLeft ) {
						m = 0;
						n++;
					}

					if ( !this.pages[m] ) {
						this.pages[m] = [];
					}

					x = Math.max(-el[i].offsetLeft, this.maxScrollX);
					y = Math.max(-el[i].offsetTop, this.maxScrollY);
					cx = x - Math.round(el[i].offsetWidth / 2);
					cy = y - Math.round(el[i].offsetHeight / 2);

					this.pages[m][n] = {
						x: x,
						y: y,
						width: el[i].offsetWidth,
						height: el[i].offsetHeight,
						cx: cx,
						cy: cy
					};

					if ( x > this.maxScrollX ) {
						m++;
					}
				}
			}

			this.goToPage(this.currentPage.pageX || 0, this.currentPage.pageY || 0, 0);

			// Update snap threshold if needed
			if ( this.options.snapThreshold % 1 === 0 ) {
				this.snapThresholdX = this.options.snapThreshold;
				this.snapThresholdY = this.options.snapThreshold;
			} else {
				this.snapThresholdX = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width * this.options.snapThreshold);
				this.snapThresholdY = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height * this.options.snapThreshold);
			}
		});

		this.on('flick', function () {
			var time = this.options.snapSpeed || Math.max(
					Math.max(
						Math.min(Math.abs(this.x - this.startX), 1000),
						Math.min(Math.abs(this.y - this.startY), 1000)
					), 300);

			this.goToPage(
				this.currentPage.pageX + this.directionX,
				this.currentPage.pageY + this.directionY,
				time
			);
		});
	},

	_nearestSnap: function (x, y) {
		if ( !this.pages.length ) {
			return { x: 0, y: 0, pageX: 0, pageY: 0 };
		}

		var i = 0,
			l = this.pages.length,
			m = 0;

		// Check if we exceeded the snap threshold
		if ( Math.abs(x - this.absStartX) < this.snapThresholdX &&
			Math.abs(y - this.absStartY) < this.snapThresholdY ) {
			return this.currentPage;
		}

		if ( x > 0 ) {
			x = 0;
		} else if ( x < this.maxScrollX ) {
			x = this.maxScrollX;
		}

		if ( y > 0 ) {
			y = 0;
		} else if ( y < this.maxScrollY ) {
			y = this.maxScrollY;
		}

		for ( ; i < l; i++ ) {
			if ( x >= this.pages[i][0].cx ) {
				x = this.pages[i][0].x;
				break;
			}
		}

		l = this.pages[i].length;

		for ( ; m < l; m++ ) {
			if ( y >= this.pages[0][m].cy ) {
				y = this.pages[0][m].y;
				break;
			}
		}

		if ( i == this.currentPage.pageX ) {
			i += this.directionX;

			if ( i < 0 ) {
				i = 0;
			} else if ( i >= this.pages.length ) {
				i = this.pages.length - 1;
			}

			x = this.pages[i][0].x;
		}

		if ( m == this.currentPage.pageY ) {
			m += this.directionY;

			if ( m < 0 ) {
				m = 0;
			} else if ( m >= this.pages[0].length ) {
				m = this.pages[0].length - 1;
			}

			y = this.pages[0][m].y;
		}

		return {
			x: x,
			y: y,
			pageX: i,
			pageY: m
		};
	},

	goToPage: function (x, y, time, easing) {
		easing = easing || this.options.bounceEasing;

		if ( x >= this.pages.length ) {
			x = this.pages.length - 1;
		} else if ( x < 0 ) {
			x = 0;
		}

		if ( y >= this.pages[x].length ) {
			y = this.pages[x].length - 1;
		} else if ( y < 0 ) {
			y = 0;
		}

		var posX = this.pages[x][y].x,
			posY = this.pages[x][y].y;

		time = time === undefined ? this.options.snapSpeed || Math.max(
			Math.max(
				Math.min(Math.abs(posX - this.x), 1000),
				Math.min(Math.abs(posY - this.y), 1000)
			), 300) : time;

		this.currentPage = {
			x: posX,
			y: posY,
			pageX: x,
			pageY: y
		};

		this.scrollTo(posX, posY, time, easing);
	},

	next: function (time, easing) {
		var x = this.currentPage.pageX,
			y = this.currentPage.pageY;

		x++;

		if ( x >= this.pages.length && this.hasVerticalScroll ) {
			x = 0;
			y++;
		}

		this.goToPage(x, y, time, easing);
	},

	prev: function (time, easing) {
		var x = this.currentPage.pageX,
			y = this.currentPage.pageY;

		x--;

		if ( x < 0 && this.hasVerticalScroll ) {
			x = 0;
			y--;
		}

		this.goToPage(x, y, time, easing);
	},

	_initKeys: function (e) {
		// default key bindings
		var keys = {
			pageUp: 33,
			pageDown: 34,
			end: 35,
			home: 36,
			left: 37,
			up: 38,
			right: 39,
			down: 40
		};
		var i;

		// if you give me characters I give you keycode
		if ( typeof this.options.keyBindings == 'object' ) {
			for ( i in this.options.keyBindings ) {
				if ( typeof this.options.keyBindings[i] == 'string' ) {
					this.options.keyBindings[i] = this.options.keyBindings[i].toUpperCase().charCodeAt(0);
				}
			}
		} else {
			this.options.keyBindings = {};
		}

		for ( i in keys ) {
			this.options.keyBindings[i] = this.options.keyBindings[i] || keys[i];
		}

		utils.addEvent(window, 'keydown', this);

		this.on('destroy', function () {
			utils.removeEvent(window, 'keydown', this);
		});
	},

	_key: function (e) {
		if ( !this.enabled ) {
			return;
		}

		var snap = this.options.snap,	// we are using this alot, better to cache it
			newX = snap ? this.currentPage.pageX : this.x,
			newY = snap ? this.currentPage.pageY : this.y,
			now = utils.getTime(),
			prevTime = this.keyTime || 0,
			acceleration = 0.250,
			pos;

		if ( this.options.useTransition && this.isInTransition ) {
			pos = this.getComputedPosition();

			this._translate(Math.round(pos.x), Math.round(pos.y));
			this.isInTransition = false;
		}

		this.keyAcceleration = now - prevTime < 200 ? Math.min(this.keyAcceleration + acceleration, 50) : 0;

		switch ( e.keyCode ) {
			case this.options.keyBindings.pageUp:
				if ( this.hasHorizontalScroll && !this.hasVerticalScroll ) {
					newX += snap ? 1 : this.wrapperWidth;
				} else {
					newY += snap ? 1 : this.wrapperHeight;
				}
				break;
			case this.options.keyBindings.pageDown:
				if ( this.hasHorizontalScroll && !this.hasVerticalScroll ) {
					newX -= snap ? 1 : this.wrapperWidth;
				} else {
					newY -= snap ? 1 : this.wrapperHeight;
				}
				break;
			case this.options.keyBindings.end:
				newX = snap ? this.pages.length-1 : this.maxScrollX;
				newY = snap ? this.pages[0].length-1 : this.maxScrollY;
				break;
			case this.options.keyBindings.home:
				newX = 0;
				newY = 0;
				break;
			case this.options.keyBindings.left:
				newX += snap ? -1 : 5 + this.keyAcceleration>>0;
				break;
			case this.options.keyBindings.up:
				newY += snap ? 1 : 5 + this.keyAcceleration>>0;
				break;
			case this.options.keyBindings.right:
				newX -= snap ? -1 : 5 + this.keyAcceleration>>0;
				break;
			case this.options.keyBindings.down:
				newY -= snap ? 1 : 5 + this.keyAcceleration>>0;
				break;
			default:
				return;
		}

		if ( snap ) {
			this.goToPage(newX, newY);
			return;
		}

		if ( newX > 0 ) {
			newX = 0;
			this.keyAcceleration = 0;
		} else if ( newX < this.maxScrollX ) {
			newX = this.maxScrollX;
			this.keyAcceleration = 0;
		}

		if ( newY > 0 ) {
			newY = 0;
			this.keyAcceleration = 0;
		} else if ( newY < this.maxScrollY ) {
			newY = this.maxScrollY;
			this.keyAcceleration = 0;
		}

		this.scrollTo(newX, newY, 0);

		this.keyTime = now;
	},

	_animate: function (destX, destY, duration, easingFn) {
		var that = this,
			startX = this.x,
			startY = this.y,
			startTime = utils.getTime(),
			destTime = startTime + duration;

		function step () {
			var now = utils.getTime(),
				newX, newY,
				easing;

			if ( now >= destTime ) {
				that.isAnimating = false;
				that._translate(destX, destY);

				if ( !that.resetPosition(that.options.bounceTime) ) {
					that._execEvent('scrollEnd');
				}

				return;
			}

			now = ( now - startTime ) / duration;
			easing = easingFn(now);
			newX = ( destX - startX ) * easing + startX;
			newY = ( destY - startY ) * easing + startY;
			that._translate(newX, newY);

			if ( that.isAnimating ) {
				rAF(step);
			}
		}

		this.isAnimating = true;
		step();
	},
	handleEvent: function (e) {
		switch ( e.type ) {
			case 'touchstart':
			case 'MSPointerDown':
			case 'mousedown':
				this._start(e);
				break;
			case 'touchmove':
			case 'MSPointerMove':
			case 'mousemove':
				this._move(e);
				break;
			case 'touchend':
			case 'MSPointerUp':
			case 'mouseup':
			case 'touchcancel':
			case 'MSPointerCancel':
			case 'mousecancel':
				this._end(e);
				break;
			case 'orientationchange':
			case 'resize':
				this._resize();
				break;
			case 'transitionend':
			case 'webkitTransitionEnd':
			case 'oTransitionEnd':
			case 'MSTransitionEnd':
				this._transitionEnd(e);
				break;
			case 'wheel':
			case 'DOMMouseScroll':
			case 'mousewheel':
				this._wheel(e);
				break;
			case 'keydown':
				this._key(e);
				break;
			case 'click':
				if ( !e._constructed ) {
					e.preventDefault();
					e.stopPropagation();
				}
				break;
		}
	}
};
function createDefaultScrollbar (direction, interactive, type) {
	var scrollbar = document.createElement('div'),
		indicator = document.createElement('div');

	if ( type === true ) {
		scrollbar.style.cssText = 'position:absolute;z-index:9999';
		indicator.style.cssText = '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px';
	}

	indicator.className = 'iScrollIndicator';

	if ( direction == 'h' ) {
		if ( type === true ) {
			scrollbar.style.cssText += ';height:7px;left:2px;right:2px;bottom:0';
			indicator.style.height = '100%';
		}
		scrollbar.className = 'iScrollHorizontalScrollbar';
	} else {
		if ( type === true ) {
			scrollbar.style.cssText += ';width:7px;bottom:2px;top:2px;right:1px';
			indicator.style.width = '100%';
		}
		scrollbar.className = 'iScrollVerticalScrollbar';
	}

	scrollbar.style.cssText += ';overflow:hidden';

	if ( !interactive ) {
		scrollbar.style.pointerEvents = 'none';
	}

	scrollbar.appendChild(indicator);

	return scrollbar;
}

function Indicator (scroller, options) {
	this.wrapper = typeof options.el == 'string' ? document.querySelector(options.el) : options.el;
	this.wrapperStyle = this.wrapper.style;
	this.indicator = this.wrapper.children[0];
	this.indicatorStyle = this.indicator.style;
	this.scroller = scroller;

	this.options = {
		listenX: true,
		listenY: true,
		interactive: false,
		resize: true,
		defaultScrollbars: false,
		shrink: false,
		fade: false,
		speedRatioX: 0,
		speedRatioY: 0
	};

	for ( var i in options ) {
		this.options[i] = options[i];
	}

	this.sizeRatioX = 1;
	this.sizeRatioY = 1;
	this.maxPosX = 0;
	this.maxPosY = 0;

	if ( this.options.interactive ) {
		if ( !this.options.disableTouch ) {
			utils.addEvent(this.indicator, 'touchstart', this);
			utils.addEvent(window, 'touchend', this);
		}
		if ( !this.options.disablePointer ) {
			utils.addEvent(this.indicator, 'MSPointerDown', this);
			utils.addEvent(window, 'MSPointerUp', this);
		}
		if ( !this.options.disableMouse ) {
			utils.addEvent(this.indicator, 'mousedown', this);
			utils.addEvent(window, 'mouseup', this);
		}
	}

	if ( this.options.fade ) {
		this.wrapperStyle[utils.style.transform] = this.scroller.translateZ;
		this.wrapperStyle[utils.style.transitionDuration] = utils.isBadAndroid ? '0.001s' : '0ms';
		this.wrapperStyle.opacity = '0';
	}
}

Indicator.prototype = {
	handleEvent: function (e) {
		switch ( e.type ) {
			case 'touchstart':
			case 'MSPointerDown':
			case 'mousedown':
				this._start(e);
				break;
			case 'touchmove':
			case 'MSPointerMove':
			case 'mousemove':
				this._move(e);
				break;
			case 'touchend':
			case 'MSPointerUp':
			case 'mouseup':
			case 'touchcancel':
			case 'MSPointerCancel':
			case 'mousecancel':
				this._end(e);
				break;
		}
	},

	destroy: function () {
		if ( this.options.interactive ) {
			utils.removeEvent(this.indicator, 'touchstart', this);
			utils.removeEvent(this.indicator, 'MSPointerDown', this);
			utils.removeEvent(this.indicator, 'mousedown', this);

			utils.removeEvent(window, 'touchmove', this);
			utils.removeEvent(window, 'MSPointerMove', this);
			utils.removeEvent(window, 'mousemove', this);

			utils.removeEvent(window, 'touchend', this);
			utils.removeEvent(window, 'MSPointerUp', this);
			utils.removeEvent(window, 'mouseup', this);
		}

		if ( this.options.defaultScrollbars ) {
			this.wrapper.parentNode.removeChild(this.wrapper);
		}
	},

	_start: function (e) {
		var point = e.touches ? e.touches[0] : e;

		e.preventDefault();
		e.stopPropagation();

		this.transitionTime();

		this.initiated = true;
		this.moved = false;
		this.lastPointX	= point.pageX;
		this.lastPointY	= point.pageY;

		this.startTime	= utils.getTime();

		if ( !this.options.disableTouch ) {
			utils.addEvent(window, 'touchmove', this);
		}
		if ( !this.options.disablePointer ) {
			utils.addEvent(window, 'MSPointerMove', this);
		}
		if ( !this.options.disableMouse ) {
			utils.addEvent(window, 'mousemove', this);
		}

		this.scroller._execEvent('beforeScrollStart');
	},

	_move: function (e) {
		var point = e.touches ? e.touches[0] : e,
			deltaX, deltaY,
			newX, newY,
			timestamp = utils.getTime();

		if ( !this.moved ) {
			this.scroller._execEvent('scrollStart');
		}

		this.moved = true;

		deltaX = point.pageX - this.lastPointX;
		this.lastPointX = point.pageX;

		deltaY = point.pageY - this.lastPointY;
		this.lastPointY = point.pageY;

		newX = this.x + deltaX;
		newY = this.y + deltaY;

		this._pos(newX, newY);

// INSERT POINT: indicator._move

		e.preventDefault();
		e.stopPropagation();
	},

	_end: function (e) {
		if ( !this.initiated ) {
			return;
		}

		this.initiated = false;

		e.preventDefault();
		e.stopPropagation();

		utils.removeEvent(window, 'touchmove', this);
		utils.removeEvent(window, 'MSPointerMove', this);
		utils.removeEvent(window, 'mousemove', this);

		if ( this.scroller.options.snap ) {
			var snap = this.scroller._nearestSnap(this.scroller.x, this.scroller.y);

			var time = this.options.snapSpeed || Math.max(
					Math.max(
						Math.min(Math.abs(this.scroller.x - snap.x), 1000),
						Math.min(Math.abs(this.scroller.y - snap.y), 1000)
					), 300);

			if ( this.scroller.x != snap.x || this.scroller.y != snap.y ) {
				this.scroller.directionX = 0;
				this.scroller.directionY = 0;
				this.scroller.currentPage = snap;
				this.scroller.scrollTo(snap.x, snap.y, time, this.scroller.options.bounceEasing);
			}
		}

		if ( this.moved ) {
			this.scroller._execEvent('scrollEnd');
		}
	},

	transitionTime: function (time) {
		time = time || 0;
		this.indicatorStyle[utils.style.transitionDuration] = time + 'ms';

		if ( !time && utils.isBadAndroid ) {
			this.indicatorStyle[utils.style.transitionDuration] = '0.001s';
		}
	},

	transitionTimingFunction: function (easing) {
		this.indicatorStyle[utils.style.transitionTimingFunction] = easing;
	},

	refresh: function () {
		this.transitionTime();

		if ( this.options.listenX && !this.options.listenY ) {
			this.indicatorStyle.display = this.scroller.hasHorizontalScroll ? 'block' : 'none';
		} else if ( this.options.listenY && !this.options.listenX ) {
			this.indicatorStyle.display = this.scroller.hasVerticalScroll ? 'block' : 'none';
		} else {
			this.indicatorStyle.display = this.scroller.hasHorizontalScroll || this.scroller.hasVerticalScroll ? 'block' : 'none';
		}

		if ( this.scroller.hasHorizontalScroll && this.scroller.hasVerticalScroll ) {
			utils.addClass(this.wrapper, 'iScrollBothScrollbars');
			utils.removeClass(this.wrapper, 'iScrollLoneScrollbar');

			if ( this.options.defaultScrollbars && this.options.customStyle ) {
				if ( this.options.listenX ) {
					this.wrapper.style.right = '8px';
				} else {
					this.wrapper.style.bottom = '8px';
				}
			}
		} else {
			utils.removeClass(this.wrapper, 'iScrollBothScrollbars');
			utils.addClass(this.wrapper, 'iScrollLoneScrollbar');

			if ( this.options.defaultScrollbars && this.options.customStyle ) {
				if ( this.options.listenX ) {
					this.wrapper.style.right = '2px';
				} else {
					this.wrapper.style.bottom = '2px';
				}
			}
		}

		var r = this.wrapper.offsetHeight;	// force refresh

		if ( this.options.listenX ) {
			this.wrapperWidth = this.wrapper.clientWidth;
			if ( this.options.resize ) {
				this.indicatorWidth = Math.max(Math.round(this.wrapperWidth * this.wrapperWidth / (this.scroller.scrollerWidth || this.wrapperWidth || 1)), 8);
				this.indicatorStyle.width = this.indicatorWidth + 'px';
			} else {
				this.indicatorWidth = this.indicator.clientWidth;
			}

			this.maxPosX = this.wrapperWidth - this.indicatorWidth;

			if ( this.options.shrink == 'clip' ) {
				this.minBoundaryX = -this.indicatorWidth + 8;
				this.maxBoundaryX = this.wrapperWidth - 8;
			} else {
				this.minBoundaryX = 0;
				this.maxBoundaryX = this.maxPosX;
			}

			this.sizeRatioX = this.options.speedRatioX || (this.scroller.maxScrollX && (this.maxPosX / this.scroller.maxScrollX));	
		}

		if ( this.options.listenY ) {
			this.wrapperHeight = this.wrapper.clientHeight;
			if ( this.options.resize ) {
				this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8);
				this.indicatorStyle.height = this.indicatorHeight + 'px';
			} else {
				this.indicatorHeight = this.indicator.clientHeight;
			}

			this.maxPosY = this.wrapperHeight - this.indicatorHeight;

			if ( this.options.shrink == 'clip' ) {
				this.minBoundaryY = -this.indicatorHeight + 8;
				this.maxBoundaryY = this.wrapperHeight - 8;
			} else {
				this.minBoundaryY = 0;
				this.maxBoundaryY = this.maxPosY;
			}

			this.maxPosY = this.wrapperHeight - this.indicatorHeight;
			this.sizeRatioY = this.options.speedRatioY || (this.scroller.maxScrollY && (this.maxPosY / this.scroller.maxScrollY));
		}

		this.updatePosition();
	},

	updatePosition: function () {
		var x = this.options.listenX && Math.round(this.sizeRatioX * this.scroller.x) || 0,
			y = this.options.listenY && Math.round(this.sizeRatioY * this.scroller.y) || 0;

		if ( !this.options.ignoreBoundaries ) {
			if ( x < this.minBoundaryX ) {
				if ( this.options.shrink == 'scale' ) {
					this.width = Math.max(this.indicatorWidth + x, 8);
					this.indicatorStyle.width = this.width + 'px';
				}
				x = this.minBoundaryX;
			} else if ( x > this.maxBoundaryX ) {
				if ( this.options.shrink == 'scale' ) {
					this.width = Math.max(this.indicatorWidth - (x - this.maxPosX), 8);
					this.indicatorStyle.width = this.width + 'px';
					x = this.maxPosX + this.indicatorWidth - this.width;
				} else {
					x = this.maxBoundaryX;
				}
			} else if ( this.options.shrink == 'scale' && this.width != this.indicatorWidth ) {
				this.width = this.indicatorWidth;
				this.indicatorStyle.width = this.width + 'px';
			}

			if ( y < this.minBoundaryY ) {
				if ( this.options.shrink == 'scale' ) {
					this.height = Math.max(this.indicatorHeight + y * 3, 8);
					this.indicatorStyle.height = this.height + 'px';
				}
				y = this.minBoundaryY;
			} else if ( y > this.maxBoundaryY ) {
				if ( this.options.shrink == 'scale' ) {
					this.height = Math.max(this.indicatorHeight - (y - this.maxPosY) * 3, 8);
					this.indicatorStyle.height = this.height + 'px';
					y = this.maxPosY + this.indicatorHeight - this.height;
				} else {
					y = this.maxBoundaryY;
				}
			} else if ( this.options.shrink == 'scale' && this.height != this.indicatorHeight ) {
				this.height = this.indicatorHeight;
				this.indicatorStyle.height = this.height + 'px';
			}
		}

		this.x = x;
		this.y = y;

		if ( this.scroller.options.useTransform ) {
			this.indicatorStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.scroller.translateZ;
		} else {
			this.indicatorStyle.left = x + 'px';
			this.indicatorStyle.top = y + 'px';
		}
	},

	_pos: function (x, y) {
		if ( x < 0 ) {
			x = 0;
		} else if ( x > this.maxPosX ) {
			x = this.maxPosX;
		}

		if ( y < 0 ) {
			y = 0;
		} else if ( y > this.maxPosY ) {
			y = this.maxPosY;
		}

		x = this.options.listenX ? Math.round(x / this.sizeRatioX) : this.scroller.x;
		y = this.options.listenY ? Math.round(y / this.sizeRatioY) : this.scroller.y;

		this.scroller.scrollTo(x, y);
	},

	fade: function (val, hold) {
		if ( hold && !this.visible ) {
			return;
		}

		clearTimeout(this.fadeTimeout);
		this.fadeTimeout = null;

		var time = val ? 250 : 500,
			delay = val ? 0 : 300;

		val = val ? '1' : '0';

		this.wrapperStyle[utils.style.transitionDuration] = time + 'ms';

		this.fadeTimeout = setTimeout((function (val) {
			this.wrapperStyle.opacity = val;
			this.visible = +val;
		}).bind(this, val), delay);
	}
};

IScroll.utils = utils;

if ( typeof module != 'undefined' && module.exports ) {
	module.exports = IScroll;
} else {
	window.IScroll = IScroll;
}

})(window, document, Math);
},{}],10:[function(require,module,exports){
var process=require("__browserify_process");// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
    // Turn off strict mode for this function so we can assign to global.Q
    /* jshint strict: false */

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = definition;
        }

    // <script>
    } else {
        Q = definition();
    }

})(function () {
"use strict";

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;

    function flush() {
        /* jshint loopfunc: true */

        while (head.next) {
            head = head.next;
            var task = head.task;
            head.task = void 0;
            var domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }

            try {
                task();

            } catch (e) {
                if (isNodeJS) {
                    // In node, uncaught exceptions are considered fatal errors.
                    // Re-throw them synchronously to interrupt flushing!

                    // Ensure continuation if the uncaught exception is suppressed
                    // listening "uncaughtException" events (as domains does).
                    // Continue in next event to avoid tick recursion.
                    if (domain) {
                        domain.exit();
                    }
                    setTimeout(flush, 0);
                    if (domain) {
                        domain.enter();
                    }

                    throw e;

                } else {
                    // In browsers, uncaught exceptions are not fatal.
                    // Re-throw them asynchronously to avoid slow-downs.
                    setTimeout(function() {
                       throw e;
                    }, 0);
                }
            }

            if (domain) {
                domain.exit();
            }
        }

        flushing = false;
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process !== "undefined" && process.nextTick) {
        // Node.js before 0.9. Note that some fake-Node environments, like the
        // Mocha test runner, introduce a `process` global without a `nextTick`.
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }

    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this **might** have the nice side-effect of reducing the size of
// the minified code by reducing x.call() to merely x()
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
// engine that has a deployed base of browsers that support generators.
// However, SM's generators use the Python-inspired semantics of
// outdated ES6 drafts.  We would like to support ES6, but we'd also
// like to make it possible to use generators in deployed browsers, so
// we also support Python-style generators.  At some point we can remove
// this block.
var hasES6Generators;
try {
    /* jshint evil: true, nonew: false */
    new Function("(function* (){ yield 1; })");
    hasES6Generators = true;
} catch (e) {
    hasES6Generators = false;
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (isPromise(value)) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    };

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined, message) {
            nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become fulfilled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be fulfilled
 */
Q.race = race;
function race(answerPs) {
    return promise(function(resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function(answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        };
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return isObject(object) &&
        typeof object.promiseDispatch === "function" &&
        typeof object.inspect === "function";
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var unhandledReasonsDisplayed = false;
var trackUnhandledRejections = true;
function displayUnhandledReasons() {
    if (
        !unhandledReasonsDisplayed &&
        typeof window !== "undefined" &&
        window.console
    ) {
        console.warn("[Q] Unhandled rejection reasons (should be empty):",
                     unhandledReasons);
    }

    unhandledReasonsDisplayed = true;
}

function logUnhandledReasons() {
    for (var i = 0; i < unhandledReasons.length; i++) {
        var reason = unhandledReasons[i];
        console.warn("Unhandled rejection reason:", reason);
    }
}

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;
    unhandledReasonsDisplayed = false;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;

        // Show unhandled rejection reasons if Node exits without handling an
        // outstanding rejection.  (Note that Browserify presently produces a
        // `process` global without the `EventEmitter` `on` method.)
        if (typeof process !== "undefined" && process.on) {
            process.on("exit", logUnhandledReasons);
        }
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
    displayUnhandledReasons();
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    if (typeof process !== "undefined" && process.on) {
        process.removeListener("exit", logUnhandledReasons);
    }
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;
            if (hasES6Generators) {
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return result.value;
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return exception.value;
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var countDown = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++countDown;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--countDown === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (countDown === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {String} custom error message (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, message) {
    return Q(object).timeout(ms, message);
};

Promise.prototype.timeout = function (ms, message) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        deferred.reject(new Error(message || "Timed out after " + ms + " ms"));
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});

},{"__browserify_process":8}],11:[function(require,module,exports){
/**
 * qstart.js - DOM ready promisified with Q
 */

(function (definition) {
    if (typeof exports === "object") {
        module.exports = definition();
    } else {
        Qstart = definition();
    }

})(function () {
    var Q = window.Q || require('q'),
        d = Q.defer(),
        successf = function () {
            window.removeEventListener("error", errorf);
            d.resolve(window.document);
        },
        errorf = function (err) { d.reject(err); };

    window.document.addEventListener("readystatechange", function () {
        if (document.readyState == "complete") successf();
    }, false);
    window.addEventListener("error", errorf, false);
    return d.promise;
});

},{"q":10}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvcGV1dGV0cmUvY29kZS9tb2JpbGUtYnV0dG9uL2V4YW1wbGUvc2Nyb2xsYWJsZS15L2luZGV4LmpzIiwiL1VzZXJzL3BldXRldHJlL2NvZGUvbW9iaWxlLWJ1dHRvbi9saWIvYnV0dG9uLmpzIiwiL1VzZXJzL3BldXRldHJlL2NvZGUvbW9iaWxlLWJ1dHRvbi9saWIvZGVmYXVsdC90b3VjaGVuZC1idXR0b24uanMiLCIvVXNlcnMvcGV1dGV0cmUvY29kZS9tb2JpbGUtYnV0dG9uL2xpYi9kZWZhdWx0L3RvdWNoc3RhcnQtYnV0dG9uLmpzIiwiL1VzZXJzL3BldXRldHJlL2NvZGUvbW9iaWxlLWJ1dHRvbi9saWIvaW5kZXguanMiLCIvVXNlcnMvcGV1dGV0cmUvY29kZS9tb2JpbGUtYnV0dG9uL2xpYi9zY3JvbGxhYmxlLXgvdG91Y2hlbmQtYnV0dG9uLmpzIiwiL1VzZXJzL3BldXRldHJlL2NvZGUvbW9iaWxlLWJ1dHRvbi9saWIvc2Nyb2xsYWJsZS15L3RvdWNoZW5kLWJ1dHRvbi5qcyIsIi9Vc2Vycy9wZXV0ZXRyZS9jb2RlL21vYmlsZS1idXR0b24vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL1VzZXJzL3BldXRldHJlL2NvZGUvbW9iaWxlLWJ1dHRvbi9ub2RlX21vZHVsZXMvaXNjcm9sbC9idWlsZC9pc2Nyb2xsLmpzIiwiL1VzZXJzL3BldXRldHJlL2NvZGUvbW9iaWxlLWJ1dHRvbi9ub2RlX21vZHVsZXMvcS9xLmpzIiwiL1VzZXJzL3BldXRldHJlL2NvZGUvbW9iaWxlLWJ1dHRvbi9ub2RlX21vZHVsZXMvcXN0YXJ0L3NyYy9xc3RhcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbjhEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvNERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBpbmRleC5qc1xuICovXG5cbnZhciBRID0gcmVxdWlyZSgncScpLFxuICAgIHFzdGFydCA9IHJlcXVpcmUoJ3FzdGFydCcpLFxuICAgIElTY3JvbGwgPSByZXF1aXJlKCdpc2Nyb2xsJyksXG4gICAgTUJ1dHRvbiA9IHJlcXVpcmUoJy4uLy4uL2xpYi9pbmRleC5qcycpO1xuXG5mdW5jdGlvbiBtYWluKCkge1xuICAgIHZhciBoMSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2gxJyksXG4gICAgICAgIHNjcm9sbFZpZXcgPSBuZXcgSVNjcm9sbCgnI3dyYXBwZXInLCB7XG4gICAgICAgICAgICBtb3VzZVdoZWVsOiB0cnVlXG4gICAgICAgIH0pLFxuICAgICAgICBiYWNrQnRuID0gbmV3IE1CdXR0b24uVG91Y2hlbmQoe1xuICAgICAgICAgICAgZWwgOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFjaycpLFxuICAgICAgICAgICAgZiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSAnLi4vaW5kZXguaHRtbCc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICBidG4xID0gbmV3IE1CdXR0b24uU2Nyb2xsYWJsZVkuVG91Y2hlbmQoe1xuICAgICAgICAgICAgdG9sZXJhbmNlOiAxMCxcbiAgICAgICAgICAgIGVsIDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bjEnKSxcbiAgICAgICAgICAgIGYgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaDEuc3R5bGUuY29sb3IgPSAncmdiKDIxOSwgOTYsIDk2KSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICBidG4yID0gbmV3IE1CdXR0b24uU2Nyb2xsYWJsZVkuVG91Y2hlbmQoe1xuICAgICAgICAgICAgdG9sZXJhbmNlOiAxMCxcbiAgICAgICAgICAgIGVsIDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bjInKSxcbiAgICAgICAgICAgIGYgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgIGgxLnN0eWxlLmNvbG9yID0gJ3JnYig3NywgMTU4LCA3NyknO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgICAgYnRuMyA9IG5ldyBNQnV0dG9uLlNjcm9sbGFibGVZLlRvdWNoZW5kKHtcbiAgICAgICAgICAgIHRvbGVyYW5jZTogMTAsXG4gICAgICAgICAgICBlbCA6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4zJyksXG4gICAgICAgICAgICBmIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGgxLnN0eWxlLmNvbG9yID0gJ3JnYig3NywgMTM2LCAxODIpJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICBiYWNrQnRuLmJpbmQoKTtcbiAgICBidG4xLmJpbmQoKTtcbiAgICBidG4yLmJpbmQoKTtcbiAgICBidG4zLmJpbmQoKTtcblxufVxuXG5xc3RhcnQudGhlbihtYWluKS5kb25lKCk7XG4iLCIvKlxuICogYnV0dG9uLmpzIC0gdGhlIGJhc2Ugb2YgYWxsIGJ1dHRvbnNcbiAqXG4gKiBBbGwgYnV0dG9ucyBzaGFyZSB0d28gZWxlbWVudHM6IGEgZnVuY3Rpb24sIHRoZSBjYWxsYmFjayBvZiB0aGUgYnV0dG9uXG4gKiBhbmQgYSBET00gZWxlbWVudC5cbiAqXG4gKiBJZiB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gcmV0dXJucyBhIHByb21pc2UsIHRoZSBidXR0b24gd2lsbFxuICoga2VlcCBpcyBhY3RpdmUgc3RhdGUgdW50aWwgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQ7XG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBCdXR0b24gPSBmdW5jdGlvbiBCdXR0b24gKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIC8qIHRoZSBjYWxsYmFjayBmdW5jdGlvbiAqL1xuICAgIHRoaXMuZiA9IG51bGw7XG4gICAgLyogdGhlIGRvbSBlbGVtZW50IHJlcHJlc2VudGluZyB0aGUgYnV0dG9uICovXG4gICAgdGhpcy5lbCA9IG51bGw7XG5cbiAgICAvKiB0aGUgc3RhdGUgb2YgdGhlIGJ1dHRvbiAqL1xuICAgIHRoaXMuYmluZGVkID0gZmFsc2U7XG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcblxuICAgIC8qIGRlZmF1bHQgYWN0aXZlIGNzcyBjbGFzcyovXG4gICAgdGhpcy5hY3RpdmVDbHMgPSAnYWN0aXZlJztcblxuICAgIGlmKHR5cGVvZiBvcHRpb25zLmFjdGl2ZUNscyA9PT0gJ3N0cmluZycpIHRoaXMuYWN0aXZlQ2xzID0gb3B0aW9ucy5hY3RpdmVDbHM7XG4gICAgaWYob3B0aW9ucy5lbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB0aGlzLmVsID0gb3B0aW9ucy5lbDtcbiAgICBpZih0eXBlb2Ygb3B0aW9ucy5mID09PSAnZnVuY3Rpb24nKSB0aGlzLmYgPSBvcHRpb25zLmY7XG59O1xuXG5CdXR0b24ucHJvdG90eXBlLnNldEVsID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgaWYodGhpcy5hY3RpdmUpIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNoYW5nZSBkb20gZWxlbWVudCwgYnV0dG9uIGlzIGFjdGl2ZS5cIik7XG4gICAgaWYodGhpcy5iaW5kZWQpIHRoaXMudW5iaW5kKCk7XG4gICAgaWYoZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsID0gZWw7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQnV0dG9uIHNldEVsIG1ldGhvZCBuZWVkcyBhIGRvbSBlbGVtZW50IGFzIGFyZ3VtZW50LlwiKTtcbiAgICB9XG59O1xuXG5CdXR0b24ucHJvdG90eXBlLnNldEFjdGl2ZSA9IGZ1bmN0aW9uIChhY3RpdmUpIHtcbiAgICBpZiAoYWN0aXZlKSB0aGlzLmVsLmNsYXNzTGlzdC5hZGQodGhpcy5hY3RpdmVDbHMpO1xuICAgIGVsc2UgdGhpcy5lbC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuYWN0aXZlQ2xzKTtcbiAgICB0aGlzLmFjdGl2ZSA9IGFjdGl2ZTtcbn07XG5cbkJ1dHRvbi5wcm90b3R5cGUuc2V0RiA9IGZ1bmN0aW9uIChmKSB7XG4gICAgaWYgKHR5cGVvZiBmICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCdXR0b24gc2V0RiBtZXRob2QgbmVlZHMgYSBmIGZ1bmN0aW9uIGFzIGFyZ3VtZW50LlwiKTtcbiAgICB0aGlzLmYgPSBmO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyogaW1wbC4gbm90IGNvbXBsZXRlZCwgYSBjaGlsZCB3aWxsIHJlZGVmaW5lIHRoZSBiaW5kIG1ldGhvZCwgY2FsbCB0aGlzIG9uZSBhbmQgc2V0IHRoaXMuYmluZGVkIHRvIHRydWUqL1xuQnV0dG9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKCkge1xuICAgIGlmKCF0aGlzLmVsIHx8ICF0aGlzLmYpIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGJpbmQgYW4gdW5pbml0aWFsaXplZCBidXR0b24uXCIpO1xuICAgIGlmKHRoaXMuYmluZGVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBiaW5kIGFuIGFscmVhZHkgYmluZGVkIGJ1dHRvbi5cIik7XG59O1xuXG4vKiBpbXBsLiBub3QgY29tcGxldGVkLCBhIGNoaWxkIHdpbGwgcmVkZWZpbmUgdGhlIGJpbmQgbWV0aG9kLCBjYWxsIHRoaXMgb25lIGFuZCBzZXQgdGhpcy5iaW5kZWQgdG8gZmFsc2UqL1xuQnV0dG9uLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYoIXRoaXMuZWwgfHwgIXRoaXMuZikgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgdW5iaW5kIGFuIHVuaW5pdGlhbGl6ZWQgYnV0dG9uLlwiKTtcbiAgICBpZighdGhpcy5iaW5kZWQpIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHVuYmluZCBhIHVuYmluZGVkIGJ1dHRvbi5cIik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1dHRvbjtcbiIsIi8qXG4gKiBkZWZhdWx0L3RvdWNoZW5kLWJ1dHRvbi5qc1xuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgUSA9IHJlcXVpcmUoJ3EnKSxcbiAgICBCdXR0b24gPSByZXF1aXJlKCcuLy4uL2J1dHRvbicpO1xuXG52YXIgVG91Y2hlbmRCdXR0b24gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIEJ1dHRvbi5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICB0aGlzLmFjdGl2ZUJvcmRlciA9IG9wdGlvbnMuYWN0aXZlQm9yZGVyIHx8IDUwO1xuICAgIHRoaXMuYm91bmRhcmllcyA9IHsgbWluWCA6IDAsIG1heFggOiAwLCBtaW5ZIDogMCwgbWF4WSA6IDAgfTtcbiAgICB0aGlzLmlkZW50aWZpZXIgPSBudWxsO1xufTtcblxuVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlID0gKGZ1bmN0aW9uIChwcm90bykge1xuICAgIGZ1bmN0aW9uIEYoKSB7fTtcbiAgICBGLnByb3RvdHlwZSA9IHByb3RvO1xuICAgIHJldHVybiBuZXcgRigpO1xufSkoQnV0dG9uLnByb3RvdHlwZSk7XG5cblRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRvdWNoZW5kQnV0dG9uO1xuXG5Ub3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUuc2V0QWN0aXZlQm9yZGVyID0gZnVuY3Rpb24gKGxlbikge1xuICAgIHRoaXMuYWN0aXZlQm9yZGVyID0gbGVuO1xufTtcblxuVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlLl9nZXRUb3VjaCA9IGZ1bmN0aW9uIChjaGFuZ2VkVG91Y2hlcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGNoYW5nZWRUb3VjaGVzW2ldLmlkZW50aWZpZXIgPT09IHRoaXMuaWRlbnRpZmllcikge1xuICAgICAgICAgICAgcmV0dXJuIGNoYW5nZWRUb3VjaGVzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxuVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlLl9pc0luQWN0aXZlWm9uZSA9IGZ1bmN0aW9uICh0b3VjaCkge1xuICAgIHZhciB4ID0gdG91Y2guY2xpZW50WCxcbiAgICAgICAgeSA9IHRvdWNoLmNsaWVudFksXG4gICAgICAgIGIgPSB0aGlzLmJvdW5kYXJpZXM7XG4gICAgcmV0dXJuIHggPCBiLm1heFggJiYgeCA+IGIubWluWCAmJiB5IDwgYi5tYXhZICYmIHkgPiBiLm1pblk7XG59O1xuXG5Ub3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUuX3JlbW92ZUNscyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5lbC5jbGFzc0xpc3QuY29udGFpbnModGhpcy5hY3RpdmVDbHMpKVxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5hY3RpdmVDbHMpO1xufTtcblxuVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlLl9hZGRDbHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmVsLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLmFjdGl2ZUNscykpXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCh0aGlzLmFjdGl2ZUNscyk7XG59O1xuXG5Ub3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBCdXR0b24ucHJvdG90eXBlLmJpbmQuY2FsbCh0aGlzKTtcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLCBmYWxzZSk7XG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLCBmYWxzZSk7XG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMsIGZhbHNlKTtcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcywgZmFsc2UpO1xuICAgIHRoaXMuYmluZGVkID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cblRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgQnV0dG9uLnByb3RvdHlwZS51bmJpbmQuY2FsbCh0aGlzKTtcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLCBmYWxzZSk7XG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLCBmYWxzZSk7XG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMsIGZhbHNlKTtcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcywgZmFsc2UpO1xuICAgIHRoaXMuYmluZGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5Ub3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgc3dpdGNoKGV2dC50eXBlKSB7XG4gICAgICAgIGNhc2UgJ3RvdWNoc3RhcnQnOlxuICAgICAgICAgICAgdGhpcy5vblRvdWNoc3RhcnQoZXZ0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0b3VjaG1vdmUnOlxuICAgICAgICAgICAgdGhpcy5vblRvdWNobW92ZShldnQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3RvdWNoZW5kJzpcbiAgICAgICAgICAgIHRoaXMub25Ub3VjaGVuZChldnQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3RvdWNoY2FuY2VsJzpcbiAgICAgICAgICAgIHRoaXMub25Ub3VjaGNhbmNlbChldnQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufTtcblxuVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlLm9uVG91Y2hzdGFydCA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICBpZighdGhpcy5hY3RpdmUpIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLnRyaWdnZXJPblRvdWNoZW5kID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pZGVudGlmaWVyID0gZXZ0LmNoYW5nZWRUb3VjaGVzWzBdLmlkZW50aWZpZXI7XG4gICAgICAgIHZhciBib3VuZGluZ1JlY3QgPSB0aGlzLmVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0aGlzLmJvdW5kYXJpZXMubWluWCA9IGJvdW5kaW5nUmVjdC5sZWZ0IC0gdGhpcy5hY3RpdmVCb3JkZXI7XG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5tYXhYID0gYm91bmRpbmdSZWN0LmxlZnQgKyBib3VuZGluZ1JlY3Qud2lkdGggKyB0aGlzLmFjdGl2ZUJvcmRlcjtcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLm1pblkgPSBib3VuZGluZ1JlY3QudG9wIC0gdGhpcy5hY3RpdmVCb3JkZXI7XG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5tYXhZID0gYm91bmRpbmdSZWN0LmJvdHRvbSArICB0aGlzLmFjdGl2ZUJvcmRlcjtcbiAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKHRoaXMuYWN0aXZlQ2xzKTtcbiAgICB9XG59O1xuXG5Ub3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUub25Ub3VjaG1vdmUgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYodGhpcy5hY3RpdmUpIHtcbiAgICAgICAgdmFyIHRvdWNoID0gdGhpcy5fZ2V0VG91Y2goZXZ0LmNoYW5nZWRUb3VjaGVzKTtcbiAgICAgICAgaWYgKHRvdWNoKSB7XG4gICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzSW5BY3RpdmVab25lKHRvdWNoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck9uVG91Y2hlbmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZENscygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyT25Ub3VjaGVuZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZUNscygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlLm9uVG91Y2hlbmQgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYodGhpcy5hY3RpdmUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2dldFRvdWNoKGV2dC5jaGFuZ2VkVG91Y2hlcykpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRyaWdnZXJPblRvdWNoZW5kKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJ0biA9IHRoaXM7XG4gICAgICAgICAgICAgICAgUShldnQpLnRoZW4odGhpcy5mKS5kb25lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgYnRuLm9uVG91Y2hjYW5jZWwoZXZ0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMub25Ub3VjaGNhbmNlbChldnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlLm9uVG91Y2hjYW5jZWwgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgdGhpcy5fcmVtb3ZlQ2xzKCk7XG4gICAgaWYodGhpcy5hY3RpdmUpIHRoaXMuYWN0aXZlID0gZmFsc2U7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRvdWNoZW5kQnV0dG9uO1xuIiwiLypcbiAqIGRlZmF1bHQvdG91Y2hzdGFydC1idXR0b24uanNcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIFEgPSByZXF1aXJlKCdxJyksXG4gICAgQnV0dG9uID0gcmVxdWlyZSgnLi8uLi9idXR0b24nKTtcblxudmFyIFRvdWNoc3RhcnRCdXR0b24gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIEJ1dHRvbi5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICB0aGlzLmRlbGF5ID0gb3B0aW9ucy5kZWxheSA+IDAgPyBvcHRpb25zLmRlbGF5IDogMDtcbn07XG5cblRvdWNoc3RhcnRCdXR0b24ucHJvdG90eXBlID0gKGZ1bmN0aW9uIChwcm90bykge1xuICAgIGZ1bmN0aW9uIEYoKSB7fTtcbiAgICBGLnByb3RvdHlwZSA9IHByb3RvO1xuICAgIHJldHVybiBuZXcgRigpO1xufSkoQnV0dG9uLnByb3RvdHlwZSk7XG5cblRvdWNoc3RhcnRCdXR0b24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVG91Y2hzdGFydEJ1dHRvbjtcblxuVG91Y2hzdGFydEJ1dHRvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBCdXR0b24ucHJvdG90eXBlLmJpbmQuY2FsbCh0aGlzKTtcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLCBmYWxzZSk7XG4gICAgdGhpcy5iaW5kZWQgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuVG91Y2hzdGFydEJ1dHRvbi5wcm90b3R5cGUudW5iaW5kID0gZnVuY3Rpb24gKCkge1xuICAgIEJ1dHRvbi5wcm90b3R5cGUudW5iaW5kLmNhbGwodGhpcyk7XG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcywgZmFsc2UpO1xuICAgIHRoaXMuYmluZGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5Ub3VjaHN0YXJ0QnV0dG9uLnByb3RvdHlwZS5oYW5kbGVFdmVudCA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICBzd2l0Y2goZXZ0LnR5cGUpIHtcbiAgICAgICAgY2FzZSAndG91Y2hzdGFydCc6XG4gICAgICAgICAgICB0aGlzLm9uVG91Y2hzdGFydChldnQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufTtcblxuVG91Y2hzdGFydEJ1dHRvbi5wcm90b3R5cGUub25Ub3VjaHN0YXJ0ID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIGlmICghdGhpcy5hY3RpdmUpIHtcbiAgICAgICAgdmFyIGJ0biA9IHRoaXM7XG4gICAgICAgIGJ0bi5zZXRBY3RpdmUodHJ1ZSk7XG4gICAgICAgIFEuZGVsYXkoZXZ0LCBidG4uZGVsYXkpLnRoZW4oYnRuLmYpLmRvbmUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYnRuLnNldEFjdGl2ZShmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVG91Y2hzdGFydEJ1dHRvbjtcbiIsIi8qXG4gKiBpbmRleC5qcyAtIG1vYmlsZS1idXR0b24gbW9kdWxlXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgVG91Y2hzdGFydCA6IHJlcXVpcmUoJy4vZGVmYXVsdC90b3VjaHN0YXJ0LWJ1dHRvbicpLFxuICAgIFRvdWNoZW5kIDogcmVxdWlyZSgnLi9kZWZhdWx0L3RvdWNoZW5kLWJ1dHRvbicpLFxuICAgIFNjcm9sbGFibGVZIDoge1xuICAgICAgICBUb3VjaGVuZCA6IHJlcXVpcmUoJy4vc2Nyb2xsYWJsZS15L3RvdWNoZW5kLWJ1dHRvbicpXG4gICAgfSxcbiAgICBTY3JvbGxhYmxlWCA6IHtcbiAgICAgICAgVG91Y2hlbmQgOiByZXF1aXJlKCcuL3Njcm9sbGFibGUteC90b3VjaGVuZC1idXR0b24nKVxuICAgIH1cbn07XG4iLCIvKlxuICogc2Nyb2xsYWJsZS14L3RvdWNoZW5kLWJ1dHRvbi5qc1xuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgVG91Y2hlbmRCdXR0b24gPSByZXF1aXJlKCcuLy4uL2RlZmF1bHQvdG91Y2hlbmQtYnV0dG9uJyk7XG5cbnZhciBTY3JvbGxhYmxlWFRvdWNoZW5kQnV0dG9uID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBUb3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICB0aGlzLnRvbGVyYW5jZSA9IG9wdGlvbnMudG9sZXJhbmNlIHx8IDEwO1xufTtcblxuU2Nyb2xsYWJsZVhUb3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUgPSAoZnVuY3Rpb24gKHByb3RvKSB7XG4gICAgZnVuY3Rpb24gRigpIHt9O1xuICAgIEYucHJvdG90eXBlID0gcHJvdG87XG4gICAgcmV0dXJuIG5ldyBGKCk7XG59KShUb3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUpO1xuXG5TY3JvbGxhYmxlWFRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNjcm9sbGFibGVYVG91Y2hlbmRCdXR0b247XG5cblNjcm9sbGFibGVYVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlLm9uVG91Y2hzdGFydCA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICBpZighdGhpcy5hY3RpdmUpIHRoaXMuc3RhcnRYID0gZXZ0LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFg7XG4gICAgVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlLm9uVG91Y2hzdGFydC5jYWxsKHRoaXMsIGV2dCk7XG59O1xuXG5TY3JvbGxhYmxlWFRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZS5faXNJbkFjdGl2ZVpvbmUgPSBmdW5jdGlvbiAodG91Y2gpIHtcbiAgICB2YXIgeSA9IHRvdWNoLmNsaWVudFksXG4gICAgICAgIGQgPSBNYXRoLmFicyh0b3VjaC5jbGllbnRYIC0gdGhpcy5zdGFydFgpLFxuICAgICAgICBiID0gdGhpcy5ib3VuZGFyaWVzO1xuICAgIHJldHVybiB5IDwgYi5tYXhZICYmIHkgPiBiLm1pblkgJiYgZCA8IHRoaXMudG9sZXJhbmNlO1xufTtcblxuU2Nyb2xsYWJsZVhUb3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUub25Ub3VjaG1vdmUgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYodGhpcy5hY3RpdmUpIHtcbiAgICAgICAgdmFyIHRvdWNoID0gdGhpcy5fZ2V0VG91Y2goZXZ0LmNoYW5nZWRUb3VjaGVzKTtcbiAgICAgICAgaWYgKHRvdWNoKSB7XG4gICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzSW5BY3RpdmVab25lKHRvdWNoKSkgdGhpcy5fYWRkQ2xzKCk7XG4gICAgICAgICAgICBlbHNlIHRoaXMub25Ub3VjaGNhbmNlbC5jYWxsKHRoaXMsIGV2dCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNjcm9sbGFibGVYVG91Y2hlbmRCdXR0b247XG4iLCIvKlxuICogc2Nyb2xsYWJsZS15L3RvdWNoZW5kLWJ1dHRvbi5qc1xuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgVG91Y2hlbmRCdXR0b24gPSByZXF1aXJlKCcuLy4uL2RlZmF1bHQvdG91Y2hlbmQtYnV0dG9uJyk7XG5cbnZhciBTY3JvbGxhYmxlWVRvdWNoZW5kQnV0dG9uID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBUb3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICB0aGlzLnRvbGVyYW5jZSA9IG9wdGlvbnMudG9sZXJhbmNlIHx8IDEwO1xufTtcblxuU2Nyb2xsYWJsZVlUb3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUgPSAoZnVuY3Rpb24gKHByb3RvKSB7XG4gICAgZnVuY3Rpb24gRigpIHt9O1xuICAgIEYucHJvdG90eXBlID0gcHJvdG87XG4gICAgcmV0dXJuIG5ldyBGKCk7XG59KShUb3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUpO1xuXG5TY3JvbGxhYmxlWVRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNjcm9sbGFibGVZVG91Y2hlbmRCdXR0b247XG5cblNjcm9sbGFibGVZVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlLm9uVG91Y2hzdGFydCA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICBpZighdGhpcy5hY3RpdmUpIHRoaXMuc3RhcnRZID0gZXZ0LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFk7XG4gICAgVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlLm9uVG91Y2hzdGFydC5jYWxsKHRoaXMsIGV2dCk7XG59O1xuXG5TY3JvbGxhYmxlWVRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZS5faXNJbkFjdGl2ZVpvbmUgPSBmdW5jdGlvbiAodG91Y2gpIHtcbiAgICB2YXIgeCA9IHRvdWNoLmNsaWVudFgsXG4gICAgICAgIGQgPSBNYXRoLmFicyh0b3VjaC5jbGllbnRZIC0gdGhpcy5zdGFydFkpLFxuICAgICAgICBiID0gdGhpcy5ib3VuZGFyaWVzO1xuICAgIHJldHVybiB4IDwgYi5tYXhYICYmIHggPiBiLm1pblggJiYgZCA8IHRoaXMudG9sZXJhbmNlO1xufTtcblxuU2Nyb2xsYWJsZVlUb3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUub25Ub3VjaG1vdmUgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYodGhpcy5hY3RpdmUpIHtcbiAgICAgICAgdmFyIHRvdWNoID0gdGhpcy5fZ2V0VG91Y2goZXZ0LmNoYW5nZWRUb3VjaGVzKTtcbiAgICAgICAgaWYgKHRvdWNoKSB7XG4gICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzSW5BY3RpdmVab25lKHRvdWNoKSkgdGhpcy5fYWRkQ2xzKCk7XG4gICAgICAgICAgICBlbHNlIHRoaXMub25Ub3VjaGNhbmNlbC5jYWxsKHRoaXMsIGV2dCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNjcm9sbGFibGVZVG91Y2hlbmRCdXR0b247XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCIvKiEgaVNjcm9sbCB2NS4xLjEgfiAoYykgMjAwOC0yMDE0IE1hdHRlbyBTcGluZWxsaSB+IGh0dHA6Ly9jdWJpcS5vcmcvbGljZW5zZSAqL1xuKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50LCBNYXRoKSB7XG52YXIgckFGID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZVx0fHxcblx0d2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVx0fHxcblx0d2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZVx0XHR8fFxuXHR3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZVx0XHR8fFxuXHR3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcdFx0fHxcblx0ZnVuY3Rpb24gKGNhbGxiYWNrKSB7IHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApOyB9O1xuXG52YXIgdXRpbHMgPSAoZnVuY3Rpb24gKCkge1xuXHR2YXIgbWUgPSB7fTtcblxuXHR2YXIgX2VsZW1lbnRTdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLnN0eWxlO1xuXHR2YXIgX3ZlbmRvciA9IChmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIHZlbmRvcnMgPSBbJ3QnLCAnd2Via2l0VCcsICdNb3pUJywgJ21zVCcsICdPVCddLFxuXHRcdFx0dHJhbnNmb3JtLFxuXHRcdFx0aSA9IDAsXG5cdFx0XHRsID0gdmVuZG9ycy5sZW5ndGg7XG5cblx0XHRmb3IgKCA7IGkgPCBsOyBpKysgKSB7XG5cdFx0XHR0cmFuc2Zvcm0gPSB2ZW5kb3JzW2ldICsgJ3JhbnNmb3JtJztcblx0XHRcdGlmICggdHJhbnNmb3JtIGluIF9lbGVtZW50U3R5bGUgKSByZXR1cm4gdmVuZG9yc1tpXS5zdWJzdHIoMCwgdmVuZG9yc1tpXS5sZW5ndGgtMSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KSgpO1xuXG5cdGZ1bmN0aW9uIF9wcmVmaXhTdHlsZSAoc3R5bGUpIHtcblx0XHRpZiAoIF92ZW5kb3IgPT09IGZhbHNlICkgcmV0dXJuIGZhbHNlO1xuXHRcdGlmICggX3ZlbmRvciA9PT0gJycgKSByZXR1cm4gc3R5bGU7XG5cdFx0cmV0dXJuIF92ZW5kb3IgKyBzdHlsZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0eWxlLnN1YnN0cigxKTtcblx0fVxuXG5cdG1lLmdldFRpbWUgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbiBnZXRUaW1lICgpIHsgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpOyB9O1xuXG5cdG1lLmV4dGVuZCA9IGZ1bmN0aW9uICh0YXJnZXQsIG9iaikge1xuXHRcdGZvciAoIHZhciBpIGluIG9iaiApIHtcblx0XHRcdHRhcmdldFtpXSA9IG9ialtpXTtcblx0XHR9XG5cdH07XG5cblx0bWUuYWRkRXZlbnQgPSBmdW5jdGlvbiAoZWwsIHR5cGUsIGZuLCBjYXB0dXJlKSB7XG5cdFx0ZWwuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmbiwgISFjYXB0dXJlKTtcblx0fTtcblxuXHRtZS5yZW1vdmVFdmVudCA9IGZ1bmN0aW9uIChlbCwgdHlwZSwgZm4sIGNhcHR1cmUpIHtcblx0XHRlbC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZuLCAhIWNhcHR1cmUpO1xuXHR9O1xuXG5cdG1lLm1vbWVudHVtID0gZnVuY3Rpb24gKGN1cnJlbnQsIHN0YXJ0LCB0aW1lLCBsb3dlck1hcmdpbiwgd3JhcHBlclNpemUsIGRlY2VsZXJhdGlvbikge1xuXHRcdHZhciBkaXN0YW5jZSA9IGN1cnJlbnQgLSBzdGFydCxcblx0XHRcdHNwZWVkID0gTWF0aC5hYnMoZGlzdGFuY2UpIC8gdGltZSxcblx0XHRcdGRlc3RpbmF0aW9uLFxuXHRcdFx0ZHVyYXRpb247XG5cblx0XHRkZWNlbGVyYXRpb24gPSBkZWNlbGVyYXRpb24gPT09IHVuZGVmaW5lZCA/IDAuMDAwNiA6IGRlY2VsZXJhdGlvbjtcblxuXHRcdGRlc3RpbmF0aW9uID0gY3VycmVudCArICggc3BlZWQgKiBzcGVlZCApIC8gKCAyICogZGVjZWxlcmF0aW9uICkgKiAoIGRpc3RhbmNlIDwgMCA/IC0xIDogMSApO1xuXHRcdGR1cmF0aW9uID0gc3BlZWQgLyBkZWNlbGVyYXRpb247XG5cblx0XHRpZiAoIGRlc3RpbmF0aW9uIDwgbG93ZXJNYXJnaW4gKSB7XG5cdFx0XHRkZXN0aW5hdGlvbiA9IHdyYXBwZXJTaXplID8gbG93ZXJNYXJnaW4gLSAoIHdyYXBwZXJTaXplIC8gMi41ICogKCBzcGVlZCAvIDggKSApIDogbG93ZXJNYXJnaW47XG5cdFx0XHRkaXN0YW5jZSA9IE1hdGguYWJzKGRlc3RpbmF0aW9uIC0gY3VycmVudCk7XG5cdFx0XHRkdXJhdGlvbiA9IGRpc3RhbmNlIC8gc3BlZWQ7XG5cdFx0fSBlbHNlIGlmICggZGVzdGluYXRpb24gPiAwICkge1xuXHRcdFx0ZGVzdGluYXRpb24gPSB3cmFwcGVyU2l6ZSA/IHdyYXBwZXJTaXplIC8gMi41ICogKCBzcGVlZCAvIDggKSA6IDA7XG5cdFx0XHRkaXN0YW5jZSA9IE1hdGguYWJzKGN1cnJlbnQpICsgZGVzdGluYXRpb247XG5cdFx0XHRkdXJhdGlvbiA9IGRpc3RhbmNlIC8gc3BlZWQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGRlc3RpbmF0aW9uOiBNYXRoLnJvdW5kKGRlc3RpbmF0aW9uKSxcblx0XHRcdGR1cmF0aW9uOiBkdXJhdGlvblxuXHRcdH07XG5cdH07XG5cblx0dmFyIF90cmFuc2Zvcm0gPSBfcHJlZml4U3R5bGUoJ3RyYW5zZm9ybScpO1xuXG5cdG1lLmV4dGVuZChtZSwge1xuXHRcdGhhc1RyYW5zZm9ybTogX3RyYW5zZm9ybSAhPT0gZmFsc2UsXG5cdFx0aGFzUGVyc3BlY3RpdmU6IF9wcmVmaXhTdHlsZSgncGVyc3BlY3RpdmUnKSBpbiBfZWxlbWVudFN0eWxlLFxuXHRcdGhhc1RvdWNoOiAnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3csXG5cdFx0aGFzUG9pbnRlcjogbmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQsXG5cdFx0aGFzVHJhbnNpdGlvbjogX3ByZWZpeFN0eWxlKCd0cmFuc2l0aW9uJykgaW4gX2VsZW1lbnRTdHlsZVxuXHR9KTtcblxuXHQvLyBUaGlzIHNob3VsZCBmaW5kIGFsbCBBbmRyb2lkIGJyb3dzZXJzIGxvd2VyIHRoYW4gYnVpbGQgNTM1LjE5IChib3RoIHN0b2NrIGJyb3dzZXIgYW5kIHdlYnZpZXcpXG5cdG1lLmlzQmFkQW5kcm9pZCA9IC9BbmRyb2lkIC8udGVzdCh3aW5kb3cubmF2aWdhdG9yLmFwcFZlcnNpb24pICYmICEoL0Nocm9tZVxcL1xcZC8udGVzdCh3aW5kb3cubmF2aWdhdG9yLmFwcFZlcnNpb24pKTtcblxuXHRtZS5leHRlbmQobWUuc3R5bGUgPSB7fSwge1xuXHRcdHRyYW5zZm9ybTogX3RyYW5zZm9ybSxcblx0XHR0cmFuc2l0aW9uVGltaW5nRnVuY3Rpb246IF9wcmVmaXhTdHlsZSgndHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uJyksXG5cdFx0dHJhbnNpdGlvbkR1cmF0aW9uOiBfcHJlZml4U3R5bGUoJ3RyYW5zaXRpb25EdXJhdGlvbicpLFxuXHRcdHRyYW5zaXRpb25EZWxheTogX3ByZWZpeFN0eWxlKCd0cmFuc2l0aW9uRGVsYXknKSxcblx0XHR0cmFuc2Zvcm1PcmlnaW46IF9wcmVmaXhTdHlsZSgndHJhbnNmb3JtT3JpZ2luJylcblx0fSk7XG5cblx0bWUuaGFzQ2xhc3MgPSBmdW5jdGlvbiAoZSwgYykge1xuXHRcdHZhciByZSA9IG5ldyBSZWdFeHAoXCIoXnxcXFxccylcIiArIGMgKyBcIihcXFxcc3wkKVwiKTtcblx0XHRyZXR1cm4gcmUudGVzdChlLmNsYXNzTmFtZSk7XG5cdH07XG5cblx0bWUuYWRkQ2xhc3MgPSBmdW5jdGlvbiAoZSwgYykge1xuXHRcdGlmICggbWUuaGFzQ2xhc3MoZSwgYykgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIG5ld2NsYXNzID0gZS5jbGFzc05hbWUuc3BsaXQoJyAnKTtcblx0XHRuZXdjbGFzcy5wdXNoKGMpO1xuXHRcdGUuY2xhc3NOYW1lID0gbmV3Y2xhc3Muam9pbignICcpO1xuXHR9O1xuXG5cdG1lLnJlbW92ZUNsYXNzID0gZnVuY3Rpb24gKGUsIGMpIHtcblx0XHRpZiAoICFtZS5oYXNDbGFzcyhlLCBjKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgcmUgPSBuZXcgUmVnRXhwKFwiKF58XFxcXHMpXCIgKyBjICsgXCIoXFxcXHN8JClcIiwgJ2cnKTtcblx0XHRlLmNsYXNzTmFtZSA9IGUuY2xhc3NOYW1lLnJlcGxhY2UocmUsICcgJyk7XG5cdH07XG5cblx0bWUub2Zmc2V0ID0gZnVuY3Rpb24gKGVsKSB7XG5cdFx0dmFyIGxlZnQgPSAtZWwub2Zmc2V0TGVmdCxcblx0XHRcdHRvcCA9IC1lbC5vZmZzZXRUb3A7XG5cblx0XHQvLyBqc2hpbnQgLVcwODRcblx0XHR3aGlsZSAoZWwgPSBlbC5vZmZzZXRQYXJlbnQpIHtcblx0XHRcdGxlZnQgLT0gZWwub2Zmc2V0TGVmdDtcblx0XHRcdHRvcCAtPSBlbC5vZmZzZXRUb3A7XG5cdFx0fVxuXHRcdC8vIGpzaGludCArVzA4NFxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGxlZnQ6IGxlZnQsXG5cdFx0XHR0b3A6IHRvcFxuXHRcdH07XG5cdH07XG5cblx0bWUucHJldmVudERlZmF1bHRFeGNlcHRpb24gPSBmdW5jdGlvbiAoZWwsIGV4Y2VwdGlvbnMpIHtcblx0XHRmb3IgKCB2YXIgaSBpbiBleGNlcHRpb25zICkge1xuXHRcdFx0aWYgKCBleGNlcHRpb25zW2ldLnRlc3QoZWxbaV0pICkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH07XG5cblx0bWUuZXh0ZW5kKG1lLmV2ZW50VHlwZSA9IHt9LCB7XG5cdFx0dG91Y2hzdGFydDogMSxcblx0XHR0b3VjaG1vdmU6IDEsXG5cdFx0dG91Y2hlbmQ6IDEsXG5cblx0XHRtb3VzZWRvd246IDIsXG5cdFx0bW91c2Vtb3ZlOiAyLFxuXHRcdG1vdXNldXA6IDIsXG5cblx0XHRNU1BvaW50ZXJEb3duOiAzLFxuXHRcdE1TUG9pbnRlck1vdmU6IDMsXG5cdFx0TVNQb2ludGVyVXA6IDNcblx0fSk7XG5cblx0bWUuZXh0ZW5kKG1lLmVhc2UgPSB7fSwge1xuXHRcdHF1YWRyYXRpYzoge1xuXHRcdFx0c3R5bGU6ICdjdWJpYy1iZXppZXIoMC4yNSwgMC40NiwgMC40NSwgMC45NCknLFxuXHRcdFx0Zm46IGZ1bmN0aW9uIChrKSB7XG5cdFx0XHRcdHJldHVybiBrICogKCAyIC0gayApO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Y2lyY3VsYXI6IHtcblx0XHRcdHN0eWxlOiAnY3ViaWMtYmV6aWVyKDAuMSwgMC41NywgMC4xLCAxKScsXHQvLyBOb3QgcHJvcGVybHkgXCJjaXJjdWxhclwiIGJ1dCB0aGlzIGxvb2tzIGJldHRlciwgaXQgc2hvdWxkIGJlICgwLjA3NSwgMC44MiwgMC4xNjUsIDEpXG5cdFx0XHRmbjogZnVuY3Rpb24gKGspIHtcblx0XHRcdFx0cmV0dXJuIE1hdGguc3FydCggMSAtICggLS1rICogayApICk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRiYWNrOiB7XG5cdFx0XHRzdHlsZTogJ2N1YmljLWJlemllcigwLjE3NSwgMC44ODUsIDAuMzIsIDEuMjc1KScsXG5cdFx0XHRmbjogZnVuY3Rpb24gKGspIHtcblx0XHRcdFx0dmFyIGIgPSA0O1xuXHRcdFx0XHRyZXR1cm4gKCBrID0gayAtIDEgKSAqIGsgKiAoICggYiArIDEgKSAqIGsgKyBiICkgKyAxO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ym91bmNlOiB7XG5cdFx0XHRzdHlsZTogJycsXG5cdFx0XHRmbjogZnVuY3Rpb24gKGspIHtcblx0XHRcdFx0aWYgKCAoIGsgLz0gMSApIDwgKCAxIC8gMi43NSApICkge1xuXHRcdFx0XHRcdHJldHVybiA3LjU2MjUgKiBrICogaztcblx0XHRcdFx0fSBlbHNlIGlmICggayA8ICggMiAvIDIuNzUgKSApIHtcblx0XHRcdFx0XHRyZXR1cm4gNy41NjI1ICogKCBrIC09ICggMS41IC8gMi43NSApICkgKiBrICsgMC43NTtcblx0XHRcdFx0fSBlbHNlIGlmICggayA8ICggMi41IC8gMi43NSApICkge1xuXHRcdFx0XHRcdHJldHVybiA3LjU2MjUgKiAoIGsgLT0gKCAyLjI1IC8gMi43NSApICkgKiBrICsgMC45Mzc1O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiA3LjU2MjUgKiAoIGsgLT0gKCAyLjYyNSAvIDIuNzUgKSApICogayArIDAuOTg0Mzc1O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRlbGFzdGljOiB7XG5cdFx0XHRzdHlsZTogJycsXG5cdFx0XHRmbjogZnVuY3Rpb24gKGspIHtcblx0XHRcdFx0dmFyIGYgPSAwLjIyLFxuXHRcdFx0XHRcdGUgPSAwLjQ7XG5cblx0XHRcdFx0aWYgKCBrID09PSAwICkgeyByZXR1cm4gMDsgfVxuXHRcdFx0XHRpZiAoIGsgPT0gMSApIHsgcmV0dXJuIDE7IH1cblxuXHRcdFx0XHRyZXR1cm4gKCBlICogTWF0aC5wb3coIDIsIC0gMTAgKiBrICkgKiBNYXRoLnNpbiggKCBrIC0gZiAvIDQgKSAqICggMiAqIE1hdGguUEkgKSAvIGYgKSArIDEgKTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXG5cdG1lLnRhcCA9IGZ1bmN0aW9uIChlLCBldmVudE5hbWUpIHtcblx0XHR2YXIgZXYgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcblx0XHRldi5pbml0RXZlbnQoZXZlbnROYW1lLCB0cnVlLCB0cnVlKTtcblx0XHRldi5wYWdlWCA9IGUucGFnZVg7XG5cdFx0ZXYucGFnZVkgPSBlLnBhZ2VZO1xuXHRcdGUudGFyZ2V0LmRpc3BhdGNoRXZlbnQoZXYpO1xuXHR9O1xuXG5cdG1lLmNsaWNrID0gZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgdGFyZ2V0ID0gZS50YXJnZXQsXG5cdFx0XHRldjtcblxuXHRcdGlmICggISgvKFNFTEVDVHxJTlBVVHxURVhUQVJFQSkvaSkudGVzdCh0YXJnZXQudGFnTmFtZSkgKSB7XG5cdFx0XHRldiA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50cycpO1xuXHRcdFx0ZXYuaW5pdE1vdXNlRXZlbnQoJ2NsaWNrJywgdHJ1ZSwgdHJ1ZSwgZS52aWV3LCAxLFxuXHRcdFx0XHR0YXJnZXQuc2NyZWVuWCwgdGFyZ2V0LnNjcmVlblksIHRhcmdldC5jbGllbnRYLCB0YXJnZXQuY2xpZW50WSxcblx0XHRcdFx0ZS5jdHJsS2V5LCBlLmFsdEtleSwgZS5zaGlmdEtleSwgZS5tZXRhS2V5LFxuXHRcdFx0XHQwLCBudWxsKTtcblxuXHRcdFx0ZXYuX2NvbnN0cnVjdGVkID0gdHJ1ZTtcblx0XHRcdHRhcmdldC5kaXNwYXRjaEV2ZW50KGV2KTtcblx0XHR9XG5cdH07XG5cblx0cmV0dXJuIG1lO1xufSkoKTtcblxuZnVuY3Rpb24gSVNjcm9sbCAoZWwsIG9wdGlvbnMpIHtcblx0dGhpcy53cmFwcGVyID0gdHlwZW9mIGVsID09ICdzdHJpbmcnID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbCkgOiBlbDtcblx0dGhpcy5zY3JvbGxlciA9IHRoaXMud3JhcHBlci5jaGlsZHJlblswXTtcblx0dGhpcy5zY3JvbGxlclN0eWxlID0gdGhpcy5zY3JvbGxlci5zdHlsZTtcdFx0Ly8gY2FjaGUgc3R5bGUgZm9yIGJldHRlciBwZXJmb3JtYW5jZVxuXG5cdHRoaXMub3B0aW9ucyA9IHtcblxuXHRcdHJlc2l6ZVNjcm9sbGJhcnM6IHRydWUsXG5cblx0XHRtb3VzZVdoZWVsU3BlZWQ6IDIwLFxuXG5cdFx0c25hcFRocmVzaG9sZDogMC4zMzQsXG5cbi8vIElOU0VSVCBQT0lOVDogT1BUSU9OUyBcblxuXHRcdHN0YXJ0WDogMCxcblx0XHRzdGFydFk6IDAsXG5cdFx0c2Nyb2xsWTogdHJ1ZSxcblx0XHRkaXJlY3Rpb25Mb2NrVGhyZXNob2xkOiA1LFxuXHRcdG1vbWVudHVtOiB0cnVlLFxuXG5cdFx0Ym91bmNlOiB0cnVlLFxuXHRcdGJvdW5jZVRpbWU6IDYwMCxcblx0XHRib3VuY2VFYXNpbmc6ICcnLFxuXG5cdFx0cHJldmVudERlZmF1bHQ6IHRydWUsXG5cdFx0cHJldmVudERlZmF1bHRFeGNlcHRpb246IHsgdGFnTmFtZTogL14oSU5QVVR8VEVYVEFSRUF8QlVUVE9OfFNFTEVDVCkkLyB9LFxuXG5cdFx0SFdDb21wb3NpdGluZzogdHJ1ZSxcblx0XHR1c2VUcmFuc2l0aW9uOiB0cnVlLFxuXHRcdHVzZVRyYW5zZm9ybTogdHJ1ZVxuXHR9O1xuXG5cdGZvciAoIHZhciBpIGluIG9wdGlvbnMgKSB7XG5cdFx0dGhpcy5vcHRpb25zW2ldID0gb3B0aW9uc1tpXTtcblx0fVxuXG5cdC8vIE5vcm1hbGl6ZSBvcHRpb25zXG5cdHRoaXMudHJhbnNsYXRlWiA9IHRoaXMub3B0aW9ucy5IV0NvbXBvc2l0aW5nICYmIHV0aWxzLmhhc1BlcnNwZWN0aXZlID8gJyB0cmFuc2xhdGVaKDApJyA6ICcnO1xuXG5cdHRoaXMub3B0aW9ucy51c2VUcmFuc2l0aW9uID0gdXRpbHMuaGFzVHJhbnNpdGlvbiAmJiB0aGlzLm9wdGlvbnMudXNlVHJhbnNpdGlvbjtcblx0dGhpcy5vcHRpb25zLnVzZVRyYW5zZm9ybSA9IHV0aWxzLmhhc1RyYW5zZm9ybSAmJiB0aGlzLm9wdGlvbnMudXNlVHJhbnNmb3JtO1xuXG5cdHRoaXMub3B0aW9ucy5ldmVudFBhc3N0aHJvdWdoID0gdGhpcy5vcHRpb25zLmV2ZW50UGFzc3Rocm91Z2ggPT09IHRydWUgPyAndmVydGljYWwnIDogdGhpcy5vcHRpb25zLmV2ZW50UGFzc3Rocm91Z2g7XG5cdHRoaXMub3B0aW9ucy5wcmV2ZW50RGVmYXVsdCA9ICF0aGlzLm9wdGlvbnMuZXZlbnRQYXNzdGhyb3VnaCAmJiB0aGlzLm9wdGlvbnMucHJldmVudERlZmF1bHQ7XG5cblx0Ly8gSWYgeW91IHdhbnQgZXZlbnRQYXNzdGhyb3VnaCBJIGhhdmUgdG8gbG9jayBvbmUgb2YgdGhlIGF4ZXNcblx0dGhpcy5vcHRpb25zLnNjcm9sbFkgPSB0aGlzLm9wdGlvbnMuZXZlbnRQYXNzdGhyb3VnaCA9PSAndmVydGljYWwnID8gZmFsc2UgOiB0aGlzLm9wdGlvbnMuc2Nyb2xsWTtcblx0dGhpcy5vcHRpb25zLnNjcm9sbFggPSB0aGlzLm9wdGlvbnMuZXZlbnRQYXNzdGhyb3VnaCA9PSAnaG9yaXpvbnRhbCcgPyBmYWxzZSA6IHRoaXMub3B0aW9ucy5zY3JvbGxYO1xuXG5cdC8vIFdpdGggZXZlbnRQYXNzdGhyb3VnaCB3ZSBhbHNvIG5lZWQgbG9ja0RpcmVjdGlvbiBtZWNoYW5pc21cblx0dGhpcy5vcHRpb25zLmZyZWVTY3JvbGwgPSB0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbCAmJiAhdGhpcy5vcHRpb25zLmV2ZW50UGFzc3Rocm91Z2g7XG5cdHRoaXMub3B0aW9ucy5kaXJlY3Rpb25Mb2NrVGhyZXNob2xkID0gdGhpcy5vcHRpb25zLmV2ZW50UGFzc3Rocm91Z2ggPyAwIDogdGhpcy5vcHRpb25zLmRpcmVjdGlvbkxvY2tUaHJlc2hvbGQ7XG5cblx0dGhpcy5vcHRpb25zLmJvdW5jZUVhc2luZyA9IHR5cGVvZiB0aGlzLm9wdGlvbnMuYm91bmNlRWFzaW5nID09ICdzdHJpbmcnID8gdXRpbHMuZWFzZVt0aGlzLm9wdGlvbnMuYm91bmNlRWFzaW5nXSB8fCB1dGlscy5lYXNlLmNpcmN1bGFyIDogdGhpcy5vcHRpb25zLmJvdW5jZUVhc2luZztcblxuXHR0aGlzLm9wdGlvbnMucmVzaXplUG9sbGluZyA9IHRoaXMub3B0aW9ucy5yZXNpemVQb2xsaW5nID09PSB1bmRlZmluZWQgPyA2MCA6IHRoaXMub3B0aW9ucy5yZXNpemVQb2xsaW5nO1xuXG5cdGlmICggdGhpcy5vcHRpb25zLnRhcCA9PT0gdHJ1ZSApIHtcblx0XHR0aGlzLm9wdGlvbnMudGFwID0gJ3RhcCc7XG5cdH1cblxuXHRpZiAoIHRoaXMub3B0aW9ucy5zaHJpbmtTY3JvbGxiYXJzID09ICdzY2FsZScgKSB7XG5cdFx0dGhpcy5vcHRpb25zLnVzZVRyYW5zaXRpb24gPSBmYWxzZTtcblx0fVxuXG5cdHRoaXMub3B0aW9ucy5pbnZlcnRXaGVlbERpcmVjdGlvbiA9IHRoaXMub3B0aW9ucy5pbnZlcnRXaGVlbERpcmVjdGlvbiA/IC0xIDogMTtcblxuLy8gSU5TRVJUIFBPSU5UOiBOT1JNQUxJWkFUSU9OXG5cblx0Ly8gU29tZSBkZWZhdWx0c1x0XG5cdHRoaXMueCA9IDA7XG5cdHRoaXMueSA9IDA7XG5cdHRoaXMuZGlyZWN0aW9uWCA9IDA7XG5cdHRoaXMuZGlyZWN0aW9uWSA9IDA7XG5cdHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4vLyBJTlNFUlQgUE9JTlQ6IERFRkFVTFRTXG5cblx0dGhpcy5faW5pdCgpO1xuXHR0aGlzLnJlZnJlc2goKTtcblxuXHR0aGlzLnNjcm9sbFRvKHRoaXMub3B0aW9ucy5zdGFydFgsIHRoaXMub3B0aW9ucy5zdGFydFkpO1xuXHR0aGlzLmVuYWJsZSgpO1xufVxuXG5JU2Nyb2xsLnByb3RvdHlwZSA9IHtcblx0dmVyc2lvbjogJzUuMS4xJyxcblxuXHRfaW5pdDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuX2luaXRFdmVudHMoKTtcblxuXHRcdGlmICggdGhpcy5vcHRpb25zLnNjcm9sbGJhcnMgfHwgdGhpcy5vcHRpb25zLmluZGljYXRvcnMgKSB7XG5cdFx0XHR0aGlzLl9pbml0SW5kaWNhdG9ycygpO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5vcHRpb25zLm1vdXNlV2hlZWwgKSB7XG5cdFx0XHR0aGlzLl9pbml0V2hlZWwoKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5zbmFwICkge1xuXHRcdFx0dGhpcy5faW5pdFNuYXAoKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5rZXlCaW5kaW5ncyApIHtcblx0XHRcdHRoaXMuX2luaXRLZXlzKCk7XG5cdFx0fVxuXG4vLyBJTlNFUlQgUE9JTlQ6IF9pbml0XG5cblx0fSxcblxuXHRkZXN0cm95OiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5faW5pdEV2ZW50cyh0cnVlKTtcblxuXHRcdHRoaXMuX2V4ZWNFdmVudCgnZGVzdHJveScpO1xuXHR9LFxuXG5cdF90cmFuc2l0aW9uRW5kOiBmdW5jdGlvbiAoZSkge1xuXHRcdGlmICggZS50YXJnZXQgIT0gdGhpcy5zY3JvbGxlciB8fCAhdGhpcy5pc0luVHJhbnNpdGlvbiApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLl90cmFuc2l0aW9uVGltZSgpO1xuXHRcdGlmICggIXRoaXMucmVzZXRQb3NpdGlvbih0aGlzLm9wdGlvbnMuYm91bmNlVGltZSkgKSB7XG5cdFx0XHR0aGlzLmlzSW5UcmFuc2l0aW9uID0gZmFsc2U7XG5cdFx0XHR0aGlzLl9leGVjRXZlbnQoJ3Njcm9sbEVuZCcpO1xuXHRcdH1cblx0fSxcblxuXHRfc3RhcnQ6IGZ1bmN0aW9uIChlKSB7XG5cdFx0Ly8gUmVhY3QgdG8gbGVmdCBtb3VzZSBidXR0b24gb25seVxuXHRcdGlmICggdXRpbHMuZXZlbnRUeXBlW2UudHlwZV0gIT0gMSApIHtcblx0XHRcdGlmICggZS5idXR0b24gIT09IDAgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoICF0aGlzLmVuYWJsZWQgfHwgKHRoaXMuaW5pdGlhdGVkICYmIHV0aWxzLmV2ZW50VHlwZVtlLnR5cGVdICE9PSB0aGlzLmluaXRpYXRlZCkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMucHJldmVudERlZmF1bHQgJiYgIXV0aWxzLmlzQmFkQW5kcm9pZCAmJiAhdXRpbHMucHJldmVudERlZmF1bHRFeGNlcHRpb24oZS50YXJnZXQsIHRoaXMub3B0aW9ucy5wcmV2ZW50RGVmYXVsdEV4Y2VwdGlvbikgKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXG5cdFx0dmFyIHBvaW50ID0gZS50b3VjaGVzID8gZS50b3VjaGVzWzBdIDogZSxcblx0XHRcdHBvcztcblxuXHRcdHRoaXMuaW5pdGlhdGVkXHQ9IHV0aWxzLmV2ZW50VHlwZVtlLnR5cGVdO1xuXHRcdHRoaXMubW92ZWRcdFx0PSBmYWxzZTtcblx0XHR0aGlzLmRpc3RYXHRcdD0gMDtcblx0XHR0aGlzLmRpc3RZXHRcdD0gMDtcblx0XHR0aGlzLmRpcmVjdGlvblggPSAwO1xuXHRcdHRoaXMuZGlyZWN0aW9uWSA9IDA7XG5cdFx0dGhpcy5kaXJlY3Rpb25Mb2NrZWQgPSAwO1xuXG5cdFx0dGhpcy5fdHJhbnNpdGlvblRpbWUoKTtcblxuXHRcdHRoaXMuc3RhcnRUaW1lID0gdXRpbHMuZ2V0VGltZSgpO1xuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMudXNlVHJhbnNpdGlvbiAmJiB0aGlzLmlzSW5UcmFuc2l0aW9uICkge1xuXHRcdFx0dGhpcy5pc0luVHJhbnNpdGlvbiA9IGZhbHNlO1xuXHRcdFx0cG9zID0gdGhpcy5nZXRDb21wdXRlZFBvc2l0aW9uKCk7XG5cdFx0XHR0aGlzLl90cmFuc2xhdGUoTWF0aC5yb3VuZChwb3MueCksIE1hdGgucm91bmQocG9zLnkpKTtcblx0XHRcdHRoaXMuX2V4ZWNFdmVudCgnc2Nyb2xsRW5kJyk7XG5cdFx0fSBlbHNlIGlmICggIXRoaXMub3B0aW9ucy51c2VUcmFuc2l0aW9uICYmIHRoaXMuaXNBbmltYXRpbmcgKSB7XG5cdFx0XHR0aGlzLmlzQW5pbWF0aW5nID0gZmFsc2U7XG5cdFx0XHR0aGlzLl9leGVjRXZlbnQoJ3Njcm9sbEVuZCcpO1xuXHRcdH1cblxuXHRcdHRoaXMuc3RhcnRYICAgID0gdGhpcy54O1xuXHRcdHRoaXMuc3RhcnRZICAgID0gdGhpcy55O1xuXHRcdHRoaXMuYWJzU3RhcnRYID0gdGhpcy54O1xuXHRcdHRoaXMuYWJzU3RhcnRZID0gdGhpcy55O1xuXHRcdHRoaXMucG9pbnRYICAgID0gcG9pbnQucGFnZVg7XG5cdFx0dGhpcy5wb2ludFkgICAgPSBwb2ludC5wYWdlWTtcblxuXHRcdHRoaXMuX2V4ZWNFdmVudCgnYmVmb3JlU2Nyb2xsU3RhcnQnKTtcblx0fSxcblxuXHRfbW92ZTogZnVuY3Rpb24gKGUpIHtcblx0XHRpZiAoICF0aGlzLmVuYWJsZWQgfHwgdXRpbHMuZXZlbnRUeXBlW2UudHlwZV0gIT09IHRoaXMuaW5pdGlhdGVkICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5vcHRpb25zLnByZXZlbnREZWZhdWx0ICkge1x0Ly8gaW5jcmVhc2VzIHBlcmZvcm1hbmNlIG9uIEFuZHJvaWQ/IFRPRE86IGNoZWNrIVxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblxuXHRcdHZhciBwb2ludFx0XHQ9IGUudG91Y2hlcyA/IGUudG91Y2hlc1swXSA6IGUsXG5cdFx0XHRkZWx0YVhcdFx0PSBwb2ludC5wYWdlWCAtIHRoaXMucG9pbnRYLFxuXHRcdFx0ZGVsdGFZXHRcdD0gcG9pbnQucGFnZVkgLSB0aGlzLnBvaW50WSxcblx0XHRcdHRpbWVzdGFtcFx0PSB1dGlscy5nZXRUaW1lKCksXG5cdFx0XHRuZXdYLCBuZXdZLFxuXHRcdFx0YWJzRGlzdFgsIGFic0Rpc3RZO1xuXG5cdFx0dGhpcy5wb2ludFhcdFx0PSBwb2ludC5wYWdlWDtcblx0XHR0aGlzLnBvaW50WVx0XHQ9IHBvaW50LnBhZ2VZO1xuXG5cdFx0dGhpcy5kaXN0WFx0XHQrPSBkZWx0YVg7XG5cdFx0dGhpcy5kaXN0WVx0XHQrPSBkZWx0YVk7XG5cdFx0YWJzRGlzdFhcdFx0PSBNYXRoLmFicyh0aGlzLmRpc3RYKTtcblx0XHRhYnNEaXN0WVx0XHQ9IE1hdGguYWJzKHRoaXMuZGlzdFkpO1xuXG5cdFx0Ly8gV2UgbmVlZCB0byBtb3ZlIGF0IGxlYXN0IDEwIHBpeGVscyBmb3IgdGhlIHNjcm9sbGluZyB0byBpbml0aWF0ZVxuXHRcdGlmICggdGltZXN0YW1wIC0gdGhpcy5lbmRUaW1lID4gMzAwICYmIChhYnNEaXN0WCA8IDEwICYmIGFic0Rpc3RZIDwgMTApICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIElmIHlvdSBhcmUgc2Nyb2xsaW5nIGluIG9uZSBkaXJlY3Rpb24gbG9jayB0aGUgb3RoZXJcblx0XHRpZiAoICF0aGlzLmRpcmVjdGlvbkxvY2tlZCAmJiAhdGhpcy5vcHRpb25zLmZyZWVTY3JvbGwgKSB7XG5cdFx0XHRpZiAoIGFic0Rpc3RYID4gYWJzRGlzdFkgKyB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uTG9ja1RocmVzaG9sZCApIHtcblx0XHRcdFx0dGhpcy5kaXJlY3Rpb25Mb2NrZWQgPSAnaCc7XHRcdC8vIGxvY2sgaG9yaXpvbnRhbGx5XG5cdFx0XHR9IGVsc2UgaWYgKCBhYnNEaXN0WSA+PSBhYnNEaXN0WCArIHRoaXMub3B0aW9ucy5kaXJlY3Rpb25Mb2NrVGhyZXNob2xkICkge1xuXHRcdFx0XHR0aGlzLmRpcmVjdGlvbkxvY2tlZCA9ICd2JztcdFx0Ly8gbG9jayB2ZXJ0aWNhbGx5XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmRpcmVjdGlvbkxvY2tlZCA9ICduJztcdFx0Ly8gbm8gbG9ja1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICggdGhpcy5kaXJlY3Rpb25Mb2NrZWQgPT0gJ2gnICkge1xuXHRcdFx0aWYgKCB0aGlzLm9wdGlvbnMuZXZlbnRQYXNzdGhyb3VnaCA9PSAndmVydGljYWwnICkge1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9IGVsc2UgaWYgKCB0aGlzLm9wdGlvbnMuZXZlbnRQYXNzdGhyb3VnaCA9PSAnaG9yaXpvbnRhbCcgKSB7XG5cdFx0XHRcdHRoaXMuaW5pdGlhdGVkID0gZmFsc2U7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0ZGVsdGFZID0gMDtcblx0XHR9IGVsc2UgaWYgKCB0aGlzLmRpcmVjdGlvbkxvY2tlZCA9PSAndicgKSB7XG5cdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5ldmVudFBhc3N0aHJvdWdoID09ICdob3Jpem9udGFsJyApIHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fSBlbHNlIGlmICggdGhpcy5vcHRpb25zLmV2ZW50UGFzc3Rocm91Z2ggPT0gJ3ZlcnRpY2FsJyApIHtcblx0XHRcdFx0dGhpcy5pbml0aWF0ZWQgPSBmYWxzZTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRkZWx0YVggPSAwO1xuXHRcdH1cblxuXHRcdGRlbHRhWCA9IHRoaXMuaGFzSG9yaXpvbnRhbFNjcm9sbCA/IGRlbHRhWCA6IDA7XG5cdFx0ZGVsdGFZID0gdGhpcy5oYXNWZXJ0aWNhbFNjcm9sbCA/IGRlbHRhWSA6IDA7XG5cblx0XHRuZXdYID0gdGhpcy54ICsgZGVsdGFYO1xuXHRcdG5ld1kgPSB0aGlzLnkgKyBkZWx0YVk7XG5cblx0XHQvLyBTbG93IGRvd24gaWYgb3V0c2lkZSBvZiB0aGUgYm91bmRhcmllc1xuXHRcdGlmICggbmV3WCA+IDAgfHwgbmV3WCA8IHRoaXMubWF4U2Nyb2xsWCApIHtcblx0XHRcdG5ld1ggPSB0aGlzLm9wdGlvbnMuYm91bmNlID8gdGhpcy54ICsgZGVsdGFYIC8gMyA6IG5ld1ggPiAwID8gMCA6IHRoaXMubWF4U2Nyb2xsWDtcblx0XHR9XG5cdFx0aWYgKCBuZXdZID4gMCB8fCBuZXdZIDwgdGhpcy5tYXhTY3JvbGxZICkge1xuXHRcdFx0bmV3WSA9IHRoaXMub3B0aW9ucy5ib3VuY2UgPyB0aGlzLnkgKyBkZWx0YVkgLyAzIDogbmV3WSA+IDAgPyAwIDogdGhpcy5tYXhTY3JvbGxZO1xuXHRcdH1cblxuXHRcdHRoaXMuZGlyZWN0aW9uWCA9IGRlbHRhWCA+IDAgPyAtMSA6IGRlbHRhWCA8IDAgPyAxIDogMDtcblx0XHR0aGlzLmRpcmVjdGlvblkgPSBkZWx0YVkgPiAwID8gLTEgOiBkZWx0YVkgPCAwID8gMSA6IDA7XG5cblx0XHRpZiAoICF0aGlzLm1vdmVkICkge1xuXHRcdFx0dGhpcy5fZXhlY0V2ZW50KCdzY3JvbGxTdGFydCcpO1xuXHRcdH1cblxuXHRcdHRoaXMubW92ZWQgPSB0cnVlO1xuXG5cdFx0dGhpcy5fdHJhbnNsYXRlKG5ld1gsIG5ld1kpO1xuXG4vKiBSRVBMQUNFIFNUQVJUOiBfbW92ZSAqL1xuXG5cdFx0aWYgKCB0aW1lc3RhbXAgLSB0aGlzLnN0YXJ0VGltZSA+IDMwMCApIHtcblx0XHRcdHRoaXMuc3RhcnRUaW1lID0gdGltZXN0YW1wO1xuXHRcdFx0dGhpcy5zdGFydFggPSB0aGlzLng7XG5cdFx0XHR0aGlzLnN0YXJ0WSA9IHRoaXMueTtcblx0XHR9XG5cbi8qIFJFUExBQ0UgRU5EOiBfbW92ZSAqL1xuXG5cdH0sXG5cblx0X2VuZDogZnVuY3Rpb24gKGUpIHtcblx0XHRpZiAoICF0aGlzLmVuYWJsZWQgfHwgdXRpbHMuZXZlbnRUeXBlW2UudHlwZV0gIT09IHRoaXMuaW5pdGlhdGVkICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5vcHRpb25zLnByZXZlbnREZWZhdWx0ICYmICF1dGlscy5wcmV2ZW50RGVmYXVsdEV4Y2VwdGlvbihlLnRhcmdldCwgdGhpcy5vcHRpb25zLnByZXZlbnREZWZhdWx0RXhjZXB0aW9uKSApIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cblx0XHR2YXIgcG9pbnQgPSBlLmNoYW5nZWRUb3VjaGVzID8gZS5jaGFuZ2VkVG91Y2hlc1swXSA6IGUsXG5cdFx0XHRtb21lbnR1bVgsXG5cdFx0XHRtb21lbnR1bVksXG5cdFx0XHRkdXJhdGlvbiA9IHV0aWxzLmdldFRpbWUoKSAtIHRoaXMuc3RhcnRUaW1lLFxuXHRcdFx0bmV3WCA9IE1hdGgucm91bmQodGhpcy54KSxcblx0XHRcdG5ld1kgPSBNYXRoLnJvdW5kKHRoaXMueSksXG5cdFx0XHRkaXN0YW5jZVggPSBNYXRoLmFicyhuZXdYIC0gdGhpcy5zdGFydFgpLFxuXHRcdFx0ZGlzdGFuY2VZID0gTWF0aC5hYnMobmV3WSAtIHRoaXMuc3RhcnRZKSxcblx0XHRcdHRpbWUgPSAwLFxuXHRcdFx0ZWFzaW5nID0gJyc7XG5cblx0XHR0aGlzLmlzSW5UcmFuc2l0aW9uID0gMDtcblx0XHR0aGlzLmluaXRpYXRlZCA9IDA7XG5cdFx0dGhpcy5lbmRUaW1lID0gdXRpbHMuZ2V0VGltZSgpO1xuXG5cdFx0Ly8gcmVzZXQgaWYgd2UgYXJlIG91dHNpZGUgb2YgdGhlIGJvdW5kYXJpZXNcblx0XHRpZiAoIHRoaXMucmVzZXRQb3NpdGlvbih0aGlzLm9wdGlvbnMuYm91bmNlVGltZSkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5zY3JvbGxUbyhuZXdYLCBuZXdZKTtcdC8vIGVuc3VyZXMgdGhhdCB0aGUgbGFzdCBwb3NpdGlvbiBpcyByb3VuZGVkXG5cblx0XHQvLyB3ZSBzY3JvbGxlZCBsZXNzIHRoYW4gMTAgcGl4ZWxzXG5cdFx0aWYgKCAhdGhpcy5tb3ZlZCApIHtcblx0XHRcdGlmICggdGhpcy5vcHRpb25zLnRhcCApIHtcblx0XHRcdFx0dXRpbHMudGFwKGUsIHRoaXMub3B0aW9ucy50YXApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5jbGljayApIHtcblx0XHRcdFx0dXRpbHMuY2xpY2soZSk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX2V4ZWNFdmVudCgnc2Nyb2xsQ2FuY2VsJyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLl9ldmVudHMuZmxpY2sgJiYgZHVyYXRpb24gPCAyMDAgJiYgZGlzdGFuY2VYIDwgMTAwICYmIGRpc3RhbmNlWSA8IDEwMCApIHtcblx0XHRcdHRoaXMuX2V4ZWNFdmVudCgnZmxpY2snKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBzdGFydCBtb21lbnR1bSBhbmltYXRpb24gaWYgbmVlZGVkXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMubW9tZW50dW0gJiYgZHVyYXRpb24gPCAzMDAgKSB7XG5cdFx0XHRtb21lbnR1bVggPSB0aGlzLmhhc0hvcml6b250YWxTY3JvbGwgPyB1dGlscy5tb21lbnR1bSh0aGlzLngsIHRoaXMuc3RhcnRYLCBkdXJhdGlvbiwgdGhpcy5tYXhTY3JvbGxYLCB0aGlzLm9wdGlvbnMuYm91bmNlID8gdGhpcy53cmFwcGVyV2lkdGggOiAwLCB0aGlzLm9wdGlvbnMuZGVjZWxlcmF0aW9uKSA6IHsgZGVzdGluYXRpb246IG5ld1gsIGR1cmF0aW9uOiAwIH07XG5cdFx0XHRtb21lbnR1bVkgPSB0aGlzLmhhc1ZlcnRpY2FsU2Nyb2xsID8gdXRpbHMubW9tZW50dW0odGhpcy55LCB0aGlzLnN0YXJ0WSwgZHVyYXRpb24sIHRoaXMubWF4U2Nyb2xsWSwgdGhpcy5vcHRpb25zLmJvdW5jZSA/IHRoaXMud3JhcHBlckhlaWdodCA6IDAsIHRoaXMub3B0aW9ucy5kZWNlbGVyYXRpb24pIDogeyBkZXN0aW5hdGlvbjogbmV3WSwgZHVyYXRpb246IDAgfTtcblx0XHRcdG5ld1ggPSBtb21lbnR1bVguZGVzdGluYXRpb247XG5cdFx0XHRuZXdZID0gbW9tZW50dW1ZLmRlc3RpbmF0aW9uO1xuXHRcdFx0dGltZSA9IE1hdGgubWF4KG1vbWVudHVtWC5kdXJhdGlvbiwgbW9tZW50dW1ZLmR1cmF0aW9uKTtcblx0XHRcdHRoaXMuaXNJblRyYW5zaXRpb24gPSAxO1xuXHRcdH1cblxuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuc25hcCApIHtcblx0XHRcdHZhciBzbmFwID0gdGhpcy5fbmVhcmVzdFNuYXAobmV3WCwgbmV3WSk7XG5cdFx0XHR0aGlzLmN1cnJlbnRQYWdlID0gc25hcDtcblx0XHRcdHRpbWUgPSB0aGlzLm9wdGlvbnMuc25hcFNwZWVkIHx8IE1hdGgubWF4KFxuXHRcdFx0XHRcdE1hdGgubWF4KFxuXHRcdFx0XHRcdFx0TWF0aC5taW4oTWF0aC5hYnMobmV3WCAtIHNuYXAueCksIDEwMDApLFxuXHRcdFx0XHRcdFx0TWF0aC5taW4oTWF0aC5hYnMobmV3WSAtIHNuYXAueSksIDEwMDApXG5cdFx0XHRcdFx0KSwgMzAwKTtcblx0XHRcdG5ld1ggPSBzbmFwLng7XG5cdFx0XHRuZXdZID0gc25hcC55O1xuXG5cdFx0XHR0aGlzLmRpcmVjdGlvblggPSAwO1xuXHRcdFx0dGhpcy5kaXJlY3Rpb25ZID0gMDtcblx0XHRcdGVhc2luZyA9IHRoaXMub3B0aW9ucy5ib3VuY2VFYXNpbmc7XG5cdFx0fVxuXG4vLyBJTlNFUlQgUE9JTlQ6IF9lbmRcblxuXHRcdGlmICggbmV3WCAhPSB0aGlzLnggfHwgbmV3WSAhPSB0aGlzLnkgKSB7XG5cdFx0XHQvLyBjaGFuZ2UgZWFzaW5nIGZ1bmN0aW9uIHdoZW4gc2Nyb2xsZXIgZ29lcyBvdXQgb2YgdGhlIGJvdW5kYXJpZXNcblx0XHRcdGlmICggbmV3WCA+IDAgfHwgbmV3WCA8IHRoaXMubWF4U2Nyb2xsWCB8fCBuZXdZID4gMCB8fCBuZXdZIDwgdGhpcy5tYXhTY3JvbGxZICkge1xuXHRcdFx0XHRlYXNpbmcgPSB1dGlscy5lYXNlLnF1YWRyYXRpYztcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5zY3JvbGxUbyhuZXdYLCBuZXdZLCB0aW1lLCBlYXNpbmcpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuX2V4ZWNFdmVudCgnc2Nyb2xsRW5kJyk7XG5cdH0sXG5cblx0X3Jlc2l6ZTogZnVuY3Rpb24gKCkge1xuXHRcdHZhciB0aGF0ID0gdGhpcztcblxuXHRcdGNsZWFyVGltZW91dCh0aGlzLnJlc2l6ZVRpbWVvdXQpO1xuXG5cdFx0dGhpcy5yZXNpemVUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHR0aGF0LnJlZnJlc2goKTtcblx0XHR9LCB0aGlzLm9wdGlvbnMucmVzaXplUG9sbGluZyk7XG5cdH0sXG5cblx0cmVzZXRQb3NpdGlvbjogZnVuY3Rpb24gKHRpbWUpIHtcblx0XHR2YXIgeCA9IHRoaXMueCxcblx0XHRcdHkgPSB0aGlzLnk7XG5cblx0XHR0aW1lID0gdGltZSB8fCAwO1xuXG5cdFx0aWYgKCAhdGhpcy5oYXNIb3Jpem9udGFsU2Nyb2xsIHx8IHRoaXMueCA+IDAgKSB7XG5cdFx0XHR4ID0gMDtcblx0XHR9IGVsc2UgaWYgKCB0aGlzLnggPCB0aGlzLm1heFNjcm9sbFggKSB7XG5cdFx0XHR4ID0gdGhpcy5tYXhTY3JvbGxYO1xuXHRcdH1cblxuXHRcdGlmICggIXRoaXMuaGFzVmVydGljYWxTY3JvbGwgfHwgdGhpcy55ID4gMCApIHtcblx0XHRcdHkgPSAwO1xuXHRcdH0gZWxzZSBpZiAoIHRoaXMueSA8IHRoaXMubWF4U2Nyb2xsWSApIHtcblx0XHRcdHkgPSB0aGlzLm1heFNjcm9sbFk7XG5cdFx0fVxuXG5cdFx0aWYgKCB4ID09IHRoaXMueCAmJiB5ID09IHRoaXMueSApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHR0aGlzLnNjcm9sbFRvKHgsIHksIHRpbWUsIHRoaXMub3B0aW9ucy5ib3VuY2VFYXNpbmcpO1xuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cblx0ZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuXHR9LFxuXG5cdGVuYWJsZTogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cdH0sXG5cblx0cmVmcmVzaDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciByZiA9IHRoaXMud3JhcHBlci5vZmZzZXRIZWlnaHQ7XHRcdC8vIEZvcmNlIHJlZmxvd1xuXG5cdFx0dGhpcy53cmFwcGVyV2lkdGhcdD0gdGhpcy53cmFwcGVyLmNsaWVudFdpZHRoO1xuXHRcdHRoaXMud3JhcHBlckhlaWdodFx0PSB0aGlzLndyYXBwZXIuY2xpZW50SGVpZ2h0O1xuXG4vKiBSRVBMQUNFIFNUQVJUOiByZWZyZXNoICovXG5cblx0XHR0aGlzLnNjcm9sbGVyV2lkdGhcdD0gdGhpcy5zY3JvbGxlci5vZmZzZXRXaWR0aDtcblx0XHR0aGlzLnNjcm9sbGVySGVpZ2h0XHQ9IHRoaXMuc2Nyb2xsZXIub2Zmc2V0SGVpZ2h0O1xuXG5cdFx0dGhpcy5tYXhTY3JvbGxYXHRcdD0gdGhpcy53cmFwcGVyV2lkdGggLSB0aGlzLnNjcm9sbGVyV2lkdGg7XG5cdFx0dGhpcy5tYXhTY3JvbGxZXHRcdD0gdGhpcy53cmFwcGVySGVpZ2h0IC0gdGhpcy5zY3JvbGxlckhlaWdodDtcblxuLyogUkVQTEFDRSBFTkQ6IHJlZnJlc2ggKi9cblxuXHRcdHRoaXMuaGFzSG9yaXpvbnRhbFNjcm9sbFx0PSB0aGlzLm9wdGlvbnMuc2Nyb2xsWCAmJiB0aGlzLm1heFNjcm9sbFggPCAwO1xuXHRcdHRoaXMuaGFzVmVydGljYWxTY3JvbGxcdFx0PSB0aGlzLm9wdGlvbnMuc2Nyb2xsWSAmJiB0aGlzLm1heFNjcm9sbFkgPCAwO1xuXG5cdFx0aWYgKCAhdGhpcy5oYXNIb3Jpem9udGFsU2Nyb2xsICkge1xuXHRcdFx0dGhpcy5tYXhTY3JvbGxYID0gMDtcblx0XHRcdHRoaXMuc2Nyb2xsZXJXaWR0aCA9IHRoaXMud3JhcHBlcldpZHRoO1xuXHRcdH1cblxuXHRcdGlmICggIXRoaXMuaGFzVmVydGljYWxTY3JvbGwgKSB7XG5cdFx0XHR0aGlzLm1heFNjcm9sbFkgPSAwO1xuXHRcdFx0dGhpcy5zY3JvbGxlckhlaWdodCA9IHRoaXMud3JhcHBlckhlaWdodDtcblx0XHR9XG5cblx0XHR0aGlzLmVuZFRpbWUgPSAwO1xuXHRcdHRoaXMuZGlyZWN0aW9uWCA9IDA7XG5cdFx0dGhpcy5kaXJlY3Rpb25ZID0gMDtcblxuXHRcdHRoaXMud3JhcHBlck9mZnNldCA9IHV0aWxzLm9mZnNldCh0aGlzLndyYXBwZXIpO1xuXG5cdFx0dGhpcy5fZXhlY0V2ZW50KCdyZWZyZXNoJyk7XG5cblx0XHR0aGlzLnJlc2V0UG9zaXRpb24oKTtcblxuLy8gSU5TRVJUIFBPSU5UOiBfcmVmcmVzaFxuXG5cdH0sXG5cblx0b246IGZ1bmN0aW9uICh0eXBlLCBmbikge1xuXHRcdGlmICggIXRoaXMuX2V2ZW50c1t0eXBlXSApIHtcblx0XHRcdHRoaXMuX2V2ZW50c1t0eXBlXSA9IFtdO1xuXHRcdH1cblxuXHRcdHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGZuKTtcblx0fSxcblxuXHRvZmY6IGZ1bmN0aW9uICh0eXBlLCBmbikge1xuXHRcdGlmICggIXRoaXMuX2V2ZW50c1t0eXBlXSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgaW5kZXggPSB0aGlzLl9ldmVudHNbdHlwZV0uaW5kZXhPZihmbik7XG5cblx0XHRpZiAoIGluZGV4ID4gLTEgKSB7XG5cdFx0XHR0aGlzLl9ldmVudHNbdHlwZV0uc3BsaWNlKGluZGV4LCAxKTtcblx0XHR9XG5cdH0sXG5cblx0X2V4ZWNFdmVudDogZnVuY3Rpb24gKHR5cGUpIHtcblx0XHRpZiAoICF0aGlzLl9ldmVudHNbdHlwZV0gKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIGkgPSAwLFxuXHRcdFx0bCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG5cblx0XHRpZiAoICFsICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGZvciAoIDsgaSA8IGw7IGkrKyApIHtcblx0XHRcdHRoaXMuX2V2ZW50c1t0eXBlXVtpXS5hcHBseSh0aGlzLCBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuXHRcdH1cblx0fSxcblxuXHRzY3JvbGxCeTogZnVuY3Rpb24gKHgsIHksIHRpbWUsIGVhc2luZykge1xuXHRcdHggPSB0aGlzLnggKyB4O1xuXHRcdHkgPSB0aGlzLnkgKyB5O1xuXHRcdHRpbWUgPSB0aW1lIHx8IDA7XG5cblx0XHR0aGlzLnNjcm9sbFRvKHgsIHksIHRpbWUsIGVhc2luZyk7XG5cdH0sXG5cblx0c2Nyb2xsVG86IGZ1bmN0aW9uICh4LCB5LCB0aW1lLCBlYXNpbmcpIHtcblx0XHRlYXNpbmcgPSBlYXNpbmcgfHwgdXRpbHMuZWFzZS5jaXJjdWxhcjtcblxuXHRcdHRoaXMuaXNJblRyYW5zaXRpb24gPSB0aGlzLm9wdGlvbnMudXNlVHJhbnNpdGlvbiAmJiB0aW1lID4gMDtcblxuXHRcdGlmICggIXRpbWUgfHwgKHRoaXMub3B0aW9ucy51c2VUcmFuc2l0aW9uICYmIGVhc2luZy5zdHlsZSkgKSB7XG5cdFx0XHR0aGlzLl90cmFuc2l0aW9uVGltaW5nRnVuY3Rpb24oZWFzaW5nLnN0eWxlKTtcblx0XHRcdHRoaXMuX3RyYW5zaXRpb25UaW1lKHRpbWUpO1xuXHRcdFx0dGhpcy5fdHJhbnNsYXRlKHgsIHkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9hbmltYXRlKHgsIHksIHRpbWUsIGVhc2luZy5mbik7XG5cdFx0fVxuXHR9LFxuXG5cdHNjcm9sbFRvRWxlbWVudDogZnVuY3Rpb24gKGVsLCB0aW1lLCBvZmZzZXRYLCBvZmZzZXRZLCBlYXNpbmcpIHtcblx0XHRlbCA9IGVsLm5vZGVUeXBlID8gZWwgOiB0aGlzLnNjcm9sbGVyLnF1ZXJ5U2VsZWN0b3IoZWwpO1xuXG5cdFx0aWYgKCAhZWwgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIHBvcyA9IHV0aWxzLm9mZnNldChlbCk7XG5cblx0XHRwb3MubGVmdCAtPSB0aGlzLndyYXBwZXJPZmZzZXQubGVmdDtcblx0XHRwb3MudG9wICAtPSB0aGlzLndyYXBwZXJPZmZzZXQudG9wO1xuXG5cdFx0Ly8gaWYgb2Zmc2V0WC9ZIGFyZSB0cnVlIHdlIGNlbnRlciB0aGUgZWxlbWVudCB0byB0aGUgc2NyZWVuXG5cdFx0aWYgKCBvZmZzZXRYID09PSB0cnVlICkge1xuXHRcdFx0b2Zmc2V0WCA9IE1hdGgucm91bmQoZWwub2Zmc2V0V2lkdGggLyAyIC0gdGhpcy53cmFwcGVyLm9mZnNldFdpZHRoIC8gMik7XG5cdFx0fVxuXHRcdGlmICggb2Zmc2V0WSA9PT0gdHJ1ZSApIHtcblx0XHRcdG9mZnNldFkgPSBNYXRoLnJvdW5kKGVsLm9mZnNldEhlaWdodCAvIDIgLSB0aGlzLndyYXBwZXIub2Zmc2V0SGVpZ2h0IC8gMik7XG5cdFx0fVxuXG5cdFx0cG9zLmxlZnQgLT0gb2Zmc2V0WCB8fCAwO1xuXHRcdHBvcy50b3AgIC09IG9mZnNldFkgfHwgMDtcblxuXHRcdHBvcy5sZWZ0ID0gcG9zLmxlZnQgPiAwID8gMCA6IHBvcy5sZWZ0IDwgdGhpcy5tYXhTY3JvbGxYID8gdGhpcy5tYXhTY3JvbGxYIDogcG9zLmxlZnQ7XG5cdFx0cG9zLnRvcCAgPSBwb3MudG9wICA+IDAgPyAwIDogcG9zLnRvcCAgPCB0aGlzLm1heFNjcm9sbFkgPyB0aGlzLm1heFNjcm9sbFkgOiBwb3MudG9wO1xuXG5cdFx0dGltZSA9IHRpbWUgPT09IHVuZGVmaW5lZCB8fCB0aW1lID09PSBudWxsIHx8IHRpbWUgPT09ICdhdXRvJyA/IE1hdGgubWF4KE1hdGguYWJzKHRoaXMueC1wb3MubGVmdCksIE1hdGguYWJzKHRoaXMueS1wb3MudG9wKSkgOiB0aW1lO1xuXG5cdFx0dGhpcy5zY3JvbGxUbyhwb3MubGVmdCwgcG9zLnRvcCwgdGltZSwgZWFzaW5nKTtcblx0fSxcblxuXHRfdHJhbnNpdGlvblRpbWU6IGZ1bmN0aW9uICh0aW1lKSB7XG5cdFx0dGltZSA9IHRpbWUgfHwgMDtcblxuXHRcdHRoaXMuc2Nyb2xsZXJTdHlsZVt1dGlscy5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb25dID0gdGltZSArICdtcyc7XG5cblx0XHRpZiAoICF0aW1lICYmIHV0aWxzLmlzQmFkQW5kcm9pZCApIHtcblx0XHRcdHRoaXMuc2Nyb2xsZXJTdHlsZVt1dGlscy5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb25dID0gJzAuMDAxcyc7XG5cdFx0fVxuXG5cblx0XHRpZiAoIHRoaXMuaW5kaWNhdG9ycyApIHtcblx0XHRcdGZvciAoIHZhciBpID0gdGhpcy5pbmRpY2F0b3JzLmxlbmd0aDsgaS0tOyApIHtcblx0XHRcdFx0dGhpcy5pbmRpY2F0b3JzW2ldLnRyYW5zaXRpb25UaW1lKHRpbWUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXG4vLyBJTlNFUlQgUE9JTlQ6IF90cmFuc2l0aW9uVGltZVxuXG5cdH0sXG5cblx0X3RyYW5zaXRpb25UaW1pbmdGdW5jdGlvbjogZnVuY3Rpb24gKGVhc2luZykge1xuXHRcdHRoaXMuc2Nyb2xsZXJTdHlsZVt1dGlscy5zdHlsZS50cmFuc2l0aW9uVGltaW5nRnVuY3Rpb25dID0gZWFzaW5nO1xuXG5cblx0XHRpZiAoIHRoaXMuaW5kaWNhdG9ycyApIHtcblx0XHRcdGZvciAoIHZhciBpID0gdGhpcy5pbmRpY2F0b3JzLmxlbmd0aDsgaS0tOyApIHtcblx0XHRcdFx0dGhpcy5pbmRpY2F0b3JzW2ldLnRyYW5zaXRpb25UaW1pbmdGdW5jdGlvbihlYXNpbmcpO1xuXHRcdFx0fVxuXHRcdH1cblxuXG4vLyBJTlNFUlQgUE9JTlQ6IF90cmFuc2l0aW9uVGltaW5nRnVuY3Rpb25cblxuXHR9LFxuXG5cdF90cmFuc2xhdGU6IGZ1bmN0aW9uICh4LCB5KSB7XG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMudXNlVHJhbnNmb3JtICkge1xuXG4vKiBSRVBMQUNFIFNUQVJUOiBfdHJhbnNsYXRlICovXG5cblx0XHRcdHRoaXMuc2Nyb2xsZXJTdHlsZVt1dGlscy5zdHlsZS50cmFuc2Zvcm1dID0gJ3RyYW5zbGF0ZSgnICsgeCArICdweCwnICsgeSArICdweCknICsgdGhpcy50cmFuc2xhdGVaO1xuXG4vKiBSRVBMQUNFIEVORDogX3RyYW5zbGF0ZSAqL1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHggPSBNYXRoLnJvdW5kKHgpO1xuXHRcdFx0eSA9IE1hdGgucm91bmQoeSk7XG5cdFx0XHR0aGlzLnNjcm9sbGVyU3R5bGUubGVmdCA9IHggKyAncHgnO1xuXHRcdFx0dGhpcy5zY3JvbGxlclN0eWxlLnRvcCA9IHkgKyAncHgnO1xuXHRcdH1cblxuXHRcdHRoaXMueCA9IHg7XG5cdFx0dGhpcy55ID0geTtcblxuXG5cdGlmICggdGhpcy5pbmRpY2F0b3JzICkge1xuXHRcdGZvciAoIHZhciBpID0gdGhpcy5pbmRpY2F0b3JzLmxlbmd0aDsgaS0tOyApIHtcblx0XHRcdHRoaXMuaW5kaWNhdG9yc1tpXS51cGRhdGVQb3NpdGlvbigpO1xuXHRcdH1cblx0fVxuXG5cbi8vIElOU0VSVCBQT0lOVDogX3RyYW5zbGF0ZVxuXG5cdH0sXG5cblx0X2luaXRFdmVudHM6IGZ1bmN0aW9uIChyZW1vdmUpIHtcblx0XHR2YXIgZXZlbnRUeXBlID0gcmVtb3ZlID8gdXRpbHMucmVtb3ZlRXZlbnQgOiB1dGlscy5hZGRFdmVudCxcblx0XHRcdHRhcmdldCA9IHRoaXMub3B0aW9ucy5iaW5kVG9XcmFwcGVyID8gdGhpcy53cmFwcGVyIDogd2luZG93O1xuXG5cdFx0ZXZlbnRUeXBlKHdpbmRvdywgJ29yaWVudGF0aW9uY2hhbmdlJywgdGhpcyk7XG5cdFx0ZXZlbnRUeXBlKHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMpO1xuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuY2xpY2sgKSB7XG5cdFx0XHRldmVudFR5cGUodGhpcy53cmFwcGVyLCAnY2xpY2snLCB0aGlzLCB0cnVlKTtcblx0XHR9XG5cblx0XHRpZiAoICF0aGlzLm9wdGlvbnMuZGlzYWJsZU1vdXNlICkge1xuXHRcdFx0ZXZlbnRUeXBlKHRoaXMud3JhcHBlciwgJ21vdXNlZG93bicsIHRoaXMpO1xuXHRcdFx0ZXZlbnRUeXBlKHRhcmdldCwgJ21vdXNlbW92ZScsIHRoaXMpO1xuXHRcdFx0ZXZlbnRUeXBlKHRhcmdldCwgJ21vdXNlY2FuY2VsJywgdGhpcyk7XG5cdFx0XHRldmVudFR5cGUodGFyZ2V0LCAnbW91c2V1cCcsIHRoaXMpO1xuXHRcdH1cblxuXHRcdGlmICggdXRpbHMuaGFzUG9pbnRlciAmJiAhdGhpcy5vcHRpb25zLmRpc2FibGVQb2ludGVyICkge1xuXHRcdFx0ZXZlbnRUeXBlKHRoaXMud3JhcHBlciwgJ01TUG9pbnRlckRvd24nLCB0aGlzKTtcblx0XHRcdGV2ZW50VHlwZSh0YXJnZXQsICdNU1BvaW50ZXJNb3ZlJywgdGhpcyk7XG5cdFx0XHRldmVudFR5cGUodGFyZ2V0LCAnTVNQb2ludGVyQ2FuY2VsJywgdGhpcyk7XG5cdFx0XHRldmVudFR5cGUodGFyZ2V0LCAnTVNQb2ludGVyVXAnLCB0aGlzKTtcblx0XHR9XG5cblx0XHRpZiAoIHV0aWxzLmhhc1RvdWNoICYmICF0aGlzLm9wdGlvbnMuZGlzYWJsZVRvdWNoICkge1xuXHRcdFx0ZXZlbnRUeXBlKHRoaXMud3JhcHBlciwgJ3RvdWNoc3RhcnQnLCB0aGlzKTtcblx0XHRcdGV2ZW50VHlwZSh0YXJnZXQsICd0b3VjaG1vdmUnLCB0aGlzKTtcblx0XHRcdGV2ZW50VHlwZSh0YXJnZXQsICd0b3VjaGNhbmNlbCcsIHRoaXMpO1xuXHRcdFx0ZXZlbnRUeXBlKHRhcmdldCwgJ3RvdWNoZW5kJywgdGhpcyk7XG5cdFx0fVxuXG5cdFx0ZXZlbnRUeXBlKHRoaXMuc2Nyb2xsZXIsICd0cmFuc2l0aW9uZW5kJywgdGhpcyk7XG5cdFx0ZXZlbnRUeXBlKHRoaXMuc2Nyb2xsZXIsICd3ZWJraXRUcmFuc2l0aW9uRW5kJywgdGhpcyk7XG5cdFx0ZXZlbnRUeXBlKHRoaXMuc2Nyb2xsZXIsICdvVHJhbnNpdGlvbkVuZCcsIHRoaXMpO1xuXHRcdGV2ZW50VHlwZSh0aGlzLnNjcm9sbGVyLCAnTVNUcmFuc2l0aW9uRW5kJywgdGhpcyk7XG5cdH0sXG5cblx0Z2V0Q29tcHV0ZWRQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBtYXRyaXggPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLnNjcm9sbGVyLCBudWxsKSxcblx0XHRcdHgsIHk7XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy51c2VUcmFuc2Zvcm0gKSB7XG5cdFx0XHRtYXRyaXggPSBtYXRyaXhbdXRpbHMuc3R5bGUudHJhbnNmb3JtXS5zcGxpdCgnKScpWzBdLnNwbGl0KCcsICcpO1xuXHRcdFx0eCA9ICsobWF0cml4WzEyXSB8fCBtYXRyaXhbNF0pO1xuXHRcdFx0eSA9ICsobWF0cml4WzEzXSB8fCBtYXRyaXhbNV0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR4ID0gK21hdHJpeC5sZWZ0LnJlcGxhY2UoL1teLVxcZC5dL2csICcnKTtcblx0XHRcdHkgPSArbWF0cml4LnRvcC5yZXBsYWNlKC9bXi1cXGQuXS9nLCAnJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHsgeDogeCwgeTogeSB9O1xuXHR9LFxuXG5cdF9pbml0SW5kaWNhdG9yczogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBpbnRlcmFjdGl2ZSA9IHRoaXMub3B0aW9ucy5pbnRlcmFjdGl2ZVNjcm9sbGJhcnMsXG5cdFx0XHRjdXN0b21TdHlsZSA9IHR5cGVvZiB0aGlzLm9wdGlvbnMuc2Nyb2xsYmFycyAhPSAnc3RyaW5nJyxcblx0XHRcdGluZGljYXRvcnMgPSBbXSxcblx0XHRcdGluZGljYXRvcjtcblxuXHRcdHZhciB0aGF0ID0gdGhpcztcblxuXHRcdHRoaXMuaW5kaWNhdG9ycyA9IFtdO1xuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuc2Nyb2xsYmFycyApIHtcblx0XHRcdC8vIFZlcnRpY2FsIHNjcm9sbGJhclxuXHRcdFx0aWYgKCB0aGlzLm9wdGlvbnMuc2Nyb2xsWSApIHtcblx0XHRcdFx0aW5kaWNhdG9yID0ge1xuXHRcdFx0XHRcdGVsOiBjcmVhdGVEZWZhdWx0U2Nyb2xsYmFyKCd2JywgaW50ZXJhY3RpdmUsIHRoaXMub3B0aW9ucy5zY3JvbGxiYXJzKSxcblx0XHRcdFx0XHRpbnRlcmFjdGl2ZTogaW50ZXJhY3RpdmUsXG5cdFx0XHRcdFx0ZGVmYXVsdFNjcm9sbGJhcnM6IHRydWUsXG5cdFx0XHRcdFx0Y3VzdG9tU3R5bGU6IGN1c3RvbVN0eWxlLFxuXHRcdFx0XHRcdHJlc2l6ZTogdGhpcy5vcHRpb25zLnJlc2l6ZVNjcm9sbGJhcnMsXG5cdFx0XHRcdFx0c2hyaW5rOiB0aGlzLm9wdGlvbnMuc2hyaW5rU2Nyb2xsYmFycyxcblx0XHRcdFx0XHRmYWRlOiB0aGlzLm9wdGlvbnMuZmFkZVNjcm9sbGJhcnMsXG5cdFx0XHRcdFx0bGlzdGVuWDogZmFsc2Vcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR0aGlzLndyYXBwZXIuYXBwZW5kQ2hpbGQoaW5kaWNhdG9yLmVsKTtcblx0XHRcdFx0aW5kaWNhdG9ycy5wdXNoKGluZGljYXRvcik7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEhvcml6b250YWwgc2Nyb2xsYmFyXG5cdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5zY3JvbGxYICkge1xuXHRcdFx0XHRpbmRpY2F0b3IgPSB7XG5cdFx0XHRcdFx0ZWw6IGNyZWF0ZURlZmF1bHRTY3JvbGxiYXIoJ2gnLCBpbnRlcmFjdGl2ZSwgdGhpcy5vcHRpb25zLnNjcm9sbGJhcnMpLFxuXHRcdFx0XHRcdGludGVyYWN0aXZlOiBpbnRlcmFjdGl2ZSxcblx0XHRcdFx0XHRkZWZhdWx0U2Nyb2xsYmFyczogdHJ1ZSxcblx0XHRcdFx0XHRjdXN0b21TdHlsZTogY3VzdG9tU3R5bGUsXG5cdFx0XHRcdFx0cmVzaXplOiB0aGlzLm9wdGlvbnMucmVzaXplU2Nyb2xsYmFycyxcblx0XHRcdFx0XHRzaHJpbms6IHRoaXMub3B0aW9ucy5zaHJpbmtTY3JvbGxiYXJzLFxuXHRcdFx0XHRcdGZhZGU6IHRoaXMub3B0aW9ucy5mYWRlU2Nyb2xsYmFycyxcblx0XHRcdFx0XHRsaXN0ZW5ZOiBmYWxzZVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHRoaXMud3JhcHBlci5hcHBlbmRDaGlsZChpbmRpY2F0b3IuZWwpO1xuXHRcdFx0XHRpbmRpY2F0b3JzLnB1c2goaW5kaWNhdG9yKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5pbmRpY2F0b3JzICkge1xuXHRcdFx0Ly8gVE9ETzogY2hlY2sgY29uY2F0IGNvbXBhdGliaWxpdHlcblx0XHRcdGluZGljYXRvcnMgPSBpbmRpY2F0b3JzLmNvbmNhdCh0aGlzLm9wdGlvbnMuaW5kaWNhdG9ycyk7XG5cdFx0fVxuXG5cdFx0Zm9yICggdmFyIGkgPSBpbmRpY2F0b3JzLmxlbmd0aDsgaS0tOyApIHtcblx0XHRcdHRoaXMuaW5kaWNhdG9ycy5wdXNoKCBuZXcgSW5kaWNhdG9yKHRoaXMsIGluZGljYXRvcnNbaV0pICk7XG5cdFx0fVxuXG5cdFx0Ly8gVE9ETzogY2hlY2sgaWYgd2UgY2FuIHVzZSBhcnJheS5tYXAgKHdpZGUgY29tcGF0aWJpbGl0eSBhbmQgcGVyZm9ybWFuY2UgaXNzdWVzKVxuXHRcdGZ1bmN0aW9uIF9pbmRpY2F0b3JzTWFwIChmbikge1xuXHRcdFx0Zm9yICggdmFyIGkgPSB0aGF0LmluZGljYXRvcnMubGVuZ3RoOyBpLS07ICkge1xuXHRcdFx0XHRmbi5jYWxsKHRoYXQuaW5kaWNhdG9yc1tpXSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuZmFkZVNjcm9sbGJhcnMgKSB7XG5cdFx0XHR0aGlzLm9uKCdzY3JvbGxFbmQnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdF9pbmRpY2F0b3JzTWFwKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHR0aGlzLmZhZGUoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5vbignc2Nyb2xsQ2FuY2VsJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRfaW5kaWNhdG9yc01hcChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0dGhpcy5mYWRlKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMub24oJ3Njcm9sbFN0YXJ0JywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRfaW5kaWNhdG9yc01hcChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0dGhpcy5mYWRlKDEpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLm9uKCdiZWZvcmVTY3JvbGxTdGFydCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0X2luZGljYXRvcnNNYXAoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHRoaXMuZmFkZSgxLCB0cnVlKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblxuXHRcdHRoaXMub24oJ3JlZnJlc2gnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRfaW5kaWNhdG9yc01hcChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHRoaXMucmVmcmVzaCgpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuXHRcdFx0X2luZGljYXRvcnNNYXAoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR0aGlzLmRlc3Ryb3koKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRkZWxldGUgdGhpcy5pbmRpY2F0b3JzO1xuXHRcdH0pO1xuXHR9LFxuXG5cdF9pbml0V2hlZWw6IGZ1bmN0aW9uICgpIHtcblx0XHR1dGlscy5hZGRFdmVudCh0aGlzLndyYXBwZXIsICd3aGVlbCcsIHRoaXMpO1xuXHRcdHV0aWxzLmFkZEV2ZW50KHRoaXMud3JhcHBlciwgJ21vdXNld2hlZWwnLCB0aGlzKTtcblx0XHR1dGlscy5hZGRFdmVudCh0aGlzLndyYXBwZXIsICdET01Nb3VzZVNjcm9sbCcsIHRoaXMpO1xuXG5cdFx0dGhpcy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHV0aWxzLnJlbW92ZUV2ZW50KHRoaXMud3JhcHBlciwgJ3doZWVsJywgdGhpcyk7XG5cdFx0XHR1dGlscy5yZW1vdmVFdmVudCh0aGlzLndyYXBwZXIsICdtb3VzZXdoZWVsJywgdGhpcyk7XG5cdFx0XHR1dGlscy5yZW1vdmVFdmVudCh0aGlzLndyYXBwZXIsICdET01Nb3VzZVNjcm9sbCcsIHRoaXMpO1xuXHRcdH0pO1xuXHR9LFxuXG5cdF93aGVlbDogZnVuY3Rpb24gKGUpIHtcblx0XHRpZiAoICF0aGlzLmVuYWJsZWQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR2YXIgd2hlZWxEZWx0YVgsIHdoZWVsRGVsdGFZLFxuXHRcdFx0bmV3WCwgbmV3WSxcblx0XHRcdHRoYXQgPSB0aGlzO1xuXG5cdFx0aWYgKCB0aGlzLndoZWVsVGltZW91dCA9PT0gdW5kZWZpbmVkICkge1xuXHRcdFx0dGhhdC5fZXhlY0V2ZW50KCdzY3JvbGxTdGFydCcpO1xuXHRcdH1cblxuXHRcdC8vIEV4ZWN1dGUgdGhlIHNjcm9sbEVuZCBldmVudCBhZnRlciA0MDBtcyB0aGUgd2hlZWwgc3RvcHBlZCBzY3JvbGxpbmdcblx0XHRjbGVhclRpbWVvdXQodGhpcy53aGVlbFRpbWVvdXQpO1xuXHRcdHRoaXMud2hlZWxUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHR0aGF0Ll9leGVjRXZlbnQoJ3Njcm9sbEVuZCcpO1xuXHRcdFx0dGhhdC53aGVlbFRpbWVvdXQgPSB1bmRlZmluZWQ7XG5cdFx0fSwgNDAwKTtcblxuXHRcdGlmICggJ2RlbHRhWCcgaW4gZSApIHtcblx0XHRcdHdoZWVsRGVsdGFYID0gLWUuZGVsdGFYO1xuXHRcdFx0d2hlZWxEZWx0YVkgPSAtZS5kZWx0YVk7XG5cdFx0fSBlbHNlIGlmICggJ3doZWVsRGVsdGFYJyBpbiBlICkge1xuXHRcdFx0d2hlZWxEZWx0YVggPSBlLndoZWVsRGVsdGFYIC8gMTIwICogdGhpcy5vcHRpb25zLm1vdXNlV2hlZWxTcGVlZDtcblx0XHRcdHdoZWVsRGVsdGFZID0gZS53aGVlbERlbHRhWSAvIDEyMCAqIHRoaXMub3B0aW9ucy5tb3VzZVdoZWVsU3BlZWQ7XG5cdFx0fSBlbHNlIGlmICggJ3doZWVsRGVsdGEnIGluIGUgKSB7XG5cdFx0XHR3aGVlbERlbHRhWCA9IHdoZWVsRGVsdGFZID0gZS53aGVlbERlbHRhIC8gMTIwICogdGhpcy5vcHRpb25zLm1vdXNlV2hlZWxTcGVlZDtcblx0XHR9IGVsc2UgaWYgKCAnZGV0YWlsJyBpbiBlICkge1xuXHRcdFx0d2hlZWxEZWx0YVggPSB3aGVlbERlbHRhWSA9IC1lLmRldGFpbCAvIDMgKiB0aGlzLm9wdGlvbnMubW91c2VXaGVlbFNwZWVkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0d2hlZWxEZWx0YVggKj0gdGhpcy5vcHRpb25zLmludmVydFdoZWVsRGlyZWN0aW9uO1xuXHRcdHdoZWVsRGVsdGFZICo9IHRoaXMub3B0aW9ucy5pbnZlcnRXaGVlbERpcmVjdGlvbjtcblxuXHRcdGlmICggIXRoaXMuaGFzVmVydGljYWxTY3JvbGwgKSB7XG5cdFx0XHR3aGVlbERlbHRhWCA9IHdoZWVsRGVsdGFZO1xuXHRcdFx0d2hlZWxEZWx0YVkgPSAwO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5vcHRpb25zLnNuYXAgKSB7XG5cdFx0XHRuZXdYID0gdGhpcy5jdXJyZW50UGFnZS5wYWdlWDtcblx0XHRcdG5ld1kgPSB0aGlzLmN1cnJlbnRQYWdlLnBhZ2VZO1xuXG5cdFx0XHRpZiAoIHdoZWVsRGVsdGFYID4gMCApIHtcblx0XHRcdFx0bmV3WC0tO1xuXHRcdFx0fSBlbHNlIGlmICggd2hlZWxEZWx0YVggPCAwICkge1xuXHRcdFx0XHRuZXdYKys7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggd2hlZWxEZWx0YVkgPiAwICkge1xuXHRcdFx0XHRuZXdZLS07XG5cdFx0XHR9IGVsc2UgaWYgKCB3aGVlbERlbHRhWSA8IDAgKSB7XG5cdFx0XHRcdG5ld1krKztcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5nb1RvUGFnZShuZXdYLCBuZXdZKTtcblxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdG5ld1ggPSB0aGlzLnggKyBNYXRoLnJvdW5kKHRoaXMuaGFzSG9yaXpvbnRhbFNjcm9sbCA/IHdoZWVsRGVsdGFYIDogMCk7XG5cdFx0bmV3WSA9IHRoaXMueSArIE1hdGgucm91bmQodGhpcy5oYXNWZXJ0aWNhbFNjcm9sbCA/IHdoZWVsRGVsdGFZIDogMCk7XG5cblx0XHRpZiAoIG5ld1ggPiAwICkge1xuXHRcdFx0bmV3WCA9IDA7XG5cdFx0fSBlbHNlIGlmICggbmV3WCA8IHRoaXMubWF4U2Nyb2xsWCApIHtcblx0XHRcdG5ld1ggPSB0aGlzLm1heFNjcm9sbFg7XG5cdFx0fVxuXG5cdFx0aWYgKCBuZXdZID4gMCApIHtcblx0XHRcdG5ld1kgPSAwO1xuXHRcdH0gZWxzZSBpZiAoIG5ld1kgPCB0aGlzLm1heFNjcm9sbFkgKSB7XG5cdFx0XHRuZXdZID0gdGhpcy5tYXhTY3JvbGxZO1xuXHRcdH1cblxuXHRcdHRoaXMuc2Nyb2xsVG8obmV3WCwgbmV3WSwgMCk7XG5cbi8vIElOU0VSVCBQT0lOVDogX3doZWVsXG5cdH0sXG5cblx0X2luaXRTbmFwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5jdXJyZW50UGFnZSA9IHt9O1xuXG5cdFx0aWYgKCB0eXBlb2YgdGhpcy5vcHRpb25zLnNuYXAgPT0gJ3N0cmluZycgKSB7XG5cdFx0XHR0aGlzLm9wdGlvbnMuc25hcCA9IHRoaXMuc2Nyb2xsZXIucXVlcnlTZWxlY3RvckFsbCh0aGlzLm9wdGlvbnMuc25hcCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5vbigncmVmcmVzaCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciBpID0gMCwgbCxcblx0XHRcdFx0bSA9IDAsIG4sXG5cdFx0XHRcdGN4LCBjeSxcblx0XHRcdFx0eCA9IDAsIHksXG5cdFx0XHRcdHN0ZXBYID0gdGhpcy5vcHRpb25zLnNuYXBTdGVwWCB8fCB0aGlzLndyYXBwZXJXaWR0aCxcblx0XHRcdFx0c3RlcFkgPSB0aGlzLm9wdGlvbnMuc25hcFN0ZXBZIHx8IHRoaXMud3JhcHBlckhlaWdodCxcblx0XHRcdFx0ZWw7XG5cblx0XHRcdHRoaXMucGFnZXMgPSBbXTtcblxuXHRcdFx0aWYgKCAhdGhpcy53cmFwcGVyV2lkdGggfHwgIXRoaXMud3JhcHBlckhlaWdodCB8fCAhdGhpcy5zY3JvbGxlcldpZHRoIHx8ICF0aGlzLnNjcm9sbGVySGVpZ2h0ICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmICggdGhpcy5vcHRpb25zLnNuYXAgPT09IHRydWUgKSB7XG5cdFx0XHRcdGN4ID0gTWF0aC5yb3VuZCggc3RlcFggLyAyICk7XG5cdFx0XHRcdGN5ID0gTWF0aC5yb3VuZCggc3RlcFkgLyAyICk7XG5cblx0XHRcdFx0d2hpbGUgKCB4ID4gLXRoaXMuc2Nyb2xsZXJXaWR0aCApIHtcblx0XHRcdFx0XHR0aGlzLnBhZ2VzW2ldID0gW107XG5cdFx0XHRcdFx0bCA9IDA7XG5cdFx0XHRcdFx0eSA9IDA7XG5cblx0XHRcdFx0XHR3aGlsZSAoIHkgPiAtdGhpcy5zY3JvbGxlckhlaWdodCApIHtcblx0XHRcdFx0XHRcdHRoaXMucGFnZXNbaV1bbF0gPSB7XG5cdFx0XHRcdFx0XHRcdHg6IE1hdGgubWF4KHgsIHRoaXMubWF4U2Nyb2xsWCksXG5cdFx0XHRcdFx0XHRcdHk6IE1hdGgubWF4KHksIHRoaXMubWF4U2Nyb2xsWSksXG5cdFx0XHRcdFx0XHRcdHdpZHRoOiBzdGVwWCxcblx0XHRcdFx0XHRcdFx0aGVpZ2h0OiBzdGVwWSxcblx0XHRcdFx0XHRcdFx0Y3g6IHggLSBjeCxcblx0XHRcdFx0XHRcdFx0Y3k6IHkgLSBjeVxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0eSAtPSBzdGVwWTtcblx0XHRcdFx0XHRcdGwrKztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR4IC09IHN0ZXBYO1xuXHRcdFx0XHRcdGkrKztcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZWwgPSB0aGlzLm9wdGlvbnMuc25hcDtcblx0XHRcdFx0bCA9IGVsLmxlbmd0aDtcblx0XHRcdFx0biA9IC0xO1xuXG5cdFx0XHRcdGZvciAoIDsgaSA8IGw7IGkrKyApIHtcblx0XHRcdFx0XHRpZiAoIGkgPT09IDAgfHwgZWxbaV0ub2Zmc2V0TGVmdCA8PSBlbFtpLTFdLm9mZnNldExlZnQgKSB7XG5cdFx0XHRcdFx0XHRtID0gMDtcblx0XHRcdFx0XHRcdG4rKztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoICF0aGlzLnBhZ2VzW21dICkge1xuXHRcdFx0XHRcdFx0dGhpcy5wYWdlc1ttXSA9IFtdO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHggPSBNYXRoLm1heCgtZWxbaV0ub2Zmc2V0TGVmdCwgdGhpcy5tYXhTY3JvbGxYKTtcblx0XHRcdFx0XHR5ID0gTWF0aC5tYXgoLWVsW2ldLm9mZnNldFRvcCwgdGhpcy5tYXhTY3JvbGxZKTtcblx0XHRcdFx0XHRjeCA9IHggLSBNYXRoLnJvdW5kKGVsW2ldLm9mZnNldFdpZHRoIC8gMik7XG5cdFx0XHRcdFx0Y3kgPSB5IC0gTWF0aC5yb3VuZChlbFtpXS5vZmZzZXRIZWlnaHQgLyAyKTtcblxuXHRcdFx0XHRcdHRoaXMucGFnZXNbbV1bbl0gPSB7XG5cdFx0XHRcdFx0XHR4OiB4LFxuXHRcdFx0XHRcdFx0eTogeSxcblx0XHRcdFx0XHRcdHdpZHRoOiBlbFtpXS5vZmZzZXRXaWR0aCxcblx0XHRcdFx0XHRcdGhlaWdodDogZWxbaV0ub2Zmc2V0SGVpZ2h0LFxuXHRcdFx0XHRcdFx0Y3g6IGN4LFxuXHRcdFx0XHRcdFx0Y3k6IGN5XG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdGlmICggeCA+IHRoaXMubWF4U2Nyb2xsWCApIHtcblx0XHRcdFx0XHRcdG0rKztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dGhpcy5nb1RvUGFnZSh0aGlzLmN1cnJlbnRQYWdlLnBhZ2VYIHx8IDAsIHRoaXMuY3VycmVudFBhZ2UucGFnZVkgfHwgMCwgMCk7XG5cblx0XHRcdC8vIFVwZGF0ZSBzbmFwIHRocmVzaG9sZCBpZiBuZWVkZWRcblx0XHRcdGlmICggdGhpcy5vcHRpb25zLnNuYXBUaHJlc2hvbGQgJSAxID09PSAwICkge1xuXHRcdFx0XHR0aGlzLnNuYXBUaHJlc2hvbGRYID0gdGhpcy5vcHRpb25zLnNuYXBUaHJlc2hvbGQ7XG5cdFx0XHRcdHRoaXMuc25hcFRocmVzaG9sZFkgPSB0aGlzLm9wdGlvbnMuc25hcFRocmVzaG9sZDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuc25hcFRocmVzaG9sZFggPSBNYXRoLnJvdW5kKHRoaXMucGFnZXNbdGhpcy5jdXJyZW50UGFnZS5wYWdlWF1bdGhpcy5jdXJyZW50UGFnZS5wYWdlWV0ud2lkdGggKiB0aGlzLm9wdGlvbnMuc25hcFRocmVzaG9sZCk7XG5cdFx0XHRcdHRoaXMuc25hcFRocmVzaG9sZFkgPSBNYXRoLnJvdW5kKHRoaXMucGFnZXNbdGhpcy5jdXJyZW50UGFnZS5wYWdlWF1bdGhpcy5jdXJyZW50UGFnZS5wYWdlWV0uaGVpZ2h0ICogdGhpcy5vcHRpb25zLnNuYXBUaHJlc2hvbGQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5vbignZmxpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgdGltZSA9IHRoaXMub3B0aW9ucy5zbmFwU3BlZWQgfHwgTWF0aC5tYXgoXG5cdFx0XHRcdFx0TWF0aC5tYXgoXG5cdFx0XHRcdFx0XHRNYXRoLm1pbihNYXRoLmFicyh0aGlzLnggLSB0aGlzLnN0YXJ0WCksIDEwMDApLFxuXHRcdFx0XHRcdFx0TWF0aC5taW4oTWF0aC5hYnModGhpcy55IC0gdGhpcy5zdGFydFkpLCAxMDAwKVxuXHRcdFx0XHRcdCksIDMwMCk7XG5cblx0XHRcdHRoaXMuZ29Ub1BhZ2UoXG5cdFx0XHRcdHRoaXMuY3VycmVudFBhZ2UucGFnZVggKyB0aGlzLmRpcmVjdGlvblgsXG5cdFx0XHRcdHRoaXMuY3VycmVudFBhZ2UucGFnZVkgKyB0aGlzLmRpcmVjdGlvblksXG5cdFx0XHRcdHRpbWVcblx0XHRcdCk7XG5cdFx0fSk7XG5cdH0sXG5cblx0X25lYXJlc3RTbmFwOiBmdW5jdGlvbiAoeCwgeSkge1xuXHRcdGlmICggIXRoaXMucGFnZXMubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuIHsgeDogMCwgeTogMCwgcGFnZVg6IDAsIHBhZ2VZOiAwIH07XG5cdFx0fVxuXG5cdFx0dmFyIGkgPSAwLFxuXHRcdFx0bCA9IHRoaXMucGFnZXMubGVuZ3RoLFxuXHRcdFx0bSA9IDA7XG5cblx0XHQvLyBDaGVjayBpZiB3ZSBleGNlZWRlZCB0aGUgc25hcCB0aHJlc2hvbGRcblx0XHRpZiAoIE1hdGguYWJzKHggLSB0aGlzLmFic1N0YXJ0WCkgPCB0aGlzLnNuYXBUaHJlc2hvbGRYICYmXG5cdFx0XHRNYXRoLmFicyh5IC0gdGhpcy5hYnNTdGFydFkpIDwgdGhpcy5zbmFwVGhyZXNob2xkWSApIHtcblx0XHRcdHJldHVybiB0aGlzLmN1cnJlbnRQYWdlO1xuXHRcdH1cblxuXHRcdGlmICggeCA+IDAgKSB7XG5cdFx0XHR4ID0gMDtcblx0XHR9IGVsc2UgaWYgKCB4IDwgdGhpcy5tYXhTY3JvbGxYICkge1xuXHRcdFx0eCA9IHRoaXMubWF4U2Nyb2xsWDtcblx0XHR9XG5cblx0XHRpZiAoIHkgPiAwICkge1xuXHRcdFx0eSA9IDA7XG5cdFx0fSBlbHNlIGlmICggeSA8IHRoaXMubWF4U2Nyb2xsWSApIHtcblx0XHRcdHkgPSB0aGlzLm1heFNjcm9sbFk7XG5cdFx0fVxuXG5cdFx0Zm9yICggOyBpIDwgbDsgaSsrICkge1xuXHRcdFx0aWYgKCB4ID49IHRoaXMucGFnZXNbaV1bMF0uY3ggKSB7XG5cdFx0XHRcdHggPSB0aGlzLnBhZ2VzW2ldWzBdLng7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGwgPSB0aGlzLnBhZ2VzW2ldLmxlbmd0aDtcblxuXHRcdGZvciAoIDsgbSA8IGw7IG0rKyApIHtcblx0XHRcdGlmICggeSA+PSB0aGlzLnBhZ2VzWzBdW21dLmN5ICkge1xuXHRcdFx0XHR5ID0gdGhpcy5wYWdlc1swXVttXS55O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIGkgPT0gdGhpcy5jdXJyZW50UGFnZS5wYWdlWCApIHtcblx0XHRcdGkgKz0gdGhpcy5kaXJlY3Rpb25YO1xuXG5cdFx0XHRpZiAoIGkgPCAwICkge1xuXHRcdFx0XHRpID0gMDtcblx0XHRcdH0gZWxzZSBpZiAoIGkgPj0gdGhpcy5wYWdlcy5sZW5ndGggKSB7XG5cdFx0XHRcdGkgPSB0aGlzLnBhZ2VzLmxlbmd0aCAtIDE7XG5cdFx0XHR9XG5cblx0XHRcdHggPSB0aGlzLnBhZ2VzW2ldWzBdLng7XG5cdFx0fVxuXG5cdFx0aWYgKCBtID09IHRoaXMuY3VycmVudFBhZ2UucGFnZVkgKSB7XG5cdFx0XHRtICs9IHRoaXMuZGlyZWN0aW9uWTtcblxuXHRcdFx0aWYgKCBtIDwgMCApIHtcblx0XHRcdFx0bSA9IDA7XG5cdFx0XHR9IGVsc2UgaWYgKCBtID49IHRoaXMucGFnZXNbMF0ubGVuZ3RoICkge1xuXHRcdFx0XHRtID0gdGhpcy5wYWdlc1swXS5sZW5ndGggLSAxO1xuXHRcdFx0fVxuXG5cdFx0XHR5ID0gdGhpcy5wYWdlc1swXVttXS55O1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHR4OiB4LFxuXHRcdFx0eTogeSxcblx0XHRcdHBhZ2VYOiBpLFxuXHRcdFx0cGFnZVk6IG1cblx0XHR9O1xuXHR9LFxuXG5cdGdvVG9QYWdlOiBmdW5jdGlvbiAoeCwgeSwgdGltZSwgZWFzaW5nKSB7XG5cdFx0ZWFzaW5nID0gZWFzaW5nIHx8IHRoaXMub3B0aW9ucy5ib3VuY2VFYXNpbmc7XG5cblx0XHRpZiAoIHggPj0gdGhpcy5wYWdlcy5sZW5ndGggKSB7XG5cdFx0XHR4ID0gdGhpcy5wYWdlcy5sZW5ndGggLSAxO1xuXHRcdH0gZWxzZSBpZiAoIHggPCAwICkge1xuXHRcdFx0eCA9IDA7XG5cdFx0fVxuXG5cdFx0aWYgKCB5ID49IHRoaXMucGFnZXNbeF0ubGVuZ3RoICkge1xuXHRcdFx0eSA9IHRoaXMucGFnZXNbeF0ubGVuZ3RoIC0gMTtcblx0XHR9IGVsc2UgaWYgKCB5IDwgMCApIHtcblx0XHRcdHkgPSAwO1xuXHRcdH1cblxuXHRcdHZhciBwb3NYID0gdGhpcy5wYWdlc1t4XVt5XS54LFxuXHRcdFx0cG9zWSA9IHRoaXMucGFnZXNbeF1beV0ueTtcblxuXHRcdHRpbWUgPSB0aW1lID09PSB1bmRlZmluZWQgPyB0aGlzLm9wdGlvbnMuc25hcFNwZWVkIHx8IE1hdGgubWF4KFxuXHRcdFx0TWF0aC5tYXgoXG5cdFx0XHRcdE1hdGgubWluKE1hdGguYWJzKHBvc1ggLSB0aGlzLngpLCAxMDAwKSxcblx0XHRcdFx0TWF0aC5taW4oTWF0aC5hYnMocG9zWSAtIHRoaXMueSksIDEwMDApXG5cdFx0XHQpLCAzMDApIDogdGltZTtcblxuXHRcdHRoaXMuY3VycmVudFBhZ2UgPSB7XG5cdFx0XHR4OiBwb3NYLFxuXHRcdFx0eTogcG9zWSxcblx0XHRcdHBhZ2VYOiB4LFxuXHRcdFx0cGFnZVk6IHlcblx0XHR9O1xuXG5cdFx0dGhpcy5zY3JvbGxUbyhwb3NYLCBwb3NZLCB0aW1lLCBlYXNpbmcpO1xuXHR9LFxuXG5cdG5leHQ6IGZ1bmN0aW9uICh0aW1lLCBlYXNpbmcpIHtcblx0XHR2YXIgeCA9IHRoaXMuY3VycmVudFBhZ2UucGFnZVgsXG5cdFx0XHR5ID0gdGhpcy5jdXJyZW50UGFnZS5wYWdlWTtcblxuXHRcdHgrKztcblxuXHRcdGlmICggeCA+PSB0aGlzLnBhZ2VzLmxlbmd0aCAmJiB0aGlzLmhhc1ZlcnRpY2FsU2Nyb2xsICkge1xuXHRcdFx0eCA9IDA7XG5cdFx0XHR5Kys7XG5cdFx0fVxuXG5cdFx0dGhpcy5nb1RvUGFnZSh4LCB5LCB0aW1lLCBlYXNpbmcpO1xuXHR9LFxuXG5cdHByZXY6IGZ1bmN0aW9uICh0aW1lLCBlYXNpbmcpIHtcblx0XHR2YXIgeCA9IHRoaXMuY3VycmVudFBhZ2UucGFnZVgsXG5cdFx0XHR5ID0gdGhpcy5jdXJyZW50UGFnZS5wYWdlWTtcblxuXHRcdHgtLTtcblxuXHRcdGlmICggeCA8IDAgJiYgdGhpcy5oYXNWZXJ0aWNhbFNjcm9sbCApIHtcblx0XHRcdHggPSAwO1xuXHRcdFx0eS0tO1xuXHRcdH1cblxuXHRcdHRoaXMuZ29Ub1BhZ2UoeCwgeSwgdGltZSwgZWFzaW5nKTtcblx0fSxcblxuXHRfaW5pdEtleXM6IGZ1bmN0aW9uIChlKSB7XG5cdFx0Ly8gZGVmYXVsdCBrZXkgYmluZGluZ3Ncblx0XHR2YXIga2V5cyA9IHtcblx0XHRcdHBhZ2VVcDogMzMsXG5cdFx0XHRwYWdlRG93bjogMzQsXG5cdFx0XHRlbmQ6IDM1LFxuXHRcdFx0aG9tZTogMzYsXG5cdFx0XHRsZWZ0OiAzNyxcblx0XHRcdHVwOiAzOCxcblx0XHRcdHJpZ2h0OiAzOSxcblx0XHRcdGRvd246IDQwXG5cdFx0fTtcblx0XHR2YXIgaTtcblxuXHRcdC8vIGlmIHlvdSBnaXZlIG1lIGNoYXJhY3RlcnMgSSBnaXZlIHlvdSBrZXljb2RlXG5cdFx0aWYgKCB0eXBlb2YgdGhpcy5vcHRpb25zLmtleUJpbmRpbmdzID09ICdvYmplY3QnICkge1xuXHRcdFx0Zm9yICggaSBpbiB0aGlzLm9wdGlvbnMua2V5QmluZGluZ3MgKSB7XG5cdFx0XHRcdGlmICggdHlwZW9mIHRoaXMub3B0aW9ucy5rZXlCaW5kaW5nc1tpXSA9PSAnc3RyaW5nJyApIHtcblx0XHRcdFx0XHR0aGlzLm9wdGlvbnMua2V5QmluZGluZ3NbaV0gPSB0aGlzLm9wdGlvbnMua2V5QmluZGluZ3NbaV0udG9VcHBlckNhc2UoKS5jaGFyQ29kZUF0KDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMub3B0aW9ucy5rZXlCaW5kaW5ncyA9IHt9O1xuXHRcdH1cblxuXHRcdGZvciAoIGkgaW4ga2V5cyApIHtcblx0XHRcdHRoaXMub3B0aW9ucy5rZXlCaW5kaW5nc1tpXSA9IHRoaXMub3B0aW9ucy5rZXlCaW5kaW5nc1tpXSB8fCBrZXlzW2ldO1xuXHRcdH1cblxuXHRcdHV0aWxzLmFkZEV2ZW50KHdpbmRvdywgJ2tleWRvd24nLCB0aGlzKTtcblxuXHRcdHRoaXMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHR1dGlscy5yZW1vdmVFdmVudCh3aW5kb3csICdrZXlkb3duJywgdGhpcyk7XG5cdFx0fSk7XG5cdH0sXG5cblx0X2tleTogZnVuY3Rpb24gKGUpIHtcblx0XHRpZiAoICF0aGlzLmVuYWJsZWQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIHNuYXAgPSB0aGlzLm9wdGlvbnMuc25hcCxcdC8vIHdlIGFyZSB1c2luZyB0aGlzIGFsb3QsIGJldHRlciB0byBjYWNoZSBpdFxuXHRcdFx0bmV3WCA9IHNuYXAgPyB0aGlzLmN1cnJlbnRQYWdlLnBhZ2VYIDogdGhpcy54LFxuXHRcdFx0bmV3WSA9IHNuYXAgPyB0aGlzLmN1cnJlbnRQYWdlLnBhZ2VZIDogdGhpcy55LFxuXHRcdFx0bm93ID0gdXRpbHMuZ2V0VGltZSgpLFxuXHRcdFx0cHJldlRpbWUgPSB0aGlzLmtleVRpbWUgfHwgMCxcblx0XHRcdGFjY2VsZXJhdGlvbiA9IDAuMjUwLFxuXHRcdFx0cG9zO1xuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMudXNlVHJhbnNpdGlvbiAmJiB0aGlzLmlzSW5UcmFuc2l0aW9uICkge1xuXHRcdFx0cG9zID0gdGhpcy5nZXRDb21wdXRlZFBvc2l0aW9uKCk7XG5cblx0XHRcdHRoaXMuX3RyYW5zbGF0ZShNYXRoLnJvdW5kKHBvcy54KSwgTWF0aC5yb3VuZChwb3MueSkpO1xuXHRcdFx0dGhpcy5pc0luVHJhbnNpdGlvbiA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdHRoaXMua2V5QWNjZWxlcmF0aW9uID0gbm93IC0gcHJldlRpbWUgPCAyMDAgPyBNYXRoLm1pbih0aGlzLmtleUFjY2VsZXJhdGlvbiArIGFjY2VsZXJhdGlvbiwgNTApIDogMDtcblxuXHRcdHN3aXRjaCAoIGUua2V5Q29kZSApIHtcblx0XHRcdGNhc2UgdGhpcy5vcHRpb25zLmtleUJpbmRpbmdzLnBhZ2VVcDpcblx0XHRcdFx0aWYgKCB0aGlzLmhhc0hvcml6b250YWxTY3JvbGwgJiYgIXRoaXMuaGFzVmVydGljYWxTY3JvbGwgKSB7XG5cdFx0XHRcdFx0bmV3WCArPSBzbmFwID8gMSA6IHRoaXMud3JhcHBlcldpZHRoO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG5ld1kgKz0gc25hcCA/IDEgOiB0aGlzLndyYXBwZXJIZWlnaHQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIHRoaXMub3B0aW9ucy5rZXlCaW5kaW5ncy5wYWdlRG93bjpcblx0XHRcdFx0aWYgKCB0aGlzLmhhc0hvcml6b250YWxTY3JvbGwgJiYgIXRoaXMuaGFzVmVydGljYWxTY3JvbGwgKSB7XG5cdFx0XHRcdFx0bmV3WCAtPSBzbmFwID8gMSA6IHRoaXMud3JhcHBlcldpZHRoO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG5ld1kgLT0gc25hcCA/IDEgOiB0aGlzLndyYXBwZXJIZWlnaHQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIHRoaXMub3B0aW9ucy5rZXlCaW5kaW5ncy5lbmQ6XG5cdFx0XHRcdG5ld1ggPSBzbmFwID8gdGhpcy5wYWdlcy5sZW5ndGgtMSA6IHRoaXMubWF4U2Nyb2xsWDtcblx0XHRcdFx0bmV3WSA9IHNuYXAgPyB0aGlzLnBhZ2VzWzBdLmxlbmd0aC0xIDogdGhpcy5tYXhTY3JvbGxZO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgdGhpcy5vcHRpb25zLmtleUJpbmRpbmdzLmhvbWU6XG5cdFx0XHRcdG5ld1ggPSAwO1xuXHRcdFx0XHRuZXdZID0gMDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIHRoaXMub3B0aW9ucy5rZXlCaW5kaW5ncy5sZWZ0OlxuXHRcdFx0XHRuZXdYICs9IHNuYXAgPyAtMSA6IDUgKyB0aGlzLmtleUFjY2VsZXJhdGlvbj4+MDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIHRoaXMub3B0aW9ucy5rZXlCaW5kaW5ncy51cDpcblx0XHRcdFx0bmV3WSArPSBzbmFwID8gMSA6IDUgKyB0aGlzLmtleUFjY2VsZXJhdGlvbj4+MDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIHRoaXMub3B0aW9ucy5rZXlCaW5kaW5ncy5yaWdodDpcblx0XHRcdFx0bmV3WCAtPSBzbmFwID8gLTEgOiA1ICsgdGhpcy5rZXlBY2NlbGVyYXRpb24+PjA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSB0aGlzLm9wdGlvbnMua2V5QmluZGluZ3MuZG93bjpcblx0XHRcdFx0bmV3WSAtPSBzbmFwID8gMSA6IDUgKyB0aGlzLmtleUFjY2VsZXJhdGlvbj4+MDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCBzbmFwICkge1xuXHRcdFx0dGhpcy5nb1RvUGFnZShuZXdYLCBuZXdZKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIG5ld1ggPiAwICkge1xuXHRcdFx0bmV3WCA9IDA7XG5cdFx0XHR0aGlzLmtleUFjY2VsZXJhdGlvbiA9IDA7XG5cdFx0fSBlbHNlIGlmICggbmV3WCA8IHRoaXMubWF4U2Nyb2xsWCApIHtcblx0XHRcdG5ld1ggPSB0aGlzLm1heFNjcm9sbFg7XG5cdFx0XHR0aGlzLmtleUFjY2VsZXJhdGlvbiA9IDA7XG5cdFx0fVxuXG5cdFx0aWYgKCBuZXdZID4gMCApIHtcblx0XHRcdG5ld1kgPSAwO1xuXHRcdFx0dGhpcy5rZXlBY2NlbGVyYXRpb24gPSAwO1xuXHRcdH0gZWxzZSBpZiAoIG5ld1kgPCB0aGlzLm1heFNjcm9sbFkgKSB7XG5cdFx0XHRuZXdZID0gdGhpcy5tYXhTY3JvbGxZO1xuXHRcdFx0dGhpcy5rZXlBY2NlbGVyYXRpb24gPSAwO1xuXHRcdH1cblxuXHRcdHRoaXMuc2Nyb2xsVG8obmV3WCwgbmV3WSwgMCk7XG5cblx0XHR0aGlzLmtleVRpbWUgPSBub3c7XG5cdH0sXG5cblx0X2FuaW1hdGU6IGZ1bmN0aW9uIChkZXN0WCwgZGVzdFksIGR1cmF0aW9uLCBlYXNpbmdGbikge1xuXHRcdHZhciB0aGF0ID0gdGhpcyxcblx0XHRcdHN0YXJ0WCA9IHRoaXMueCxcblx0XHRcdHN0YXJ0WSA9IHRoaXMueSxcblx0XHRcdHN0YXJ0VGltZSA9IHV0aWxzLmdldFRpbWUoKSxcblx0XHRcdGRlc3RUaW1lID0gc3RhcnRUaW1lICsgZHVyYXRpb247XG5cblx0XHRmdW5jdGlvbiBzdGVwICgpIHtcblx0XHRcdHZhciBub3cgPSB1dGlscy5nZXRUaW1lKCksXG5cdFx0XHRcdG5ld1gsIG5ld1ksXG5cdFx0XHRcdGVhc2luZztcblxuXHRcdFx0aWYgKCBub3cgPj0gZGVzdFRpbWUgKSB7XG5cdFx0XHRcdHRoYXQuaXNBbmltYXRpbmcgPSBmYWxzZTtcblx0XHRcdFx0dGhhdC5fdHJhbnNsYXRlKGRlc3RYLCBkZXN0WSk7XG5cblx0XHRcdFx0aWYgKCAhdGhhdC5yZXNldFBvc2l0aW9uKHRoYXQub3B0aW9ucy5ib3VuY2VUaW1lKSApIHtcblx0XHRcdFx0XHR0aGF0Ll9leGVjRXZlbnQoJ3Njcm9sbEVuZCcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRub3cgPSAoIG5vdyAtIHN0YXJ0VGltZSApIC8gZHVyYXRpb247XG5cdFx0XHRlYXNpbmcgPSBlYXNpbmdGbihub3cpO1xuXHRcdFx0bmV3WCA9ICggZGVzdFggLSBzdGFydFggKSAqIGVhc2luZyArIHN0YXJ0WDtcblx0XHRcdG5ld1kgPSAoIGRlc3RZIC0gc3RhcnRZICkgKiBlYXNpbmcgKyBzdGFydFk7XG5cdFx0XHR0aGF0Ll90cmFuc2xhdGUobmV3WCwgbmV3WSk7XG5cblx0XHRcdGlmICggdGhhdC5pc0FuaW1hdGluZyApIHtcblx0XHRcdFx0ckFGKHN0ZXApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuaXNBbmltYXRpbmcgPSB0cnVlO1xuXHRcdHN0ZXAoKTtcblx0fSxcblx0aGFuZGxlRXZlbnQ6IGZ1bmN0aW9uIChlKSB7XG5cdFx0c3dpdGNoICggZS50eXBlICkge1xuXHRcdFx0Y2FzZSAndG91Y2hzdGFydCc6XG5cdFx0XHRjYXNlICdNU1BvaW50ZXJEb3duJzpcblx0XHRcdGNhc2UgJ21vdXNlZG93bic6XG5cdFx0XHRcdHRoaXMuX3N0YXJ0KGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ3RvdWNobW92ZSc6XG5cdFx0XHRjYXNlICdNU1BvaW50ZXJNb3ZlJzpcblx0XHRcdGNhc2UgJ21vdXNlbW92ZSc6XG5cdFx0XHRcdHRoaXMuX21vdmUoZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAndG91Y2hlbmQnOlxuXHRcdFx0Y2FzZSAnTVNQb2ludGVyVXAnOlxuXHRcdFx0Y2FzZSAnbW91c2V1cCc6XG5cdFx0XHRjYXNlICd0b3VjaGNhbmNlbCc6XG5cdFx0XHRjYXNlICdNU1BvaW50ZXJDYW5jZWwnOlxuXHRcdFx0Y2FzZSAnbW91c2VjYW5jZWwnOlxuXHRcdFx0XHR0aGlzLl9lbmQoZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnb3JpZW50YXRpb25jaGFuZ2UnOlxuXHRcdFx0Y2FzZSAncmVzaXplJzpcblx0XHRcdFx0dGhpcy5fcmVzaXplKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAndHJhbnNpdGlvbmVuZCc6XG5cdFx0XHRjYXNlICd3ZWJraXRUcmFuc2l0aW9uRW5kJzpcblx0XHRcdGNhc2UgJ29UcmFuc2l0aW9uRW5kJzpcblx0XHRcdGNhc2UgJ01TVHJhbnNpdGlvbkVuZCc6XG5cdFx0XHRcdHRoaXMuX3RyYW5zaXRpb25FbmQoZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnd2hlZWwnOlxuXHRcdFx0Y2FzZSAnRE9NTW91c2VTY3JvbGwnOlxuXHRcdFx0Y2FzZSAnbW91c2V3aGVlbCc6XG5cdFx0XHRcdHRoaXMuX3doZWVsKGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2tleWRvd24nOlxuXHRcdFx0XHR0aGlzLl9rZXkoZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnY2xpY2snOlxuXHRcdFx0XHRpZiAoICFlLl9jb25zdHJ1Y3RlZCApIHtcblx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn07XG5mdW5jdGlvbiBjcmVhdGVEZWZhdWx0U2Nyb2xsYmFyIChkaXJlY3Rpb24sIGludGVyYWN0aXZlLCB0eXBlKSB7XG5cdHZhciBzY3JvbGxiYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcblx0XHRpbmRpY2F0b3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuXHRpZiAoIHR5cGUgPT09IHRydWUgKSB7XG5cdFx0c2Nyb2xsYmFyLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246YWJzb2x1dGU7ei1pbmRleDo5OTk5Jztcblx0XHRpbmRpY2F0b3Iuc3R5bGUuY3NzVGV4dCA9ICctd2Via2l0LWJveC1zaXppbmc6Ym9yZGVyLWJveDstbW96LWJveC1zaXppbmc6Ym9yZGVyLWJveDtib3gtc2l6aW5nOmJvcmRlci1ib3g7cG9zaXRpb246YWJzb2x1dGU7YmFja2dyb3VuZDpyZ2JhKDAsMCwwLDAuNSk7Ym9yZGVyOjFweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LDAuOSk7Ym9yZGVyLXJhZGl1czozcHgnO1xuXHR9XG5cblx0aW5kaWNhdG9yLmNsYXNzTmFtZSA9ICdpU2Nyb2xsSW5kaWNhdG9yJztcblxuXHRpZiAoIGRpcmVjdGlvbiA9PSAnaCcgKSB7XG5cdFx0aWYgKCB0eXBlID09PSB0cnVlICkge1xuXHRcdFx0c2Nyb2xsYmFyLnN0eWxlLmNzc1RleHQgKz0gJztoZWlnaHQ6N3B4O2xlZnQ6MnB4O3JpZ2h0OjJweDtib3R0b206MCc7XG5cdFx0XHRpbmRpY2F0b3Iuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xuXHRcdH1cblx0XHRzY3JvbGxiYXIuY2xhc3NOYW1lID0gJ2lTY3JvbGxIb3Jpem9udGFsU2Nyb2xsYmFyJztcblx0fSBlbHNlIHtcblx0XHRpZiAoIHR5cGUgPT09IHRydWUgKSB7XG5cdFx0XHRzY3JvbGxiYXIuc3R5bGUuY3NzVGV4dCArPSAnO3dpZHRoOjdweDtib3R0b206MnB4O3RvcDoycHg7cmlnaHQ6MXB4Jztcblx0XHRcdGluZGljYXRvci5zdHlsZS53aWR0aCA9ICcxMDAlJztcblx0XHR9XG5cdFx0c2Nyb2xsYmFyLmNsYXNzTmFtZSA9ICdpU2Nyb2xsVmVydGljYWxTY3JvbGxiYXInO1xuXHR9XG5cblx0c2Nyb2xsYmFyLnN0eWxlLmNzc1RleHQgKz0gJztvdmVyZmxvdzpoaWRkZW4nO1xuXG5cdGlmICggIWludGVyYWN0aXZlICkge1xuXHRcdHNjcm9sbGJhci5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuXHR9XG5cblx0c2Nyb2xsYmFyLmFwcGVuZENoaWxkKGluZGljYXRvcik7XG5cblx0cmV0dXJuIHNjcm9sbGJhcjtcbn1cblxuZnVuY3Rpb24gSW5kaWNhdG9yIChzY3JvbGxlciwgb3B0aW9ucykge1xuXHR0aGlzLndyYXBwZXIgPSB0eXBlb2Ygb3B0aW9ucy5lbCA9PSAnc3RyaW5nJyA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iob3B0aW9ucy5lbCkgOiBvcHRpb25zLmVsO1xuXHR0aGlzLndyYXBwZXJTdHlsZSA9IHRoaXMud3JhcHBlci5zdHlsZTtcblx0dGhpcy5pbmRpY2F0b3IgPSB0aGlzLndyYXBwZXIuY2hpbGRyZW5bMF07XG5cdHRoaXMuaW5kaWNhdG9yU3R5bGUgPSB0aGlzLmluZGljYXRvci5zdHlsZTtcblx0dGhpcy5zY3JvbGxlciA9IHNjcm9sbGVyO1xuXG5cdHRoaXMub3B0aW9ucyA9IHtcblx0XHRsaXN0ZW5YOiB0cnVlLFxuXHRcdGxpc3Rlblk6IHRydWUsXG5cdFx0aW50ZXJhY3RpdmU6IGZhbHNlLFxuXHRcdHJlc2l6ZTogdHJ1ZSxcblx0XHRkZWZhdWx0U2Nyb2xsYmFyczogZmFsc2UsXG5cdFx0c2hyaW5rOiBmYWxzZSxcblx0XHRmYWRlOiBmYWxzZSxcblx0XHRzcGVlZFJhdGlvWDogMCxcblx0XHRzcGVlZFJhdGlvWTogMFxuXHR9O1xuXG5cdGZvciAoIHZhciBpIGluIG9wdGlvbnMgKSB7XG5cdFx0dGhpcy5vcHRpb25zW2ldID0gb3B0aW9uc1tpXTtcblx0fVxuXG5cdHRoaXMuc2l6ZVJhdGlvWCA9IDE7XG5cdHRoaXMuc2l6ZVJhdGlvWSA9IDE7XG5cdHRoaXMubWF4UG9zWCA9IDA7XG5cdHRoaXMubWF4UG9zWSA9IDA7XG5cblx0aWYgKCB0aGlzLm9wdGlvbnMuaW50ZXJhY3RpdmUgKSB7XG5cdFx0aWYgKCAhdGhpcy5vcHRpb25zLmRpc2FibGVUb3VjaCApIHtcblx0XHRcdHV0aWxzLmFkZEV2ZW50KHRoaXMuaW5kaWNhdG9yLCAndG91Y2hzdGFydCcsIHRoaXMpO1xuXHRcdFx0dXRpbHMuYWRkRXZlbnQod2luZG93LCAndG91Y2hlbmQnLCB0aGlzKTtcblx0XHR9XG5cdFx0aWYgKCAhdGhpcy5vcHRpb25zLmRpc2FibGVQb2ludGVyICkge1xuXHRcdFx0dXRpbHMuYWRkRXZlbnQodGhpcy5pbmRpY2F0b3IsICdNU1BvaW50ZXJEb3duJywgdGhpcyk7XG5cdFx0XHR1dGlscy5hZGRFdmVudCh3aW5kb3csICdNU1BvaW50ZXJVcCcsIHRoaXMpO1xuXHRcdH1cblx0XHRpZiAoICF0aGlzLm9wdGlvbnMuZGlzYWJsZU1vdXNlICkge1xuXHRcdFx0dXRpbHMuYWRkRXZlbnQodGhpcy5pbmRpY2F0b3IsICdtb3VzZWRvd24nLCB0aGlzKTtcblx0XHRcdHV0aWxzLmFkZEV2ZW50KHdpbmRvdywgJ21vdXNldXAnLCB0aGlzKTtcblx0XHR9XG5cdH1cblxuXHRpZiAoIHRoaXMub3B0aW9ucy5mYWRlICkge1xuXHRcdHRoaXMud3JhcHBlclN0eWxlW3V0aWxzLnN0eWxlLnRyYW5zZm9ybV0gPSB0aGlzLnNjcm9sbGVyLnRyYW5zbGF0ZVo7XG5cdFx0dGhpcy53cmFwcGVyU3R5bGVbdXRpbHMuc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uXSA9IHV0aWxzLmlzQmFkQW5kcm9pZCA/ICcwLjAwMXMnIDogJzBtcyc7XG5cdFx0dGhpcy53cmFwcGVyU3R5bGUub3BhY2l0eSA9ICcwJztcblx0fVxufVxuXG5JbmRpY2F0b3IucHJvdG90eXBlID0ge1xuXHRoYW5kbGVFdmVudDogZnVuY3Rpb24gKGUpIHtcblx0XHRzd2l0Y2ggKCBlLnR5cGUgKSB7XG5cdFx0XHRjYXNlICd0b3VjaHN0YXJ0Jzpcblx0XHRcdGNhc2UgJ01TUG9pbnRlckRvd24nOlxuXHRcdFx0Y2FzZSAnbW91c2Vkb3duJzpcblx0XHRcdFx0dGhpcy5fc3RhcnQoZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAndG91Y2htb3ZlJzpcblx0XHRcdGNhc2UgJ01TUG9pbnRlck1vdmUnOlxuXHRcdFx0Y2FzZSAnbW91c2Vtb3ZlJzpcblx0XHRcdFx0dGhpcy5fbW92ZShlKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICd0b3VjaGVuZCc6XG5cdFx0XHRjYXNlICdNU1BvaW50ZXJVcCc6XG5cdFx0XHRjYXNlICdtb3VzZXVwJzpcblx0XHRcdGNhc2UgJ3RvdWNoY2FuY2VsJzpcblx0XHRcdGNhc2UgJ01TUG9pbnRlckNhbmNlbCc6XG5cdFx0XHRjYXNlICdtb3VzZWNhbmNlbCc6XG5cdFx0XHRcdHRoaXMuX2VuZChlKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9LFxuXG5cdGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAoIHRoaXMub3B0aW9ucy5pbnRlcmFjdGl2ZSApIHtcblx0XHRcdHV0aWxzLnJlbW92ZUV2ZW50KHRoaXMuaW5kaWNhdG9yLCAndG91Y2hzdGFydCcsIHRoaXMpO1xuXHRcdFx0dXRpbHMucmVtb3ZlRXZlbnQodGhpcy5pbmRpY2F0b3IsICdNU1BvaW50ZXJEb3duJywgdGhpcyk7XG5cdFx0XHR1dGlscy5yZW1vdmVFdmVudCh0aGlzLmluZGljYXRvciwgJ21vdXNlZG93bicsIHRoaXMpO1xuXG5cdFx0XHR1dGlscy5yZW1vdmVFdmVudCh3aW5kb3csICd0b3VjaG1vdmUnLCB0aGlzKTtcblx0XHRcdHV0aWxzLnJlbW92ZUV2ZW50KHdpbmRvdywgJ01TUG9pbnRlck1vdmUnLCB0aGlzKTtcblx0XHRcdHV0aWxzLnJlbW92ZUV2ZW50KHdpbmRvdywgJ21vdXNlbW92ZScsIHRoaXMpO1xuXG5cdFx0XHR1dGlscy5yZW1vdmVFdmVudCh3aW5kb3csICd0b3VjaGVuZCcsIHRoaXMpO1xuXHRcdFx0dXRpbHMucmVtb3ZlRXZlbnQod2luZG93LCAnTVNQb2ludGVyVXAnLCB0aGlzKTtcblx0XHRcdHV0aWxzLnJlbW92ZUV2ZW50KHdpbmRvdywgJ21vdXNldXAnLCB0aGlzKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5kZWZhdWx0U2Nyb2xsYmFycyApIHtcblx0XHRcdHRoaXMud3JhcHBlci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMud3JhcHBlcik7XG5cdFx0fVxuXHR9LFxuXG5cdF9zdGFydDogZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgcG9pbnQgPSBlLnRvdWNoZXMgPyBlLnRvdWNoZXNbMF0gOiBlO1xuXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR0aGlzLnRyYW5zaXRpb25UaW1lKCk7XG5cblx0XHR0aGlzLmluaXRpYXRlZCA9IHRydWU7XG5cdFx0dGhpcy5tb3ZlZCA9IGZhbHNlO1xuXHRcdHRoaXMubGFzdFBvaW50WFx0PSBwb2ludC5wYWdlWDtcblx0XHR0aGlzLmxhc3RQb2ludFlcdD0gcG9pbnQucGFnZVk7XG5cblx0XHR0aGlzLnN0YXJ0VGltZVx0PSB1dGlscy5nZXRUaW1lKCk7XG5cblx0XHRpZiAoICF0aGlzLm9wdGlvbnMuZGlzYWJsZVRvdWNoICkge1xuXHRcdFx0dXRpbHMuYWRkRXZlbnQod2luZG93LCAndG91Y2htb3ZlJywgdGhpcyk7XG5cdFx0fVxuXHRcdGlmICggIXRoaXMub3B0aW9ucy5kaXNhYmxlUG9pbnRlciApIHtcblx0XHRcdHV0aWxzLmFkZEV2ZW50KHdpbmRvdywgJ01TUG9pbnRlck1vdmUnLCB0aGlzKTtcblx0XHR9XG5cdFx0aWYgKCAhdGhpcy5vcHRpb25zLmRpc2FibGVNb3VzZSApIHtcblx0XHRcdHV0aWxzLmFkZEV2ZW50KHdpbmRvdywgJ21vdXNlbW92ZScsIHRoaXMpO1xuXHRcdH1cblxuXHRcdHRoaXMuc2Nyb2xsZXIuX2V4ZWNFdmVudCgnYmVmb3JlU2Nyb2xsU3RhcnQnKTtcblx0fSxcblxuXHRfbW92ZTogZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgcG9pbnQgPSBlLnRvdWNoZXMgPyBlLnRvdWNoZXNbMF0gOiBlLFxuXHRcdFx0ZGVsdGFYLCBkZWx0YVksXG5cdFx0XHRuZXdYLCBuZXdZLFxuXHRcdFx0dGltZXN0YW1wID0gdXRpbHMuZ2V0VGltZSgpO1xuXG5cdFx0aWYgKCAhdGhpcy5tb3ZlZCApIHtcblx0XHRcdHRoaXMuc2Nyb2xsZXIuX2V4ZWNFdmVudCgnc2Nyb2xsU3RhcnQnKTtcblx0XHR9XG5cblx0XHR0aGlzLm1vdmVkID0gdHJ1ZTtcblxuXHRcdGRlbHRhWCA9IHBvaW50LnBhZ2VYIC0gdGhpcy5sYXN0UG9pbnRYO1xuXHRcdHRoaXMubGFzdFBvaW50WCA9IHBvaW50LnBhZ2VYO1xuXG5cdFx0ZGVsdGFZID0gcG9pbnQucGFnZVkgLSB0aGlzLmxhc3RQb2ludFk7XG5cdFx0dGhpcy5sYXN0UG9pbnRZID0gcG9pbnQucGFnZVk7XG5cblx0XHRuZXdYID0gdGhpcy54ICsgZGVsdGFYO1xuXHRcdG5ld1kgPSB0aGlzLnkgKyBkZWx0YVk7XG5cblx0XHR0aGlzLl9wb3MobmV3WCwgbmV3WSk7XG5cbi8vIElOU0VSVCBQT0lOVDogaW5kaWNhdG9yLl9tb3ZlXG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0fSxcblxuXHRfZW5kOiBmdW5jdGlvbiAoZSkge1xuXHRcdGlmICggIXRoaXMuaW5pdGlhdGVkICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuaW5pdGlhdGVkID0gZmFsc2U7XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHV0aWxzLnJlbW92ZUV2ZW50KHdpbmRvdywgJ3RvdWNobW92ZScsIHRoaXMpO1xuXHRcdHV0aWxzLnJlbW92ZUV2ZW50KHdpbmRvdywgJ01TUG9pbnRlck1vdmUnLCB0aGlzKTtcblx0XHR1dGlscy5yZW1vdmVFdmVudCh3aW5kb3csICdtb3VzZW1vdmUnLCB0aGlzKTtcblxuXHRcdGlmICggdGhpcy5zY3JvbGxlci5vcHRpb25zLnNuYXAgKSB7XG5cdFx0XHR2YXIgc25hcCA9IHRoaXMuc2Nyb2xsZXIuX25lYXJlc3RTbmFwKHRoaXMuc2Nyb2xsZXIueCwgdGhpcy5zY3JvbGxlci55KTtcblxuXHRcdFx0dmFyIHRpbWUgPSB0aGlzLm9wdGlvbnMuc25hcFNwZWVkIHx8IE1hdGgubWF4KFxuXHRcdFx0XHRcdE1hdGgubWF4KFxuXHRcdFx0XHRcdFx0TWF0aC5taW4oTWF0aC5hYnModGhpcy5zY3JvbGxlci54IC0gc25hcC54KSwgMTAwMCksXG5cdFx0XHRcdFx0XHRNYXRoLm1pbihNYXRoLmFicyh0aGlzLnNjcm9sbGVyLnkgLSBzbmFwLnkpLCAxMDAwKVxuXHRcdFx0XHRcdCksIDMwMCk7XG5cblx0XHRcdGlmICggdGhpcy5zY3JvbGxlci54ICE9IHNuYXAueCB8fCB0aGlzLnNjcm9sbGVyLnkgIT0gc25hcC55ICkge1xuXHRcdFx0XHR0aGlzLnNjcm9sbGVyLmRpcmVjdGlvblggPSAwO1xuXHRcdFx0XHR0aGlzLnNjcm9sbGVyLmRpcmVjdGlvblkgPSAwO1xuXHRcdFx0XHR0aGlzLnNjcm9sbGVyLmN1cnJlbnRQYWdlID0gc25hcDtcblx0XHRcdFx0dGhpcy5zY3JvbGxlci5zY3JvbGxUbyhzbmFwLngsIHNuYXAueSwgdGltZSwgdGhpcy5zY3JvbGxlci5vcHRpb25zLmJvdW5jZUVhc2luZyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLm1vdmVkICkge1xuXHRcdFx0dGhpcy5zY3JvbGxlci5fZXhlY0V2ZW50KCdzY3JvbGxFbmQnKTtcblx0XHR9XG5cdH0sXG5cblx0dHJhbnNpdGlvblRpbWU6IGZ1bmN0aW9uICh0aW1lKSB7XG5cdFx0dGltZSA9IHRpbWUgfHwgMDtcblx0XHR0aGlzLmluZGljYXRvclN0eWxlW3V0aWxzLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbl0gPSB0aW1lICsgJ21zJztcblxuXHRcdGlmICggIXRpbWUgJiYgdXRpbHMuaXNCYWRBbmRyb2lkICkge1xuXHRcdFx0dGhpcy5pbmRpY2F0b3JTdHlsZVt1dGlscy5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb25dID0gJzAuMDAxcyc7XG5cdFx0fVxuXHR9LFxuXG5cdHRyYW5zaXRpb25UaW1pbmdGdW5jdGlvbjogZnVuY3Rpb24gKGVhc2luZykge1xuXHRcdHRoaXMuaW5kaWNhdG9yU3R5bGVbdXRpbHMuc3R5bGUudHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uXSA9IGVhc2luZztcblx0fSxcblxuXHRyZWZyZXNoOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy50cmFuc2l0aW9uVGltZSgpO1xuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMubGlzdGVuWCAmJiAhdGhpcy5vcHRpb25zLmxpc3RlblkgKSB7XG5cdFx0XHR0aGlzLmluZGljYXRvclN0eWxlLmRpc3BsYXkgPSB0aGlzLnNjcm9sbGVyLmhhc0hvcml6b250YWxTY3JvbGwgPyAnYmxvY2snIDogJ25vbmUnO1xuXHRcdH0gZWxzZSBpZiAoIHRoaXMub3B0aW9ucy5saXN0ZW5ZICYmICF0aGlzLm9wdGlvbnMubGlzdGVuWCApIHtcblx0XHRcdHRoaXMuaW5kaWNhdG9yU3R5bGUuZGlzcGxheSA9IHRoaXMuc2Nyb2xsZXIuaGFzVmVydGljYWxTY3JvbGwgPyAnYmxvY2snIDogJ25vbmUnO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmluZGljYXRvclN0eWxlLmRpc3BsYXkgPSB0aGlzLnNjcm9sbGVyLmhhc0hvcml6b250YWxTY3JvbGwgfHwgdGhpcy5zY3JvbGxlci5oYXNWZXJ0aWNhbFNjcm9sbCA/ICdibG9jaycgOiAnbm9uZSc7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLnNjcm9sbGVyLmhhc0hvcml6b250YWxTY3JvbGwgJiYgdGhpcy5zY3JvbGxlci5oYXNWZXJ0aWNhbFNjcm9sbCApIHtcblx0XHRcdHV0aWxzLmFkZENsYXNzKHRoaXMud3JhcHBlciwgJ2lTY3JvbGxCb3RoU2Nyb2xsYmFycycpO1xuXHRcdFx0dXRpbHMucmVtb3ZlQ2xhc3ModGhpcy53cmFwcGVyLCAnaVNjcm9sbExvbmVTY3JvbGxiYXInKTtcblxuXHRcdFx0aWYgKCB0aGlzLm9wdGlvbnMuZGVmYXVsdFNjcm9sbGJhcnMgJiYgdGhpcy5vcHRpb25zLmN1c3RvbVN0eWxlICkge1xuXHRcdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5saXN0ZW5YICkge1xuXHRcdFx0XHRcdHRoaXMud3JhcHBlci5zdHlsZS5yaWdodCA9ICc4cHgnO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMud3JhcHBlci5zdHlsZS5ib3R0b20gPSAnOHB4Jztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR1dGlscy5yZW1vdmVDbGFzcyh0aGlzLndyYXBwZXIsICdpU2Nyb2xsQm90aFNjcm9sbGJhcnMnKTtcblx0XHRcdHV0aWxzLmFkZENsYXNzKHRoaXMud3JhcHBlciwgJ2lTY3JvbGxMb25lU2Nyb2xsYmFyJyk7XG5cblx0XHRcdGlmICggdGhpcy5vcHRpb25zLmRlZmF1bHRTY3JvbGxiYXJzICYmIHRoaXMub3B0aW9ucy5jdXN0b21TdHlsZSApIHtcblx0XHRcdFx0aWYgKCB0aGlzLm9wdGlvbnMubGlzdGVuWCApIHtcblx0XHRcdFx0XHR0aGlzLndyYXBwZXIuc3R5bGUucmlnaHQgPSAnMnB4Jztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLndyYXBwZXIuc3R5bGUuYm90dG9tID0gJzJweCc7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgciA9IHRoaXMud3JhcHBlci5vZmZzZXRIZWlnaHQ7XHQvLyBmb3JjZSByZWZyZXNoXG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5saXN0ZW5YICkge1xuXHRcdFx0dGhpcy53cmFwcGVyV2lkdGggPSB0aGlzLndyYXBwZXIuY2xpZW50V2lkdGg7XG5cdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5yZXNpemUgKSB7XG5cdFx0XHRcdHRoaXMuaW5kaWNhdG9yV2lkdGggPSBNYXRoLm1heChNYXRoLnJvdW5kKHRoaXMud3JhcHBlcldpZHRoICogdGhpcy53cmFwcGVyV2lkdGggLyAodGhpcy5zY3JvbGxlci5zY3JvbGxlcldpZHRoIHx8IHRoaXMud3JhcHBlcldpZHRoIHx8IDEpKSwgOCk7XG5cdFx0XHRcdHRoaXMuaW5kaWNhdG9yU3R5bGUud2lkdGggPSB0aGlzLmluZGljYXRvcldpZHRoICsgJ3B4Jztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuaW5kaWNhdG9yV2lkdGggPSB0aGlzLmluZGljYXRvci5jbGllbnRXaWR0aDtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5tYXhQb3NYID0gdGhpcy53cmFwcGVyV2lkdGggLSB0aGlzLmluZGljYXRvcldpZHRoO1xuXG5cdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5zaHJpbmsgPT0gJ2NsaXAnICkge1xuXHRcdFx0XHR0aGlzLm1pbkJvdW5kYXJ5WCA9IC10aGlzLmluZGljYXRvcldpZHRoICsgODtcblx0XHRcdFx0dGhpcy5tYXhCb3VuZGFyeVggPSB0aGlzLndyYXBwZXJXaWR0aCAtIDg7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm1pbkJvdW5kYXJ5WCA9IDA7XG5cdFx0XHRcdHRoaXMubWF4Qm91bmRhcnlYID0gdGhpcy5tYXhQb3NYO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNpemVSYXRpb1ggPSB0aGlzLm9wdGlvbnMuc3BlZWRSYXRpb1ggfHwgKHRoaXMuc2Nyb2xsZXIubWF4U2Nyb2xsWCAmJiAodGhpcy5tYXhQb3NYIC8gdGhpcy5zY3JvbGxlci5tYXhTY3JvbGxYKSk7XHRcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5saXN0ZW5ZICkge1xuXHRcdFx0dGhpcy53cmFwcGVySGVpZ2h0ID0gdGhpcy53cmFwcGVyLmNsaWVudEhlaWdodDtcblx0XHRcdGlmICggdGhpcy5vcHRpb25zLnJlc2l6ZSApIHtcblx0XHRcdFx0dGhpcy5pbmRpY2F0b3JIZWlnaHQgPSBNYXRoLm1heChNYXRoLnJvdW5kKHRoaXMud3JhcHBlckhlaWdodCAqIHRoaXMud3JhcHBlckhlaWdodCAvICh0aGlzLnNjcm9sbGVyLnNjcm9sbGVySGVpZ2h0IHx8IHRoaXMud3JhcHBlckhlaWdodCB8fCAxKSksIDgpO1xuXHRcdFx0XHR0aGlzLmluZGljYXRvclN0eWxlLmhlaWdodCA9IHRoaXMuaW5kaWNhdG9ySGVpZ2h0ICsgJ3B4Jztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuaW5kaWNhdG9ySGVpZ2h0ID0gdGhpcy5pbmRpY2F0b3IuY2xpZW50SGVpZ2h0O1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLm1heFBvc1kgPSB0aGlzLndyYXBwZXJIZWlnaHQgLSB0aGlzLmluZGljYXRvckhlaWdodDtcblxuXHRcdFx0aWYgKCB0aGlzLm9wdGlvbnMuc2hyaW5rID09ICdjbGlwJyApIHtcblx0XHRcdFx0dGhpcy5taW5Cb3VuZGFyeVkgPSAtdGhpcy5pbmRpY2F0b3JIZWlnaHQgKyA4O1xuXHRcdFx0XHR0aGlzLm1heEJvdW5kYXJ5WSA9IHRoaXMud3JhcHBlckhlaWdodCAtIDg7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm1pbkJvdW5kYXJ5WSA9IDA7XG5cdFx0XHRcdHRoaXMubWF4Qm91bmRhcnlZID0gdGhpcy5tYXhQb3NZO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLm1heFBvc1kgPSB0aGlzLndyYXBwZXJIZWlnaHQgLSB0aGlzLmluZGljYXRvckhlaWdodDtcblx0XHRcdHRoaXMuc2l6ZVJhdGlvWSA9IHRoaXMub3B0aW9ucy5zcGVlZFJhdGlvWSB8fCAodGhpcy5zY3JvbGxlci5tYXhTY3JvbGxZICYmICh0aGlzLm1heFBvc1kgLyB0aGlzLnNjcm9sbGVyLm1heFNjcm9sbFkpKTtcblx0XHR9XG5cblx0XHR0aGlzLnVwZGF0ZVBvc2l0aW9uKCk7XG5cdH0sXG5cblx0dXBkYXRlUG9zaXRpb246IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgeCA9IHRoaXMub3B0aW9ucy5saXN0ZW5YICYmIE1hdGgucm91bmQodGhpcy5zaXplUmF0aW9YICogdGhpcy5zY3JvbGxlci54KSB8fCAwLFxuXHRcdFx0eSA9IHRoaXMub3B0aW9ucy5saXN0ZW5ZICYmIE1hdGgucm91bmQodGhpcy5zaXplUmF0aW9ZICogdGhpcy5zY3JvbGxlci55KSB8fCAwO1xuXG5cdFx0aWYgKCAhdGhpcy5vcHRpb25zLmlnbm9yZUJvdW5kYXJpZXMgKSB7XG5cdFx0XHRpZiAoIHggPCB0aGlzLm1pbkJvdW5kYXJ5WCApIHtcblx0XHRcdFx0aWYgKCB0aGlzLm9wdGlvbnMuc2hyaW5rID09ICdzY2FsZScgKSB7XG5cdFx0XHRcdFx0dGhpcy53aWR0aCA9IE1hdGgubWF4KHRoaXMuaW5kaWNhdG9yV2lkdGggKyB4LCA4KTtcblx0XHRcdFx0XHR0aGlzLmluZGljYXRvclN0eWxlLndpZHRoID0gdGhpcy53aWR0aCArICdweCc7XG5cdFx0XHRcdH1cblx0XHRcdFx0eCA9IHRoaXMubWluQm91bmRhcnlYO1xuXHRcdFx0fSBlbHNlIGlmICggeCA+IHRoaXMubWF4Qm91bmRhcnlYICkge1xuXHRcdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5zaHJpbmsgPT0gJ3NjYWxlJyApIHtcblx0XHRcdFx0XHR0aGlzLndpZHRoID0gTWF0aC5tYXgodGhpcy5pbmRpY2F0b3JXaWR0aCAtICh4IC0gdGhpcy5tYXhQb3NYKSwgOCk7XG5cdFx0XHRcdFx0dGhpcy5pbmRpY2F0b3JTdHlsZS53aWR0aCA9IHRoaXMud2lkdGggKyAncHgnO1xuXHRcdFx0XHRcdHggPSB0aGlzLm1heFBvc1ggKyB0aGlzLmluZGljYXRvcldpZHRoIC0gdGhpcy53aWR0aDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR4ID0gdGhpcy5tYXhCb3VuZGFyeVg7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoIHRoaXMub3B0aW9ucy5zaHJpbmsgPT0gJ3NjYWxlJyAmJiB0aGlzLndpZHRoICE9IHRoaXMuaW5kaWNhdG9yV2lkdGggKSB7XG5cdFx0XHRcdHRoaXMud2lkdGggPSB0aGlzLmluZGljYXRvcldpZHRoO1xuXHRcdFx0XHR0aGlzLmluZGljYXRvclN0eWxlLndpZHRoID0gdGhpcy53aWR0aCArICdweCc7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggeSA8IHRoaXMubWluQm91bmRhcnlZICkge1xuXHRcdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5zaHJpbmsgPT0gJ3NjYWxlJyApIHtcblx0XHRcdFx0XHR0aGlzLmhlaWdodCA9IE1hdGgubWF4KHRoaXMuaW5kaWNhdG9ySGVpZ2h0ICsgeSAqIDMsIDgpO1xuXHRcdFx0XHRcdHRoaXMuaW5kaWNhdG9yU3R5bGUuaGVpZ2h0ID0gdGhpcy5oZWlnaHQgKyAncHgnO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHkgPSB0aGlzLm1pbkJvdW5kYXJ5WTtcblx0XHRcdH0gZWxzZSBpZiAoIHkgPiB0aGlzLm1heEJvdW5kYXJ5WSApIHtcblx0XHRcdFx0aWYgKCB0aGlzLm9wdGlvbnMuc2hyaW5rID09ICdzY2FsZScgKSB7XG5cdFx0XHRcdFx0dGhpcy5oZWlnaHQgPSBNYXRoLm1heCh0aGlzLmluZGljYXRvckhlaWdodCAtICh5IC0gdGhpcy5tYXhQb3NZKSAqIDMsIDgpO1xuXHRcdFx0XHRcdHRoaXMuaW5kaWNhdG9yU3R5bGUuaGVpZ2h0ID0gdGhpcy5oZWlnaHQgKyAncHgnO1xuXHRcdFx0XHRcdHkgPSB0aGlzLm1heFBvc1kgKyB0aGlzLmluZGljYXRvckhlaWdodCAtIHRoaXMuaGVpZ2h0O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHkgPSB0aGlzLm1heEJvdW5kYXJ5WTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmICggdGhpcy5vcHRpb25zLnNocmluayA9PSAnc2NhbGUnICYmIHRoaXMuaGVpZ2h0ICE9IHRoaXMuaW5kaWNhdG9ySGVpZ2h0ICkge1xuXHRcdFx0XHR0aGlzLmhlaWdodCA9IHRoaXMuaW5kaWNhdG9ySGVpZ2h0O1xuXHRcdFx0XHR0aGlzLmluZGljYXRvclN0eWxlLmhlaWdodCA9IHRoaXMuaGVpZ2h0ICsgJ3B4Jztcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnggPSB4O1xuXHRcdHRoaXMueSA9IHk7XG5cblx0XHRpZiAoIHRoaXMuc2Nyb2xsZXIub3B0aW9ucy51c2VUcmFuc2Zvcm0gKSB7XG5cdFx0XHR0aGlzLmluZGljYXRvclN0eWxlW3V0aWxzLnN0eWxlLnRyYW5zZm9ybV0gPSAndHJhbnNsYXRlKCcgKyB4ICsgJ3B4LCcgKyB5ICsgJ3B4KScgKyB0aGlzLnNjcm9sbGVyLnRyYW5zbGF0ZVo7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuaW5kaWNhdG9yU3R5bGUubGVmdCA9IHggKyAncHgnO1xuXHRcdFx0dGhpcy5pbmRpY2F0b3JTdHlsZS50b3AgPSB5ICsgJ3B4Jztcblx0XHR9XG5cdH0sXG5cblx0X3BvczogZnVuY3Rpb24gKHgsIHkpIHtcblx0XHRpZiAoIHggPCAwICkge1xuXHRcdFx0eCA9IDA7XG5cdFx0fSBlbHNlIGlmICggeCA+IHRoaXMubWF4UG9zWCApIHtcblx0XHRcdHggPSB0aGlzLm1heFBvc1g7XG5cdFx0fVxuXG5cdFx0aWYgKCB5IDwgMCApIHtcblx0XHRcdHkgPSAwO1xuXHRcdH0gZWxzZSBpZiAoIHkgPiB0aGlzLm1heFBvc1kgKSB7XG5cdFx0XHR5ID0gdGhpcy5tYXhQb3NZO1xuXHRcdH1cblxuXHRcdHggPSB0aGlzLm9wdGlvbnMubGlzdGVuWCA/IE1hdGgucm91bmQoeCAvIHRoaXMuc2l6ZVJhdGlvWCkgOiB0aGlzLnNjcm9sbGVyLng7XG5cdFx0eSA9IHRoaXMub3B0aW9ucy5saXN0ZW5ZID8gTWF0aC5yb3VuZCh5IC8gdGhpcy5zaXplUmF0aW9ZKSA6IHRoaXMuc2Nyb2xsZXIueTtcblxuXHRcdHRoaXMuc2Nyb2xsZXIuc2Nyb2xsVG8oeCwgeSk7XG5cdH0sXG5cblx0ZmFkZTogZnVuY3Rpb24gKHZhbCwgaG9sZCkge1xuXHRcdGlmICggaG9sZCAmJiAhdGhpcy52aXNpYmxlICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNsZWFyVGltZW91dCh0aGlzLmZhZGVUaW1lb3V0KTtcblx0XHR0aGlzLmZhZGVUaW1lb3V0ID0gbnVsbDtcblxuXHRcdHZhciB0aW1lID0gdmFsID8gMjUwIDogNTAwLFxuXHRcdFx0ZGVsYXkgPSB2YWwgPyAwIDogMzAwO1xuXG5cdFx0dmFsID0gdmFsID8gJzEnIDogJzAnO1xuXG5cdFx0dGhpcy53cmFwcGVyU3R5bGVbdXRpbHMuc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uXSA9IHRpbWUgKyAnbXMnO1xuXG5cdFx0dGhpcy5mYWRlVGltZW91dCA9IHNldFRpbWVvdXQoKGZ1bmN0aW9uICh2YWwpIHtcblx0XHRcdHRoaXMud3JhcHBlclN0eWxlLm9wYWNpdHkgPSB2YWw7XG5cdFx0XHR0aGlzLnZpc2libGUgPSArdmFsO1xuXHRcdH0pLmJpbmQodGhpcywgdmFsKSwgZGVsYXkpO1xuXHR9XG59O1xuXG5JU2Nyb2xsLnV0aWxzID0gdXRpbHM7XG5cbmlmICggdHlwZW9mIG1vZHVsZSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBJU2Nyb2xsO1xufSBlbHNlIHtcblx0d2luZG93LklTY3JvbGwgPSBJU2Nyb2xsO1xufVxuXG59KSh3aW5kb3csIGRvY3VtZW50LCBNYXRoKTsiLCJ2YXIgcHJvY2Vzcz1yZXF1aXJlKFwiX19icm93c2VyaWZ5X3Byb2Nlc3NcIik7Ly8gdmltOnRzPTQ6c3RzPTQ6c3c9NDpcbi8qIVxuICpcbiAqIENvcHlyaWdodCAyMDA5LTIwMTIgS3JpcyBLb3dhbCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIE1JVFxuICogbGljZW5zZSBmb3VuZCBhdCBodHRwOi8vZ2l0aHViLmNvbS9rcmlza293YWwvcS9yYXcvbWFzdGVyL0xJQ0VOU0VcbiAqXG4gKiBXaXRoIHBhcnRzIGJ5IFR5bGVyIENsb3NlXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDA5IFR5bGVyIENsb3NlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUIFggbGljZW5zZSBmb3VuZFxuICogYXQgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5odG1sXG4gKiBGb3JrZWQgYXQgcmVmX3NlbmQuanMgdmVyc2lvbjogMjAwOS0wNS0xMVxuICpcbiAqIFdpdGggcGFydHMgYnkgTWFyayBNaWxsZXJcbiAqIENvcHlyaWdodCAoQykgMjAxMSBHb29nbGUgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICpcbiAqL1xuXG4oZnVuY3Rpb24gKGRlZmluaXRpb24pIHtcbiAgICAvLyBUdXJuIG9mZiBzdHJpY3QgbW9kZSBmb3IgdGhpcyBmdW5jdGlvbiBzbyB3ZSBjYW4gYXNzaWduIHRvIGdsb2JhbC5RXG4gICAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi9cblxuICAgIC8vIFRoaXMgZmlsZSB3aWxsIGZ1bmN0aW9uIHByb3Blcmx5IGFzIGEgPHNjcmlwdD4gdGFnLCBvciBhIG1vZHVsZVxuICAgIC8vIHVzaW5nIENvbW1vbkpTIGFuZCBOb2RlSlMgb3IgUmVxdWlyZUpTIG1vZHVsZSBmb3JtYXRzLiAgSW5cbiAgICAvLyBDb21tb24vTm9kZS9SZXF1aXJlSlMsIHRoZSBtb2R1bGUgZXhwb3J0cyB0aGUgUSBBUEkgYW5kIHdoZW5cbiAgICAvLyBleGVjdXRlZCBhcyBhIHNpbXBsZSA8c2NyaXB0PiwgaXQgY3JlYXRlcyBhIFEgZ2xvYmFsIGluc3RlYWQuXG5cbiAgICAvLyBNb250YWdlIFJlcXVpcmVcbiAgICBpZiAodHlwZW9mIGJvb3RzdHJhcCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGJvb3RzdHJhcChcInByb21pc2VcIiwgZGVmaW5pdGlvbik7XG5cbiAgICAvLyBDb21tb25KU1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBkZWZpbml0aW9uKCk7XG5cbiAgICAvLyBSZXF1aXJlSlNcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShkZWZpbml0aW9uKTtcblxuICAgIC8vIFNFUyAoU2VjdXJlIEVjbWFTY3JpcHQpXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc2VzICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlmICghc2VzLm9rKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlcy5tYWtlUSA9IGRlZmluaXRpb247XG4gICAgICAgIH1cblxuICAgIC8vIDxzY3JpcHQ+XG4gICAgfSBlbHNlIHtcbiAgICAgICAgUSA9IGRlZmluaXRpb24oKTtcbiAgICB9XG5cbn0pKGZ1bmN0aW9uICgpIHtcblwidXNlIHN0cmljdFwiO1xuXG52YXIgaGFzU3RhY2tzID0gZmFsc2U7XG50cnkge1xuICAgIHRocm93IG5ldyBFcnJvcigpO1xufSBjYXRjaCAoZSkge1xuICAgIGhhc1N0YWNrcyA9ICEhZS5zdGFjaztcbn1cblxuLy8gQWxsIGNvZGUgYWZ0ZXIgdGhpcyBwb2ludCB3aWxsIGJlIGZpbHRlcmVkIGZyb20gc3RhY2sgdHJhY2VzIHJlcG9ydGVkXG4vLyBieSBRLlxudmFyIHFTdGFydGluZ0xpbmUgPSBjYXB0dXJlTGluZSgpO1xudmFyIHFGaWxlTmFtZTtcblxuLy8gc2hpbXNcblxuLy8gdXNlZCBmb3IgZmFsbGJhY2sgaW4gXCJhbGxSZXNvbHZlZFwiXG52YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHt9O1xuXG4vLyBVc2UgdGhlIGZhc3Rlc3QgcG9zc2libGUgbWVhbnMgdG8gZXhlY3V0ZSBhIHRhc2sgaW4gYSBmdXR1cmUgdHVyblxuLy8gb2YgdGhlIGV2ZW50IGxvb3AuXG52YXIgbmV4dFRpY2sgPShmdW5jdGlvbiAoKSB7XG4gICAgLy8gbGlua2VkIGxpc3Qgb2YgdGFza3MgKHNpbmdsZSwgd2l0aCBoZWFkIG5vZGUpXG4gICAgdmFyIGhlYWQgPSB7dGFzazogdm9pZCAwLCBuZXh0OiBudWxsfTtcbiAgICB2YXIgdGFpbCA9IGhlYWQ7XG4gICAgdmFyIGZsdXNoaW5nID0gZmFsc2U7XG4gICAgdmFyIHJlcXVlc3RUaWNrID0gdm9pZCAwO1xuICAgIHZhciBpc05vZGVKUyA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgICAgIC8qIGpzaGludCBsb29wZnVuYzogdHJ1ZSAqL1xuXG4gICAgICAgIHdoaWxlIChoZWFkLm5leHQpIHtcbiAgICAgICAgICAgIGhlYWQgPSBoZWFkLm5leHQ7XG4gICAgICAgICAgICB2YXIgdGFzayA9IGhlYWQudGFzaztcbiAgICAgICAgICAgIGhlYWQudGFzayA9IHZvaWQgMDtcbiAgICAgICAgICAgIHZhciBkb21haW4gPSBoZWFkLmRvbWFpbjtcblxuICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgIGhlYWQuZG9tYWluID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIGRvbWFpbi5lbnRlcigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRhc2soKTtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmIChpc05vZGVKUykge1xuICAgICAgICAgICAgICAgICAgICAvLyBJbiBub2RlLCB1bmNhdWdodCBleGNlcHRpb25zIGFyZSBjb25zaWRlcmVkIGZhdGFsIGVycm9ycy5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmUtdGhyb3cgdGhlbSBzeW5jaHJvbm91c2x5IHRvIGludGVycnVwdCBmbHVzaGluZyFcblxuICAgICAgICAgICAgICAgICAgICAvLyBFbnN1cmUgY29udGludWF0aW9uIGlmIHRoZSB1bmNhdWdodCBleGNlcHRpb24gaXMgc3VwcHJlc3NlZFxuICAgICAgICAgICAgICAgICAgICAvLyBsaXN0ZW5pbmcgXCJ1bmNhdWdodEV4Y2VwdGlvblwiIGV2ZW50cyAoYXMgZG9tYWlucyBkb2VzKS5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ29udGludWUgaW4gbmV4dCBldmVudCB0byBhdm9pZCB0aWNrIHJlY3Vyc2lvbi5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZsdXNoLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluLmVudGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSW4gYnJvd3NlcnMsIHVuY2F1Z2h0IGV4Y2VwdGlvbnMgYXJlIG5vdCBmYXRhbC5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmUtdGhyb3cgdGhlbSBhc3luY2hyb25vdXNseSB0byBhdm9pZCBzbG93LWRvd25zLlxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICBkb21haW4uZXhpdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZmx1c2hpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBuZXh0VGljayA9IGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgIHRhaWwgPSB0YWlsLm5leHQgPSB7XG4gICAgICAgICAgICB0YXNrOiB0YXNrLFxuICAgICAgICAgICAgZG9tYWluOiBpc05vZGVKUyAmJiBwcm9jZXNzLmRvbWFpbixcbiAgICAgICAgICAgIG5leHQ6IG51bGxcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoIWZsdXNoaW5nKSB7XG4gICAgICAgICAgICBmbHVzaGluZyA9IHRydWU7XG4gICAgICAgICAgICByZXF1ZXN0VGljaygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwcm9jZXNzLm5leHRUaWNrKSB7XG4gICAgICAgIC8vIE5vZGUuanMgYmVmb3JlIDAuOS4gTm90ZSB0aGF0IHNvbWUgZmFrZS1Ob2RlIGVudmlyb25tZW50cywgbGlrZSB0aGVcbiAgICAgICAgLy8gTW9jaGEgdGVzdCBydW5uZXIsIGludHJvZHVjZSBhIGBwcm9jZXNzYCBnbG9iYWwgd2l0aG91dCBhIGBuZXh0VGlja2AuXG4gICAgICAgIGlzTm9kZUpTID0gdHJ1ZTtcblxuICAgICAgICByZXF1ZXN0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICAgICAgICB9O1xuXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgLy8gSW4gSUUxMCwgTm9kZS5qcyAwLjkrLCBvciBodHRwczovL2dpdGh1Yi5jb20vTm9ibGVKUy9zZXRJbW1lZGlhdGVcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrID0gc2V0SW1tZWRpYXRlLmJpbmQod2luZG93LCBmbHVzaCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXF1ZXN0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUoZmx1c2gpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgLy8gbW9kZXJuIGJyb3dzZXJzXG4gICAgICAgIC8vIGh0dHA6Ly93d3cubm9uYmxvY2tpbmcuaW8vMjAxMS8wNi93aW5kb3duZXh0dGljay5odG1sXG4gICAgICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgICAgIC8vIEF0IGxlYXN0IFNhZmFyaSBWZXJzaW9uIDYuMC41ICg4NTM2LjMwLjEpIGludGVybWl0dGVudGx5IGNhbm5vdCBjcmVhdGVcbiAgICAgICAgLy8gd29ya2luZyBtZXNzYWdlIHBvcnRzIHRoZSBmaXJzdCB0aW1lIGEgcGFnZSBsb2Fkcy5cbiAgICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXF1ZXN0VGljayA9IHJlcXVlc3RQb3J0VGljaztcbiAgICAgICAgICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gZmx1c2g7XG4gICAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgcmVxdWVzdFBvcnRUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gT3BlcmEgcmVxdWlyZXMgdXMgdG8gcHJvdmlkZSBhIG1lc3NhZ2UgcGF5bG9hZCwgcmVnYXJkbGVzcyBvZlxuICAgICAgICAgICAgLy8gd2hldGhlciB3ZSB1c2UgaXQuXG4gICAgICAgICAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICAgICAgICB9O1xuICAgICAgICByZXF1ZXN0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZmx1c2gsIDApO1xuICAgICAgICAgICAgcmVxdWVzdFBvcnRUaWNrKCk7XG4gICAgICAgIH07XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBvbGQgYnJvd3NlcnNcbiAgICAgICAgcmVxdWVzdFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZsdXNoLCAwKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dFRpY2s7XG59KSgpO1xuXG4vLyBBdHRlbXB0IHRvIG1ha2UgZ2VuZXJpY3Mgc2FmZSBpbiB0aGUgZmFjZSBvZiBkb3duc3RyZWFtXG4vLyBtb2RpZmljYXRpb25zLlxuLy8gVGhlcmUgaXMgbm8gc2l0dWF0aW9uIHdoZXJlIHRoaXMgaXMgbmVjZXNzYXJ5LlxuLy8gSWYgeW91IG5lZWQgYSBzZWN1cml0eSBndWFyYW50ZWUsIHRoZXNlIHByaW1vcmRpYWxzIG5lZWQgdG8gYmVcbi8vIGRlZXBseSBmcm96ZW4gYW55d2F5LCBhbmQgaWYgeW91IGRvbuKAmXQgbmVlZCBhIHNlY3VyaXR5IGd1YXJhbnRlZSxcbi8vIHRoaXMgaXMganVzdCBwbGFpbiBwYXJhbm9pZC5cbi8vIEhvd2V2ZXIsIHRoaXMgKiptaWdodCoqIGhhdmUgdGhlIG5pY2Ugc2lkZS1lZmZlY3Qgb2YgcmVkdWNpbmcgdGhlIHNpemUgb2Zcbi8vIHRoZSBtaW5pZmllZCBjb2RlIGJ5IHJlZHVjaW5nIHguY2FsbCgpIHRvIG1lcmVseSB4KClcbi8vIFNlZSBNYXJrIE1pbGxlcuKAmXMgZXhwbGFuYXRpb24gb2Ygd2hhdCB0aGlzIGRvZXMuXG4vLyBodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1jb252ZW50aW9uczpzYWZlX21ldGFfcHJvZ3JhbW1pbmdcbnZhciBjYWxsID0gRnVuY3Rpb24uY2FsbDtcbmZ1bmN0aW9uIHVuY3VycnlUaGlzKGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gY2FsbC5hcHBseShmLCBhcmd1bWVudHMpO1xuICAgIH07XG59XG4vLyBUaGlzIGlzIGVxdWl2YWxlbnQsIGJ1dCBzbG93ZXI6XG4vLyB1bmN1cnJ5VGhpcyA9IEZ1bmN0aW9uX2JpbmQuYmluZChGdW5jdGlvbl9iaW5kLmNhbGwpO1xuLy8gaHR0cDovL2pzcGVyZi5jb20vdW5jdXJyeXRoaXNcblxudmFyIGFycmF5X3NsaWNlID0gdW5jdXJyeVRoaXMoQXJyYXkucHJvdG90eXBlLnNsaWNlKTtcblxudmFyIGFycmF5X3JlZHVjZSA9IHVuY3VycnlUaGlzKFxuICAgIEFycmF5LnByb3RvdHlwZS5yZWR1Y2UgfHwgZnVuY3Rpb24gKGNhbGxiYWNrLCBiYXNpcykge1xuICAgICAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICAgICAgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG4gICAgICAgIC8vIGNvbmNlcm5pbmcgdGhlIGluaXRpYWwgdmFsdWUsIGlmIG9uZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIC8vIHNlZWsgdG8gdGhlIGZpcnN0IHZhbHVlIGluIHRoZSBhcnJheSwgYWNjb3VudGluZ1xuICAgICAgICAgICAgLy8gZm9yIHRoZSBwb3NzaWJpbGl0eSB0aGF0IGlzIGlzIGEgc3BhcnNlIGFycmF5XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4IGluIHRoaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzaXMgPSB0aGlzW2luZGV4KytdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCsraW5kZXggPj0gbGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IHdoaWxlICgxKTtcbiAgICAgICAgfVxuICAgICAgICAvLyByZWR1Y2VcbiAgICAgICAgZm9yICg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAvLyBhY2NvdW50IGZvciB0aGUgcG9zc2liaWxpdHkgdGhhdCB0aGUgYXJyYXkgaXMgc3BhcnNlXG4gICAgICAgICAgICBpZiAoaW5kZXggaW4gdGhpcykge1xuICAgICAgICAgICAgICAgIGJhc2lzID0gY2FsbGJhY2soYmFzaXMsIHRoaXNbaW5kZXhdLCBpbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJhc2lzO1xuICAgIH1cbik7XG5cbnZhciBhcnJheV9pbmRleE9mID0gdW5jdXJyeVRoaXMoXG4gICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgfHwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5vdCBhIHZlcnkgZ29vZCBzaGltLCBidXQgZ29vZCBlbm91Z2ggZm9yIG91ciBvbmUgdXNlIG9mIGl0XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXNbaV0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbik7XG5cbnZhciBhcnJheV9tYXAgPSB1bmN1cnJ5VGhpcyhcbiAgICBBcnJheS5wcm90b3R5cGUubWFwIHx8IGZ1bmN0aW9uIChjYWxsYmFjaywgdGhpc3ApIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgY29sbGVjdCA9IFtdO1xuICAgICAgICBhcnJheV9yZWR1Y2Uoc2VsZiwgZnVuY3Rpb24gKHVuZGVmaW5lZCwgdmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICBjb2xsZWN0LnB1c2goY2FsbGJhY2suY2FsbCh0aGlzcCwgdmFsdWUsIGluZGV4LCBzZWxmKSk7XG4gICAgICAgIH0sIHZvaWQgMCk7XG4gICAgICAgIHJldHVybiBjb2xsZWN0O1xuICAgIH1cbik7XG5cbnZhciBvYmplY3RfY3JlYXRlID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiAocHJvdG90eXBlKSB7XG4gICAgZnVuY3Rpb24gVHlwZSgpIHsgfVxuICAgIFR5cGUucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAgIHJldHVybiBuZXcgVHlwZSgpO1xufTtcblxudmFyIG9iamVjdF9oYXNPd25Qcm9wZXJ0eSA9IHVuY3VycnlUaGlzKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkpO1xuXG52YXIgb2JqZWN0X2tleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgIGlmIChvYmplY3RfaGFzT3duUHJvcGVydHkob2JqZWN0LCBrZXkpKSB7XG4gICAgICAgICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn07XG5cbnZhciBvYmplY3RfdG9TdHJpbmcgPSB1bmN1cnJ5VGhpcyhPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKTtcblxuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IE9iamVjdCh2YWx1ZSk7XG59XG5cbi8vIGdlbmVyYXRvciByZWxhdGVkIHNoaW1zXG5cbi8vIEZJWE1FOiBSZW1vdmUgdGhpcyBmdW5jdGlvbiBvbmNlIEVTNiBnZW5lcmF0b3JzIGFyZSBpbiBTcGlkZXJNb25rZXkuXG5mdW5jdGlvbiBpc1N0b3BJdGVyYXRpb24oZXhjZXB0aW9uKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgb2JqZWN0X3RvU3RyaW5nKGV4Y2VwdGlvbikgPT09IFwiW29iamVjdCBTdG9wSXRlcmF0aW9uXVwiIHx8XG4gICAgICAgIGV4Y2VwdGlvbiBpbnN0YW5jZW9mIFFSZXR1cm5WYWx1ZVxuICAgICk7XG59XG5cbi8vIEZJWE1FOiBSZW1vdmUgdGhpcyBoZWxwZXIgYW5kIFEucmV0dXJuIG9uY2UgRVM2IGdlbmVyYXRvcnMgYXJlIGluXG4vLyBTcGlkZXJNb25rZXkuXG52YXIgUVJldHVyblZhbHVlO1xuaWYgKHR5cGVvZiBSZXR1cm5WYWx1ZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIFFSZXR1cm5WYWx1ZSA9IFJldHVyblZhbHVlO1xufSBlbHNlIHtcbiAgICBRUmV0dXJuVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH07XG59XG5cbi8vIFVudGlsIFY4IDMuMTkgLyBDaHJvbWl1bSAyOSBpcyByZWxlYXNlZCwgU3BpZGVyTW9ua2V5IGlzIHRoZSBvbmx5XG4vLyBlbmdpbmUgdGhhdCBoYXMgYSBkZXBsb3llZCBiYXNlIG9mIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBnZW5lcmF0b3JzLlxuLy8gSG93ZXZlciwgU00ncyBnZW5lcmF0b3JzIHVzZSB0aGUgUHl0aG9uLWluc3BpcmVkIHNlbWFudGljcyBvZlxuLy8gb3V0ZGF0ZWQgRVM2IGRyYWZ0cy4gIFdlIHdvdWxkIGxpa2UgdG8gc3VwcG9ydCBFUzYsIGJ1dCB3ZSdkIGFsc29cbi8vIGxpa2UgdG8gbWFrZSBpdCBwb3NzaWJsZSB0byB1c2UgZ2VuZXJhdG9ycyBpbiBkZXBsb3llZCBicm93c2Vycywgc29cbi8vIHdlIGFsc28gc3VwcG9ydCBQeXRob24tc3R5bGUgZ2VuZXJhdG9ycy4gIEF0IHNvbWUgcG9pbnQgd2UgY2FuIHJlbW92ZVxuLy8gdGhpcyBibG9jay5cbnZhciBoYXNFUzZHZW5lcmF0b3JzO1xudHJ5IHtcbiAgICAvKiBqc2hpbnQgZXZpbDogdHJ1ZSwgbm9uZXc6IGZhbHNlICovXG4gICAgbmV3IEZ1bmN0aW9uKFwiKGZ1bmN0aW9uKiAoKXsgeWllbGQgMTsgfSlcIik7XG4gICAgaGFzRVM2R2VuZXJhdG9ycyA9IHRydWU7XG59IGNhdGNoIChlKSB7XG4gICAgaGFzRVM2R2VuZXJhdG9ycyA9IGZhbHNlO1xufVxuXG4vLyBsb25nIHN0YWNrIHRyYWNlc1xuXG52YXIgU1RBQ0tfSlVNUF9TRVBBUkFUT1IgPSBcIkZyb20gcHJldmlvdXMgZXZlbnQ6XCI7XG5cbmZ1bmN0aW9uIG1ha2VTdGFja1RyYWNlTG9uZyhlcnJvciwgcHJvbWlzZSkge1xuICAgIC8vIElmIHBvc3NpYmxlLCB0cmFuc2Zvcm0gdGhlIGVycm9yIHN0YWNrIHRyYWNlIGJ5IHJlbW92aW5nIE5vZGUgYW5kIFFcbiAgICAvLyBjcnVmdCwgdGhlbiBjb25jYXRlbmF0aW5nIHdpdGggdGhlIHN0YWNrIHRyYWNlIG9mIGBwcm9taXNlYC4gU2VlICM1Ny5cbiAgICBpZiAoaGFzU3RhY2tzICYmXG4gICAgICAgIHByb21pc2Uuc3RhY2sgJiZcbiAgICAgICAgdHlwZW9mIGVycm9yID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgIGVycm9yICE9PSBudWxsICYmXG4gICAgICAgIGVycm9yLnN0YWNrICYmXG4gICAgICAgIGVycm9yLnN0YWNrLmluZGV4T2YoU1RBQ0tfSlVNUF9TRVBBUkFUT1IpID09PSAtMVxuICAgICkge1xuICAgICAgICB2YXIgc3RhY2tzID0gW107XG4gICAgICAgIGZvciAodmFyIHAgPSBwcm9taXNlOyAhIXA7IHAgPSBwLnNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHAuc3RhY2spIHtcbiAgICAgICAgICAgICAgICBzdGFja3MudW5zaGlmdChwLnN0YWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdGFja3MudW5zaGlmdChlcnJvci5zdGFjayk7XG5cbiAgICAgICAgdmFyIGNvbmNhdGVkU3RhY2tzID0gc3RhY2tzLmpvaW4oXCJcXG5cIiArIFNUQUNLX0pVTVBfU0VQQVJBVE9SICsgXCJcXG5cIik7XG4gICAgICAgIGVycm9yLnN0YWNrID0gZmlsdGVyU3RhY2tTdHJpbmcoY29uY2F0ZWRTdGFja3MpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZmlsdGVyU3RhY2tTdHJpbmcoc3RhY2tTdHJpbmcpIHtcbiAgICB2YXIgbGluZXMgPSBzdGFja1N0cmluZy5zcGxpdChcIlxcblwiKTtcbiAgICB2YXIgZGVzaXJlZExpbmVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgbGluZSA9IGxpbmVzW2ldO1xuXG4gICAgICAgIGlmICghaXNJbnRlcm5hbEZyYW1lKGxpbmUpICYmICFpc05vZGVGcmFtZShsaW5lKSAmJiBsaW5lKSB7XG4gICAgICAgICAgICBkZXNpcmVkTGluZXMucHVzaChsaW5lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVzaXJlZExpbmVzLmpvaW4oXCJcXG5cIik7XG59XG5cbmZ1bmN0aW9uIGlzTm9kZUZyYW1lKHN0YWNrTGluZSkge1xuICAgIHJldHVybiBzdGFja0xpbmUuaW5kZXhPZihcIihtb2R1bGUuanM6XCIpICE9PSAtMSB8fFxuICAgICAgICAgICBzdGFja0xpbmUuaW5kZXhPZihcIihub2RlLmpzOlwiKSAhPT0gLTE7XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVOYW1lQW5kTGluZU51bWJlcihzdGFja0xpbmUpIHtcbiAgICAvLyBOYW1lZCBmdW5jdGlvbnM6IFwiYXQgZnVuY3Rpb25OYW1lIChmaWxlbmFtZTpsaW5lTnVtYmVyOmNvbHVtbk51bWJlcilcIlxuICAgIC8vIEluIElFMTAgZnVuY3Rpb24gbmFtZSBjYW4gaGF2ZSBzcGFjZXMgKFwiQW5vbnltb3VzIGZ1bmN0aW9uXCIpIE9fb1xuICAgIHZhciBhdHRlbXB0MSA9IC9hdCAuKyBcXCgoLispOihcXGQrKTooPzpcXGQrKVxcKSQvLmV4ZWMoc3RhY2tMaW5lKTtcbiAgICBpZiAoYXR0ZW1wdDEpIHtcbiAgICAgICAgcmV0dXJuIFthdHRlbXB0MVsxXSwgTnVtYmVyKGF0dGVtcHQxWzJdKV07XG4gICAgfVxuXG4gICAgLy8gQW5vbnltb3VzIGZ1bmN0aW9uczogXCJhdCBmaWxlbmFtZTpsaW5lTnVtYmVyOmNvbHVtbk51bWJlclwiXG4gICAgdmFyIGF0dGVtcHQyID0gL2F0IChbXiBdKyk6KFxcZCspOig/OlxcZCspJC8uZXhlYyhzdGFja0xpbmUpO1xuICAgIGlmIChhdHRlbXB0Mikge1xuICAgICAgICByZXR1cm4gW2F0dGVtcHQyWzFdLCBOdW1iZXIoYXR0ZW1wdDJbMl0pXTtcbiAgICB9XG5cbiAgICAvLyBGaXJlZm94IHN0eWxlOiBcImZ1bmN0aW9uQGZpbGVuYW1lOmxpbmVOdW1iZXIgb3IgQGZpbGVuYW1lOmxpbmVOdW1iZXJcIlxuICAgIHZhciBhdHRlbXB0MyA9IC8uKkAoLispOihcXGQrKSQvLmV4ZWMoc3RhY2tMaW5lKTtcbiAgICBpZiAoYXR0ZW1wdDMpIHtcbiAgICAgICAgcmV0dXJuIFthdHRlbXB0M1sxXSwgTnVtYmVyKGF0dGVtcHQzWzJdKV07XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc0ludGVybmFsRnJhbWUoc3RhY2tMaW5lKSB7XG4gICAgdmFyIGZpbGVOYW1lQW5kTGluZU51bWJlciA9IGdldEZpbGVOYW1lQW5kTGluZU51bWJlcihzdGFja0xpbmUpO1xuXG4gICAgaWYgKCFmaWxlTmFtZUFuZExpbmVOdW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBmaWxlTmFtZSA9IGZpbGVOYW1lQW5kTGluZU51bWJlclswXTtcbiAgICB2YXIgbGluZU51bWJlciA9IGZpbGVOYW1lQW5kTGluZU51bWJlclsxXTtcblxuICAgIHJldHVybiBmaWxlTmFtZSA9PT0gcUZpbGVOYW1lICYmXG4gICAgICAgIGxpbmVOdW1iZXIgPj0gcVN0YXJ0aW5nTGluZSAmJlxuICAgICAgICBsaW5lTnVtYmVyIDw9IHFFbmRpbmdMaW5lO1xufVxuXG4vLyBkaXNjb3ZlciBvd24gZmlsZSBuYW1lIGFuZCBsaW5lIG51bWJlciByYW5nZSBmb3IgZmlsdGVyaW5nIHN0YWNrXG4vLyB0cmFjZXNcbmZ1bmN0aW9uIGNhcHR1cmVMaW5lKCkge1xuICAgIGlmICghaGFzU3RhY2tzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHZhciBsaW5lcyA9IGUuc3RhY2suc3BsaXQoXCJcXG5cIik7XG4gICAgICAgIHZhciBmaXJzdExpbmUgPSBsaW5lc1swXS5pbmRleE9mKFwiQFwiKSA+IDAgPyBsaW5lc1sxXSA6IGxpbmVzWzJdO1xuICAgICAgICB2YXIgZmlsZU5hbWVBbmRMaW5lTnVtYmVyID0gZ2V0RmlsZU5hbWVBbmRMaW5lTnVtYmVyKGZpcnN0TGluZSk7XG4gICAgICAgIGlmICghZmlsZU5hbWVBbmRMaW5lTnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBxRmlsZU5hbWUgPSBmaWxlTmFtZUFuZExpbmVOdW1iZXJbMF07XG4gICAgICAgIHJldHVybiBmaWxlTmFtZUFuZExpbmVOdW1iZXJbMV07XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkZXByZWNhdGUoY2FsbGJhY2ssIG5hbWUsIGFsdGVybmF0aXZlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICAgICAgICB0eXBlb2YgY29uc29sZS53YXJuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihuYW1lICsgXCIgaXMgZGVwcmVjYXRlZCwgdXNlIFwiICsgYWx0ZXJuYXRpdmUgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGluc3RlYWQuXCIsIG5ldyBFcnJvcihcIlwiKS5zdGFjayk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KGNhbGxiYWNrLCBhcmd1bWVudHMpO1xuICAgIH07XG59XG5cbi8vIGVuZCBvZiBzaGltc1xuLy8gYmVnaW5uaW5nIG9mIHJlYWwgd29ya1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBwcm9taXNlIGZvciBhbiBpbW1lZGlhdGUgcmVmZXJlbmNlLCBwYXNzZXMgcHJvbWlzZXMgdGhyb3VnaCwgb3JcbiAqIGNvZXJjZXMgcHJvbWlzZXMgZnJvbSBkaWZmZXJlbnQgc3lzdGVtcy5cbiAqIEBwYXJhbSB2YWx1ZSBpbW1lZGlhdGUgcmVmZXJlbmNlIG9yIHByb21pc2VcbiAqL1xuZnVuY3Rpb24gUSh2YWx1ZSkge1xuICAgIC8vIElmIHRoZSBvYmplY3QgaXMgYWxyZWFkeSBhIFByb21pc2UsIHJldHVybiBpdCBkaXJlY3RseS4gIFRoaXMgZW5hYmxlc1xuICAgIC8vIHRoZSByZXNvbHZlIGZ1bmN0aW9uIHRvIGJvdGggYmUgdXNlZCB0byBjcmVhdGVkIHJlZmVyZW5jZXMgZnJvbSBvYmplY3RzLFxuICAgIC8vIGJ1dCB0byB0b2xlcmFibHkgY29lcmNlIG5vbi1wcm9taXNlcyB0byBwcm9taXNlcy5cbiAgICBpZiAoaXNQcm9taXNlKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgLy8gYXNzaW1pbGF0ZSB0aGVuYWJsZXNcbiAgICBpZiAoaXNQcm9taXNlQWxpa2UodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBjb2VyY2UodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmdWxmaWxsKHZhbHVlKTtcbiAgICB9XG59XG5RLnJlc29sdmUgPSBRO1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgdGFzayBpbiBhIGZ1dHVyZSB0dXJuIG9mIHRoZSBldmVudCBsb29wLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdGFza1xuICovXG5RLm5leHRUaWNrID0gbmV4dFRpY2s7XG5cbi8qKlxuICogQ29udHJvbHMgd2hldGhlciBvciBub3QgbG9uZyBzdGFjayB0cmFjZXMgd2lsbCBiZSBvblxuICovXG5RLmxvbmdTdGFja1N1cHBvcnQgPSBmYWxzZTtcblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEge3Byb21pc2UsIHJlc29sdmUsIHJlamVjdH0gb2JqZWN0LlxuICpcbiAqIGByZXNvbHZlYCBpcyBhIGNhbGxiYWNrIHRvIGludm9rZSB3aXRoIGEgbW9yZSByZXNvbHZlZCB2YWx1ZSBmb3IgdGhlXG4gKiBwcm9taXNlLiBUbyBmdWxmaWxsIHRoZSBwcm9taXNlLCBpbnZva2UgYHJlc29sdmVgIHdpdGggYW55IHZhbHVlIHRoYXQgaXNcbiAqIG5vdCBhIHRoZW5hYmxlLiBUbyByZWplY3QgdGhlIHByb21pc2UsIGludm9rZSBgcmVzb2x2ZWAgd2l0aCBhIHJlamVjdGVkXG4gKiB0aGVuYWJsZSwgb3IgaW52b2tlIGByZWplY3RgIHdpdGggdGhlIHJlYXNvbiBkaXJlY3RseS4gVG8gcmVzb2x2ZSB0aGVcbiAqIHByb21pc2UgdG8gYW5vdGhlciB0aGVuYWJsZSwgdGh1cyBwdXR0aW5nIGl0IGluIHRoZSBzYW1lIHN0YXRlLCBpbnZva2VcbiAqIGByZXNvbHZlYCB3aXRoIHRoYXQgb3RoZXIgdGhlbmFibGUuXG4gKi9cblEuZGVmZXIgPSBkZWZlcjtcbmZ1bmN0aW9uIGRlZmVyKCkge1xuICAgIC8vIGlmIFwibWVzc2FnZXNcIiBpcyBhbiBcIkFycmF5XCIsIHRoYXQgaW5kaWNhdGVzIHRoYXQgdGhlIHByb21pc2UgaGFzIG5vdCB5ZXRcbiAgICAvLyBiZWVuIHJlc29sdmVkLiAgSWYgaXQgaXMgXCJ1bmRlZmluZWRcIiwgaXQgaGFzIGJlZW4gcmVzb2x2ZWQuICBFYWNoXG4gICAgLy8gZWxlbWVudCBvZiB0aGUgbWVzc2FnZXMgYXJyYXkgaXMgaXRzZWxmIGFuIGFycmF5IG9mIGNvbXBsZXRlIGFyZ3VtZW50cyB0b1xuICAgIC8vIGZvcndhcmQgdG8gdGhlIHJlc29sdmVkIHByb21pc2UuICBXZSBjb2VyY2UgdGhlIHJlc29sdXRpb24gdmFsdWUgdG8gYVxuICAgIC8vIHByb21pc2UgdXNpbmcgdGhlIGByZXNvbHZlYCBmdW5jdGlvbiBiZWNhdXNlIGl0IGhhbmRsZXMgYm90aCBmdWxseVxuICAgIC8vIG5vbi10aGVuYWJsZSB2YWx1ZXMgYW5kIG90aGVyIHRoZW5hYmxlcyBncmFjZWZ1bGx5LlxuICAgIHZhciBtZXNzYWdlcyA9IFtdLCBwcm9ncmVzc0xpc3RlbmVycyA9IFtdLCByZXNvbHZlZFByb21pc2U7XG5cbiAgICB2YXIgZGVmZXJyZWQgPSBvYmplY3RfY3JlYXRlKGRlZmVyLnByb3RvdHlwZSk7XG4gICAgdmFyIHByb21pc2UgPSBvYmplY3RfY3JlYXRlKFByb21pc2UucHJvdG90eXBlKTtcblxuICAgIHByb21pc2UucHJvbWlzZURpc3BhdGNoID0gZnVuY3Rpb24gKHJlc29sdmUsIG9wLCBvcGVyYW5kcykge1xuICAgICAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cyk7XG4gICAgICAgIGlmIChtZXNzYWdlcykge1xuICAgICAgICAgICAgbWVzc2FnZXMucHVzaChhcmdzKTtcbiAgICAgICAgICAgIGlmIChvcCA9PT0gXCJ3aGVuXCIgJiYgb3BlcmFuZHNbMV0pIHsgLy8gcHJvZ3Jlc3Mgb3BlcmFuZFxuICAgICAgICAgICAgICAgIHByb2dyZXNzTGlzdGVuZXJzLnB1c2gob3BlcmFuZHNbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmVkUHJvbWlzZS5wcm9taXNlRGlzcGF0Y2guYXBwbHkocmVzb2x2ZWRQcm9taXNlLCBhcmdzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFhYWCBkZXByZWNhdGVkXG4gICAgcHJvbWlzZS52YWx1ZU9mID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAobWVzc2FnZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBuZWFyZXJWYWx1ZSA9IG5lYXJlcihyZXNvbHZlZFByb21pc2UpO1xuICAgICAgICBpZiAoaXNQcm9taXNlKG5lYXJlclZhbHVlKSkge1xuICAgICAgICAgICAgcmVzb2x2ZWRQcm9taXNlID0gbmVhcmVyVmFsdWU7IC8vIHNob3J0ZW4gY2hhaW5cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmVhcmVyVmFsdWU7XG4gICAgfTtcblxuICAgIHByb21pc2UuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN0YXRlOiBcInBlbmRpbmdcIiB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNvbHZlZFByb21pc2UuaW5zcGVjdCgpO1xuICAgIH07XG5cbiAgICBpZiAoUS5sb25nU3RhY2tTdXBwb3J0ICYmIGhhc1N0YWNrcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIE5PVEU6IGRvbid0IHRyeSB0byB1c2UgYEVycm9yLmNhcHR1cmVTdGFja1RyYWNlYCBvciB0cmFuc2ZlciB0aGVcbiAgICAgICAgICAgIC8vIGFjY2Vzc29yIGFyb3VuZDsgdGhhdCBjYXVzZXMgbWVtb3J5IGxlYWtzIGFzIHBlciBHSC0xMTEuIEp1c3RcbiAgICAgICAgICAgIC8vIHJlaWZ5IHRoZSBzdGFjayB0cmFjZSBhcyBhIHN0cmluZyBBU0FQLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIEF0IHRoZSBzYW1lIHRpbWUsIGN1dCBvZmYgdGhlIGZpcnN0IGxpbmU7IGl0J3MgYWx3YXlzIGp1c3RcbiAgICAgICAgICAgIC8vIFwiW29iamVjdCBQcm9taXNlXVxcblwiLCBhcyBwZXIgdGhlIGB0b1N0cmluZ2AuXG4gICAgICAgICAgICBwcm9taXNlLnN0YWNrID0gZS5zdGFjay5zdWJzdHJpbmcoZS5zdGFjay5pbmRleE9mKFwiXFxuXCIpICsgMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBOT1RFOiB3ZSBkbyB0aGUgY2hlY2tzIGZvciBgcmVzb2x2ZWRQcm9taXNlYCBpbiBlYWNoIG1ldGhvZCwgaW5zdGVhZCBvZlxuICAgIC8vIGNvbnNvbGlkYXRpbmcgdGhlbSBpbnRvIGBiZWNvbWVgLCBzaW5jZSBvdGhlcndpc2Ugd2UnZCBjcmVhdGUgbmV3XG4gICAgLy8gcHJvbWlzZXMgd2l0aCB0aGUgbGluZXMgYGJlY29tZSh3aGF0ZXZlcih2YWx1ZSkpYC4gU2VlIGUuZy4gR0gtMjUyLlxuXG4gICAgZnVuY3Rpb24gYmVjb21lKG5ld1Byb21pc2UpIHtcbiAgICAgICAgcmVzb2x2ZWRQcm9taXNlID0gbmV3UHJvbWlzZTtcbiAgICAgICAgcHJvbWlzZS5zb3VyY2UgPSBuZXdQcm9taXNlO1xuXG4gICAgICAgIGFycmF5X3JlZHVjZShtZXNzYWdlcywgZnVuY3Rpb24gKHVuZGVmaW5lZCwgbWVzc2FnZSkge1xuICAgICAgICAgICAgbmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG5ld1Byb21pc2UucHJvbWlzZURpc3BhdGNoLmFwcGx5KG5ld1Byb21pc2UsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHZvaWQgMCk7XG5cbiAgICAgICAgbWVzc2FnZXMgPSB2b2lkIDA7XG4gICAgICAgIHByb2dyZXNzTGlzdGVuZXJzID0gdm9pZCAwO1xuICAgIH1cblxuICAgIGRlZmVycmVkLnByb21pc2UgPSBwcm9taXNlO1xuICAgIGRlZmVycmVkLnJlc29sdmUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVjb21lKFEodmFsdWUpKTtcbiAgICB9O1xuXG4gICAgZGVmZXJyZWQuZnVsZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAocmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBiZWNvbWUoZnVsZmlsbCh2YWx1ZSkpO1xuICAgIH07XG4gICAgZGVmZXJyZWQucmVqZWN0ID0gZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICBpZiAocmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBiZWNvbWUocmVqZWN0KHJlYXNvbikpO1xuICAgIH07XG4gICAgZGVmZXJyZWQubm90aWZ5ID0gZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgIGlmIChyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGFycmF5X3JlZHVjZShwcm9ncmVzc0xpc3RlbmVycywgZnVuY3Rpb24gKHVuZGVmaW5lZCwgcHJvZ3Jlc3NMaXN0ZW5lcikge1xuICAgICAgICAgICAgbmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzTGlzdGVuZXIocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHZvaWQgMCk7XG4gICAgfTtcblxuICAgIHJldHVybiBkZWZlcnJlZDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgTm9kZS1zdHlsZSBjYWxsYmFjayB0aGF0IHdpbGwgcmVzb2x2ZSBvciByZWplY3QgdGhlIGRlZmVycmVkXG4gKiBwcm9taXNlLlxuICogQHJldHVybnMgYSBub2RlYmFja1xuICovXG5kZWZlci5wcm90b3R5cGUubWFrZU5vZGVSZXNvbHZlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlcnJvciwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICBzZWxmLnJlamVjdChlcnJvcik7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIHNlbGYucmVzb2x2ZShhcnJheV9zbGljZShhcmd1bWVudHMsIDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxuLyoqXG4gKiBAcGFyYW0gcmVzb2x2ZXIge0Z1bmN0aW9ufSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBub3RoaW5nIGFuZCBhY2NlcHRzXG4gKiB0aGUgcmVzb2x2ZSwgcmVqZWN0LCBhbmQgbm90aWZ5IGZ1bmN0aW9ucyBmb3IgYSBkZWZlcnJlZC5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IG1heSBiZSByZXNvbHZlZCB3aXRoIHRoZSBnaXZlbiByZXNvbHZlIGFuZCByZWplY3RcbiAqIGZ1bmN0aW9ucywgb3IgcmVqZWN0ZWQgYnkgYSB0aHJvd24gZXhjZXB0aW9uIGluIHJlc29sdmVyXG4gKi9cblEucHJvbWlzZSA9IHByb21pc2U7XG5mdW5jdGlvbiBwcm9taXNlKHJlc29sdmVyKSB7XG4gICAgaWYgKHR5cGVvZiByZXNvbHZlciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJyZXNvbHZlciBtdXN0IGJlIGEgZnVuY3Rpb24uXCIpO1xuICAgIH1cbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIHRyeSB7XG4gICAgICAgIHJlc29sdmVyKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCwgZGVmZXJyZWQubm90aWZ5KTtcbiAgICB9IGNhdGNoIChyZWFzb24pIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHJlYXNvbik7XG4gICAgfVxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuXG4vLyBYWFggZXhwZXJpbWVudGFsLiAgVGhpcyBtZXRob2QgaXMgYSB3YXkgdG8gZGVub3RlIHRoYXQgYSBsb2NhbCB2YWx1ZSBpc1xuLy8gc2VyaWFsaXphYmxlIGFuZCBzaG91bGQgYmUgaW1tZWRpYXRlbHkgZGlzcGF0Y2hlZCB0byBhIHJlbW90ZSB1cG9uIHJlcXVlc3QsXG4vLyBpbnN0ZWFkIG9mIHBhc3NpbmcgYSByZWZlcmVuY2UuXG5RLnBhc3NCeUNvcHkgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgLy9mcmVlemUob2JqZWN0KTtcbiAgICAvL3Bhc3NCeUNvcGllcy5zZXQob2JqZWN0LCB0cnVlKTtcbiAgICByZXR1cm4gb2JqZWN0O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUucGFzc0J5Q29weSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL2ZyZWV6ZShvYmplY3QpO1xuICAgIC8vcGFzc0J5Q29waWVzLnNldChvYmplY3QsIHRydWUpO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJZiB0d28gcHJvbWlzZXMgZXZlbnR1YWxseSBmdWxmaWxsIHRvIHRoZSBzYW1lIHZhbHVlLCBwcm9taXNlcyB0aGF0IHZhbHVlLFxuICogYnV0IG90aGVyd2lzZSByZWplY3RzLlxuICogQHBhcmFtIHgge0FueSp9XG4gKiBAcGFyYW0geSB7QW55Kn1cbiAqIEByZXR1cm5zIHtBbnkqfSBhIHByb21pc2UgZm9yIHggYW5kIHkgaWYgdGhleSBhcmUgdGhlIHNhbWUsIGJ1dCBhIHJlamVjdGlvblxuICogb3RoZXJ3aXNlLlxuICpcbiAqL1xuUS5qb2luID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICByZXR1cm4gUSh4KS5qb2luKHkpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuam9pbiA9IGZ1bmN0aW9uICh0aGF0KSB7XG4gICAgcmV0dXJuIFEoW3RoaXMsIHRoYXRdKS5zcHJlYWQoZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgaWYgKHggPT09IHkpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IFwiPT09XCIgc2hvdWxkIGJlIE9iamVjdC5pcyBvciBlcXVpdlxuICAgICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBqb2luOiBub3QgdGhlIHNhbWU6IFwiICsgeCArIFwiIFwiICsgeSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSBmaXJzdCBvZiBhbiBhcnJheSBvZiBwcm9taXNlcyB0byBiZWNvbWUgZnVsZmlsbGVkLlxuICogQHBhcmFtIGFuc3dlcnMge0FycmF5W0FueSpdfSBwcm9taXNlcyB0byByYWNlXG4gKiBAcmV0dXJucyB7QW55Kn0gdGhlIGZpcnN0IHByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cblEucmFjZSA9IHJhY2U7XG5mdW5jdGlvbiByYWNlKGFuc3dlclBzKSB7XG4gICAgcmV0dXJuIHByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIC8vIFN3aXRjaCB0byB0aGlzIG9uY2Ugd2UgY2FuIGFzc3VtZSBhdCBsZWFzdCBFUzVcbiAgICAgICAgLy8gYW5zd2VyUHMuZm9yRWFjaChmdW5jdGlvbihhbnN3ZXJQKSB7XG4gICAgICAgIC8vICAgICBRKGFuc3dlclApLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIC8vIFVzZSB0aGlzIGluIHRoZSBtZWFudGltZVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYW5zd2VyUHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIFEoYW5zd2VyUHNbaV0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5yYWNlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4oUS5yYWNlKTtcbn07XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIFByb21pc2Ugd2l0aCBhIHByb21pc2UgZGVzY3JpcHRvciBvYmplY3QgYW5kIG9wdGlvbmFsIGZhbGxiYWNrXG4gKiBmdW5jdGlvbi4gIFRoZSBkZXNjcmlwdG9yIGNvbnRhaW5zIG1ldGhvZHMgbGlrZSB3aGVuKHJlamVjdGVkKSwgZ2V0KG5hbWUpLFxuICogc2V0KG5hbWUsIHZhbHVlKSwgcG9zdChuYW1lLCBhcmdzKSwgYW5kIGRlbGV0ZShuYW1lKSwgd2hpY2ggYWxsXG4gKiByZXR1cm4gZWl0aGVyIGEgdmFsdWUsIGEgcHJvbWlzZSBmb3IgYSB2YWx1ZSwgb3IgYSByZWplY3Rpb24uICBUaGUgZmFsbGJhY2tcbiAqIGFjY2VwdHMgdGhlIG9wZXJhdGlvbiBuYW1lLCBhIHJlc29sdmVyLCBhbmQgYW55IGZ1cnRoZXIgYXJndW1lbnRzIHRoYXQgd291bGRcbiAqIGhhdmUgYmVlbiBmb3J3YXJkZWQgdG8gdGhlIGFwcHJvcHJpYXRlIG1ldGhvZCBhYm92ZSBoYWQgYSBtZXRob2QgYmVlblxuICogcHJvdmlkZWQgd2l0aCB0aGUgcHJvcGVyIG5hbWUuICBUaGUgQVBJIG1ha2VzIG5vIGd1YXJhbnRlZXMgYWJvdXQgdGhlIG5hdHVyZVxuICogb2YgdGhlIHJldHVybmVkIG9iamVjdCwgYXBhcnQgZnJvbSB0aGF0IGl0IGlzIHVzYWJsZSB3aGVyZWV2ZXIgcHJvbWlzZXMgYXJlXG4gKiBib3VnaHQgYW5kIHNvbGQuXG4gKi9cblEubWFrZVByb21pc2UgPSBQcm9taXNlO1xuZnVuY3Rpb24gUHJvbWlzZShkZXNjcmlwdG9yLCBmYWxsYmFjaywgaW5zcGVjdCkge1xuICAgIGlmIChmYWxsYmFjayA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGZhbGxiYWNrID0gZnVuY3Rpb24gKG9wKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBcIlByb21pc2UgZG9lcyBub3Qgc3VwcG9ydCBvcGVyYXRpb246IFwiICsgb3BcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAoaW5zcGVjdCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge3N0YXRlOiBcInVua25vd25cIn07XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIHByb21pc2UgPSBvYmplY3RfY3JlYXRlKFByb21pc2UucHJvdG90eXBlKTtcblxuICAgIHByb21pc2UucHJvbWlzZURpc3BhdGNoID0gZnVuY3Rpb24gKHJlc29sdmUsIG9wLCBhcmdzKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoZGVzY3JpcHRvcltvcF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBkZXNjcmlwdG9yW29wXS5hcHBseShwcm9taXNlLCBhcmdzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsbGJhY2suY2FsbChwcm9taXNlLCBvcCwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlc29sdmUpIHtcbiAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcm9taXNlLmluc3BlY3QgPSBpbnNwZWN0O1xuXG4gICAgLy8gWFhYIGRlcHJlY2F0ZWQgYHZhbHVlT2ZgIGFuZCBgZXhjZXB0aW9uYCBzdXBwb3J0XG4gICAgaWYgKGluc3BlY3QpIHtcbiAgICAgICAgdmFyIGluc3BlY3RlZCA9IGluc3BlY3QoKTtcbiAgICAgICAgaWYgKGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiKSB7XG4gICAgICAgICAgICBwcm9taXNlLmV4Y2VwdGlvbiA9IGluc3BlY3RlZC5yZWFzb247XG4gICAgICAgIH1cblxuICAgICAgICBwcm9taXNlLnZhbHVlT2YgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaW5zcGVjdGVkID0gaW5zcGVjdCgpO1xuICAgICAgICAgICAgaWYgKGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJwZW5kaW5nXCIgfHxcbiAgICAgICAgICAgICAgICBpbnNwZWN0ZWQuc3RhdGUgPT09IFwicmVqZWN0ZWRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGluc3BlY3RlZC52YWx1ZTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBQcm9taXNlXVwiO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzc2VkKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdmFyIGRvbmUgPSBmYWxzZTsgICAvLyBlbnN1cmUgdGhlIHVudHJ1c3RlZCBwcm9taXNlIG1ha2VzIGF0IG1vc3QgYVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luZ2xlIGNhbGwgdG8gb25lIG9mIHRoZSBjYWxsYmFja3NcblxuICAgIGZ1bmN0aW9uIF9mdWxmaWxsZWQodmFsdWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgZnVsZmlsbGVkID09PSBcImZ1bmN0aW9uXCIgPyBmdWxmaWxsZWQodmFsdWUpIDogdmFsdWU7XG4gICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChleGNlcHRpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JlamVjdGVkKGV4Y2VwdGlvbikge1xuICAgICAgICBpZiAodHlwZW9mIHJlamVjdGVkID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIG1ha2VTdGFja1RyYWNlTG9uZyhleGNlcHRpb24sIHNlbGYpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0ZWQoZXhjZXB0aW9uKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKG5ld0V4Y2VwdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3RXhjZXB0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3Byb2dyZXNzZWQodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBwcm9ncmVzc2VkID09PSBcImZ1bmN0aW9uXCIgPyBwcm9ncmVzc2VkKHZhbHVlKSA6IHZhbHVlO1xuICAgIH1cblxuICAgIG5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5wcm9taXNlRGlzcGF0Y2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKF9mdWxmaWxsZWQodmFsdWUpKTtcbiAgICAgICAgfSwgXCJ3aGVuXCIsIFtmdW5jdGlvbiAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKF9yZWplY3RlZChleGNlcHRpb24pKTtcbiAgICAgICAgfV0pO1xuICAgIH0pO1xuXG4gICAgLy8gUHJvZ3Jlc3MgcHJvcGFnYXRvciBuZWVkIHRvIGJlIGF0dGFjaGVkIGluIHRoZSBjdXJyZW50IHRpY2suXG4gICAgc2VsZi5wcm9taXNlRGlzcGF0Y2godm9pZCAwLCBcIndoZW5cIiwgW3ZvaWQgMCwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBuZXdWYWx1ZTtcbiAgICAgICAgdmFyIHRocmV3ID0gZmFsc2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBuZXdWYWx1ZSA9IF9wcm9ncmVzc2VkKHZhbHVlKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyZXcgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKFEub25lcnJvcikge1xuICAgICAgICAgICAgICAgIFEub25lcnJvcihlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhyZXcpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLm5vdGlmeShuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXJzIGFuIG9ic2VydmVyIG9uIGEgcHJvbWlzZS5cbiAqXG4gKiBHdWFyYW50ZWVzOlxuICpcbiAqIDEuIHRoYXQgZnVsZmlsbGVkIGFuZCByZWplY3RlZCB3aWxsIGJlIGNhbGxlZCBvbmx5IG9uY2UuXG4gKiAyLiB0aGF0IGVpdGhlciB0aGUgZnVsZmlsbGVkIGNhbGxiYWNrIG9yIHRoZSByZWplY3RlZCBjYWxsYmFjayB3aWxsIGJlXG4gKiAgICBjYWxsZWQsIGJ1dCBub3QgYm90aC5cbiAqIDMuIHRoYXQgZnVsZmlsbGVkIGFuZCByZWplY3RlZCB3aWxsIG5vdCBiZSBjYWxsZWQgaW4gdGhpcyB0dXJuLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSAgICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSB0byBvYnNlcnZlXG4gKiBAcGFyYW0gZnVsZmlsbGVkICBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2l0aCB0aGUgZnVsZmlsbGVkIHZhbHVlXG4gKiBAcGFyYW0gcmVqZWN0ZWQgICBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2l0aCB0aGUgcmVqZWN0aW9uIGV4Y2VwdGlvblxuICogQHBhcmFtIHByb2dyZXNzZWQgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG9uIGFueSBwcm9ncmVzcyBub3RpZmljYXRpb25zXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWUgZnJvbSB0aGUgaW52b2tlZCBjYWxsYmFja1xuICovXG5RLndoZW4gPSB3aGVuO1xuZnVuY3Rpb24gd2hlbih2YWx1ZSwgZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3NlZCkge1xuICAgIHJldHVybiBRKHZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzZWQpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuUmVzb2x2ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKCkgeyByZXR1cm4gdmFsdWU7IH0pO1xufTtcblxuUS50aGVuUmVzb2x2ZSA9IGZ1bmN0aW9uIChwcm9taXNlLCB2YWx1ZSkge1xuICAgIHJldHVybiBRKHByb21pc2UpLnRoZW5SZXNvbHZlKHZhbHVlKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnRoZW5SZWplY3QgPSBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAoKSB7IHRocm93IHJlYXNvbjsgfSk7XG59O1xuXG5RLnRoZW5SZWplY3QgPSBmdW5jdGlvbiAocHJvbWlzZSwgcmVhc29uKSB7XG4gICAgcmV0dXJuIFEocHJvbWlzZSkudGhlblJlamVjdChyZWFzb24pO1xufTtcblxuLyoqXG4gKiBJZiBhbiBvYmplY3QgaXMgbm90IGEgcHJvbWlzZSwgaXQgaXMgYXMgXCJuZWFyXCIgYXMgcG9zc2libGUuXG4gKiBJZiBhIHByb21pc2UgaXMgcmVqZWN0ZWQsIGl0IGlzIGFzIFwibmVhclwiIGFzIHBvc3NpYmxlIHRvby5cbiAqIElmIGl04oCZcyBhIGZ1bGZpbGxlZCBwcm9taXNlLCB0aGUgZnVsZmlsbG1lbnQgdmFsdWUgaXMgbmVhcmVyLlxuICogSWYgaXTigJlzIGEgZGVmZXJyZWQgcHJvbWlzZSBhbmQgdGhlIGRlZmVycmVkIGhhcyBiZWVuIHJlc29sdmVkLCB0aGVcbiAqIHJlc29sdXRpb24gaXMgXCJuZWFyZXJcIi5cbiAqIEBwYXJhbSBvYmplY3RcbiAqIEByZXR1cm5zIG1vc3QgcmVzb2x2ZWQgKG5lYXJlc3QpIGZvcm0gb2YgdGhlIG9iamVjdFxuICovXG5cbi8vIFhYWCBzaG91bGQgd2UgcmUtZG8gdGhpcz9cblEubmVhcmVyID0gbmVhcmVyO1xuZnVuY3Rpb24gbmVhcmVyKHZhbHVlKSB7XG4gICAgaWYgKGlzUHJvbWlzZSh2YWx1ZSkpIHtcbiAgICAgICAgdmFyIGluc3BlY3RlZCA9IHZhbHVlLmluc3BlY3QoKTtcbiAgICAgICAgaWYgKGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJmdWxmaWxsZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuIGluc3BlY3RlZC52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbi8qKlxuICogQHJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGEgcHJvbWlzZS5cbiAqIE90aGVyd2lzZSBpdCBpcyBhIGZ1bGZpbGxlZCB2YWx1ZS5cbiAqL1xuUS5pc1Byb21pc2UgPSBpc1Byb21pc2U7XG5mdW5jdGlvbiBpc1Byb21pc2Uob2JqZWN0KSB7XG4gICAgcmV0dXJuIGlzT2JqZWN0KG9iamVjdCkgJiZcbiAgICAgICAgdHlwZW9mIG9iamVjdC5wcm9taXNlRGlzcGF0Y2ggPT09IFwiZnVuY3Rpb25cIiAmJlxuICAgICAgICB0eXBlb2Ygb2JqZWN0Lmluc3BlY3QgPT09IFwiZnVuY3Rpb25cIjtcbn1cblxuUS5pc1Byb21pc2VBbGlrZSA9IGlzUHJvbWlzZUFsaWtlO1xuZnVuY3Rpb24gaXNQcm9taXNlQWxpa2Uob2JqZWN0KSB7XG4gICAgcmV0dXJuIGlzT2JqZWN0KG9iamVjdCkgJiYgdHlwZW9mIG9iamVjdC50aGVuID09PSBcImZ1bmN0aW9uXCI7XG59XG5cbi8qKlxuICogQHJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGEgcGVuZGluZyBwcm9taXNlLCBtZWFuaW5nIG5vdFxuICogZnVsZmlsbGVkIG9yIHJlamVjdGVkLlxuICovXG5RLmlzUGVuZGluZyA9IGlzUGVuZGluZztcbmZ1bmN0aW9uIGlzUGVuZGluZyhvYmplY3QpIHtcbiAgICByZXR1cm4gaXNQcm9taXNlKG9iamVjdCkgJiYgb2JqZWN0Lmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJwZW5kaW5nXCI7XG59XG5cblByb21pc2UucHJvdG90eXBlLmlzUGVuZGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnNwZWN0KCkuc3RhdGUgPT09IFwicGVuZGluZ1wiO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSB2YWx1ZSBvciBmdWxmaWxsZWRcbiAqIHByb21pc2UuXG4gKi9cblEuaXNGdWxmaWxsZWQgPSBpc0Z1bGZpbGxlZDtcbmZ1bmN0aW9uIGlzRnVsZmlsbGVkKG9iamVjdCkge1xuICAgIHJldHVybiAhaXNQcm9taXNlKG9iamVjdCkgfHwgb2JqZWN0Lmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJmdWxmaWxsZWRcIjtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuaXNGdWxmaWxsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zcGVjdCgpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSByZWplY3RlZCBwcm9taXNlLlxuICovXG5RLmlzUmVqZWN0ZWQgPSBpc1JlamVjdGVkO1xuZnVuY3Rpb24gaXNSZWplY3RlZChvYmplY3QpIHtcbiAgICByZXR1cm4gaXNQcm9taXNlKG9iamVjdCkgJiYgb2JqZWN0Lmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5pc1JlamVjdGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiO1xufTtcblxuLy8vLyBCRUdJTiBVTkhBTkRMRUQgUkVKRUNUSU9OIFRSQUNLSU5HXG5cbi8vIFRoaXMgcHJvbWlzZSBsaWJyYXJ5IGNvbnN1bWVzIGV4Y2VwdGlvbnMgdGhyb3duIGluIGhhbmRsZXJzIHNvIHRoZXkgY2FuIGJlXG4vLyBoYW5kbGVkIGJ5IGEgc3Vic2VxdWVudCBwcm9taXNlLiAgVGhlIGV4Y2VwdGlvbnMgZ2V0IGFkZGVkIHRvIHRoaXMgYXJyYXkgd2hlblxuLy8gdGhleSBhcmUgY3JlYXRlZCwgYW5kIHJlbW92ZWQgd2hlbiB0aGV5IGFyZSBoYW5kbGVkLiAgTm90ZSB0aGF0IGluIEVTNiBvclxuLy8gc2hpbW1lZCBlbnZpcm9ubWVudHMsIHRoaXMgd291bGQgbmF0dXJhbGx5IGJlIGEgYFNldGAuXG52YXIgdW5oYW5kbGVkUmVhc29ucyA9IFtdO1xudmFyIHVuaGFuZGxlZFJlamVjdGlvbnMgPSBbXTtcbnZhciB1bmhhbmRsZWRSZWFzb25zRGlzcGxheWVkID0gZmFsc2U7XG52YXIgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gdHJ1ZTtcbmZ1bmN0aW9uIGRpc3BsYXlVbmhhbmRsZWRSZWFzb25zKCkge1xuICAgIGlmIChcbiAgICAgICAgIXVuaGFuZGxlZFJlYXNvbnNEaXNwbGF5ZWQgJiZcbiAgICAgICAgdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICAgICB3aW5kb3cuY29uc29sZVxuICAgICkge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJbUV0gVW5oYW5kbGVkIHJlamVjdGlvbiByZWFzb25zIChzaG91bGQgYmUgZW1wdHkpOlwiLFxuICAgICAgICAgICAgICAgICAgICAgdW5oYW5kbGVkUmVhc29ucyk7XG4gICAgfVxuXG4gICAgdW5oYW5kbGVkUmVhc29uc0Rpc3BsYXllZCA9IHRydWU7XG59XG5cbmZ1bmN0aW9uIGxvZ1VuaGFuZGxlZFJlYXNvbnMoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1bmhhbmRsZWRSZWFzb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByZWFzb24gPSB1bmhhbmRsZWRSZWFzb25zW2ldO1xuICAgICAgICBjb25zb2xlLndhcm4oXCJVbmhhbmRsZWQgcmVqZWN0aW9uIHJlYXNvbjpcIiwgcmVhc29uKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucygpIHtcbiAgICB1bmhhbmRsZWRSZWFzb25zLmxlbmd0aCA9IDA7XG4gICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5sZW5ndGggPSAwO1xuICAgIHVuaGFuZGxlZFJlYXNvbnNEaXNwbGF5ZWQgPSBmYWxzZTtcblxuICAgIGlmICghdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zKSB7XG4gICAgICAgIHRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucyA9IHRydWU7XG5cbiAgICAgICAgLy8gU2hvdyB1bmhhbmRsZWQgcmVqZWN0aW9uIHJlYXNvbnMgaWYgTm9kZSBleGl0cyB3aXRob3V0IGhhbmRsaW5nIGFuXG4gICAgICAgIC8vIG91dHN0YW5kaW5nIHJlamVjdGlvbi4gIChOb3RlIHRoYXQgQnJvd3NlcmlmeSBwcmVzZW50bHkgcHJvZHVjZXMgYVxuICAgICAgICAvLyBgcHJvY2Vzc2AgZ2xvYmFsIHdpdGhvdXQgdGhlIGBFdmVudEVtaXR0ZXJgIGBvbmAgbWV0aG9kLilcbiAgICAgICAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSBcInVuZGVmaW5lZFwiICYmIHByb2Nlc3Mub24pIHtcbiAgICAgICAgICAgIHByb2Nlc3Mub24oXCJleGl0XCIsIGxvZ1VuaGFuZGxlZFJlYXNvbnMpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiB0cmFja1JlamVjdGlvbihwcm9taXNlLCByZWFzb24pIHtcbiAgICBpZiAoIXRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5wdXNoKHByb21pc2UpO1xuICAgIGlmIChyZWFzb24gJiYgdHlwZW9mIHJlYXNvbi5zdGFjayAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnB1c2gocmVhc29uLnN0YWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnB1c2goXCIobm8gc3RhY2spIFwiICsgcmVhc29uKTtcbiAgICB9XG4gICAgZGlzcGxheVVuaGFuZGxlZFJlYXNvbnMoKTtcbn1cblxuZnVuY3Rpb24gdW50cmFja1JlamVjdGlvbihwcm9taXNlKSB7XG4gICAgaWYgKCF0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBhdCA9IGFycmF5X2luZGV4T2YodW5oYW5kbGVkUmVqZWN0aW9ucywgcHJvbWlzZSk7XG4gICAgaWYgKGF0ICE9PSAtMSkge1xuICAgICAgICB1bmhhbmRsZWRSZWplY3Rpb25zLnNwbGljZShhdCwgMSk7XG4gICAgICAgIHVuaGFuZGxlZFJlYXNvbnMuc3BsaWNlKGF0LCAxKTtcbiAgICB9XG59XG5cblEucmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zID0gcmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zO1xuXG5RLmdldFVuaGFuZGxlZFJlYXNvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gTWFrZSBhIGNvcHkgc28gdGhhdCBjb25zdW1lcnMgY2FuJ3QgaW50ZXJmZXJlIHdpdGggb3VyIGludGVybmFsIHN0YXRlLlxuICAgIHJldHVybiB1bmhhbmRsZWRSZWFzb25zLnNsaWNlKCk7XG59O1xuXG5RLnN0b3BVbmhhbmRsZWRSZWplY3Rpb25UcmFja2luZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXNldFVuaGFuZGxlZFJlamVjdGlvbnMoKTtcbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiYgcHJvY2Vzcy5vbikge1xuICAgICAgICBwcm9jZXNzLnJlbW92ZUxpc3RlbmVyKFwiZXhpdFwiLCBsb2dVbmhhbmRsZWRSZWFzb25zKTtcbiAgICB9XG4gICAgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gZmFsc2U7XG59O1xuXG5yZXNldFVuaGFuZGxlZFJlamVjdGlvbnMoKTtcblxuLy8vLyBFTkQgVU5IQU5ETEVEIFJFSkVDVElPTiBUUkFDS0lOR1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSByZWplY3RlZCBwcm9taXNlLlxuICogQHBhcmFtIHJlYXNvbiB2YWx1ZSBkZXNjcmliaW5nIHRoZSBmYWlsdXJlXG4gKi9cblEucmVqZWN0ID0gcmVqZWN0O1xuZnVuY3Rpb24gcmVqZWN0KHJlYXNvbikge1xuICAgIHZhciByZWplY3Rpb24gPSBQcm9taXNlKHtcbiAgICAgICAgXCJ3aGVuXCI6IGZ1bmN0aW9uIChyZWplY3RlZCkge1xuICAgICAgICAgICAgLy8gbm90ZSB0aGF0IHRoZSBlcnJvciBoYXMgYmVlbiBoYW5kbGVkXG4gICAgICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB1bnRyYWNrUmVqZWN0aW9uKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdGVkID8gcmVqZWN0ZWQocmVhc29uKSA6IHRoaXM7XG4gICAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiBmYWxsYmFjaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSwgZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwicmVqZWN0ZWRcIiwgcmVhc29uOiByZWFzb24gfTtcbiAgICB9KTtcblxuICAgIC8vIE5vdGUgdGhhdCB0aGUgcmVhc29uIGhhcyBub3QgYmVlbiBoYW5kbGVkLlxuICAgIHRyYWNrUmVqZWN0aW9uKHJlamVjdGlvbiwgcmVhc29uKTtcblxuICAgIHJldHVybiByZWplY3Rpb247XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGZ1bGZpbGxlZCBwcm9taXNlIGZvciBhbiBpbW1lZGlhdGUgcmVmZXJlbmNlLlxuICogQHBhcmFtIHZhbHVlIGltbWVkaWF0ZSByZWZlcmVuY2VcbiAqL1xuUS5mdWxmaWxsID0gZnVsZmlsbDtcbmZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHtcbiAgICByZXR1cm4gUHJvbWlzZSh7XG4gICAgICAgIFwid2hlblwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVbbmFtZV07XG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uIChuYW1lLCByaHMpIHtcbiAgICAgICAgICAgIHZhbHVlW25hbWVdID0gcmhzO1xuICAgICAgICB9LFxuICAgICAgICBcImRlbGV0ZVwiOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlW25hbWVdO1xuICAgICAgICB9LFxuICAgICAgICBcInBvc3RcIjogZnVuY3Rpb24gKG5hbWUsIGFyZ3MpIHtcbiAgICAgICAgICAgIC8vIE1hcmsgTWlsbGVyIHByb3Bvc2VzIHRoYXQgcG9zdCB3aXRoIG5vIG5hbWUgc2hvdWxkIGFwcGx5IGFcbiAgICAgICAgICAgIC8vIHByb21pc2VkIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKG5hbWUgPT09IG51bGwgfHwgbmFtZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmFwcGx5KHZvaWQgMCwgYXJncyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZVtuYW1lXS5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiYXBwbHlcIjogZnVuY3Rpb24gKHRoaXNwLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuYXBwbHkodGhpc3AsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBcImtleXNcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG9iamVjdF9rZXlzKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0sIHZvaWQgMCwgZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwiZnVsZmlsbGVkXCIsIHZhbHVlOiB2YWx1ZSB9O1xuICAgIH0pO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIHRoZW5hYmxlcyB0byBRIHByb21pc2VzLlxuICogQHBhcmFtIHByb21pc2UgdGhlbmFibGUgcHJvbWlzZVxuICogQHJldHVybnMgYSBRIHByb21pc2VcbiAqL1xuZnVuY3Rpb24gY29lcmNlKHByb21pc2UpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHByb21pc2UudGhlbihkZWZlcnJlZC5yZXNvbHZlLCBkZWZlcnJlZC5yZWplY3QsIGRlZmVycmVkLm5vdGlmeSk7XG4gICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuLyoqXG4gKiBBbm5vdGF0ZXMgYW4gb2JqZWN0IHN1Y2ggdGhhdCBpdCB3aWxsIG5ldmVyIGJlXG4gKiB0cmFuc2ZlcnJlZCBhd2F5IGZyb20gdGhpcyBwcm9jZXNzIG92ZXIgYW55IHByb21pc2VcbiAqIGNvbW11bmljYXRpb24gY2hhbm5lbC5cbiAqIEBwYXJhbSBvYmplY3RcbiAqIEByZXR1cm5zIHByb21pc2UgYSB3cmFwcGluZyBvZiB0aGF0IG9iamVjdCB0aGF0XG4gKiBhZGRpdGlvbmFsbHkgcmVzcG9uZHMgdG8gdGhlIFwiaXNEZWZcIiBtZXNzYWdlXG4gKiB3aXRob3V0IGEgcmVqZWN0aW9uLlxuICovXG5RLm1hc3RlciA9IG1hc3RlcjtcbmZ1bmN0aW9uIG1hc3RlcihvYmplY3QpIHtcbiAgICByZXR1cm4gUHJvbWlzZSh7XG4gICAgICAgIFwiaXNEZWZcIjogZnVuY3Rpb24gKCkge31cbiAgICB9LCBmdW5jdGlvbiBmYWxsYmFjayhvcCwgYXJncykge1xuICAgICAgICByZXR1cm4gZGlzcGF0Y2gob2JqZWN0LCBvcCwgYXJncyk7XG4gICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gUShvYmplY3QpLmluc3BlY3QoKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBTcHJlYWRzIHRoZSB2YWx1ZXMgb2YgYSBwcm9taXNlZCBhcnJheSBvZiBhcmd1bWVudHMgaW50byB0aGVcbiAqIGZ1bGZpbGxtZW50IGNhbGxiYWNrLlxuICogQHBhcmFtIGZ1bGZpbGxlZCBjYWxsYmFjayB0aGF0IHJlY2VpdmVzIHZhcmlhZGljIGFyZ3VtZW50cyBmcm9tIHRoZVxuICogcHJvbWlzZWQgYXJyYXlcbiAqIEBwYXJhbSByZWplY3RlZCBjYWxsYmFjayB0aGF0IHJlY2VpdmVzIHRoZSBleGNlcHRpb24gaWYgdGhlIHByb21pc2VcbiAqIGlzIHJlamVjdGVkLlxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlIG9yIHRocm93biBleGNlcHRpb24gb2ZcbiAqIGVpdGhlciBjYWxsYmFjay5cbiAqL1xuUS5zcHJlYWQgPSBzcHJlYWQ7XG5mdW5jdGlvbiBzcHJlYWQodmFsdWUsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gUSh2YWx1ZSkuc3ByZWFkKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5zcHJlYWQgPSBmdW5jdGlvbiAoZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICAgIHJldHVybiB0aGlzLmFsbCgpLnRoZW4oZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgICAgIHJldHVybiBmdWxmaWxsZWQuYXBwbHkodm9pZCAwLCBhcnJheSk7XG4gICAgfSwgcmVqZWN0ZWQpO1xufTtcblxuLyoqXG4gKiBUaGUgYXN5bmMgZnVuY3Rpb24gaXMgYSBkZWNvcmF0b3IgZm9yIGdlbmVyYXRvciBmdW5jdGlvbnMsIHR1cm5pbmdcbiAqIHRoZW0gaW50byBhc3luY2hyb25vdXMgZ2VuZXJhdG9ycy4gIEFsdGhvdWdoIGdlbmVyYXRvcnMgYXJlIG9ubHkgcGFydFxuICogb2YgdGhlIG5ld2VzdCBFQ01BU2NyaXB0IDYgZHJhZnRzLCB0aGlzIGNvZGUgZG9lcyBub3QgY2F1c2Ugc3ludGF4XG4gKiBlcnJvcnMgaW4gb2xkZXIgZW5naW5lcy4gIFRoaXMgY29kZSBzaG91bGQgY29udGludWUgdG8gd29yayBhbmQgd2lsbFxuICogaW4gZmFjdCBpbXByb3ZlIG92ZXIgdGltZSBhcyB0aGUgbGFuZ3VhZ2UgaW1wcm92ZXMuXG4gKlxuICogRVM2IGdlbmVyYXRvcnMgYXJlIGN1cnJlbnRseSBwYXJ0IG9mIFY4IHZlcnNpb24gMy4xOSB3aXRoIHRoZVxuICogLS1oYXJtb255LWdlbmVyYXRvcnMgcnVudGltZSBmbGFnIGVuYWJsZWQuICBTcGlkZXJNb25rZXkgaGFzIGhhZCB0aGVtXG4gKiBmb3IgbG9uZ2VyLCBidXQgdW5kZXIgYW4gb2xkZXIgUHl0aG9uLWluc3BpcmVkIGZvcm0uICBUaGlzIGZ1bmN0aW9uXG4gKiB3b3JrcyBvbiBib3RoIGtpbmRzIG9mIGdlbmVyYXRvcnMuXG4gKlxuICogRGVjb3JhdGVzIGEgZ2VuZXJhdG9yIGZ1bmN0aW9uIHN1Y2ggdGhhdDpcbiAqICAtIGl0IG1heSB5aWVsZCBwcm9taXNlc1xuICogIC0gZXhlY3V0aW9uIHdpbGwgY29udGludWUgd2hlbiB0aGF0IHByb21pc2UgaXMgZnVsZmlsbGVkXG4gKiAgLSB0aGUgdmFsdWUgb2YgdGhlIHlpZWxkIGV4cHJlc3Npb24gd2lsbCBiZSB0aGUgZnVsZmlsbGVkIHZhbHVlXG4gKiAgLSBpdCByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZSAod2hlbiB0aGUgZ2VuZXJhdG9yXG4gKiAgICBzdG9wcyBpdGVyYXRpbmcpXG4gKiAgLSB0aGUgZGVjb3JhdGVkIGZ1bmN0aW9uIHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXG4gKiAgICBvZiB0aGUgZ2VuZXJhdG9yIG9yIHRoZSBmaXJzdCByZWplY3RlZCBwcm9taXNlIGFtb25nIHRob3NlXG4gKiAgICB5aWVsZGVkLlxuICogIC0gaWYgYW4gZXJyb3IgaXMgdGhyb3duIGluIHRoZSBnZW5lcmF0b3IsIGl0IHByb3BhZ2F0ZXMgdGhyb3VnaFxuICogICAgZXZlcnkgZm9sbG93aW5nIHlpZWxkIHVudGlsIGl0IGlzIGNhdWdodCwgb3IgdW50aWwgaXQgZXNjYXBlc1xuICogICAgdGhlIGdlbmVyYXRvciBmdW5jdGlvbiBhbHRvZ2V0aGVyLCBhbmQgaXMgdHJhbnNsYXRlZCBpbnRvIGFcbiAqICAgIHJlamVjdGlvbiBmb3IgdGhlIHByb21pc2UgcmV0dXJuZWQgYnkgdGhlIGRlY29yYXRlZCBnZW5lcmF0b3IuXG4gKi9cblEuYXN5bmMgPSBhc3luYztcbmZ1bmN0aW9uIGFzeW5jKG1ha2VHZW5lcmF0b3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyB3aGVuIHZlcmIgaXMgXCJzZW5kXCIsIGFyZyBpcyBhIHZhbHVlXG4gICAgICAgIC8vIHdoZW4gdmVyYiBpcyBcInRocm93XCIsIGFyZyBpcyBhbiBleGNlcHRpb25cbiAgICAgICAgZnVuY3Rpb24gY29udGludWVyKHZlcmIsIGFyZykge1xuICAgICAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgICAgIGlmIChoYXNFUzZHZW5lcmF0b3JzKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZ2VuZXJhdG9yW3ZlcmJdKGFyZyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQudmFsdWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdoZW4ocmVzdWx0LnZhbHVlLCBjYWxsYmFjaywgZXJyYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBGSVhNRTogUmVtb3ZlIHRoaXMgY2FzZSB3aGVuIFNNIGRvZXMgRVM2IGdlbmVyYXRvcnMuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZ2VuZXJhdG9yW3ZlcmJdKGFyZyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1N0b3BJdGVyYXRpb24oZXhjZXB0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4Y2VwdGlvbi52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gd2hlbihyZXN1bHQsIGNhbGxiYWNrLCBlcnJiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZ2VuZXJhdG9yID0gbWFrZUdlbmVyYXRvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSBjb250aW51ZXIuYmluZChjb250aW51ZXIsIFwibmV4dFwiKTtcbiAgICAgICAgdmFyIGVycmJhY2sgPSBjb250aW51ZXIuYmluZChjb250aW51ZXIsIFwidGhyb3dcIik7XG4gICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgIH07XG59XG5cbi8qKlxuICogVGhlIHNwYXduIGZ1bmN0aW9uIGlzIGEgc21hbGwgd3JhcHBlciBhcm91bmQgYXN5bmMgdGhhdCBpbW1lZGlhdGVseVxuICogY2FsbHMgdGhlIGdlbmVyYXRvciBhbmQgYWxzbyBlbmRzIHRoZSBwcm9taXNlIGNoYWluLCBzbyB0aGF0IGFueVxuICogdW5oYW5kbGVkIGVycm9ycyBhcmUgdGhyb3duIGluc3RlYWQgb2YgZm9yd2FyZGVkIHRvIHRoZSBlcnJvclxuICogaGFuZGxlci4gVGhpcyBpcyB1c2VmdWwgYmVjYXVzZSBpdCdzIGV4dHJlbWVseSBjb21tb24gdG8gcnVuXG4gKiBnZW5lcmF0b3JzIGF0IHRoZSB0b3AtbGV2ZWwgdG8gd29yayB3aXRoIGxpYnJhcmllcy5cbiAqL1xuUS5zcGF3biA9IHNwYXduO1xuZnVuY3Rpb24gc3Bhd24obWFrZUdlbmVyYXRvcikge1xuICAgIFEuZG9uZShRLmFzeW5jKG1ha2VHZW5lcmF0b3IpKCkpO1xufVxuXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgaW50ZXJmYWNlIG9uY2UgRVM2IGdlbmVyYXRvcnMgYXJlIGluIFNwaWRlck1vbmtleS5cbi8qKlxuICogVGhyb3dzIGEgUmV0dXJuVmFsdWUgZXhjZXB0aW9uIHRvIHN0b3AgYW4gYXN5bmNocm9ub3VzIGdlbmVyYXRvci5cbiAqXG4gKiBUaGlzIGludGVyZmFjZSBpcyBhIHN0b3AtZ2FwIG1lYXN1cmUgdG8gc3VwcG9ydCBnZW5lcmF0b3IgcmV0dXJuXG4gKiB2YWx1ZXMgaW4gb2xkZXIgRmlyZWZveC9TcGlkZXJNb25rZXkuICBJbiBicm93c2VycyB0aGF0IHN1cHBvcnQgRVM2XG4gKiBnZW5lcmF0b3JzIGxpa2UgQ2hyb21pdW0gMjksIGp1c3QgdXNlIFwicmV0dXJuXCIgaW4geW91ciBnZW5lcmF0b3JcbiAqIGZ1bmN0aW9ucy5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgdGhlIHJldHVybiB2YWx1ZSBmb3IgdGhlIHN1cnJvdW5kaW5nIGdlbmVyYXRvclxuICogQHRocm93cyBSZXR1cm5WYWx1ZSBleGNlcHRpb24gd2l0aCB0aGUgdmFsdWUuXG4gKiBAZXhhbXBsZVxuICogLy8gRVM2IHN0eWxlXG4gKiBRLmFzeW5jKGZ1bmN0aW9uKiAoKSB7XG4gKiAgICAgIHZhciBmb28gPSB5aWVsZCBnZXRGb29Qcm9taXNlKCk7XG4gKiAgICAgIHZhciBiYXIgPSB5aWVsZCBnZXRCYXJQcm9taXNlKCk7XG4gKiAgICAgIHJldHVybiBmb28gKyBiYXI7XG4gKiB9KVxuICogLy8gT2xkZXIgU3BpZGVyTW9ua2V5IHN0eWxlXG4gKiBRLmFzeW5jKGZ1bmN0aW9uICgpIHtcbiAqICAgICAgdmFyIGZvbyA9IHlpZWxkIGdldEZvb1Byb21pc2UoKTtcbiAqICAgICAgdmFyIGJhciA9IHlpZWxkIGdldEJhclByb21pc2UoKTtcbiAqICAgICAgUS5yZXR1cm4oZm9vICsgYmFyKTtcbiAqIH0pXG4gKi9cblFbXCJyZXR1cm5cIl0gPSBfcmV0dXJuO1xuZnVuY3Rpb24gX3JldHVybih2YWx1ZSkge1xuICAgIHRocm93IG5ldyBRUmV0dXJuVmFsdWUodmFsdWUpO1xufVxuXG4vKipcbiAqIFRoZSBwcm9taXNlZCBmdW5jdGlvbiBkZWNvcmF0b3IgZW5zdXJlcyB0aGF0IGFueSBwcm9taXNlIGFyZ3VtZW50c1xuICogYXJlIHNldHRsZWQgYW5kIHBhc3NlZCBhcyB2YWx1ZXMgKGB0aGlzYCBpcyBhbHNvIHNldHRsZWQgYW5kIHBhc3NlZFxuICogYXMgYSB2YWx1ZSkuICBJdCB3aWxsIGFsc28gZW5zdXJlIHRoYXQgdGhlIHJlc3VsdCBvZiBhIGZ1bmN0aW9uIGlzXG4gKiBhbHdheXMgYSBwcm9taXNlLlxuICpcbiAqIEBleGFtcGxlXG4gKiB2YXIgYWRkID0gUS5wcm9taXNlZChmdW5jdGlvbiAoYSwgYikge1xuICogICAgIHJldHVybiBhICsgYjtcbiAqIH0pO1xuICogYWRkKFEoYSksIFEoQikpO1xuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBkZWNvcmF0ZVxuICogQHJldHVybnMge2Z1bmN0aW9ufSBhIGZ1bmN0aW9uIHRoYXQgaGFzIGJlZW4gZGVjb3JhdGVkLlxuICovXG5RLnByb21pc2VkID0gcHJvbWlzZWQ7XG5mdW5jdGlvbiBwcm9taXNlZChjYWxsYmFjaykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBzcHJlYWQoW3RoaXMsIGFsbChhcmd1bWVudHMpXSwgZnVuY3Rpb24gKHNlbGYsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBzZW5kcyBhIG1lc3NhZ2UgdG8gYSB2YWx1ZSBpbiBhIGZ1dHVyZSB0dXJuXG4gKiBAcGFyYW0gb2JqZWN0KiB0aGUgcmVjaXBpZW50XG4gKiBAcGFyYW0gb3AgdGhlIG5hbWUgb2YgdGhlIG1lc3NhZ2Ugb3BlcmF0aW9uLCBlLmcuLCBcIndoZW5cIixcbiAqIEBwYXJhbSBhcmdzIGZ1cnRoZXIgYXJndW1lbnRzIHRvIGJlIGZvcndhcmRlZCB0byB0aGUgb3BlcmF0aW9uXG4gKiBAcmV0dXJucyByZXN1bHQge1Byb21pc2V9IGEgcHJvbWlzZSBmb3IgdGhlIHJlc3VsdCBvZiB0aGUgb3BlcmF0aW9uXG4gKi9cblEuZGlzcGF0Y2ggPSBkaXNwYXRjaDtcbmZ1bmN0aW9uIGRpc3BhdGNoKG9iamVjdCwgb3AsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKG9wLCBhcmdzKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuZGlzcGF0Y2ggPSBmdW5jdGlvbiAob3AsIGFyZ3MpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBuZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKGRlZmVycmVkLnJlc29sdmUsIG9wLCBhcmdzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgdmFsdWUgb2YgYSBwcm9wZXJ0eSBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBwcm9wZXJ0eSB0byBnZXRcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHByb3BlcnR5IHZhbHVlXG4gKi9cblEuZ2V0ID0gZnVuY3Rpb24gKG9iamVjdCwga2V5KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImdldFwiLCBba2V5XSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJnZXRcIiwgW2tleV0pO1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIHByb3BlcnR5IGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3Igb2JqZWN0IG9iamVjdFxuICogQHBhcmFtIG5hbWUgICAgICBuYW1lIG9mIHByb3BlcnR5IHRvIHNldFxuICogQHBhcmFtIHZhbHVlICAgICBuZXcgdmFsdWUgb2YgcHJvcGVydHlcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICovXG5RLnNldCA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwic2V0XCIsIFtrZXksIHZhbHVlXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwic2V0XCIsIFtrZXksIHZhbHVlXSk7XG59O1xuXG4vKipcbiAqIERlbGV0ZXMgYSBwcm9wZXJ0eSBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBwcm9wZXJ0eSB0byBkZWxldGVcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICovXG5RLmRlbCA9IC8vIFhYWCBsZWdhY3lcblFbXCJkZWxldGVcIl0gPSBmdW5jdGlvbiAob2JqZWN0LCBrZXkpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwiZGVsZXRlXCIsIFtrZXldKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmRlbCA9IC8vIFhYWCBsZWdhY3lcblByb21pc2UucHJvdG90eXBlW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwiZGVsZXRlXCIsIFtrZXldKTtcbn07XG5cbi8qKlxuICogSW52b2tlcyBhIG1ldGhvZCBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBtZXRob2QgdG8gaW52b2tlXG4gKiBAcGFyYW0gdmFsdWUgICAgIGEgdmFsdWUgdG8gcG9zdCwgdHlwaWNhbGx5IGFuIGFycmF5IG9mXG4gKiAgICAgICAgICAgICAgICAgIGludm9jYXRpb24gYXJndW1lbnRzIGZvciBwcm9taXNlcyB0aGF0XG4gKiAgICAgICAgICAgICAgICAgIGFyZSB1bHRpbWF0ZWx5IGJhY2tlZCB3aXRoIGByZXNvbHZlYCB2YWx1ZXMsXG4gKiAgICAgICAgICAgICAgICAgIGFzIG9wcG9zZWQgdG8gdGhvc2UgYmFja2VkIHdpdGggVVJMc1xuICogICAgICAgICAgICAgICAgICB3aGVyZWluIHRoZSBwb3N0ZWQgdmFsdWUgY2FuIGJlIGFueVxuICogICAgICAgICAgICAgICAgICBKU09OIHNlcmlhbGl6YWJsZSBvYmplY3QuXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuLy8gYm91bmQgbG9jYWxseSBiZWNhdXNlIGl0IGlzIHVzZWQgYnkgb3RoZXIgbWV0aG9kc1xuUS5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUS5wb3N0ID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSwgYXJncykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcmdzXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUHJvbWlzZS5wcm90b3R5cGUucG9zdCA9IGZ1bmN0aW9uIChuYW1lLCBhcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcmdzXSk7XG59O1xuXG4vKipcbiAqIEludm9rZXMgYSBtZXRob2QgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgbWV0aG9kIHRvIGludm9rZVxuICogQHBhcmFtIC4uLmFyZ3MgICBhcnJheSBvZiBpbnZvY2F0aW9uIGFyZ3VtZW50c1xuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXG4gKi9cblEuc2VuZCA9IC8vIFhYWCBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIHBhcmxhbmNlXG5RLm1jYWxsID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblEuaW52b2tlID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcnJheV9zbGljZShhcmd1bWVudHMsIDIpXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5zZW5kID0gLy8gWFhYIE1hcmsgTWlsbGVyJ3MgcHJvcG9zZWQgcGFybGFuY2VcblByb21pc2UucHJvdG90eXBlLm1jYWxsID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblByb21pc2UucHJvdG90eXBlLmludm9rZSA9IGZ1bmN0aW9uIChuYW1lIC8qLi4uYXJncyovKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpXSk7XG59O1xuXG4vKipcbiAqIEFwcGxpZXMgdGhlIHByb21pc2VkIGZ1bmN0aW9uIGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IGZ1bmN0aW9uXG4gKiBAcGFyYW0gYXJncyAgICAgIGFycmF5IG9mIGFwcGxpY2F0aW9uIGFyZ3VtZW50c1xuICovXG5RLmZhcHBseSA9IGZ1bmN0aW9uIChvYmplY3QsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwiYXBwbHlcIiwgW3ZvaWQgMCwgYXJnc10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmFwcGx5ID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFyZ3NdKTtcbn07XG5cbi8qKlxuICogQ2FsbHMgdGhlIHByb21pc2VkIGZ1bmN0aW9uIGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IGZ1bmN0aW9uXG4gKiBAcGFyYW0gLi4uYXJncyAgIGFycmF5IG9mIGFwcGxpY2F0aW9uIGFyZ3VtZW50c1xuICovXG5RW1widHJ5XCJdID1cblEuZmNhbGwgPSBmdW5jdGlvbiAob2JqZWN0IC8qIC4uLmFyZ3MqLykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJhcHBseVwiLCBbdm9pZCAwLCBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5mY2FsbCA9IGZ1bmN0aW9uICgvKi4uLmFyZ3MqLykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwiYXBwbHlcIiwgW3ZvaWQgMCwgYXJyYXlfc2xpY2UoYXJndW1lbnRzKV0pO1xufTtcblxuLyoqXG4gKiBCaW5kcyB0aGUgcHJvbWlzZWQgZnVuY3Rpb24sIHRyYW5zZm9ybWluZyByZXR1cm4gdmFsdWVzIGludG8gYSBmdWxmaWxsZWRcbiAqIHByb21pc2UgYW5kIHRocm93biBlcnJvcnMgaW50byBhIHJlamVjdGVkIG9uZS5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgZnVuY3Rpb25cbiAqIEBwYXJhbSAuLi5hcmdzICAgYXJyYXkgb2YgYXBwbGljYXRpb24gYXJndW1lbnRzXG4gKi9cblEuZmJpbmQgPSBmdW5jdGlvbiAob2JqZWN0IC8qLi4uYXJncyovKSB7XG4gICAgdmFyIHByb21pc2UgPSBRKG9iamVjdCk7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBmdW5jdGlvbiBmYm91bmQoKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlLmRpc3BhdGNoKFwiYXBwbHlcIiwgW1xuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIGFyZ3MuY29uY2F0KGFycmF5X3NsaWNlKGFyZ3VtZW50cykpXG4gICAgICAgIF0pO1xuICAgIH07XG59O1xuUHJvbWlzZS5wcm90b3R5cGUuZmJpbmQgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgcHJvbWlzZSA9IHRoaXM7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMpO1xuICAgIHJldHVybiBmdW5jdGlvbiBmYm91bmQoKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlLmRpc3BhdGNoKFwiYXBwbHlcIiwgW1xuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIGFyZ3MuY29uY2F0KGFycmF5X3NsaWNlKGFyZ3VtZW50cykpXG4gICAgICAgIF0pO1xuICAgIH07XG59O1xuXG4vKipcbiAqIFJlcXVlc3RzIHRoZSBuYW1lcyBvZiB0aGUgb3duZWQgcHJvcGVydGllcyBvZiBhIHByb21pc2VkXG4gKiBvYmplY3QgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSBrZXlzIG9mIHRoZSBldmVudHVhbGx5IHNldHRsZWQgb2JqZWN0XG4gKi9cblEua2V5cyA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwia2V5c1wiLCBbXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwia2V5c1wiLCBbXSk7XG59O1xuXG4vKipcbiAqIFR1cm5zIGFuIGFycmF5IG9mIHByb21pc2VzIGludG8gYSBwcm9taXNlIGZvciBhbiBhcnJheS4gIElmIGFueSBvZlxuICogdGhlIHByb21pc2VzIGdldHMgcmVqZWN0ZWQsIHRoZSB3aG9sZSBhcnJheSBpcyByZWplY3RlZCBpbW1lZGlhdGVseS5cbiAqIEBwYXJhbSB7QXJyYXkqfSBhbiBhcnJheSAob3IgcHJvbWlzZSBmb3IgYW4gYXJyYXkpIG9mIHZhbHVlcyAob3JcbiAqIHByb21pc2VzIGZvciB2YWx1ZXMpXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIGFuIGFycmF5IG9mIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlc1xuICovXG4vLyBCeSBNYXJrIE1pbGxlclxuLy8gaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9c3RyYXdtYW46Y29uY3VycmVuY3kmcmV2PTEzMDg3NzY1MjEjYWxsZnVsZmlsbGVkXG5RLmFsbCA9IGFsbDtcbmZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICAgIHJldHVybiB3aGVuKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZXMpIHtcbiAgICAgICAgdmFyIGNvdW50RG93biA9IDA7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgICAgIGFycmF5X3JlZHVjZShwcm9taXNlcywgZnVuY3Rpb24gKHVuZGVmaW5lZCwgcHJvbWlzZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBzbmFwc2hvdDtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBpc1Byb21pc2UocHJvbWlzZSkgJiZcbiAgICAgICAgICAgICAgICAoc25hcHNob3QgPSBwcm9taXNlLmluc3BlY3QoKSkuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHByb21pc2VzW2luZGV4XSA9IHNuYXBzaG90LnZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICArK2NvdW50RG93bjtcbiAgICAgICAgICAgICAgICB3aGVuKFxuICAgICAgICAgICAgICAgICAgICBwcm9taXNlLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzW2luZGV4XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKC0tY291bnREb3duID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShwcm9taXNlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkoeyBpbmRleDogaW5kZXgsIHZhbHVlOiBwcm9ncmVzcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHZvaWQgMCk7XG4gICAgICAgIGlmIChjb3VudERvd24gPT09IDApIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocHJvbWlzZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0pO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5hbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGFsbCh0aGlzKTtcbn07XG5cbi8qKlxuICogV2FpdHMgZm9yIGFsbCBwcm9taXNlcyB0byBiZSBzZXR0bGVkLCBlaXRoZXIgZnVsZmlsbGVkIG9yXG4gKiByZWplY3RlZC4gIFRoaXMgaXMgZGlzdGluY3QgZnJvbSBgYWxsYCBzaW5jZSB0aGF0IHdvdWxkIHN0b3BcbiAqIHdhaXRpbmcgYXQgdGhlIGZpcnN0IHJlamVjdGlvbi4gIFRoZSBwcm9taXNlIHJldHVybmVkIGJ5XG4gKiBgYWxsUmVzb2x2ZWRgIHdpbGwgbmV2ZXIgYmUgcmVqZWN0ZWQuXG4gKiBAcGFyYW0gcHJvbWlzZXMgYSBwcm9taXNlIGZvciBhbiBhcnJheSAob3IgYW4gYXJyYXkpIG9mIHByb21pc2VzXG4gKiAob3IgdmFsdWVzKVxuICogQHJldHVybiBhIHByb21pc2UgZm9yIGFuIGFycmF5IG9mIHByb21pc2VzXG4gKi9cblEuYWxsUmVzb2x2ZWQgPSBkZXByZWNhdGUoYWxsUmVzb2x2ZWQsIFwiYWxsUmVzb2x2ZWRcIiwgXCJhbGxTZXR0bGVkXCIpO1xuZnVuY3Rpb24gYWxsUmVzb2x2ZWQocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gd2hlbihwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgICAgIHByb21pc2VzID0gYXJyYXlfbWFwKHByb21pc2VzLCBRKTtcbiAgICAgICAgcmV0dXJuIHdoZW4oYWxsKGFycmF5X21hcChwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB3aGVuKHByb21pc2UsIG5vb3AsIG5vb3ApO1xuICAgICAgICB9KSksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlcztcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cblByb21pc2UucHJvdG90eXBlLmFsbFJlc29sdmVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBhbGxSZXNvbHZlZCh0aGlzKTtcbn07XG5cbi8qKlxuICogQHNlZSBQcm9taXNlI2FsbFNldHRsZWRcbiAqL1xuUS5hbGxTZXR0bGVkID0gYWxsU2V0dGxlZDtcbmZ1bmN0aW9uIGFsbFNldHRsZWQocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gUShwcm9taXNlcykuYWxsU2V0dGxlZCgpO1xufVxuXG4vKipcbiAqIFR1cm5zIGFuIGFycmF5IG9mIHByb21pc2VzIGludG8gYSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiB0aGVpciBzdGF0ZXMgKGFzXG4gKiByZXR1cm5lZCBieSBgaW5zcGVjdGApIHdoZW4gdGhleSBoYXZlIGFsbCBzZXR0bGVkLlxuICogQHBhcmFtIHtBcnJheVtBbnkqXX0gdmFsdWVzIGFuIGFycmF5IChvciBwcm9taXNlIGZvciBhbiBhcnJheSkgb2YgdmFsdWVzIChvclxuICogcHJvbWlzZXMgZm9yIHZhbHVlcylcbiAqIEByZXR1cm5zIHtBcnJheVtTdGF0ZV19IGFuIGFycmF5IG9mIHN0YXRlcyBmb3IgdGhlIHJlc3BlY3RpdmUgdmFsdWVzLlxuICovXG5Qcm9taXNlLnByb3RvdHlwZS5hbGxTZXR0bGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgICAgIHJldHVybiBhbGwoYXJyYXlfbWFwKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgICAgICAgICAgcHJvbWlzZSA9IFEocHJvbWlzZSk7XG4gICAgICAgICAgICBmdW5jdGlvbiByZWdhcmRsZXNzKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlLmluc3BlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlLnRoZW4ocmVnYXJkbGVzcywgcmVnYXJkbGVzcyk7XG4gICAgICAgIH0pKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQ2FwdHVyZXMgdGhlIGZhaWx1cmUgb2YgYSBwcm9taXNlLCBnaXZpbmcgYW4gb3BvcnR1bml0eSB0byByZWNvdmVyXG4gKiB3aXRoIGEgY2FsbGJhY2suICBJZiB0aGUgZ2l2ZW4gcHJvbWlzZSBpcyBmdWxmaWxsZWQsIHRoZSByZXR1cm5lZFxuICogcHJvbWlzZSBpcyBmdWxmaWxsZWQuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2UgZm9yIHNvbWV0aGluZ1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgdG8gZnVsZmlsbCB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpZiB0aGVcbiAqIGdpdmVuIHByb21pc2UgaXMgcmVqZWN0ZWRcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgY2FsbGJhY2tcbiAqL1xuUS5mYWlsID0gLy8gWFhYIGxlZ2FjeVxuUVtcImNhdGNoXCJdID0gZnVuY3Rpb24gKG9iamVjdCwgcmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLnRoZW4odm9pZCAwLCByZWplY3RlZCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5mYWlsID0gLy8gWFhYIGxlZ2FjeVxuUHJvbWlzZS5wcm90b3R5cGVbXCJjYXRjaFwiXSA9IGZ1bmN0aW9uIChyZWplY3RlZCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4odm9pZCAwLCByZWplY3RlZCk7XG59O1xuXG4vKipcbiAqIEF0dGFjaGVzIGEgbGlzdGVuZXIgdGhhdCBjYW4gcmVzcG9uZCB0byBwcm9ncmVzcyBub3RpZmljYXRpb25zIGZyb20gYVxuICogcHJvbWlzZSdzIG9yaWdpbmF0aW5nIGRlZmVycmVkLiBUaGlzIGxpc3RlbmVyIHJlY2VpdmVzIHRoZSBleGFjdCBhcmd1bWVudHNcbiAqIHBhc3NlZCB0byBgYGRlZmVycmVkLm5vdGlmeWBgLlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlIGZvciBzb21ldGhpbmdcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHRvIHJlY2VpdmUgYW55IHByb2dyZXNzIG5vdGlmaWNhdGlvbnNcbiAqIEByZXR1cm5zIHRoZSBnaXZlbiBwcm9taXNlLCB1bmNoYW5nZWRcbiAqL1xuUS5wcm9ncmVzcyA9IHByb2dyZXNzO1xuZnVuY3Rpb24gcHJvZ3Jlc3Mob2JqZWN0LCBwcm9ncmVzc2VkKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS50aGVuKHZvaWQgMCwgdm9pZCAwLCBwcm9ncmVzc2VkKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUucHJvZ3Jlc3MgPSBmdW5jdGlvbiAocHJvZ3Jlc3NlZCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4odm9pZCAwLCB2b2lkIDAsIHByb2dyZXNzZWQpO1xufTtcblxuLyoqXG4gKiBQcm92aWRlcyBhbiBvcHBvcnR1bml0eSB0byBvYnNlcnZlIHRoZSBzZXR0bGluZyBvZiBhIHByb21pc2UsXG4gKiByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIHByb21pc2UgaXMgZnVsZmlsbGVkIG9yIHJlamVjdGVkLiAgRm9yd2FyZHNcbiAqIHRoZSByZXNvbHV0aW9uIHRvIHRoZSByZXR1cm5lZCBwcm9taXNlIHdoZW4gdGhlIGNhbGxiYWNrIGlzIGRvbmUuXG4gKiBUaGUgY2FsbGJhY2sgY2FuIHJldHVybiBhIHByb21pc2UgdG8gZGVmZXIgY29tcGxldGlvbi5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgdG8gb2JzZXJ2ZSB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW5cbiAqIHByb21pc2UsIHRha2VzIG5vIGFyZ3VtZW50cy5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2Ugd2hlblxuICogYGBmaW5gYCBpcyBkb25lLlxuICovXG5RLmZpbiA9IC8vIFhYWCBsZWdhY3lcblFbXCJmaW5hbGx5XCJdID0gZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gUShvYmplY3QpW1wiZmluYWxseVwiXShjYWxsYmFjayk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5maW4gPSAvLyBYWFggbGVnYWN5XG5Qcm9taXNlLnByb3RvdHlwZVtcImZpbmFsbHlcIl0gPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9IFEoY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5mY2FsbCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9KTtcbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIFRPRE8gYXR0ZW1wdCB0byByZWN5Y2xlIHRoZSByZWplY3Rpb24gd2l0aCBcInRoaXNcIi5cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmZjYWxsKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUZXJtaW5hdGVzIGEgY2hhaW4gb2YgcHJvbWlzZXMsIGZvcmNpbmcgcmVqZWN0aW9ucyB0byBiZVxuICogdGhyb3duIGFzIGV4Y2VwdGlvbnMuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2UgYXQgdGhlIGVuZCBvZiBhIGNoYWluIG9mIHByb21pc2VzXG4gKiBAcmV0dXJucyBub3RoaW5nXG4gKi9cblEuZG9uZSA9IGZ1bmN0aW9uIChvYmplY3QsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kb25lKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmRvbmUgPSBmdW5jdGlvbiAoZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3MpIHtcbiAgICB2YXIgb25VbmhhbmRsZWRFcnJvciA9IGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAvLyBmb3J3YXJkIHRvIGEgZnV0dXJlIHR1cm4gc28gdGhhdCBgYHdoZW5gYFxuICAgICAgICAvLyBkb2VzIG5vdCBjYXRjaCBpdCBhbmQgdHVybiBpdCBpbnRvIGEgcmVqZWN0aW9uLlxuICAgICAgICBuZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBtYWtlU3RhY2tUcmFjZUxvbmcoZXJyb3IsIHByb21pc2UpO1xuICAgICAgICAgICAgaWYgKFEub25lcnJvcikge1xuICAgICAgICAgICAgICAgIFEub25lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gQXZvaWQgdW5uZWNlc3NhcnkgYG5leHRUaWNrYGluZyB2aWEgYW4gdW5uZWNlc3NhcnkgYHdoZW5gLlxuICAgIHZhciBwcm9taXNlID0gZnVsZmlsbGVkIHx8IHJlamVjdGVkIHx8IHByb2dyZXNzID9cbiAgICAgICAgdGhpcy50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSA6XG4gICAgICAgIHRoaXM7XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgcHJvY2VzcyAmJiBwcm9jZXNzLmRvbWFpbikge1xuICAgICAgICBvblVuaGFuZGxlZEVycm9yID0gcHJvY2Vzcy5kb21haW4uYmluZChvblVuaGFuZGxlZEVycm9yKTtcbiAgICB9XG5cbiAgICBwcm9taXNlLnRoZW4odm9pZCAwLCBvblVuaGFuZGxlZEVycm9yKTtcbn07XG5cbi8qKlxuICogQ2F1c2VzIGEgcHJvbWlzZSB0byBiZSByZWplY3RlZCBpZiBpdCBkb2VzIG5vdCBnZXQgZnVsZmlsbGVkIGJlZm9yZVxuICogc29tZSBtaWxsaXNlY29uZHMgdGltZSBvdXQuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBtaWxsaXNlY29uZHMgdGltZW91dFxuICogQHBhcmFtIHtTdHJpbmd9IGN1c3RvbSBlcnJvciBtZXNzYWdlIChvcHRpb25hbClcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2UgaWYgaXQgaXNcbiAqIGZ1bGZpbGxlZCBiZWZvcmUgdGhlIHRpbWVvdXQsIG90aGVyd2lzZSByZWplY3RlZC5cbiAqL1xuUS50aW1lb3V0ID0gZnVuY3Rpb24gKG9iamVjdCwgbXMsIG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLnRpbWVvdXQobXMsIG1lc3NhZ2UpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uIChtcywgbWVzc2FnZSkge1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdmFyIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QobmV3IEVycm9yKG1lc3NhZ2UgfHwgXCJUaW1lZCBvdXQgYWZ0ZXIgXCIgKyBtcyArIFwiIG1zXCIpKTtcbiAgICB9LCBtcyk7XG5cbiAgICB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHZhbHVlKTtcbiAgICB9LCBmdW5jdGlvbiAoZXhjZXB0aW9uKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXhjZXB0aW9uKTtcbiAgICB9LCBkZWZlcnJlZC5ub3RpZnkpO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgZ2l2ZW4gdmFsdWUgKG9yIHByb21pc2VkIHZhbHVlKSwgc29tZVxuICogbWlsbGlzZWNvbmRzIGFmdGVyIGl0IHJlc29sdmVkLiBQYXNzZXMgcmVqZWN0aW9ucyBpbW1lZGlhdGVseS5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZVxuICogQHBhcmFtIHtOdW1iZXJ9IG1pbGxpc2Vjb25kc1xuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW4gcHJvbWlzZSBhZnRlciBtaWxsaXNlY29uZHNcbiAqIHRpbWUgaGFzIGVsYXBzZWQgc2luY2UgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2UuXG4gKiBJZiB0aGUgZ2l2ZW4gcHJvbWlzZSByZWplY3RzLCB0aGF0IGlzIHBhc3NlZCBpbW1lZGlhdGVseS5cbiAqL1xuUS5kZWxheSA9IGZ1bmN0aW9uIChvYmplY3QsIHRpbWVvdXQpIHtcbiAgICBpZiAodGltZW91dCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHRpbWVvdXQgPSBvYmplY3Q7XG4gICAgICAgIG9iamVjdCA9IHZvaWQgMDtcbiAgICB9XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kZWxheSh0aW1lb3V0KTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmRlbGF5ID0gZnVuY3Rpb24gKHRpbWVvdXQpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUodmFsdWUpO1xuICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFBhc3NlcyBhIGNvbnRpbnVhdGlvbiB0byBhIE5vZGUgZnVuY3Rpb24sIHdoaWNoIGlzIGNhbGxlZCB3aXRoIHRoZSBnaXZlblxuICogYXJndW1lbnRzIHByb3ZpZGVkIGFzIGFuIGFycmF5LCBhbmQgcmV0dXJucyBhIHByb21pc2UuXG4gKlxuICogICAgICBRLm5mYXBwbHkoRlMucmVhZEZpbGUsIFtfX2ZpbGVuYW1lXSlcbiAqICAgICAgLnRoZW4oZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAqICAgICAgfSlcbiAqXG4gKi9cblEubmZhcHBseSA9IGZ1bmN0aW9uIChjYWxsYmFjaywgYXJncykge1xuICAgIHJldHVybiBRKGNhbGxiYWNrKS5uZmFwcGx5KGFyZ3MpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubmZhcHBseSA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmdzKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgdGhpcy5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogUGFzc2VzIGEgY29udGludWF0aW9uIHRvIGEgTm9kZSBmdW5jdGlvbiwgd2hpY2ggaXMgY2FsbGVkIHdpdGggdGhlIGdpdmVuXG4gKiBhcmd1bWVudHMgcHJvdmlkZWQgaW5kaXZpZHVhbGx5LCBhbmQgcmV0dXJucyBhIHByb21pc2UuXG4gKiBAZXhhbXBsZVxuICogUS5uZmNhbGwoRlMucmVhZEZpbGUsIF9fZmlsZW5hbWUpXG4gKiAudGhlbihmdW5jdGlvbiAoY29udGVudCkge1xuICogfSlcbiAqXG4gKi9cblEubmZjYWxsID0gZnVuY3Rpb24gKGNhbGxiYWNrIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBRKGNhbGxiYWNrKS5uZmFwcGx5KGFyZ3MpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubmZjYWxsID0gZnVuY3Rpb24gKC8qLi4uYXJncyovKSB7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICB0aGlzLmZhcHBseShub2RlQXJncykuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBXcmFwcyBhIE5vZGVKUyBjb250aW51YXRpb24gcGFzc2luZyBmdW5jdGlvbiBhbmQgcmV0dXJucyBhbiBlcXVpdmFsZW50XG4gKiB2ZXJzaW9uIHRoYXQgcmV0dXJucyBhIHByb21pc2UuXG4gKiBAZXhhbXBsZVxuICogUS5uZmJpbmQoRlMucmVhZEZpbGUsIF9fZmlsZW5hbWUpKFwidXRmLThcIilcbiAqIC50aGVuKGNvbnNvbGUubG9nKVxuICogLmRvbmUoKVxuICovXG5RLm5mYmluZCA9XG5RLmRlbm9kZWlmeSA9IGZ1bmN0aW9uIChjYWxsYmFjayAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBiYXNlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG5vZGVBcmdzID0gYmFzZUFyZ3MuY29uY2F0KGFycmF5X3NsaWNlKGFyZ3VtZW50cykpO1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgICAgIFEoY2FsbGJhY2spLmZhcHBseShub2RlQXJncykuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubmZiaW5kID1cblByb21pc2UucHJvdG90eXBlLmRlbm9kZWlmeSA9IGZ1bmN0aW9uICgvKi4uLmFyZ3MqLykge1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG4gICAgcmV0dXJuIFEuZGVub2RlaWZ5LmFwcGx5KHZvaWQgMCwgYXJncyk7XG59O1xuXG5RLm5iaW5kID0gZnVuY3Rpb24gKGNhbGxiYWNrLCB0aGlzcCAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBiYXNlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG5vZGVBcmdzID0gYmFzZUFyZ3MuY29uY2F0KGFycmF5X3NsaWNlKGFyZ3VtZW50cykpO1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgICAgIGZ1bmN0aW9uIGJvdW5kKCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHRoaXNwLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgICAgIFEoYm91bmQpLmZhcHBseShub2RlQXJncykuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubmJpbmQgPSBmdW5jdGlvbiAoLyp0aGlzcCwgLi4uYXJncyovKSB7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDApO1xuICAgIGFyZ3MudW5zaGlmdCh0aGlzKTtcbiAgICByZXR1cm4gUS5uYmluZC5hcHBseSh2b2lkIDAsIGFyZ3MpO1xufTtcblxuLyoqXG4gKiBDYWxscyBhIG1ldGhvZCBvZiBhIE5vZGUtc3R5bGUgb2JqZWN0IHRoYXQgYWNjZXB0cyBhIE5vZGUtc3R5bGVcbiAqIGNhbGxiYWNrIHdpdGggYSBnaXZlbiBhcnJheSBvZiBhcmd1bWVudHMsIHBsdXMgYSBwcm92aWRlZCBjYWxsYmFjay5cbiAqIEBwYXJhbSBvYmplY3QgYW4gb2JqZWN0IHRoYXQgaGFzIHRoZSBuYW1lZCBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIG1ldGhvZCBvZiBvYmplY3RcbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3MgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZDsgdGhlIGNhbGxiYWNrXG4gKiB3aWxsIGJlIHByb3ZpZGVkIGJ5IFEgYW5kIGFwcGVuZGVkIHRvIHRoZXNlIGFyZ3VtZW50cy5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9yIGVycm9yXG4gKi9cblEubm1hcHBseSA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5RLm5wb3N0ID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSwgYXJncykge1xuICAgIHJldHVybiBRKG9iamVjdCkubnBvc3QobmFtZSwgYXJncyk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5ubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblByb21pc2UucHJvdG90eXBlLm5wb3N0ID0gZnVuY3Rpb24gKG5hbWUsIGFyZ3MpIHtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmdzIHx8IFtdKTtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgbm9kZUFyZ3NdKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIENhbGxzIGEgbWV0aG9kIG9mIGEgTm9kZS1zdHlsZSBvYmplY3QgdGhhdCBhY2NlcHRzIGEgTm9kZS1zdHlsZVxuICogY2FsbGJhY2ssIGZvcndhcmRpbmcgdGhlIGdpdmVuIHZhcmlhZGljIGFyZ3VtZW50cywgcGx1cyBhIHByb3ZpZGVkXG4gKiBjYWxsYmFjayBhcmd1bWVudC5cbiAqIEBwYXJhbSBvYmplY3QgYW4gb2JqZWN0IHRoYXQgaGFzIHRoZSBuYW1lZCBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIG1ldGhvZCBvZiBvYmplY3RcbiAqIEBwYXJhbSAuLi5hcmdzIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBtZXRob2Q7IHRoZSBjYWxsYmFjayB3aWxsXG4gKiBiZSBwcm92aWRlZCBieSBRIGFuZCBhcHBlbmRlZCB0byB0aGVzZSBhcmd1bWVudHMuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSB2YWx1ZSBvciBlcnJvclxuICovXG5RLm5zZW5kID0gLy8gWFhYIEJhc2VkIG9uIE1hcmsgTWlsbGVyJ3MgcHJvcG9zZWQgXCJzZW5kXCJcblEubm1jYWxsID0gLy8gWFhYIEJhc2VkIG9uIFwiUmVkc2FuZHJvJ3NcIiBwcm9wb3NhbFxuUS5uaW52b2tlID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMik7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgbm9kZUFyZ3NdKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uc2VuZCA9IC8vIFhYWCBCYXNlZCBvbiBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIFwic2VuZFwiXG5Qcm9taXNlLnByb3RvdHlwZS5ubWNhbGwgPSAvLyBYWFggQmFzZWQgb24gXCJSZWRzYW5kcm8nc1wiIHByb3Bvc2FsXG5Qcm9taXNlLnByb3RvdHlwZS5uaW52b2tlID0gZnVuY3Rpb24gKG5hbWUgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBub2RlQXJnc10pLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogSWYgYSBmdW5jdGlvbiB3b3VsZCBsaWtlIHRvIHN1cHBvcnQgYm90aCBOb2RlIGNvbnRpbnVhdGlvbi1wYXNzaW5nLXN0eWxlIGFuZFxuICogcHJvbWlzZS1yZXR1cm5pbmctc3R5bGUsIGl0IGNhbiBlbmQgaXRzIGludGVybmFsIHByb21pc2UgY2hhaW4gd2l0aFxuICogYG5vZGVpZnkobm9kZWJhY2spYCwgZm9yd2FyZGluZyB0aGUgb3B0aW9uYWwgbm9kZWJhY2sgYXJndW1lbnQuICBJZiB0aGUgdXNlclxuICogZWxlY3RzIHRvIHVzZSBhIG5vZGViYWNrLCB0aGUgcmVzdWx0IHdpbGwgYmUgc2VudCB0aGVyZS4gIElmIHRoZXkgZG8gbm90XG4gKiBwYXNzIGEgbm9kZWJhY2ssIHRoZXkgd2lsbCByZWNlaXZlIHRoZSByZXN1bHQgcHJvbWlzZS5cbiAqIEBwYXJhbSBvYmplY3QgYSByZXN1bHQgKG9yIGEgcHJvbWlzZSBmb3IgYSByZXN1bHQpXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBub2RlYmFjayBhIE5vZGUuanMtc3R5bGUgY2FsbGJhY2tcbiAqIEByZXR1cm5zIGVpdGhlciB0aGUgcHJvbWlzZSBvciBub3RoaW5nXG4gKi9cblEubm9kZWlmeSA9IG5vZGVpZnk7XG5mdW5jdGlvbiBub2RlaWZ5KG9iamVjdCwgbm9kZWJhY2spIHtcbiAgICByZXR1cm4gUShvYmplY3QpLm5vZGVpZnkobm9kZWJhY2spO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5ub2RlaWZ5ID0gZnVuY3Rpb24gKG5vZGViYWNrKSB7XG4gICAgaWYgKG5vZGViYWNrKSB7XG4gICAgICAgIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIG5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBub2RlYmFjayhudWxsLCB2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBuZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbm9kZWJhY2soZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn07XG5cbi8vIEFsbCBjb2RlIGJlZm9yZSB0aGlzIHBvaW50IHdpbGwgYmUgZmlsdGVyZWQgZnJvbSBzdGFjayB0cmFjZXMuXG52YXIgcUVuZGluZ0xpbmUgPSBjYXB0dXJlTGluZSgpO1xuXG5yZXR1cm4gUTtcblxufSk7XG4iLCIvKipcbiAqIHFzdGFydC5qcyAtIERPTSByZWFkeSBwcm9taXNpZmllZCB3aXRoIFFcbiAqL1xuXG4oZnVuY3Rpb24gKGRlZmluaXRpb24pIHtcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBkZWZpbml0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgUXN0YXJ0ID0gZGVmaW5pdGlvbigpO1xuICAgIH1cblxufSkoZnVuY3Rpb24gKCkge1xuICAgIHZhciBRID0gd2luZG93LlEgfHwgcmVxdWlyZSgncScpLFxuICAgICAgICBkID0gUS5kZWZlcigpLFxuICAgICAgICBzdWNjZXNzZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgZXJyb3JmKTtcbiAgICAgICAgICAgIGQucmVzb2x2ZSh3aW5kb3cuZG9jdW1lbnQpO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcmYgPSBmdW5jdGlvbiAoZXJyKSB7IGQucmVqZWN0KGVycik7IH07XG5cbiAgICB3aW5kb3cuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInJlYWR5c3RhdGVjaGFuZ2VcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PSBcImNvbXBsZXRlXCIpIHN1Y2Nlc3NmKCk7XG4gICAgfSwgZmFsc2UpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgZXJyb3JmLCBmYWxzZSk7XG4gICAgcmV0dXJuIGQucHJvbWlzZTtcbn0pO1xuIl19
;