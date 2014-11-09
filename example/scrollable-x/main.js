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
            scrollX: true, scrollY: false, mouseWheel: true
        }),
        backBtn = new MButton.Touchend({
            el : document.getElementById('back'),
            f : function () {
                window.location = '../index.html';
            }
        }),
        btn1 = new MButton.ScrollableX.Touchend({
            tolerance: 10,
            el : document.getElementById('btn1'),
            f : function () {
                h1.style.color = 'rgb(219, 96, 96)';
            }
        }),
        btn2 = new MButton.ScrollableX.Touchend({
            tolerance: 10,
            el : document.getElementById('btn2'),
            f : function () {
                 h1.style.color = 'rgb(77, 158, 77)';
            }
        }),
        btn3 = new MButton.ScrollableX.Touchend({
            tolerance: 10,
            el : document.getElementById('btn3'),
            f : function () {
                h1.style.color = 'rgb(77, 136, 182)';
            }
        });
}

qstart.then(main).done();

},{"../../lib/index.js":3,"iscroll":20,"q":21,"qstart":23}],2:[function(require,module,exports){
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

var lock = false;

var Button = function Button (options) {
    options = options || {};

    /* the callback function */
    this.f = null;
    /* the dom element representing the button */
    this.el = null;

    /* the state of the button */
    this.binded = false;
    this.active = false;
    this.monotouchable = false;

    /* default active css class*/
    this.activeCls = 'active';

    if(typeof options.activeCls === 'string') this.activeCls = options.activeCls;
    if(options.el instanceof HTMLElement) this.el = options.el;
    if(typeof options.f === 'function') this.f = options.f;
    if(options.monotouchable) this.monotouchable = options.monotouchable;
    if(options.autobind !== false) this.bind();
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

Button.prototype._addCls = function () {
    if (!this.el.classList.contains(this.activeCls))
        this.el.classList.add(this.activeCls);
};

Button.prototype._removeCls = function () {
    if (this.el.classList.contains(this.activeCls))
        this.el.classList.remove(this.activeCls);
};

Button.prototype.setActive = function (active) {
    if (active) this._addCls();
    else this._removeCls();
    this.active = active;
    return this;
};

Button.prototype.lock = function () {
    if(this.monotouchable) lock = true;
    return this;
};

Button.prototype.unlock = function () {
    if(this.monotouchable) lock = false;
    return this;
};

Button.prototype.isLocked = function () {
    return lock;
}

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
    return this;
};

/* impl. not completed, a child will redefine the bind method, call this one and set this.binded to false*/
Button.prototype.unbind = function () {
    if(!this.el || !this.f) throw new Error("Can't unbind an uninitialized button.");
    if(!this.binded) throw new Error("Can't unbind a unbinded button.");
    return this;
};

module.exports = Button;

},{}],3:[function(require,module,exports){
/*
 * index.js - mobile-button module
 */

"use strict";

var MousedownButton = require('./mouse/default/mousedown-button'),
    MouseupButton = require('./mouse/default/mouseup-button'),
    MouseupOnScrollableYButton = require('./mouse/scrollable-y/mouseup-button'),
    MouseupOnScrollableXButton = require('./mouse/scrollable-x/mouseup-button'),
    MousePushButton = require('./mouse/default/mouse-push-button'),

    TouchstartButton = require('./touch/default/touchstart-button'),
    TouchendButton = require('./touch/default/touchend-button'),
    TouchendOnScrollableYButton = require('./touch/scrollable-y/touchend-button'),
    TouchendOnScrollableXButton = require('./touch/scrollable-x/touchend-button'),
    TouchPushButton = require('./touch/default/touch-push-button'),

    PointerdownButton = require('./pointer/default/pointerdown-button'),
    PointerupButton = require('./pointer/default/pointerup-button'),
    PointerupOnScrollableYButton = require('./pointer/scrollable-y/pointerup-button'),
    PointerupOnScrollableXButton = require('./pointer/scrollable-x/pointerup-button'),
    PointerPushButton = require('./pointer/default/pointer-push-button'),

    touchable = 'ontouchstart' in window,
    pointable = !!window.MSPointerEvent || !!window.PointerEvent;

module.exports = {
    Touchstart : touchable ? TouchstartButton : (pointable ? PointerdownButton : MousedownButton),
    Touchend : touchable ? TouchendButton : (pointable ? PointerupButton : MouseupButton),
    ScrollableY : {
        Touchend : touchable ? TouchendOnScrollableYButton : (pointable ? PointerupOnScrollableYButton : MouseupOnScrollableYButton)
    },
    ScrollableX : {
        Touchend : touchable ? TouchendOnScrollableXButton : (pointable ? PointerupOnScrollableXButton : MouseupOnScrollableXButton)
    },
    Push : touchable ? TouchPushButton : (pointable ? PointerPushButton : MousePushButton)
};

},{"./mouse/default/mouse-push-button":4,"./mouse/default/mousedown-button":5,"./mouse/default/mouseup-button":6,"./mouse/scrollable-x/mouseup-button":7,"./mouse/scrollable-y/mouseup-button":8,"./pointer/default/pointer-push-button":9,"./pointer/default/pointerdown-button":10,"./pointer/default/pointerup-button":11,"./pointer/scrollable-x/pointerup-button":12,"./pointer/scrollable-y/pointerup-button":13,"./touch/default/touch-push-button":14,"./touch/default/touchend-button":15,"./touch/default/touchstart-button":16,"./touch/scrollable-x/touchend-button":17,"./touch/scrollable-y/touchend-button":18}],4:[function(require,module,exports){
/*
 * default/mouse-push-button.js
 */

"use strict";

var Q = require('q'),
    Button = require('./../../button');

var MousePushButton = function (options) {
    Button.prototype.constructor.call(this, options);
    this.delay = options.delay > 0 ? options.delay : 0;
    this.g = null;
    if(typeof options.g === 'function') this.g = options.g;
    this.promisef = null;
    this.boundaries = { minX : 0, maxX : 0, minY : 0, maxY : 0 };
    this.leftOrEnded = false;
};

MousePushButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(Button.prototype);

MousePushButton.prototype.constructor = MousePushButton;

MousePushButton.prototype.setG = function (g) {
    if (typeof g !== 'function')
        throw new Error("Button setG method needs a g function as argument.");
    this.g = g;
    return this;
};

MousePushButton.prototype._isInActiveZone = function (touch) {
    var x = touch.clientX,
        y = touch.clientY,
        b = this.boundaries;
    return x < b.maxX && x > b.minX && y < b.maxY && y > b.minY;
};

MousePushButton.prototype.bind = function () {
    Button.prototype.bind.call(this);
    this.el.addEventListener('mousedown', this, false);
    this.binded = true;
    return this;
};

MousePushButton.prototype.unbind = function () {
    Button.prototype.unbind.call(this);
    this.el.removeEventListener('mousedown', this, false);
    this.binded = false;
    return this;
};

MousePushButton.prototype.handleEvent = function (evt) {
    switch (evt.type) {
        case 'mousedown':
            this.onMousedown(evt);
            break;
        case 'mousemove':
            this.onMousemove(evt);
            break;
        case 'mouseup':
            this.onMouseup(evt);
            break;
    }
};

MousePushButton.prototype.onMousedown = function (evt) {
    if (!this.active) {
        if (evt.button === 0) {
            evt.preventDefault();
            this.setActive(true);
            var boundingRect = this.el.getBoundingClientRect();
            this.boundaries.minX = boundingRect.left;
            this.boundaries.maxX = boundingRect.left + boundingRect.width;
            this.boundaries.minY = boundingRect.top;
            this.boundaries.maxY = boundingRect.bottom;
            this.el.ownerDocument.addEventListener('mousemove', this, false);
            this.el.ownerDocument.addEventListener('mouseup', this, false);
            this.promisef = Q.delay(evt, this.delay).then(this.f);
        }
    }
};

MousePushButton.prototype.onMousemove = function (evt) {
    if(this.active && !this.leftOrEnded) {
        evt.preventDefault();
        if (!this._isInActiveZone(evt))
            this.onMouseup(evt);
    }
};

MousePushButton.prototype.onMouseup = function (evt) {
    if(this.active && !this.leftOrEnded) {
        this._removeCls();
        this.leftOrEnded = true;
        this.promisef
                .then(evt)
                .then(this.g)
                .finally(this._done(evt))
                .done();
    }
};

MousePushButton.prototype._done = function (evt) {
    var btn = this;
    return function () {
        btn.setActive(false);
        btn.leftOrEnded = false;
        btn.el.ownerDocument.removeEventListener('mousemove', btn, false);
        btn.el.ownerDocument.removeEventListener('mouseup', btn, false);
    };
};

module.exports = MousePushButton;

},{"./../../button":2,"q":21}],5:[function(require,module,exports){
/*
 * default/mousedown-button.js
 */

"use strict";

var Q = require('q'),
    Button = require('./../../button');

var MousedownButton = function (options) {
    Button.prototype.constructor.call(this, options);
    this.delay = options.delay > 0 ? options.delay : 0;
};

MousedownButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(Button.prototype);

MousedownButton.prototype.constructor = MousedownButton;

MousedownButton.prototype.bind = function () {
    Button.prototype.bind.call(this);
    this.el.addEventListener('mousedown', this, false);
    this.binded = true;
    return this;
};

MousedownButton.prototype.unbind = function () {
    Button.prototype.unbind.call(this);
    this.el.removeEventListener('mousedown', this, false);
    this.binded = false;
    return this;
};

MousedownButton.prototype.handleEvent = function (evt) {
    switch(evt.type) {
        case 'mousedown':
            this.onMousedown(evt);
            break;
    }
};

function _done(btn) {
    return function () { btn.setActive(false); };
};

MousedownButton.prototype.onMousedown = function (evt) {
    if (!this.active) {
        if (evt.button === 0) {
            var btn = this;
            btn.setActive(true);
            Q.delay(evt, btn.delay).then(btn.f).finally(_done(btn)).done();
        }
    }
};

module.exports = MousedownButton;

},{"./../../button":2,"q":21}],6:[function(require,module,exports){
/*
 * default/mouseup-button.js
 */

"use strict";

var Q = require('q'),
    Button = require('./../../button');

var MouseupButton = function (options) {
    Button.prototype.constructor.call(this, options);
    this.activeBorder = options.activeBorder || 50;
    this.boundaries = { minX : 0, maxX : 0, minY : 0, maxY : 0 };
    this.clicked = false;
};

MouseupButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(Button.prototype);

MouseupButton.prototype.constructor = MouseupButton;

MouseupButton.prototype.setActiveBorder = function (len) {
    this.activeBorder = len;
};

MouseupButton.prototype._isInActiveZone = function (evt) {
    var x = evt.clientX,
        y = evt.clientY,
        b = this.boundaries;
    return x < b.maxX && x > b.minX && y < b.maxY && y > b.minY;
};

MouseupButton.prototype.bind = function () {
    Button.prototype.bind.call(this);
    this.el.addEventListener('mousedown', this, false);
    this.binded = true;
    return this;
};

MouseupButton.prototype.unbind = function () {
    Button.prototype.unbind.call(this);
    this.el.removeEventListener('mousedown', this, false);
    this.binded = false;
    return this;
};

MouseupButton.prototype.handleEvent = function (evt) {
    switch (evt.type) {
        case 'mousedown':
            this.onMousedown(evt);
            break;
        case 'mousemove':
            this.onMousemove(evt);
            break;
        case 'mouseup':
            this.onMouseup(evt);
            break;
    }
};

MouseupButton.prototype.onMousedown = function (evt) {
    if (!this.active) {
        if (evt.button === 0) {
            evt.preventDefault();
            this.setActive(true);
            this.triggerOnMouseup = true;
            var boundingRect = this.el.getBoundingClientRect();
            this.boundaries.minX = boundingRect.left - this.activeBorder;
            this.boundaries.maxX = boundingRect.left + boundingRect.width + this.activeBorder;
            this.boundaries.minY = boundingRect.top - this.activeBorder;
            this.boundaries.maxY = boundingRect.bottom +  this.activeBorder;
            this.el.ownerDocument.addEventListener('mousemove', this, false);
            this.el.ownerDocument.addEventListener('mouseup', this, false);
        }
    }
};

MouseupButton.prototype.onMousemove = function (evt) {
    if (this.active && !this.clicked) {
        if (this._isInActiveZone(evt)) {
            this.triggerOnMouseup = true;
            this._addCls();
        } else {
            this.triggerOnMouseup = false;
            this._removeCls();
        }
    }
};

MouseupButton.prototype._done = function (evt) {
    var btn = this;
    return function () { btn.onMousecancel(evt); };
};

MouseupButton.prototype.onMouseup = function (evt) {
    if (this.active) {
        if (this.triggerOnMouseup) {
            var btn = this;
            btn._removeCls();
            btn.clicked = true;
            Q(evt).then(btn.f).finally(btn._done(evt)).done();
        } else {
            this.onMousecancel(evt);
        }
    }
};

MouseupButton.prototype.onMousecancel = function (evt) {
    this._removeCls();
    if (this.active) this.active = false;
    if (this.clicked) this.clicked = false;
    this.el.ownerDocument.removeEventListener('mousemove', this, false);
    this.el.ownerDocument.removeEventListener('mouseup', this, false);
};

module.exports = MouseupButton;

},{"./../../button":2,"q":21}],7:[function(require,module,exports){
/*
 * scrollable-x/mouseup-button.js
 */

"use strict";

var MouseupButton = require('./../default/mouseup-button');

var MouseupOnScrollableXButton = function (options) {
    MouseupButton.prototype.constructor.call(this, options);
    this.tolerance = options.tolerance || 10;
};

MouseupOnScrollableXButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(MouseupButton.prototype);

MouseupOnScrollableXButton.prototype.constructor = MouseupOnScrollableXButton;

MouseupOnScrollableXButton.prototype.onMousedown = function (evt) {
    if (!this.active) this.startX = evt.clientX;
    MouseupButton.prototype.onMousedown.call(this, evt);
};

MouseupOnScrollableXButton.prototype._isInActiveZone = function (evt) {
    var y = evt.clientY,
        d = Math.abs(evt.clientX - this.startX),
        b = this.boundaries;
    return y < b.maxY && y > b.minY && d < this.tolerance;
};

MouseupOnScrollableXButton.prototype.onMousemove = function (evt) {
    if (this.active) {
        if (this._isInActiveZone(evt)) this._addCls();
        else this.onMousecancel.call(this, evt);
    }
};

module.exports = MouseupOnScrollableXButton;

},{"./../default/mouseup-button":6}],8:[function(require,module,exports){
/*
 * scrollable-y/mouseup-button.js
 */

"use strict";

var MouseupButton = require('./../default/mouseup-button');

var MouseupOnScrollableYButton = function (options) {
    MouseupButton.prototype.constructor.call(this, options);
    this.tolerance = options.tolerance || 10;
};

MouseupOnScrollableYButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(MouseupButton.prototype);

MouseupOnScrollableYButton.prototype.constructor = MouseupOnScrollableYButton;

MouseupOnScrollableYButton.prototype.onMousedown = function (evt) {
    if (!this.active) this.startY = evt.clientY;
    MouseupButton.prototype.onMousedown.call(this, evt);
};

MouseupOnScrollableYButton.prototype._isInActiveZone = function (evt) {
    var x = evt.clientX,
        d = Math.abs(evt.clientY - this.startY),
        b = this.boundaries;
    return x < b.maxX && x > b.minX && d < this.tolerance;
};

MouseupOnScrollableYButton.prototype.onMousemove = function (evt) {
    if (this.active) {
        if (this._isInActiveZone(evt)) this._addCls();
        else this.onMousecancel.call(this, evt);
    }
};

module.exports = MouseupOnScrollableYButton;

},{"./../default/mouseup-button":6}],9:[function(require,module,exports){
/*
 * default/pointer-push-button.js
 */

"use strict";

var Q = require('q'),
    Button = require('./../../button');

var PointerPushButton = function (options) {
    Button.prototype.constructor.call(this, options);
    this.delay = options.delay > 0 ? options.delay : 0;
    this.g = null;
    if(typeof options.g === 'function') this.g = options.g;
    this.promisef = null;
    this.boundaries = { minX : 0, maxX : 0, minY : 0, maxY : 0 };
    this.leftOrEnded = false;
    this.pointerId = null;
};

PointerPushButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(Button.prototype);

PointerPushButton.prototype.constructor = PointerPushButton;

PointerPushButton.prototype.setG = function (g) {
    if (typeof g !== 'function')
        throw new Error("Button setG method needs a g function as argument.");
    this.g = g;
    return this;
};

PointerPushButton.prototype._isDownPointerId = function (pointerId) {
    return this.pointerId === pointerId;
};

PointerPushButton.prototype._isInActiveZone = function (evt) {
    var x = evt.clientX,
        y = evt.clientY,
        b = this.boundaries;
    return x < b.maxX && x > b.minX && y < b.maxY && y > b.minY;
};

PointerPushButton.prototype._setPointerCapture = function (pointerId) {
    if (window.MSPointerEvent)
        this.el.msSetPointerCapture(pointerId);
    else
        this.el.setPointerCapture(pointerId);
};

PointerPushButton.prototype.bind = function () {
    Button.prototype.bind.call(this);
    if (window.MSPointerEvent) {
        this.el.addEventListener('MSPointerDown', this, false);
        this.el.addEventListener('MSPointerMove', this, false);
        this.el.addEventListener('MSPointerUp', this, false);
        this.el.addEventListener('MSPointerCancel', this, false);
    } else {
        this.el.addEventListener('pointerdown', this, false);
        this.el.addEventListener('pointermove', this, false);
        this.el.addEventListener('pointerup', this, false);
        this.el.addEventListener('pointercancel', this, false);
    }
    this.binded = true;
    return this;
};

PointerPushButton.prototype.unbind = function () {
    Button.prototype.unbind.call(this);
    if (window.MSPointerEvent) {
        this.el.removeEventListener('MSPointerDown', this, false);
        this.el.removeEventListener('MSPointerMove', this, false);
        this.el.removeEventListener('MSPointerUp', this, false);
        this.el.removeEventListener('MSPointerCancel', this, false);
    } else {
        this.el.removeEventListener('pointerdown', this, false);
        this.el.removeEventListener('pointermove', this, false);
        this.el.removeEventListener('pointerup', this, false);
        this.el.removeEventListener('pointercancel', this, false);
    }
    this.binded = false;
    return this;
};

PointerPushButton.prototype.handleEvent = function (evt) {
    switch (evt.type) {
        case 'MSPointerDown':
        case 'pointerdown':
            this.onPointerdown(evt);
            break;
        case 'MSPointerMove':
        case 'pointermove':
            this.onPointermove(evt);
            break;
        case 'MSPointerUp':
        case 'pointerup':
            this.onPointerup(evt);
            break;
        case 'MSPointerCancel':
        case 'pointercancel':
            this.onPointercancel(evt);
            break;
    }
};

PointerPushButton.prototype.onPointerdown = function (evt) {
    if(!this.active && (!this.monotouchable || !this.isLocked())) {
        if(this.monotouchable) this.lock();
        this.setActive(true);
        this.pointerId = evt.pointerId;
        this._setPointerCapture(evt.pointerId);
        var boundingRect = this.el.getBoundingClientRect();
        this.boundaries.minX = boundingRect.left;
        this.boundaries.maxX = boundingRect.left + boundingRect.width;
        this.boundaries.minY = boundingRect.top;
        this.boundaries.maxY = boundingRect.bottom;
        this.promisef = Q.delay(evt, this.delay).then(this.f);
    }
};

PointerPushButton.prototype.onPointermove = function (evt) {
    if (this.active && !this.leftOrEnded) {
        if (this._isDownPointerId(evt.pointerId)) {
            evt.preventDefault();
            if (!this._isInActiveZone(evt)) {
                this._removeCls();
                this.leftOrEnded = true;
                this.promisef
                        .then(evt)
                        .then(this.g)
                        .finally(this._done(evt))
                        .done();
            }
        }
    }
};

PointerPushButton.prototype._done = function (evt) {
    var btn = this;
    return function () {
        if(btn.monotouchable) btn.unlock();
        btn.onPointercancel(evt);
    };
};

PointerPushButton.prototype.onPointerup = function (evt) {
    if (this.active && !this.leftOrEnded) {
        if (this._isDownPointerId(evt.pointerId)) {
            this._removeCls();
            this.leftOrEnded = true;
            this.promisef
                    .then(evt)
                    .then(this.g)
                    .finally(this._done(evt))
                    .done();
        }
    }
};

PointerPushButton.prototype.onPointercancel = function (evt) {
    this.setActive(false);
    this.leftOrEnded = false;
};

module.exports = PointerPushButton;

},{"./../../button":2,"q":21}],10:[function(require,module,exports){
/*
 * default/pointerdown-button.js
 */

"use strict";

var Q = require('q'),
    Button = require('./../../button');

var PointerdownButton = function (options) {
    Button.prototype.constructor.call(this, options);
    this.delay = options.delay > 0 ? options.delay : 0;
};

PointerdownButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(Button.prototype);

PointerdownButton.prototype.constructor = PointerdownButton;

PointerdownButton.prototype.bind = function () {
    Button.prototype.bind.call(this);
    if (window.MSPointerEvent)
        this.el.addEventListener('MSPointerDown', this, false);
    else
        this.el.addEventListener('pointerdown', this, false);;
    this.binded = true;
    return this;
};

PointerdownButton.prototype.unbind = function () {
    Button.prototype.unbind.call(this);
    if (window.MSPointerEvent)
        this.el.removeEventListener('MSPointerDown', this, false);
    else
        this.el.removeEventListener('pointerdown', this, false);;
    this.binded = false;
    return this;
};

PointerdownButton.prototype.handleEvent = function (evt) {
    switch(evt.type) {
        case 'MSPointerDown':
        case 'pointerdown':
            this.onPointerdown(evt);
            break;
    }
};

function _done(btn) {
    return function () {
        if(btn.monotouchable) btn.unlock();
        btn.setActive(false);
    };
};

PointerdownButton.prototype.onPointerdown = function (evt) {
    if (!this.active && (!this.monotouchable || !this.isLocked())) {
        var btn = this;
        if(btn.monotouchable) btn.lock();
        btn.setActive(true);
        Q.delay(evt, btn.delay).then(btn.f).finally(_done(btn)).done();
    }
};

module.exports = PointerdownButton;

},{"./../../button":2,"q":21}],11:[function(require,module,exports){
/*
 * default/pointerup-button.js
 */

"use strict";

var Q = require('q'),
    Button = require('./../../button');

var PointerupButton = function (options) {
    Button.prototype.constructor.call(this, options);
    this.activeBorder = options.activeBorder || 50;
    this.boundaries = { minX : 0, maxX : 0, minY : 0, maxY : 0 };
    this.pointerId = null;
};

PointerupButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(Button.prototype);

PointerupButton.prototype.constructor = PointerupButton;

PointerupButton.prototype.setActiveBorder = function (len) {
    this.activeBorder = len;
};

PointerupButton.prototype._isDownPointerId = function (pointerId) {
    return this.pointerId === pointerId;
};

PointerupButton.prototype._isInActiveZone = function (evt) {
    var x = evt.clientX,
        y = evt.clientY,
        b = this.boundaries;
    return x < b.maxX && x > b.minX && y < b.maxY && y > b.minY;
};

PointerupButton.prototype._setPointerCapture = function (pointerId) {
    if (window.MSPointerEvent)
        this.el.msSetPointerCapture(pointerId);
    else
        this.el.setPointerCapture(pointerId);
}

PointerupButton.prototype.bind = function () {
    Button.prototype.bind.call(this);
    if (window.MSPointerEvent) {
        this.el.addEventListener('MSPointerDown', this, false);
        this.el.addEventListener('MSPointerMove', this, false);
        this.el.addEventListener('MSPointerUp', this, false);
        this.el.addEventListener('MSPointerCancel', this, false);
    } else {
        this.el.addEventListener('pointerdown', this, false);
        this.el.addEventListener('pointermove', this, false);
        this.el.addEventListener('pointerup', this, false);
        this.el.addEventListener('pointercancel', this, false);
    }
    this.binded = true;
    return this;
};

PointerupButton.prototype.unbind = function () {
    Button.prototype.unbind.call(this);
    if (window.MSPointerEvent) {
        this.el.removeEventListener('MSPointerDown', this, false);
        this.el.removeEventListener('MSPointerMove', this, false);
        this.el.removeEventListener('MSPointerUp', this, false);
        this.el.removeEventListener('MSPointerCancel', this, false);
    } else {
        this.el.removeEventListener('pointerdown', this, false);
        this.el.removeEventListener('pointermove', this, false);
        this.el.removeEventListener('pointerup', this, false);
        this.el.removeEventListener('pointercancel', this, false);
    }
    this.binded = false;
    return this;
};

PointerupButton.prototype.handleEvent = function (evt) {
    switch (evt.type) {
        case 'MSPointerDown':
        case 'pointerdown':
            this.onPointerdown(evt);
            break;
        case 'MSPointerMove':
        case 'pointermove':
            this.onPointermove(evt);
            break;
        case 'MSPointerUp':
        case 'pointerup':
            this.onPointerup(evt);
            break;
        case 'MSPointerCancel':
        case 'pointercancel':
            this.onPointercancel(evt);
            break;
    }
};

PointerupButton.prototype.onPointerdown = function (evt) {
    if (!this.active  && (!this.monotouchable || !this.isLocked())) {
        if(this.monotouchable) this.lock();
        this.setActive(true);
        this.pointerId = evt.pointerId;
        this._setPointerCapture(evt.pointerId);
        this.triggerOnPointerup = true;
        var boundingRect = this.el.getBoundingClientRect();
        this.boundaries.minX = boundingRect.left - this.activeBorder;
        this.boundaries.maxX = boundingRect.left + boundingRect.width + this.activeBorder;
        this.boundaries.minY = boundingRect.top - this.activeBorder;
        this.boundaries.maxY = boundingRect.bottom +  this.activeBorder;
    }
};

PointerupButton.prototype.onPointermove = function (evt) {
    if (this.active) {
        if (this._isDownPointerId(evt.pointerId)) {
            evt.preventDefault();
            if (this._isInActiveZone(evt)) {
                this.triggerOnPointerup = true;
                this._addCls();
            } else {
                this.triggerOnPointerup = false;
                this._removeCls();
            }
        }
    }
};

PointerupButton.prototype._done = function (evt) {
    var btn = this;
    return function () {
        if(btn.monotouchable) btn.unlock();
        btn.onPointercancel(evt);
    };
};

PointerupButton.prototype.onPointerup = function (evt) {
    if (this.active) {
        if (this._isDownPointerId(evt.pointerId)) {
            if (this.triggerOnPointerup) {
                var btn = this;
                btn._removeCls();
                Q(evt).then(btn.f).finally(btn._done(evt)).done();
            } else {
                this._done(evt);
            }
        }
    }
};

PointerupButton.prototype.onPointercancel = function (evt) {
    this._removeCls();
    if (this.active) this.active = false;
};

module.exports = PointerupButton;

},{"./../../button":2,"q":21}],12:[function(require,module,exports){
/*
 * scrollable-x/pointerup-button.js
 */

"use strict";

var PointerupButton = require('./../default/pointerup-button');

var PointerupOnScrollableXButton = function (options) {
    PointerupButton.prototype.constructor.call(this, options);
    this.tolerance = options.tolerance || 10;
};

PointerupOnScrollableXButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(PointerupButton.prototype);

PointerupOnScrollableXButton.prototype.constructor = PointerupOnScrollableXButton;

PointerupOnScrollableXButton.prototype.onPointerdown = function (evt) {
    if (!this.active && (!this.monotouchable || !this.isLocked()))
        this.startX = evt.clientX;
    PointerupButton.prototype.onPointerdown.call(this, evt);
};

PointerupOnScrollableXButton.prototype._isInActiveZone = function (evt) {
    var y = evt.clientY,
        d = Math.abs(evt.clientX - this.startX),
        b = this.boundaries;
    return y < b.maxY && y > b.minY && d < this.tolerance;
};

PointerupOnScrollableXButton.prototype.onPointermove = function (evt) {
    if (this.active) {
        if (this._isDownPointerId(evt.pointerId)) {
            evt.preventDefault();
            if (this._isInActiveZone(evt)) this._addCls();
            else this._done.call(this, evt)();
        }
    }
};

module.exports = PointerupOnScrollableXButton;

},{"./../default/pointerup-button":11}],13:[function(require,module,exports){
/*
 * scrollable-y/pointerup-button.js
 */

"use strict";

var PointerupButton = require('./../default/pointerup-button');

var PointerupOnScrollableYButton = function (options) {
    PointerupButton.prototype.constructor.call(this, options);
    this.tolerance = options.tolerance || 10;
};

PointerupOnScrollableYButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(PointerupButton.prototype);

PointerupOnScrollableYButton.prototype.constructor = PointerupOnScrollableYButton;

PointerupOnScrollableYButton.prototype.onPointerdown = function (evt) {
    if (!this.active && (!this.monotouchable || !this.isLocked()))
        this.startY = evt.clientY;
    PointerupButton.prototype.onPointerdown.call(this, evt);
};

PointerupOnScrollableYButton.prototype._isInActiveZone = function (evt) {
    var x = evt.clientX,
        d = Math.abs(evt.clientY - this.startY),
        b = this.boundaries;
    return x < b.maxX && x > b.minX && d < this.tolerance;
};

PointerupOnScrollableYButton.prototype.onPointermove = function (evt) {
    if (this.active) {
        if (this._isDownPointerId(evt.pointerId)) {
            evt.preventDefault();
            if (this._isInActiveZone(evt)) this._addCls();
            else this._done.call(this, evt)();
        }
    }
};

module.exports = PointerupOnScrollableYButton;

},{"./../default/pointerup-button":11}],14:[function(require,module,exports){
/*
 * default/touch-push-button.js
 */

"use strict";

var Q = require('q'),
    Button = require('./../../button');

var TouchPushButton = function (options) {
    Button.prototype.constructor.call(this, options);
    this.delay = options.delay > 0 ? options.delay : 0;
    this.g = null;
    if(typeof options.g === 'function') this.g = options.g;
    this.promisef = null;
    this.boundaries = { minX : 0, maxX : 0, minY : 0, maxY : 0 };
    this.leftOrEnded = false;
    this.identifier = null;
};

TouchPushButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(Button.prototype);

TouchPushButton.prototype.constructor = TouchPushButton;

TouchPushButton.prototype.setG = function (g) {
    if (typeof g !== 'function')
        throw new Error("Button setG method needs a g function as argument.");
    this.g = g;
    return this;
};

TouchPushButton.prototype._getTouch = function (changedTouches) {
    for (var i = 0; i < changedTouches.length; i++) {
        if (changedTouches[i].identifier === this.identifier) {
            return changedTouches[i];
        }
    }
    return null;
};

TouchPushButton.prototype._isInActiveZone = function (touch) {
    var x = touch.clientX,
        y = touch.clientY,
        b = this.boundaries;
    return x < b.maxX && x > b.minX && y < b.maxY && y > b.minY;
};

TouchPushButton.prototype.bind = function () {
    Button.prototype.bind.call(this);
    this.el.addEventListener('touchstart', this, false);
    this.el.addEventListener('touchmove', this, false);
    this.el.addEventListener('touchend', this, false);
    this.el.addEventListener('touchcancel', this, false);
    this.binded = true;
    return this;
};

TouchPushButton.prototype.unbind = function () {
    Button.prototype.unbind.call(this);
    this.el.removeEventListener('touchstart', this, false);
    this.el.removeEventListener('touchmove', this, false);
    this.el.removeEventListener('touchend', this, false);
    this.el.removeEventListener('touchcancel', this, false);
    this.binded = false;
    return this;
};

TouchPushButton.prototype.handleEvent = function (evt) {
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

TouchPushButton.prototype.onTouchstart = function (evt) {
    if(!this.active && (!this.monotouchable || !this.isLocked())) {
        if(this.monotouchable) this.lock();
        this.setActive(true);
        this.identifier = evt.changedTouches[0].identifier;
        var boundingRect = this.el.getBoundingClientRect();
        this.boundaries.minX = boundingRect.left;
        this.boundaries.maxX = boundingRect.left + boundingRect.width;
        this.boundaries.minY = boundingRect.top;
        this.boundaries.maxY = boundingRect.bottom;
        this.promisef = Q.delay(evt, this.delay).then(this.f);
    }
};

TouchPushButton.prototype.onTouchmove = function (evt) {
    if(this.active && !this.leftOrEnded) {
        var touch = this._getTouch(evt.changedTouches);
        if (touch) {
            evt.preventDefault();
            if(!this._isInActiveZone(touch)) {
                this._removeCls();
                this.leftOrEnded = true;
                this.promisef
                        .then(evt)
                        .then(this.g)
                        .finally(this._done(evt))
                        .done();
            }
        }
    }
};

TouchPushButton.prototype._done = function (evt) {
    var btn = this;
    return function () {
        if(btn.monotouchable) btn.unlock();
        btn.onTouchcancel(evt);
    };
};

TouchPushButton.prototype.onTouchend = function (evt) {
    if(this.active && !this.leftOrEnded) {
        if (this._getTouch(evt.changedTouches)) {
            this._removeCls();
            this.leftOrEnded = true;
            this.promisef
                    .then(evt)
                    .then(this.g)
                    .finally(this._done(evt))
                    .done();
        }
    }
};

TouchPushButton.prototype.onTouchcancel = function (evt) {
    this.setActive(false);
    this.leftOrEnded = false;
};

module.exports = TouchPushButton;

},{"./../../button":2,"q":21}],15:[function(require,module,exports){
/*
 * default/touchend-button.js
 */

"use strict";

var Q = require('q'),
    Button = require('./../../button');

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
    if(!this.active && (!this.monotouchable || !this.isLocked())) {
        if(this.monotouchable) this.lock();
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

TouchendButton.prototype._done = function (evt) {
    var btn = this;
    return function () {
        if(btn.monotouchable) btn.unlock();
        btn.onTouchcancel(evt);
    };
};

TouchendButton.prototype.onTouchend = function (evt) {
    if(this.active) {
        if (this._getTouch(evt.changedTouches)) {
            if (this.triggerOnTouchend) {
                var btn = this;
                btn._removeCls();
                Q(evt).then(btn.f).finally(btn._done(evt)).done();
            }
            else {
                this._done(evt)();
            }
        }
    }
};

TouchendButton.prototype.onTouchcancel = function (evt) {
    this._removeCls();
    if(this.active) this.active = false;
};

module.exports = TouchendButton;

},{"./../../button":2,"q":21}],16:[function(require,module,exports){
/*
 * default/touchstart-button.js
 */

"use strict";

var Q = require('q'),
    Button = require('./../../button');

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

function _done(btn) {
    return function () {
        if(btn.monotouchable) btn.unlock();
        btn.setActive(false);
    };
};

TouchstartButton.prototype.onTouchstart = function (evt) {
    if (!this.active && (!this.monotouchable || !this.isLocked())) {
        var btn = this;
        if(btn.monotouchable) btn.lock();
        btn.setActive(true);
        Q.delay(evt, btn.delay).then(btn.f).finally(_done(btn)).done();
    }
};

module.exports = TouchstartButton;

},{"./../../button":2,"q":21}],17:[function(require,module,exports){
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
    if(!this.active && (!this.monotouchable || !this.isLocked()))
        this.startX = evt.changedTouches[0].clientX;
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
            else this._done.call(this, evt)();
        }
    }
};

module.exports = ScrollableXTouchendButton;

},{"./../default/touchend-button":15}],18:[function(require,module,exports){
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
    if(!this.active && (!this.monotouchable || !this.isLocked()))
        this.startY = evt.changedTouches[0].clientY;
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
            else this._done.call(this, evt)();
        }
    }
};

module.exports = ScrollableYTouchendButton;

},{"./../default/touchend-button":15}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
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
Q.Promise = promise; // ES6
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

promise.race = race; // ES6
promise.all = all; // ES6
promise.reject = reject; // ES6
promise.resolve = Q; // ES6

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
var trackUnhandledRejections = true;

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;
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

            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
            // engine that has a deployed base of browsers that support generators.
            // However, SM's generators use the Python-inspired semantics of
            // outdated ES6 drafts.  We would like to support ES6, but we'd also
            // like to make it possible to use generators in deployed browsers, so
            // we also support Python-style generators.  At some point we can remove
            // this block.

            if (typeof StopIteration === "undefined") {
                // ES6 Generators
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
                // SpiderMonkey Generators
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

},{"__browserify_process":19}],22:[function(require,module,exports){
module.exports=require(21)
},{"__browserify_process":19}],23:[function(require,module,exports){
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

},{"q":22}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvcGV1dGV0cmUvY29kZS9tb2JpbGUtYnV0dG9uL2V4YW1wbGUvc2Nyb2xsYWJsZS14L2luZGV4LmpzIiwiL1VzZXJzL3BldXRldHJlL2NvZGUvbW9iaWxlLWJ1dHRvbi9saWIvYnV0dG9uLmpzIiwiL1VzZXJzL3BldXRldHJlL2NvZGUvbW9iaWxlLWJ1dHRvbi9saWIvaW5kZXguanMiLCIvVXNlcnMvcGV1dGV0cmUvY29kZS9tb2JpbGUtYnV0dG9uL2xpYi9tb3VzZS9kZWZhdWx0L21vdXNlLXB1c2gtYnV0dG9uLmpzIiwiL1VzZXJzL3BldXRldHJlL2NvZGUvbW9iaWxlLWJ1dHRvbi9saWIvbW91c2UvZGVmYXVsdC9tb3VzZWRvd24tYnV0dG9uLmpzIiwiL1VzZXJzL3BldXRldHJlL2NvZGUvbW9iaWxlLWJ1dHRvbi9saWIvbW91c2UvZGVmYXVsdC9tb3VzZXVwLWJ1dHRvbi5qcyIsIi9Vc2Vycy9wZXV0ZXRyZS9jb2RlL21vYmlsZS1idXR0b24vbGliL21vdXNlL3Njcm9sbGFibGUteC9tb3VzZXVwLWJ1dHRvbi5qcyIsIi9Vc2Vycy9wZXV0ZXRyZS9jb2RlL21vYmlsZS1idXR0b24vbGliL21vdXNlL3Njcm9sbGFibGUteS9tb3VzZXVwLWJ1dHRvbi5qcyIsIi9Vc2Vycy9wZXV0ZXRyZS9jb2RlL21vYmlsZS1idXR0b24vbGliL3BvaW50ZXIvZGVmYXVsdC9wb2ludGVyLXB1c2gtYnV0dG9uLmpzIiwiL1VzZXJzL3BldXRldHJlL2NvZGUvbW9iaWxlLWJ1dHRvbi9saWIvcG9pbnRlci9kZWZhdWx0L3BvaW50ZXJkb3duLWJ1dHRvbi5qcyIsIi9Vc2Vycy9wZXV0ZXRyZS9jb2RlL21vYmlsZS1idXR0b24vbGliL3BvaW50ZXIvZGVmYXVsdC9wb2ludGVydXAtYnV0dG9uLmpzIiwiL1VzZXJzL3BldXRldHJlL2NvZGUvbW9iaWxlLWJ1dHRvbi9saWIvcG9pbnRlci9zY3JvbGxhYmxlLXgvcG9pbnRlcnVwLWJ1dHRvbi5qcyIsIi9Vc2Vycy9wZXV0ZXRyZS9jb2RlL21vYmlsZS1idXR0b24vbGliL3BvaW50ZXIvc2Nyb2xsYWJsZS15L3BvaW50ZXJ1cC1idXR0b24uanMiLCIvVXNlcnMvcGV1dGV0cmUvY29kZS9tb2JpbGUtYnV0dG9uL2xpYi90b3VjaC9kZWZhdWx0L3RvdWNoLXB1c2gtYnV0dG9uLmpzIiwiL1VzZXJzL3BldXRldHJlL2NvZGUvbW9iaWxlLWJ1dHRvbi9saWIvdG91Y2gvZGVmYXVsdC90b3VjaGVuZC1idXR0b24uanMiLCIvVXNlcnMvcGV1dGV0cmUvY29kZS9tb2JpbGUtYnV0dG9uL2xpYi90b3VjaC9kZWZhdWx0L3RvdWNoc3RhcnQtYnV0dG9uLmpzIiwiL1VzZXJzL3BldXRldHJlL2NvZGUvbW9iaWxlLWJ1dHRvbi9saWIvdG91Y2gvc2Nyb2xsYWJsZS14L3RvdWNoZW5kLWJ1dHRvbi5qcyIsIi9Vc2Vycy9wZXV0ZXRyZS9jb2RlL21vYmlsZS1idXR0b24vbGliL3RvdWNoL3Njcm9sbGFibGUteS90b3VjaGVuZC1idXR0b24uanMiLCIvVXNlcnMvcGV1dGV0cmUvY29kZS9tb2JpbGUtYnV0dG9uL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbnNlcnQtbW9kdWxlLWdsb2JhbHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy9wZXV0ZXRyZS9jb2RlL21vYmlsZS1idXR0b24vbm9kZV9tb2R1bGVzL2lzY3JvbGwvYnVpbGQvaXNjcm9sbC5qcyIsIi9Vc2Vycy9wZXV0ZXRyZS9jb2RlL21vYmlsZS1idXR0b24vbm9kZV9tb2R1bGVzL3EvcS5qcyIsIi9Vc2Vycy9wZXV0ZXRyZS9jb2RlL21vYmlsZS1idXR0b24vbm9kZV9tb2R1bGVzL3FzdGFydC9ub2RlX21vZHVsZXMvcS9xLmpzIiwiL1VzZXJzL3BldXRldHJlL2NvZGUvbW9iaWxlLWJ1dHRvbi9ub2RlX21vZHVsZXMvcXN0YXJ0L3NyYy9xc3RhcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ244REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2gzREE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIGluZGV4LmpzXG4gKi9cblxudmFyIFEgPSByZXF1aXJlKCdxJyksXG4gICAgcXN0YXJ0ID0gcmVxdWlyZSgncXN0YXJ0JyksXG4gICAgSVNjcm9sbCA9IHJlcXVpcmUoJ2lzY3JvbGwnKSxcbiAgICBNQnV0dG9uID0gcmVxdWlyZSgnLi4vLi4vbGliL2luZGV4LmpzJyk7XG5cbmZ1bmN0aW9uIG1haW4oKSB7XG4gICAgdmFyIGgxID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaDEnKSxcbiAgICAgICAgc2Nyb2xsVmlldyA9IG5ldyBJU2Nyb2xsKCcjd3JhcHBlcicsIHtcbiAgICAgICAgICAgIHNjcm9sbFg6IHRydWUsIHNjcm9sbFk6IGZhbHNlLCBtb3VzZVdoZWVsOiB0cnVlXG4gICAgICAgIH0pLFxuICAgICAgICBiYWNrQnRuID0gbmV3IE1CdXR0b24uVG91Y2hlbmQoe1xuICAgICAgICAgICAgZWwgOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFjaycpLFxuICAgICAgICAgICAgZiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSAnLi4vaW5kZXguaHRtbCc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICBidG4xID0gbmV3IE1CdXR0b24uU2Nyb2xsYWJsZVguVG91Y2hlbmQoe1xuICAgICAgICAgICAgdG9sZXJhbmNlOiAxMCxcbiAgICAgICAgICAgIGVsIDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bjEnKSxcbiAgICAgICAgICAgIGYgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaDEuc3R5bGUuY29sb3IgPSAncmdiKDIxOSwgOTYsIDk2KSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICBidG4yID0gbmV3IE1CdXR0b24uU2Nyb2xsYWJsZVguVG91Y2hlbmQoe1xuICAgICAgICAgICAgdG9sZXJhbmNlOiAxMCxcbiAgICAgICAgICAgIGVsIDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bjInKSxcbiAgICAgICAgICAgIGYgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgIGgxLnN0eWxlLmNvbG9yID0gJ3JnYig3NywgMTU4LCA3NyknO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgICAgYnRuMyA9IG5ldyBNQnV0dG9uLlNjcm9sbGFibGVYLlRvdWNoZW5kKHtcbiAgICAgICAgICAgIHRvbGVyYW5jZTogMTAsXG4gICAgICAgICAgICBlbCA6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4zJyksXG4gICAgICAgICAgICBmIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGgxLnN0eWxlLmNvbG9yID0gJ3JnYig3NywgMTM2LCAxODIpJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG59XG5cbnFzdGFydC50aGVuKG1haW4pLmRvbmUoKTtcbiIsIi8qXG4gKiBidXR0b24uanMgLSB0aGUgYmFzZSBvZiBhbGwgYnV0dG9uc1xuICpcbiAqIEFsbCBidXR0b25zIHNoYXJlIHR3byBlbGVtZW50czogYSBmdW5jdGlvbiwgdGhlIGNhbGxiYWNrIG9mIHRoZSBidXR0b25cbiAqIGFuZCBhIERPTSBlbGVtZW50LlxuICpcbiAqIElmIHRoZSBjYWxsYmFjayBmdW5jdGlvbiByZXR1cm5zIGEgcHJvbWlzZSwgdGhlIGJ1dHRvbiB3aWxsXG4gKiBrZWVwIGlzIGFjdGl2ZSBzdGF0ZSB1bnRpbCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZDtcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGxvY2sgPSBmYWxzZTtcblxudmFyIEJ1dHRvbiA9IGZ1bmN0aW9uIEJ1dHRvbiAob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgLyogdGhlIGNhbGxiYWNrIGZ1bmN0aW9uICovXG4gICAgdGhpcy5mID0gbnVsbDtcbiAgICAvKiB0aGUgZG9tIGVsZW1lbnQgcmVwcmVzZW50aW5nIHRoZSBidXR0b24gKi9cbiAgICB0aGlzLmVsID0gbnVsbDtcblxuICAgIC8qIHRoZSBzdGF0ZSBvZiB0aGUgYnV0dG9uICovXG4gICAgdGhpcy5iaW5kZWQgPSBmYWxzZTtcbiAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMubW9ub3RvdWNoYWJsZSA9IGZhbHNlO1xuXG4gICAgLyogZGVmYXVsdCBhY3RpdmUgY3NzIGNsYXNzKi9cbiAgICB0aGlzLmFjdGl2ZUNscyA9ICdhY3RpdmUnO1xuXG4gICAgaWYodHlwZW9mIG9wdGlvbnMuYWN0aXZlQ2xzID09PSAnc3RyaW5nJykgdGhpcy5hY3RpdmVDbHMgPSBvcHRpb25zLmFjdGl2ZUNscztcbiAgICBpZihvcHRpb25zLmVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHRoaXMuZWwgPSBvcHRpb25zLmVsO1xuICAgIGlmKHR5cGVvZiBvcHRpb25zLmYgPT09ICdmdW5jdGlvbicpIHRoaXMuZiA9IG9wdGlvbnMuZjtcbiAgICBpZihvcHRpb25zLm1vbm90b3VjaGFibGUpIHRoaXMubW9ub3RvdWNoYWJsZSA9IG9wdGlvbnMubW9ub3RvdWNoYWJsZTtcbiAgICBpZihvcHRpb25zLmF1dG9iaW5kICE9PSBmYWxzZSkgdGhpcy5iaW5kKCk7XG59O1xuXG5CdXR0b24ucHJvdG90eXBlLnNldEVsID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgaWYodGhpcy5hY3RpdmUpIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNoYW5nZSBkb20gZWxlbWVudCwgYnV0dG9uIGlzIGFjdGl2ZS5cIik7XG4gICAgaWYodGhpcy5iaW5kZWQpIHRoaXMudW5iaW5kKCk7XG4gICAgaWYoZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsID0gZWw7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQnV0dG9uIHNldEVsIG1ldGhvZCBuZWVkcyBhIGRvbSBlbGVtZW50IGFzIGFyZ3VtZW50LlwiKTtcbiAgICB9XG59O1xuXG5CdXR0b24ucHJvdG90eXBlLl9hZGRDbHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmVsLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLmFjdGl2ZUNscykpXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCh0aGlzLmFjdGl2ZUNscyk7XG59O1xuXG5CdXR0b24ucHJvdG90eXBlLl9yZW1vdmVDbHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuYWN0aXZlQ2xzKSlcbiAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuYWN0aXZlQ2xzKTtcbn07XG5cbkJ1dHRvbi5wcm90b3R5cGUuc2V0QWN0aXZlID0gZnVuY3Rpb24gKGFjdGl2ZSkge1xuICAgIGlmIChhY3RpdmUpIHRoaXMuX2FkZENscygpO1xuICAgIGVsc2UgdGhpcy5fcmVtb3ZlQ2xzKCk7XG4gICAgdGhpcy5hY3RpdmUgPSBhY3RpdmU7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5CdXR0b24ucHJvdG90eXBlLmxvY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYodGhpcy5tb25vdG91Y2hhYmxlKSBsb2NrID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkJ1dHRvbi5wcm90b3R5cGUudW5sb2NrID0gZnVuY3Rpb24gKCkge1xuICAgIGlmKHRoaXMubW9ub3RvdWNoYWJsZSkgbG9jayA9IGZhbHNlO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuQnV0dG9uLnByb3RvdHlwZS5pc0xvY2tlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbG9jaztcbn1cblxuQnV0dG9uLnByb3RvdHlwZS5zZXRGID0gZnVuY3Rpb24gKGYpIHtcbiAgICBpZiAodHlwZW9mIGYgIT09ICdmdW5jdGlvbicpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkJ1dHRvbiBzZXRGIG1ldGhvZCBuZWVkcyBhIGYgZnVuY3Rpb24gYXMgYXJndW1lbnQuXCIpO1xuICAgIHRoaXMuZiA9IGY7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKiBpbXBsLiBub3QgY29tcGxldGVkLCBhIGNoaWxkIHdpbGwgcmVkZWZpbmUgdGhlIGJpbmQgbWV0aG9kLCBjYWxsIHRoaXMgb25lIGFuZCBzZXQgdGhpcy5iaW5kZWQgdG8gdHJ1ZSovXG5CdXR0b24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYoIXRoaXMuZWwgfHwgIXRoaXMuZikgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgYmluZCBhbiB1bmluaXRpYWxpemVkIGJ1dHRvbi5cIik7XG4gICAgaWYodGhpcy5iaW5kZWQpIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGJpbmQgYW4gYWxyZWFkeSBiaW5kZWQgYnV0dG9uLlwiKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qIGltcGwuIG5vdCBjb21wbGV0ZWQsIGEgY2hpbGQgd2lsbCByZWRlZmluZSB0aGUgYmluZCBtZXRob2QsIGNhbGwgdGhpcyBvbmUgYW5kIHNldCB0aGlzLmJpbmRlZCB0byBmYWxzZSovXG5CdXR0b24ucHJvdG90eXBlLnVuYmluZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZighdGhpcy5lbCB8fCAhdGhpcy5mKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCB1bmJpbmQgYW4gdW5pbml0aWFsaXplZCBidXR0b24uXCIpO1xuICAgIGlmKCF0aGlzLmJpbmRlZCkgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgdW5iaW5kIGEgdW5iaW5kZWQgYnV0dG9uLlwiKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQnV0dG9uO1xuIiwiLypcbiAqIGluZGV4LmpzIC0gbW9iaWxlLWJ1dHRvbiBtb2R1bGVcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIE1vdXNlZG93bkJ1dHRvbiA9IHJlcXVpcmUoJy4vbW91c2UvZGVmYXVsdC9tb3VzZWRvd24tYnV0dG9uJyksXG4gICAgTW91c2V1cEJ1dHRvbiA9IHJlcXVpcmUoJy4vbW91c2UvZGVmYXVsdC9tb3VzZXVwLWJ1dHRvbicpLFxuICAgIE1vdXNldXBPblNjcm9sbGFibGVZQnV0dG9uID0gcmVxdWlyZSgnLi9tb3VzZS9zY3JvbGxhYmxlLXkvbW91c2V1cC1idXR0b24nKSxcbiAgICBNb3VzZXVwT25TY3JvbGxhYmxlWEJ1dHRvbiA9IHJlcXVpcmUoJy4vbW91c2Uvc2Nyb2xsYWJsZS14L21vdXNldXAtYnV0dG9uJyksXG4gICAgTW91c2VQdXNoQnV0dG9uID0gcmVxdWlyZSgnLi9tb3VzZS9kZWZhdWx0L21vdXNlLXB1c2gtYnV0dG9uJyksXG5cbiAgICBUb3VjaHN0YXJ0QnV0dG9uID0gcmVxdWlyZSgnLi90b3VjaC9kZWZhdWx0L3RvdWNoc3RhcnQtYnV0dG9uJyksXG4gICAgVG91Y2hlbmRCdXR0b24gPSByZXF1aXJlKCcuL3RvdWNoL2RlZmF1bHQvdG91Y2hlbmQtYnV0dG9uJyksXG4gICAgVG91Y2hlbmRPblNjcm9sbGFibGVZQnV0dG9uID0gcmVxdWlyZSgnLi90b3VjaC9zY3JvbGxhYmxlLXkvdG91Y2hlbmQtYnV0dG9uJyksXG4gICAgVG91Y2hlbmRPblNjcm9sbGFibGVYQnV0dG9uID0gcmVxdWlyZSgnLi90b3VjaC9zY3JvbGxhYmxlLXgvdG91Y2hlbmQtYnV0dG9uJyksXG4gICAgVG91Y2hQdXNoQnV0dG9uID0gcmVxdWlyZSgnLi90b3VjaC9kZWZhdWx0L3RvdWNoLXB1c2gtYnV0dG9uJyksXG5cbiAgICBQb2ludGVyZG93bkJ1dHRvbiA9IHJlcXVpcmUoJy4vcG9pbnRlci9kZWZhdWx0L3BvaW50ZXJkb3duLWJ1dHRvbicpLFxuICAgIFBvaW50ZXJ1cEJ1dHRvbiA9IHJlcXVpcmUoJy4vcG9pbnRlci9kZWZhdWx0L3BvaW50ZXJ1cC1idXR0b24nKSxcbiAgICBQb2ludGVydXBPblNjcm9sbGFibGVZQnV0dG9uID0gcmVxdWlyZSgnLi9wb2ludGVyL3Njcm9sbGFibGUteS9wb2ludGVydXAtYnV0dG9uJyksXG4gICAgUG9pbnRlcnVwT25TY3JvbGxhYmxlWEJ1dHRvbiA9IHJlcXVpcmUoJy4vcG9pbnRlci9zY3JvbGxhYmxlLXgvcG9pbnRlcnVwLWJ1dHRvbicpLFxuICAgIFBvaW50ZXJQdXNoQnV0dG9uID0gcmVxdWlyZSgnLi9wb2ludGVyL2RlZmF1bHQvcG9pbnRlci1wdXNoLWJ1dHRvbicpLFxuXG4gICAgdG91Y2hhYmxlID0gJ29udG91Y2hzdGFydCcgaW4gd2luZG93LFxuICAgIHBvaW50YWJsZSA9ICEhd2luZG93Lk1TUG9pbnRlckV2ZW50IHx8ICEhd2luZG93LlBvaW50ZXJFdmVudDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgVG91Y2hzdGFydCA6IHRvdWNoYWJsZSA/IFRvdWNoc3RhcnRCdXR0b24gOiAocG9pbnRhYmxlID8gUG9pbnRlcmRvd25CdXR0b24gOiBNb3VzZWRvd25CdXR0b24pLFxuICAgIFRvdWNoZW5kIDogdG91Y2hhYmxlID8gVG91Y2hlbmRCdXR0b24gOiAocG9pbnRhYmxlID8gUG9pbnRlcnVwQnV0dG9uIDogTW91c2V1cEJ1dHRvbiksXG4gICAgU2Nyb2xsYWJsZVkgOiB7XG4gICAgICAgIFRvdWNoZW5kIDogdG91Y2hhYmxlID8gVG91Y2hlbmRPblNjcm9sbGFibGVZQnV0dG9uIDogKHBvaW50YWJsZSA/IFBvaW50ZXJ1cE9uU2Nyb2xsYWJsZVlCdXR0b24gOiBNb3VzZXVwT25TY3JvbGxhYmxlWUJ1dHRvbilcbiAgICB9LFxuICAgIFNjcm9sbGFibGVYIDoge1xuICAgICAgICBUb3VjaGVuZCA6IHRvdWNoYWJsZSA/IFRvdWNoZW5kT25TY3JvbGxhYmxlWEJ1dHRvbiA6IChwb2ludGFibGUgPyBQb2ludGVydXBPblNjcm9sbGFibGVYQnV0dG9uIDogTW91c2V1cE9uU2Nyb2xsYWJsZVhCdXR0b24pXG4gICAgfSxcbiAgICBQdXNoIDogdG91Y2hhYmxlID8gVG91Y2hQdXNoQnV0dG9uIDogKHBvaW50YWJsZSA/IFBvaW50ZXJQdXNoQnV0dG9uIDogTW91c2VQdXNoQnV0dG9uKVxufTtcbiIsIi8qXG4gKiBkZWZhdWx0L21vdXNlLXB1c2gtYnV0dG9uLmpzXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBRID0gcmVxdWlyZSgncScpLFxuICAgIEJ1dHRvbiA9IHJlcXVpcmUoJy4vLi4vLi4vYnV0dG9uJyk7XG5cbnZhciBNb3VzZVB1c2hCdXR0b24gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIEJ1dHRvbi5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICB0aGlzLmRlbGF5ID0gb3B0aW9ucy5kZWxheSA+IDAgPyBvcHRpb25zLmRlbGF5IDogMDtcbiAgICB0aGlzLmcgPSBudWxsO1xuICAgIGlmKHR5cGVvZiBvcHRpb25zLmcgPT09ICdmdW5jdGlvbicpIHRoaXMuZyA9IG9wdGlvbnMuZztcbiAgICB0aGlzLnByb21pc2VmID0gbnVsbDtcbiAgICB0aGlzLmJvdW5kYXJpZXMgPSB7IG1pblggOiAwLCBtYXhYIDogMCwgbWluWSA6IDAsIG1heFkgOiAwIH07XG4gICAgdGhpcy5sZWZ0T3JFbmRlZCA9IGZhbHNlO1xufTtcblxuTW91c2VQdXNoQnV0dG9uLnByb3RvdHlwZSA9IChmdW5jdGlvbiAocHJvdG8pIHtcbiAgICBmdW5jdGlvbiBGKCkge307XG4gICAgRi5wcm90b3R5cGUgPSBwcm90bztcbiAgICByZXR1cm4gbmV3IEYoKTtcbn0pKEJ1dHRvbi5wcm90b3R5cGUpO1xuXG5Nb3VzZVB1c2hCdXR0b24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTW91c2VQdXNoQnV0dG9uO1xuXG5Nb3VzZVB1c2hCdXR0b24ucHJvdG90eXBlLnNldEcgPSBmdW5jdGlvbiAoZykge1xuICAgIGlmICh0eXBlb2YgZyAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQnV0dG9uIHNldEcgbWV0aG9kIG5lZWRzIGEgZyBmdW5jdGlvbiBhcyBhcmd1bWVudC5cIik7XG4gICAgdGhpcy5nID0gZztcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbk1vdXNlUHVzaEJ1dHRvbi5wcm90b3R5cGUuX2lzSW5BY3RpdmVab25lID0gZnVuY3Rpb24gKHRvdWNoKSB7XG4gICAgdmFyIHggPSB0b3VjaC5jbGllbnRYLFxuICAgICAgICB5ID0gdG91Y2guY2xpZW50WSxcbiAgICAgICAgYiA9IHRoaXMuYm91bmRhcmllcztcbiAgICByZXR1cm4geCA8IGIubWF4WCAmJiB4ID4gYi5taW5YICYmIHkgPCBiLm1heFkgJiYgeSA+IGIubWluWTtcbn07XG5cbk1vdXNlUHVzaEJ1dHRvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBCdXR0b24ucHJvdG90eXBlLmJpbmQuY2FsbCh0aGlzKTtcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMsIGZhbHNlKTtcbiAgICB0aGlzLmJpbmRlZCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5Nb3VzZVB1c2hCdXR0b24ucHJvdG90eXBlLnVuYmluZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBCdXR0b24ucHJvdG90eXBlLnVuYmluZC5jYWxsKHRoaXMpO1xuICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcywgZmFsc2UpO1xuICAgIHRoaXMuYmluZGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5Nb3VzZVB1c2hCdXR0b24ucHJvdG90eXBlLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIHN3aXRjaCAoZXZ0LnR5cGUpIHtcbiAgICAgICAgY2FzZSAnbW91c2Vkb3duJzpcbiAgICAgICAgICAgIHRoaXMub25Nb3VzZWRvd24oZXZ0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtb3VzZW1vdmUnOlxuICAgICAgICAgICAgdGhpcy5vbk1vdXNlbW92ZShldnQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ21vdXNldXAnOlxuICAgICAgICAgICAgdGhpcy5vbk1vdXNldXAoZXZ0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cbk1vdXNlUHVzaEJ1dHRvbi5wcm90b3R5cGUub25Nb3VzZWRvd24gPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYgKCF0aGlzLmFjdGl2ZSkge1xuICAgICAgICBpZiAoZXZ0LmJ1dHRvbiA9PT0gMCkge1xuICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZSh0cnVlKTtcbiAgICAgICAgICAgIHZhciBib3VuZGluZ1JlY3QgPSB0aGlzLmVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgdGhpcy5ib3VuZGFyaWVzLm1pblggPSBib3VuZGluZ1JlY3QubGVmdDtcbiAgICAgICAgICAgIHRoaXMuYm91bmRhcmllcy5tYXhYID0gYm91bmRpbmdSZWN0LmxlZnQgKyBib3VuZGluZ1JlY3Qud2lkdGg7XG4gICAgICAgICAgICB0aGlzLmJvdW5kYXJpZXMubWluWSA9IGJvdW5kaW5nUmVjdC50b3A7XG4gICAgICAgICAgICB0aGlzLmJvdW5kYXJpZXMubWF4WSA9IGJvdW5kaW5nUmVjdC5ib3R0b207XG4gICAgICAgICAgICB0aGlzLmVsLm93bmVyRG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcywgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5lbC5vd25lckRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnByb21pc2VmID0gUS5kZWxheShldnQsIHRoaXMuZGVsYXkpLnRoZW4odGhpcy5mKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbk1vdXNlUHVzaEJ1dHRvbi5wcm90b3R5cGUub25Nb3VzZW1vdmUgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYodGhpcy5hY3RpdmUgJiYgIXRoaXMubGVmdE9yRW5kZWQpIHtcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmICghdGhpcy5faXNJbkFjdGl2ZVpvbmUoZXZ0KSlcbiAgICAgICAgICAgIHRoaXMub25Nb3VzZXVwKGV2dCk7XG4gICAgfVxufTtcblxuTW91c2VQdXNoQnV0dG9uLnByb3RvdHlwZS5vbk1vdXNldXAgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYodGhpcy5hY3RpdmUgJiYgIXRoaXMubGVmdE9yRW5kZWQpIHtcbiAgICAgICAgdGhpcy5fcmVtb3ZlQ2xzKCk7XG4gICAgICAgIHRoaXMubGVmdE9yRW5kZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnByb21pc2VmXG4gICAgICAgICAgICAgICAgLnRoZW4oZXZ0KVxuICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuZylcbiAgICAgICAgICAgICAgICAuZmluYWxseSh0aGlzLl9kb25lKGV2dCkpXG4gICAgICAgICAgICAgICAgLmRvbmUoKTtcbiAgICB9XG59O1xuXG5Nb3VzZVB1c2hCdXR0b24ucHJvdG90eXBlLl9kb25lID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIHZhciBidG4gPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGJ0bi5zZXRBY3RpdmUoZmFsc2UpO1xuICAgICAgICBidG4ubGVmdE9yRW5kZWQgPSBmYWxzZTtcbiAgICAgICAgYnRuLmVsLm93bmVyRG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgYnRuLCBmYWxzZSk7XG4gICAgICAgIGJ0bi5lbC5vd25lckRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBidG4sIGZhbHNlKTtcbiAgICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZVB1c2hCdXR0b247XG4iLCIvKlxuICogZGVmYXVsdC9tb3VzZWRvd24tYnV0dG9uLmpzXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBRID0gcmVxdWlyZSgncScpLFxuICAgIEJ1dHRvbiA9IHJlcXVpcmUoJy4vLi4vLi4vYnV0dG9uJyk7XG5cbnZhciBNb3VzZWRvd25CdXR0b24gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIEJ1dHRvbi5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICB0aGlzLmRlbGF5ID0gb3B0aW9ucy5kZWxheSA+IDAgPyBvcHRpb25zLmRlbGF5IDogMDtcbn07XG5cbk1vdXNlZG93bkJ1dHRvbi5wcm90b3R5cGUgPSAoZnVuY3Rpb24gKHByb3RvKSB7XG4gICAgZnVuY3Rpb24gRigpIHt9O1xuICAgIEYucHJvdG90eXBlID0gcHJvdG87XG4gICAgcmV0dXJuIG5ldyBGKCk7XG59KShCdXR0b24ucHJvdG90eXBlKTtcblxuTW91c2Vkb3duQnV0dG9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1vdXNlZG93bkJ1dHRvbjtcblxuTW91c2Vkb3duQnV0dG9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKCkge1xuICAgIEJ1dHRvbi5wcm90b3R5cGUuYmluZC5jYWxsKHRoaXMpO1xuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcywgZmFsc2UpO1xuICAgIHRoaXMuYmluZGVkID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbk1vdXNlZG93bkJ1dHRvbi5wcm90b3R5cGUudW5iaW5kID0gZnVuY3Rpb24gKCkge1xuICAgIEJ1dHRvbi5wcm90b3R5cGUudW5iaW5kLmNhbGwodGhpcyk7XG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLCBmYWxzZSk7XG4gICAgdGhpcy5iaW5kZWQgPSBmYWxzZTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbk1vdXNlZG93bkJ1dHRvbi5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgc3dpdGNoKGV2dC50eXBlKSB7XG4gICAgICAgIGNhc2UgJ21vdXNlZG93bic6XG4gICAgICAgICAgICB0aGlzLm9uTW91c2Vkb3duKGV2dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBfZG9uZShidG4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkgeyBidG4uc2V0QWN0aXZlKGZhbHNlKTsgfTtcbn07XG5cbk1vdXNlZG93bkJ1dHRvbi5wcm90b3R5cGUub25Nb3VzZWRvd24gPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYgKCF0aGlzLmFjdGl2ZSkge1xuICAgICAgICBpZiAoZXZ0LmJ1dHRvbiA9PT0gMCkge1xuICAgICAgICAgICAgdmFyIGJ0biA9IHRoaXM7XG4gICAgICAgICAgICBidG4uc2V0QWN0aXZlKHRydWUpO1xuICAgICAgICAgICAgUS5kZWxheShldnQsIGJ0bi5kZWxheSkudGhlbihidG4uZikuZmluYWxseShfZG9uZShidG4pKS5kb25lKCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vdXNlZG93bkJ1dHRvbjtcbiIsIi8qXG4gKiBkZWZhdWx0L21vdXNldXAtYnV0dG9uLmpzXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBRID0gcmVxdWlyZSgncScpLFxuICAgIEJ1dHRvbiA9IHJlcXVpcmUoJy4vLi4vLi4vYnV0dG9uJyk7XG5cbnZhciBNb3VzZXVwQnV0dG9uID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBCdXR0b24ucHJvdG90eXBlLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgdGhpcy5hY3RpdmVCb3JkZXIgPSBvcHRpb25zLmFjdGl2ZUJvcmRlciB8fCA1MDtcbiAgICB0aGlzLmJvdW5kYXJpZXMgPSB7IG1pblggOiAwLCBtYXhYIDogMCwgbWluWSA6IDAsIG1heFkgOiAwIH07XG4gICAgdGhpcy5jbGlja2VkID0gZmFsc2U7XG59O1xuXG5Nb3VzZXVwQnV0dG9uLnByb3RvdHlwZSA9IChmdW5jdGlvbiAocHJvdG8pIHtcbiAgICBmdW5jdGlvbiBGKCkge307XG4gICAgRi5wcm90b3R5cGUgPSBwcm90bztcbiAgICByZXR1cm4gbmV3IEYoKTtcbn0pKEJ1dHRvbi5wcm90b3R5cGUpO1xuXG5Nb3VzZXVwQnV0dG9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1vdXNldXBCdXR0b247XG5cbk1vdXNldXBCdXR0b24ucHJvdG90eXBlLnNldEFjdGl2ZUJvcmRlciA9IGZ1bmN0aW9uIChsZW4pIHtcbiAgICB0aGlzLmFjdGl2ZUJvcmRlciA9IGxlbjtcbn07XG5cbk1vdXNldXBCdXR0b24ucHJvdG90eXBlLl9pc0luQWN0aXZlWm9uZSA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICB2YXIgeCA9IGV2dC5jbGllbnRYLFxuICAgICAgICB5ID0gZXZ0LmNsaWVudFksXG4gICAgICAgIGIgPSB0aGlzLmJvdW5kYXJpZXM7XG4gICAgcmV0dXJuIHggPCBiLm1heFggJiYgeCA+IGIubWluWCAmJiB5IDwgYi5tYXhZICYmIHkgPiBiLm1pblk7XG59O1xuXG5Nb3VzZXVwQnV0dG9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKCkge1xuICAgIEJ1dHRvbi5wcm90b3R5cGUuYmluZC5jYWxsKHRoaXMpO1xuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcywgZmFsc2UpO1xuICAgIHRoaXMuYmluZGVkID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbk1vdXNldXBCdXR0b24ucHJvdG90eXBlLnVuYmluZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBCdXR0b24ucHJvdG90eXBlLnVuYmluZC5jYWxsKHRoaXMpO1xuICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcywgZmFsc2UpO1xuICAgIHRoaXMuYmluZGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5Nb3VzZXVwQnV0dG9uLnByb3RvdHlwZS5oYW5kbGVFdmVudCA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICBzd2l0Y2ggKGV2dC50eXBlKSB7XG4gICAgICAgIGNhc2UgJ21vdXNlZG93bic6XG4gICAgICAgICAgICB0aGlzLm9uTW91c2Vkb3duKGV2dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbW91c2Vtb3ZlJzpcbiAgICAgICAgICAgIHRoaXMub25Nb3VzZW1vdmUoZXZ0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtb3VzZXVwJzpcbiAgICAgICAgICAgIHRoaXMub25Nb3VzZXVwKGV2dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59O1xuXG5Nb3VzZXVwQnV0dG9uLnByb3RvdHlwZS5vbk1vdXNlZG93biA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICBpZiAoIXRoaXMuYWN0aXZlKSB7XG4gICAgICAgIGlmIChldnQuYnV0dG9uID09PSAwKSB7XG4gICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlKHRydWUpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyT25Nb3VzZXVwID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBib3VuZGluZ1JlY3QgPSB0aGlzLmVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgdGhpcy5ib3VuZGFyaWVzLm1pblggPSBib3VuZGluZ1JlY3QubGVmdCAtIHRoaXMuYWN0aXZlQm9yZGVyO1xuICAgICAgICAgICAgdGhpcy5ib3VuZGFyaWVzLm1heFggPSBib3VuZGluZ1JlY3QubGVmdCArIGJvdW5kaW5nUmVjdC53aWR0aCArIHRoaXMuYWN0aXZlQm9yZGVyO1xuICAgICAgICAgICAgdGhpcy5ib3VuZGFyaWVzLm1pblkgPSBib3VuZGluZ1JlY3QudG9wIC0gdGhpcy5hY3RpdmVCb3JkZXI7XG4gICAgICAgICAgICB0aGlzLmJvdW5kYXJpZXMubWF4WSA9IGJvdW5kaW5nUmVjdC5ib3R0b20gKyAgdGhpcy5hY3RpdmVCb3JkZXI7XG4gICAgICAgICAgICB0aGlzLmVsLm93bmVyRG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcywgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5lbC5vd25lckRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5Nb3VzZXVwQnV0dG9uLnByb3RvdHlwZS5vbk1vdXNlbW92ZSA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICBpZiAodGhpcy5hY3RpdmUgJiYgIXRoaXMuY2xpY2tlZCkge1xuICAgICAgICBpZiAodGhpcy5faXNJbkFjdGl2ZVpvbmUoZXZ0KSkge1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyT25Nb3VzZXVwID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2FkZENscygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyT25Nb3VzZXVwID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVDbHMoKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbk1vdXNldXBCdXR0b24ucHJvdG90eXBlLl9kb25lID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIHZhciBidG4gPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7IGJ0bi5vbk1vdXNlY2FuY2VsKGV2dCk7IH07XG59O1xuXG5Nb3VzZXVwQnV0dG9uLnByb3RvdHlwZS5vbk1vdXNldXAgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICAgIGlmICh0aGlzLnRyaWdnZXJPbk1vdXNldXApIHtcbiAgICAgICAgICAgIHZhciBidG4gPSB0aGlzO1xuICAgICAgICAgICAgYnRuLl9yZW1vdmVDbHMoKTtcbiAgICAgICAgICAgIGJ0bi5jbGlja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIFEoZXZ0KS50aGVuKGJ0bi5mKS5maW5hbGx5KGJ0bi5fZG9uZShldnQpKS5kb25lKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm9uTW91c2VjYW5jZWwoZXZ0KTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbk1vdXNldXBCdXR0b24ucHJvdG90eXBlLm9uTW91c2VjYW5jZWwgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgdGhpcy5fcmVtb3ZlQ2xzKCk7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuICAgIGlmICh0aGlzLmNsaWNrZWQpIHRoaXMuY2xpY2tlZCA9IGZhbHNlO1xuICAgIHRoaXMuZWwub3duZXJEb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLCBmYWxzZSk7XG4gICAgdGhpcy5lbC5vd25lckRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLCBmYWxzZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vdXNldXBCdXR0b247XG4iLCIvKlxuICogc2Nyb2xsYWJsZS14L21vdXNldXAtYnV0dG9uLmpzXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBNb3VzZXVwQnV0dG9uID0gcmVxdWlyZSgnLi8uLi9kZWZhdWx0L21vdXNldXAtYnV0dG9uJyk7XG5cbnZhciBNb3VzZXVwT25TY3JvbGxhYmxlWEJ1dHRvbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgTW91c2V1cEJ1dHRvbi5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICB0aGlzLnRvbGVyYW5jZSA9IG9wdGlvbnMudG9sZXJhbmNlIHx8IDEwO1xufTtcblxuTW91c2V1cE9uU2Nyb2xsYWJsZVhCdXR0b24ucHJvdG90eXBlID0gKGZ1bmN0aW9uIChwcm90bykge1xuICAgIGZ1bmN0aW9uIEYoKSB7fTtcbiAgICBGLnByb3RvdHlwZSA9IHByb3RvO1xuICAgIHJldHVybiBuZXcgRigpO1xufSkoTW91c2V1cEJ1dHRvbi5wcm90b3R5cGUpO1xuXG5Nb3VzZXVwT25TY3JvbGxhYmxlWEJ1dHRvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNb3VzZXVwT25TY3JvbGxhYmxlWEJ1dHRvbjtcblxuTW91c2V1cE9uU2Nyb2xsYWJsZVhCdXR0b24ucHJvdG90eXBlLm9uTW91c2Vkb3duID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIGlmICghdGhpcy5hY3RpdmUpIHRoaXMuc3RhcnRYID0gZXZ0LmNsaWVudFg7XG4gICAgTW91c2V1cEJ1dHRvbi5wcm90b3R5cGUub25Nb3VzZWRvd24uY2FsbCh0aGlzLCBldnQpO1xufTtcblxuTW91c2V1cE9uU2Nyb2xsYWJsZVhCdXR0b24ucHJvdG90eXBlLl9pc0luQWN0aXZlWm9uZSA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICB2YXIgeSA9IGV2dC5jbGllbnRZLFxuICAgICAgICBkID0gTWF0aC5hYnMoZXZ0LmNsaWVudFggLSB0aGlzLnN0YXJ0WCksXG4gICAgICAgIGIgPSB0aGlzLmJvdW5kYXJpZXM7XG4gICAgcmV0dXJuIHkgPCBiLm1heFkgJiYgeSA+IGIubWluWSAmJiBkIDwgdGhpcy50b2xlcmFuY2U7XG59O1xuXG5Nb3VzZXVwT25TY3JvbGxhYmxlWEJ1dHRvbi5wcm90b3R5cGUub25Nb3VzZW1vdmUgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc0luQWN0aXZlWm9uZShldnQpKSB0aGlzLl9hZGRDbHMoKTtcbiAgICAgICAgZWxzZSB0aGlzLm9uTW91c2VjYW5jZWwuY2FsbCh0aGlzLCBldnQpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTW91c2V1cE9uU2Nyb2xsYWJsZVhCdXR0b247XG4iLCIvKlxuICogc2Nyb2xsYWJsZS15L21vdXNldXAtYnV0dG9uLmpzXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBNb3VzZXVwQnV0dG9uID0gcmVxdWlyZSgnLi8uLi9kZWZhdWx0L21vdXNldXAtYnV0dG9uJyk7XG5cbnZhciBNb3VzZXVwT25TY3JvbGxhYmxlWUJ1dHRvbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgTW91c2V1cEJ1dHRvbi5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICB0aGlzLnRvbGVyYW5jZSA9IG9wdGlvbnMudG9sZXJhbmNlIHx8IDEwO1xufTtcblxuTW91c2V1cE9uU2Nyb2xsYWJsZVlCdXR0b24ucHJvdG90eXBlID0gKGZ1bmN0aW9uIChwcm90bykge1xuICAgIGZ1bmN0aW9uIEYoKSB7fTtcbiAgICBGLnByb3RvdHlwZSA9IHByb3RvO1xuICAgIHJldHVybiBuZXcgRigpO1xufSkoTW91c2V1cEJ1dHRvbi5wcm90b3R5cGUpO1xuXG5Nb3VzZXVwT25TY3JvbGxhYmxlWUJ1dHRvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNb3VzZXVwT25TY3JvbGxhYmxlWUJ1dHRvbjtcblxuTW91c2V1cE9uU2Nyb2xsYWJsZVlCdXR0b24ucHJvdG90eXBlLm9uTW91c2Vkb3duID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIGlmICghdGhpcy5hY3RpdmUpIHRoaXMuc3RhcnRZID0gZXZ0LmNsaWVudFk7XG4gICAgTW91c2V1cEJ1dHRvbi5wcm90b3R5cGUub25Nb3VzZWRvd24uY2FsbCh0aGlzLCBldnQpO1xufTtcblxuTW91c2V1cE9uU2Nyb2xsYWJsZVlCdXR0b24ucHJvdG90eXBlLl9pc0luQWN0aXZlWm9uZSA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICB2YXIgeCA9IGV2dC5jbGllbnRYLFxuICAgICAgICBkID0gTWF0aC5hYnMoZXZ0LmNsaWVudFkgLSB0aGlzLnN0YXJ0WSksXG4gICAgICAgIGIgPSB0aGlzLmJvdW5kYXJpZXM7XG4gICAgcmV0dXJuIHggPCBiLm1heFggJiYgeCA+IGIubWluWCAmJiBkIDwgdGhpcy50b2xlcmFuY2U7XG59O1xuXG5Nb3VzZXVwT25TY3JvbGxhYmxlWUJ1dHRvbi5wcm90b3R5cGUub25Nb3VzZW1vdmUgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc0luQWN0aXZlWm9uZShldnQpKSB0aGlzLl9hZGRDbHMoKTtcbiAgICAgICAgZWxzZSB0aGlzLm9uTW91c2VjYW5jZWwuY2FsbCh0aGlzLCBldnQpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTW91c2V1cE9uU2Nyb2xsYWJsZVlCdXR0b247XG4iLCIvKlxuICogZGVmYXVsdC9wb2ludGVyLXB1c2gtYnV0dG9uLmpzXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBRID0gcmVxdWlyZSgncScpLFxuICAgIEJ1dHRvbiA9IHJlcXVpcmUoJy4vLi4vLi4vYnV0dG9uJyk7XG5cbnZhciBQb2ludGVyUHVzaEJ1dHRvbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgQnV0dG9uLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICAgIHRoaXMuZGVsYXkgPSBvcHRpb25zLmRlbGF5ID4gMCA/IG9wdGlvbnMuZGVsYXkgOiAwO1xuICAgIHRoaXMuZyA9IG51bGw7XG4gICAgaWYodHlwZW9mIG9wdGlvbnMuZyA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5nID0gb3B0aW9ucy5nO1xuICAgIHRoaXMucHJvbWlzZWYgPSBudWxsO1xuICAgIHRoaXMuYm91bmRhcmllcyA9IHsgbWluWCA6IDAsIG1heFggOiAwLCBtaW5ZIDogMCwgbWF4WSA6IDAgfTtcbiAgICB0aGlzLmxlZnRPckVuZGVkID0gZmFsc2U7XG4gICAgdGhpcy5wb2ludGVySWQgPSBudWxsO1xufTtcblxuUG9pbnRlclB1c2hCdXR0b24ucHJvdG90eXBlID0gKGZ1bmN0aW9uIChwcm90bykge1xuICAgIGZ1bmN0aW9uIEYoKSB7fTtcbiAgICBGLnByb3RvdHlwZSA9IHByb3RvO1xuICAgIHJldHVybiBuZXcgRigpO1xufSkoQnV0dG9uLnByb3RvdHlwZSk7XG5cblBvaW50ZXJQdXNoQnV0dG9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBvaW50ZXJQdXNoQnV0dG9uO1xuXG5Qb2ludGVyUHVzaEJ1dHRvbi5wcm90b3R5cGUuc2V0RyA9IGZ1bmN0aW9uIChnKSB7XG4gICAgaWYgKHR5cGVvZiBnICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCdXR0b24gc2V0RyBtZXRob2QgbmVlZHMgYSBnIGZ1bmN0aW9uIGFzIGFyZ3VtZW50LlwiKTtcbiAgICB0aGlzLmcgPSBnO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuUG9pbnRlclB1c2hCdXR0b24ucHJvdG90eXBlLl9pc0Rvd25Qb2ludGVySWQgPSBmdW5jdGlvbiAocG9pbnRlcklkKSB7XG4gICAgcmV0dXJuIHRoaXMucG9pbnRlcklkID09PSBwb2ludGVySWQ7XG59O1xuXG5Qb2ludGVyUHVzaEJ1dHRvbi5wcm90b3R5cGUuX2lzSW5BY3RpdmVab25lID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIHZhciB4ID0gZXZ0LmNsaWVudFgsXG4gICAgICAgIHkgPSBldnQuY2xpZW50WSxcbiAgICAgICAgYiA9IHRoaXMuYm91bmRhcmllcztcbiAgICByZXR1cm4geCA8IGIubWF4WCAmJiB4ID4gYi5taW5YICYmIHkgPCBiLm1heFkgJiYgeSA+IGIubWluWTtcbn07XG5cblBvaW50ZXJQdXNoQnV0dG9uLnByb3RvdHlwZS5fc2V0UG9pbnRlckNhcHR1cmUgPSBmdW5jdGlvbiAocG9pbnRlcklkKSB7XG4gICAgaWYgKHdpbmRvdy5NU1BvaW50ZXJFdmVudClcbiAgICAgICAgdGhpcy5lbC5tc1NldFBvaW50ZXJDYXB0dXJlKHBvaW50ZXJJZCk7XG4gICAgZWxzZVxuICAgICAgICB0aGlzLmVsLnNldFBvaW50ZXJDYXB0dXJlKHBvaW50ZXJJZCk7XG59O1xuXG5Qb2ludGVyUHVzaEJ1dHRvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBCdXR0b24ucHJvdG90eXBlLmJpbmQuY2FsbCh0aGlzKTtcbiAgICBpZiAod2luZG93Lk1TUG9pbnRlckV2ZW50KSB7XG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyRG93bicsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJNb3ZlJywgdGhpcywgZmFsc2UpO1xuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ01TUG9pbnRlclVwJywgdGhpcywgZmFsc2UpO1xuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ01TUG9pbnRlckNhbmNlbCcsIHRoaXMsIGZhbHNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgdGhpcywgZmFsc2UpO1xuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgdGhpcywgZmFsc2UpO1xuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJ1cCcsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyY2FuY2VsJywgdGhpcywgZmFsc2UpO1xuICAgIH1cbiAgICB0aGlzLmJpbmRlZCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5Qb2ludGVyUHVzaEJ1dHRvbi5wcm90b3R5cGUudW5iaW5kID0gZnVuY3Rpb24gKCkge1xuICAgIEJ1dHRvbi5wcm90b3R5cGUudW5iaW5kLmNhbGwodGhpcyk7XG4gICAgaWYgKHdpbmRvdy5NU1BvaW50ZXJFdmVudCkge1xuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ01TUG9pbnRlckRvd24nLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyTW92ZScsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJVcCcsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJDYW5jZWwnLCB0aGlzLCBmYWxzZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVydXAnLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcmNhbmNlbCcsIHRoaXMsIGZhbHNlKTtcbiAgICB9XG4gICAgdGhpcy5iaW5kZWQgPSBmYWxzZTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cblBvaW50ZXJQdXNoQnV0dG9uLnByb3RvdHlwZS5oYW5kbGVFdmVudCA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICBzd2l0Y2ggKGV2dC50eXBlKSB7XG4gICAgICAgIGNhc2UgJ01TUG9pbnRlckRvd24nOlxuICAgICAgICBjYXNlICdwb2ludGVyZG93bic6XG4gICAgICAgICAgICB0aGlzLm9uUG9pbnRlcmRvd24oZXZ0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdNU1BvaW50ZXJNb3ZlJzpcbiAgICAgICAgY2FzZSAncG9pbnRlcm1vdmUnOlxuICAgICAgICAgICAgdGhpcy5vblBvaW50ZXJtb3ZlKGV2dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnTVNQb2ludGVyVXAnOlxuICAgICAgICBjYXNlICdwb2ludGVydXAnOlxuICAgICAgICAgICAgdGhpcy5vblBvaW50ZXJ1cChldnQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ01TUG9pbnRlckNhbmNlbCc6XG4gICAgICAgIGNhc2UgJ3BvaW50ZXJjYW5jZWwnOlxuICAgICAgICAgICAgdGhpcy5vblBvaW50ZXJjYW5jZWwoZXZ0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cblBvaW50ZXJQdXNoQnV0dG9uLnByb3RvdHlwZS5vblBvaW50ZXJkb3duID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIGlmKCF0aGlzLmFjdGl2ZSAmJiAoIXRoaXMubW9ub3RvdWNoYWJsZSB8fCAhdGhpcy5pc0xvY2tlZCgpKSkge1xuICAgICAgICBpZih0aGlzLm1vbm90b3VjaGFibGUpIHRoaXMubG9jaygpO1xuICAgICAgICB0aGlzLnNldEFjdGl2ZSh0cnVlKTtcbiAgICAgICAgdGhpcy5wb2ludGVySWQgPSBldnQucG9pbnRlcklkO1xuICAgICAgICB0aGlzLl9zZXRQb2ludGVyQ2FwdHVyZShldnQucG9pbnRlcklkKTtcbiAgICAgICAgdmFyIGJvdW5kaW5nUmVjdCA9IHRoaXMuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5taW5YID0gYm91bmRpbmdSZWN0LmxlZnQ7XG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5tYXhYID0gYm91bmRpbmdSZWN0LmxlZnQgKyBib3VuZGluZ1JlY3Qud2lkdGg7XG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5taW5ZID0gYm91bmRpbmdSZWN0LnRvcDtcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLm1heFkgPSBib3VuZGluZ1JlY3QuYm90dG9tO1xuICAgICAgICB0aGlzLnByb21pc2VmID0gUS5kZWxheShldnQsIHRoaXMuZGVsYXkpLnRoZW4odGhpcy5mKTtcbiAgICB9XG59O1xuXG5Qb2ludGVyUHVzaEJ1dHRvbi5wcm90b3R5cGUub25Qb2ludGVybW92ZSA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICBpZiAodGhpcy5hY3RpdmUgJiYgIXRoaXMubGVmdE9yRW5kZWQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzRG93blBvaW50ZXJJZChldnQucG9pbnRlcklkKSkge1xuICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzSW5BY3RpdmVab25lKGV2dCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVDbHMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxlZnRPckVuZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb21pc2VmXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihldnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbih0aGlzLmcpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmluYWxseSh0aGlzLl9kb25lKGV2dCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZG9uZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuUG9pbnRlclB1c2hCdXR0b24ucHJvdG90eXBlLl9kb25lID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIHZhciBidG4gPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmKGJ0bi5tb25vdG91Y2hhYmxlKSBidG4udW5sb2NrKCk7XG4gICAgICAgIGJ0bi5vblBvaW50ZXJjYW5jZWwoZXZ0KTtcbiAgICB9O1xufTtcblxuUG9pbnRlclB1c2hCdXR0b24ucHJvdG90eXBlLm9uUG9pbnRlcnVwID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIGlmICh0aGlzLmFjdGl2ZSAmJiAhdGhpcy5sZWZ0T3JFbmRlZCkge1xuICAgICAgICBpZiAodGhpcy5faXNEb3duUG9pbnRlcklkKGV2dC5wb2ludGVySWQpKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVDbHMoKTtcbiAgICAgICAgICAgIHRoaXMubGVmdE9yRW5kZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5wcm9taXNlZlxuICAgICAgICAgICAgICAgICAgICAudGhlbihldnQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuZylcbiAgICAgICAgICAgICAgICAgICAgLmZpbmFsbHkodGhpcy5fZG9uZShldnQpKVxuICAgICAgICAgICAgICAgICAgICAuZG9uZSgpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuUG9pbnRlclB1c2hCdXR0b24ucHJvdG90eXBlLm9uUG9pbnRlcmNhbmNlbCA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICB0aGlzLnNldEFjdGl2ZShmYWxzZSk7XG4gICAgdGhpcy5sZWZ0T3JFbmRlZCA9IGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb2ludGVyUHVzaEJ1dHRvbjtcbiIsIi8qXG4gKiBkZWZhdWx0L3BvaW50ZXJkb3duLWJ1dHRvbi5qc1xuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgUSA9IHJlcXVpcmUoJ3EnKSxcbiAgICBCdXR0b24gPSByZXF1aXJlKCcuLy4uLy4uL2J1dHRvbicpO1xuXG52YXIgUG9pbnRlcmRvd25CdXR0b24gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIEJ1dHRvbi5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICB0aGlzLmRlbGF5ID0gb3B0aW9ucy5kZWxheSA+IDAgPyBvcHRpb25zLmRlbGF5IDogMDtcbn07XG5cblBvaW50ZXJkb3duQnV0dG9uLnByb3RvdHlwZSA9IChmdW5jdGlvbiAocHJvdG8pIHtcbiAgICBmdW5jdGlvbiBGKCkge307XG4gICAgRi5wcm90b3R5cGUgPSBwcm90bztcbiAgICByZXR1cm4gbmV3IEYoKTtcbn0pKEJ1dHRvbi5wcm90b3R5cGUpO1xuXG5Qb2ludGVyZG93bkJ1dHRvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQb2ludGVyZG93bkJ1dHRvbjtcblxuUG9pbnRlcmRvd25CdXR0b24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgQnV0dG9uLnByb3RvdHlwZS5iaW5kLmNhbGwodGhpcyk7XG4gICAgaWYgKHdpbmRvdy5NU1BvaW50ZXJFdmVudClcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJEb3duJywgdGhpcywgZmFsc2UpO1xuICAgIGVsc2VcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIHRoaXMsIGZhbHNlKTs7XG4gICAgdGhpcy5iaW5kZWQgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuUG9pbnRlcmRvd25CdXR0b24ucHJvdG90eXBlLnVuYmluZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBCdXR0b24ucHJvdG90eXBlLnVuYmluZC5jYWxsKHRoaXMpO1xuICAgIGlmICh3aW5kb3cuTVNQb2ludGVyRXZlbnQpXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyRG93bicsIHRoaXMsIGZhbHNlKTtcbiAgICBlbHNlXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCB0aGlzLCBmYWxzZSk7O1xuICAgIHRoaXMuYmluZGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5Qb2ludGVyZG93bkJ1dHRvbi5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgc3dpdGNoKGV2dC50eXBlKSB7XG4gICAgICAgIGNhc2UgJ01TUG9pbnRlckRvd24nOlxuICAgICAgICBjYXNlICdwb2ludGVyZG93bic6XG4gICAgICAgICAgICB0aGlzLm9uUG9pbnRlcmRvd24oZXZ0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIF9kb25lKGJ0bikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmKGJ0bi5tb25vdG91Y2hhYmxlKSBidG4udW5sb2NrKCk7XG4gICAgICAgIGJ0bi5zZXRBY3RpdmUoZmFsc2UpO1xuICAgIH07XG59O1xuXG5Qb2ludGVyZG93bkJ1dHRvbi5wcm90b3R5cGUub25Qb2ludGVyZG93biA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICBpZiAoIXRoaXMuYWN0aXZlICYmICghdGhpcy5tb25vdG91Y2hhYmxlIHx8ICF0aGlzLmlzTG9ja2VkKCkpKSB7XG4gICAgICAgIHZhciBidG4gPSB0aGlzO1xuICAgICAgICBpZihidG4ubW9ub3RvdWNoYWJsZSkgYnRuLmxvY2soKTtcbiAgICAgICAgYnRuLnNldEFjdGl2ZSh0cnVlKTtcbiAgICAgICAgUS5kZWxheShldnQsIGJ0bi5kZWxheSkudGhlbihidG4uZikuZmluYWxseShfZG9uZShidG4pKS5kb25lKCk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb2ludGVyZG93bkJ1dHRvbjtcbiIsIi8qXG4gKiBkZWZhdWx0L3BvaW50ZXJ1cC1idXR0b24uanNcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIFEgPSByZXF1aXJlKCdxJyksXG4gICAgQnV0dG9uID0gcmVxdWlyZSgnLi8uLi8uLi9idXR0b24nKTtcblxudmFyIFBvaW50ZXJ1cEJ1dHRvbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgQnV0dG9uLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICAgIHRoaXMuYWN0aXZlQm9yZGVyID0gb3B0aW9ucy5hY3RpdmVCb3JkZXIgfHwgNTA7XG4gICAgdGhpcy5ib3VuZGFyaWVzID0geyBtaW5YIDogMCwgbWF4WCA6IDAsIG1pblkgOiAwLCBtYXhZIDogMCB9O1xuICAgIHRoaXMucG9pbnRlcklkID0gbnVsbDtcbn07XG5cblBvaW50ZXJ1cEJ1dHRvbi5wcm90b3R5cGUgPSAoZnVuY3Rpb24gKHByb3RvKSB7XG4gICAgZnVuY3Rpb24gRigpIHt9O1xuICAgIEYucHJvdG90eXBlID0gcHJvdG87XG4gICAgcmV0dXJuIG5ldyBGKCk7XG59KShCdXR0b24ucHJvdG90eXBlKTtcblxuUG9pbnRlcnVwQnV0dG9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBvaW50ZXJ1cEJ1dHRvbjtcblxuUG9pbnRlcnVwQnV0dG9uLnByb3RvdHlwZS5zZXRBY3RpdmVCb3JkZXIgPSBmdW5jdGlvbiAobGVuKSB7XG4gICAgdGhpcy5hY3RpdmVCb3JkZXIgPSBsZW47XG59O1xuXG5Qb2ludGVydXBCdXR0b24ucHJvdG90eXBlLl9pc0Rvd25Qb2ludGVySWQgPSBmdW5jdGlvbiAocG9pbnRlcklkKSB7XG4gICAgcmV0dXJuIHRoaXMucG9pbnRlcklkID09PSBwb2ludGVySWQ7XG59O1xuXG5Qb2ludGVydXBCdXR0b24ucHJvdG90eXBlLl9pc0luQWN0aXZlWm9uZSA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICB2YXIgeCA9IGV2dC5jbGllbnRYLFxuICAgICAgICB5ID0gZXZ0LmNsaWVudFksXG4gICAgICAgIGIgPSB0aGlzLmJvdW5kYXJpZXM7XG4gICAgcmV0dXJuIHggPCBiLm1heFggJiYgeCA+IGIubWluWCAmJiB5IDwgYi5tYXhZICYmIHkgPiBiLm1pblk7XG59O1xuXG5Qb2ludGVydXBCdXR0b24ucHJvdG90eXBlLl9zZXRQb2ludGVyQ2FwdHVyZSA9IGZ1bmN0aW9uIChwb2ludGVySWQpIHtcbiAgICBpZiAod2luZG93Lk1TUG9pbnRlckV2ZW50KVxuICAgICAgICB0aGlzLmVsLm1zU2V0UG9pbnRlckNhcHR1cmUocG9pbnRlcklkKTtcbiAgICBlbHNlXG4gICAgICAgIHRoaXMuZWwuc2V0UG9pbnRlckNhcHR1cmUocG9pbnRlcklkKTtcbn1cblxuUG9pbnRlcnVwQnV0dG9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKCkge1xuICAgIEJ1dHRvbi5wcm90b3R5cGUuYmluZC5jYWxsKHRoaXMpO1xuICAgIGlmICh3aW5kb3cuTVNQb2ludGVyRXZlbnQpIHtcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJEb3duJywgdGhpcywgZmFsc2UpO1xuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ01TUG9pbnRlck1vdmUnLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyVXAnLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyQ2FuY2VsJywgdGhpcywgZmFsc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcnVwJywgdGhpcywgZmFsc2UpO1xuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJjYW5jZWwnLCB0aGlzLCBmYWxzZSk7XG4gICAgfVxuICAgIHRoaXMuYmluZGVkID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cblBvaW50ZXJ1cEJ1dHRvbi5wcm90b3R5cGUudW5iaW5kID0gZnVuY3Rpb24gKCkge1xuICAgIEJ1dHRvbi5wcm90b3R5cGUudW5iaW5kLmNhbGwodGhpcyk7XG4gICAgaWYgKHdpbmRvdy5NU1BvaW50ZXJFdmVudCkge1xuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ01TUG9pbnRlckRvd24nLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyTW92ZScsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJVcCcsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJDYW5jZWwnLCB0aGlzLCBmYWxzZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVydXAnLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcmNhbmNlbCcsIHRoaXMsIGZhbHNlKTtcbiAgICB9XG4gICAgdGhpcy5iaW5kZWQgPSBmYWxzZTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cblBvaW50ZXJ1cEJ1dHRvbi5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgc3dpdGNoIChldnQudHlwZSkge1xuICAgICAgICBjYXNlICdNU1BvaW50ZXJEb3duJzpcbiAgICAgICAgY2FzZSAncG9pbnRlcmRvd24nOlxuICAgICAgICAgICAgdGhpcy5vblBvaW50ZXJkb3duKGV2dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnTVNQb2ludGVyTW92ZSc6XG4gICAgICAgIGNhc2UgJ3BvaW50ZXJtb3ZlJzpcbiAgICAgICAgICAgIHRoaXMub25Qb2ludGVybW92ZShldnQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ01TUG9pbnRlclVwJzpcbiAgICAgICAgY2FzZSAncG9pbnRlcnVwJzpcbiAgICAgICAgICAgIHRoaXMub25Qb2ludGVydXAoZXZ0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdNU1BvaW50ZXJDYW5jZWwnOlxuICAgICAgICBjYXNlICdwb2ludGVyY2FuY2VsJzpcbiAgICAgICAgICAgIHRoaXMub25Qb2ludGVyY2FuY2VsKGV2dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59O1xuXG5Qb2ludGVydXBCdXR0b24ucHJvdG90eXBlLm9uUG9pbnRlcmRvd24gPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYgKCF0aGlzLmFjdGl2ZSAgJiYgKCF0aGlzLm1vbm90b3VjaGFibGUgfHwgIXRoaXMuaXNMb2NrZWQoKSkpIHtcbiAgICAgICAgaWYodGhpcy5tb25vdG91Y2hhYmxlKSB0aGlzLmxvY2soKTtcbiAgICAgICAgdGhpcy5zZXRBY3RpdmUodHJ1ZSk7XG4gICAgICAgIHRoaXMucG9pbnRlcklkID0gZXZ0LnBvaW50ZXJJZDtcbiAgICAgICAgdGhpcy5fc2V0UG9pbnRlckNhcHR1cmUoZXZ0LnBvaW50ZXJJZCk7XG4gICAgICAgIHRoaXMudHJpZ2dlck9uUG9pbnRlcnVwID0gdHJ1ZTtcbiAgICAgICAgdmFyIGJvdW5kaW5nUmVjdCA9IHRoaXMuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5taW5YID0gYm91bmRpbmdSZWN0LmxlZnQgLSB0aGlzLmFjdGl2ZUJvcmRlcjtcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLm1heFggPSBib3VuZGluZ1JlY3QubGVmdCArIGJvdW5kaW5nUmVjdC53aWR0aCArIHRoaXMuYWN0aXZlQm9yZGVyO1xuICAgICAgICB0aGlzLmJvdW5kYXJpZXMubWluWSA9IGJvdW5kaW5nUmVjdC50b3AgLSB0aGlzLmFjdGl2ZUJvcmRlcjtcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLm1heFkgPSBib3VuZGluZ1JlY3QuYm90dG9tICsgIHRoaXMuYWN0aXZlQm9yZGVyO1xuICAgIH1cbn07XG5cblBvaW50ZXJ1cEJ1dHRvbi5wcm90b3R5cGUub25Qb2ludGVybW92ZSA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICBpZiAodGhpcy5hY3RpdmUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzRG93blBvaW50ZXJJZChldnQucG9pbnRlcklkKSkge1xuICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNJbkFjdGl2ZVpvbmUoZXZ0KSkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck9uUG9pbnRlcnVwID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRDbHMoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyT25Qb2ludGVydXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVDbHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cblBvaW50ZXJ1cEJ1dHRvbi5wcm90b3R5cGUuX2RvbmUgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgdmFyIGJ0biA9IHRoaXM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYoYnRuLm1vbm90b3VjaGFibGUpIGJ0bi51bmxvY2soKTtcbiAgICAgICAgYnRuLm9uUG9pbnRlcmNhbmNlbChldnQpO1xuICAgIH07XG59O1xuXG5Qb2ludGVydXBCdXR0b24ucHJvdG90eXBlLm9uUG9pbnRlcnVwID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgICBpZiAodGhpcy5faXNEb3duUG9pbnRlcklkKGV2dC5wb2ludGVySWQpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50cmlnZ2VyT25Qb2ludGVydXApIHtcbiAgICAgICAgICAgICAgICB2YXIgYnRuID0gdGhpcztcbiAgICAgICAgICAgICAgICBidG4uX3JlbW92ZUNscygpO1xuICAgICAgICAgICAgICAgIFEoZXZ0KS50aGVuKGJ0bi5mKS5maW5hbGx5KGJ0bi5fZG9uZShldnQpKS5kb25lKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RvbmUoZXZ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cblBvaW50ZXJ1cEJ1dHRvbi5wcm90b3R5cGUub25Qb2ludGVyY2FuY2VsID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIHRoaXMuX3JlbW92ZUNscygpO1xuICAgIGlmICh0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBmYWxzZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUG9pbnRlcnVwQnV0dG9uO1xuIiwiLypcbiAqIHNjcm9sbGFibGUteC9wb2ludGVydXAtYnV0dG9uLmpzXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBQb2ludGVydXBCdXR0b24gPSByZXF1aXJlKCcuLy4uL2RlZmF1bHQvcG9pbnRlcnVwLWJ1dHRvbicpO1xuXG52YXIgUG9pbnRlcnVwT25TY3JvbGxhYmxlWEJ1dHRvbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgUG9pbnRlcnVwQnV0dG9uLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICAgIHRoaXMudG9sZXJhbmNlID0gb3B0aW9ucy50b2xlcmFuY2UgfHwgMTA7XG59O1xuXG5Qb2ludGVydXBPblNjcm9sbGFibGVYQnV0dG9uLnByb3RvdHlwZSA9IChmdW5jdGlvbiAocHJvdG8pIHtcbiAgICBmdW5jdGlvbiBGKCkge307XG4gICAgRi5wcm90b3R5cGUgPSBwcm90bztcbiAgICByZXR1cm4gbmV3IEYoKTtcbn0pKFBvaW50ZXJ1cEJ1dHRvbi5wcm90b3R5cGUpO1xuXG5Qb2ludGVydXBPblNjcm9sbGFibGVYQnV0dG9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBvaW50ZXJ1cE9uU2Nyb2xsYWJsZVhCdXR0b247XG5cblBvaW50ZXJ1cE9uU2Nyb2xsYWJsZVhCdXR0b24ucHJvdG90eXBlLm9uUG9pbnRlcmRvd24gPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYgKCF0aGlzLmFjdGl2ZSAmJiAoIXRoaXMubW9ub3RvdWNoYWJsZSB8fCAhdGhpcy5pc0xvY2tlZCgpKSlcbiAgICAgICAgdGhpcy5zdGFydFggPSBldnQuY2xpZW50WDtcbiAgICBQb2ludGVydXBCdXR0b24ucHJvdG90eXBlLm9uUG9pbnRlcmRvd24uY2FsbCh0aGlzLCBldnQpO1xufTtcblxuUG9pbnRlcnVwT25TY3JvbGxhYmxlWEJ1dHRvbi5wcm90b3R5cGUuX2lzSW5BY3RpdmVab25lID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIHZhciB5ID0gZXZ0LmNsaWVudFksXG4gICAgICAgIGQgPSBNYXRoLmFicyhldnQuY2xpZW50WCAtIHRoaXMuc3RhcnRYKSxcbiAgICAgICAgYiA9IHRoaXMuYm91bmRhcmllcztcbiAgICByZXR1cm4geSA8IGIubWF4WSAmJiB5ID4gYi5taW5ZICYmIGQgPCB0aGlzLnRvbGVyYW5jZTtcbn07XG5cblBvaW50ZXJ1cE9uU2Nyb2xsYWJsZVhCdXR0b24ucHJvdG90eXBlLm9uUG9pbnRlcm1vdmUgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc0Rvd25Qb2ludGVySWQoZXZ0LnBvaW50ZXJJZCkpIHtcbiAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzSW5BY3RpdmVab25lKGV2dCkpIHRoaXMuX2FkZENscygpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLl9kb25lLmNhbGwodGhpcywgZXZ0KSgpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb2ludGVydXBPblNjcm9sbGFibGVYQnV0dG9uO1xuIiwiLypcbiAqIHNjcm9sbGFibGUteS9wb2ludGVydXAtYnV0dG9uLmpzXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBQb2ludGVydXBCdXR0b24gPSByZXF1aXJlKCcuLy4uL2RlZmF1bHQvcG9pbnRlcnVwLWJ1dHRvbicpO1xuXG52YXIgUG9pbnRlcnVwT25TY3JvbGxhYmxlWUJ1dHRvbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgUG9pbnRlcnVwQnV0dG9uLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICAgIHRoaXMudG9sZXJhbmNlID0gb3B0aW9ucy50b2xlcmFuY2UgfHwgMTA7XG59O1xuXG5Qb2ludGVydXBPblNjcm9sbGFibGVZQnV0dG9uLnByb3RvdHlwZSA9IChmdW5jdGlvbiAocHJvdG8pIHtcbiAgICBmdW5jdGlvbiBGKCkge307XG4gICAgRi5wcm90b3R5cGUgPSBwcm90bztcbiAgICByZXR1cm4gbmV3IEYoKTtcbn0pKFBvaW50ZXJ1cEJ1dHRvbi5wcm90b3R5cGUpO1xuXG5Qb2ludGVydXBPblNjcm9sbGFibGVZQnV0dG9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBvaW50ZXJ1cE9uU2Nyb2xsYWJsZVlCdXR0b247XG5cblBvaW50ZXJ1cE9uU2Nyb2xsYWJsZVlCdXR0b24ucHJvdG90eXBlLm9uUG9pbnRlcmRvd24gPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYgKCF0aGlzLmFjdGl2ZSAmJiAoIXRoaXMubW9ub3RvdWNoYWJsZSB8fCAhdGhpcy5pc0xvY2tlZCgpKSlcbiAgICAgICAgdGhpcy5zdGFydFkgPSBldnQuY2xpZW50WTtcbiAgICBQb2ludGVydXBCdXR0b24ucHJvdG90eXBlLm9uUG9pbnRlcmRvd24uY2FsbCh0aGlzLCBldnQpO1xufTtcblxuUG9pbnRlcnVwT25TY3JvbGxhYmxlWUJ1dHRvbi5wcm90b3R5cGUuX2lzSW5BY3RpdmVab25lID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIHZhciB4ID0gZXZ0LmNsaWVudFgsXG4gICAgICAgIGQgPSBNYXRoLmFicyhldnQuY2xpZW50WSAtIHRoaXMuc3RhcnRZKSxcbiAgICAgICAgYiA9IHRoaXMuYm91bmRhcmllcztcbiAgICByZXR1cm4geCA8IGIubWF4WCAmJiB4ID4gYi5taW5YICYmIGQgPCB0aGlzLnRvbGVyYW5jZTtcbn07XG5cblBvaW50ZXJ1cE9uU2Nyb2xsYWJsZVlCdXR0b24ucHJvdG90eXBlLm9uUG9pbnRlcm1vdmUgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc0Rvd25Qb2ludGVySWQoZXZ0LnBvaW50ZXJJZCkpIHtcbiAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzSW5BY3RpdmVab25lKGV2dCkpIHRoaXMuX2FkZENscygpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLl9kb25lLmNhbGwodGhpcywgZXZ0KSgpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb2ludGVydXBPblNjcm9sbGFibGVZQnV0dG9uO1xuIiwiLypcbiAqIGRlZmF1bHQvdG91Y2gtcHVzaC1idXR0b24uanNcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIFEgPSByZXF1aXJlKCdxJyksXG4gICAgQnV0dG9uID0gcmVxdWlyZSgnLi8uLi8uLi9idXR0b24nKTtcblxudmFyIFRvdWNoUHVzaEJ1dHRvbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgQnV0dG9uLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICAgIHRoaXMuZGVsYXkgPSBvcHRpb25zLmRlbGF5ID4gMCA/IG9wdGlvbnMuZGVsYXkgOiAwO1xuICAgIHRoaXMuZyA9IG51bGw7XG4gICAgaWYodHlwZW9mIG9wdGlvbnMuZyA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5nID0gb3B0aW9ucy5nO1xuICAgIHRoaXMucHJvbWlzZWYgPSBudWxsO1xuICAgIHRoaXMuYm91bmRhcmllcyA9IHsgbWluWCA6IDAsIG1heFggOiAwLCBtaW5ZIDogMCwgbWF4WSA6IDAgfTtcbiAgICB0aGlzLmxlZnRPckVuZGVkID0gZmFsc2U7XG4gICAgdGhpcy5pZGVudGlmaWVyID0gbnVsbDtcbn07XG5cblRvdWNoUHVzaEJ1dHRvbi5wcm90b3R5cGUgPSAoZnVuY3Rpb24gKHByb3RvKSB7XG4gICAgZnVuY3Rpb24gRigpIHt9O1xuICAgIEYucHJvdG90eXBlID0gcHJvdG87XG4gICAgcmV0dXJuIG5ldyBGKCk7XG59KShCdXR0b24ucHJvdG90eXBlKTtcblxuVG91Y2hQdXNoQnV0dG9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRvdWNoUHVzaEJ1dHRvbjtcblxuVG91Y2hQdXNoQnV0dG9uLnByb3RvdHlwZS5zZXRHID0gZnVuY3Rpb24gKGcpIHtcbiAgICBpZiAodHlwZW9mIGcgIT09ICdmdW5jdGlvbicpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkJ1dHRvbiBzZXRHIG1ldGhvZCBuZWVkcyBhIGcgZnVuY3Rpb24gYXMgYXJndW1lbnQuXCIpO1xuICAgIHRoaXMuZyA9IGc7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5Ub3VjaFB1c2hCdXR0b24ucHJvdG90eXBlLl9nZXRUb3VjaCA9IGZ1bmN0aW9uIChjaGFuZ2VkVG91Y2hlcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGNoYW5nZWRUb3VjaGVzW2ldLmlkZW50aWZpZXIgPT09IHRoaXMuaWRlbnRpZmllcikge1xuICAgICAgICAgICAgcmV0dXJuIGNoYW5nZWRUb3VjaGVzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxuVG91Y2hQdXNoQnV0dG9uLnByb3RvdHlwZS5faXNJbkFjdGl2ZVpvbmUgPSBmdW5jdGlvbiAodG91Y2gpIHtcbiAgICB2YXIgeCA9IHRvdWNoLmNsaWVudFgsXG4gICAgICAgIHkgPSB0b3VjaC5jbGllbnRZLFxuICAgICAgICBiID0gdGhpcy5ib3VuZGFyaWVzO1xuICAgIHJldHVybiB4IDwgYi5tYXhYICYmIHggPiBiLm1pblggJiYgeSA8IGIubWF4WSAmJiB5ID4gYi5taW5ZO1xufTtcblxuVG91Y2hQdXNoQnV0dG9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKCkge1xuICAgIEJ1dHRvbi5wcm90b3R5cGUuYmluZC5jYWxsKHRoaXMpO1xuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMsIGZhbHNlKTtcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMsIGZhbHNlKTtcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcywgZmFsc2UpO1xuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLCBmYWxzZSk7XG4gICAgdGhpcy5iaW5kZWQgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuVG91Y2hQdXNoQnV0dG9uLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgQnV0dG9uLnByb3RvdHlwZS51bmJpbmQuY2FsbCh0aGlzKTtcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLCBmYWxzZSk7XG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLCBmYWxzZSk7XG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMsIGZhbHNlKTtcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcywgZmFsc2UpO1xuICAgIHRoaXMuYmluZGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5Ub3VjaFB1c2hCdXR0b24ucHJvdG90eXBlLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIHN3aXRjaChldnQudHlwZSkge1xuICAgICAgICBjYXNlICd0b3VjaHN0YXJ0JzpcbiAgICAgICAgICAgIHRoaXMub25Ub3VjaHN0YXJ0KGV2dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndG91Y2htb3ZlJzpcbiAgICAgICAgICAgIHRoaXMub25Ub3VjaG1vdmUoZXZ0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0b3VjaGVuZCc6XG4gICAgICAgICAgICB0aGlzLm9uVG91Y2hlbmQoZXZ0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0b3VjaGNhbmNlbCc6XG4gICAgICAgICAgICB0aGlzLm9uVG91Y2hjYW5jZWwoZXZ0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cblRvdWNoUHVzaEJ1dHRvbi5wcm90b3R5cGUub25Ub3VjaHN0YXJ0ID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIGlmKCF0aGlzLmFjdGl2ZSAmJiAoIXRoaXMubW9ub3RvdWNoYWJsZSB8fCAhdGhpcy5pc0xvY2tlZCgpKSkge1xuICAgICAgICBpZih0aGlzLm1vbm90b3VjaGFibGUpIHRoaXMubG9jaygpO1xuICAgICAgICB0aGlzLnNldEFjdGl2ZSh0cnVlKTtcbiAgICAgICAgdGhpcy5pZGVudGlmaWVyID0gZXZ0LmNoYW5nZWRUb3VjaGVzWzBdLmlkZW50aWZpZXI7XG4gICAgICAgIHZhciBib3VuZGluZ1JlY3QgPSB0aGlzLmVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0aGlzLmJvdW5kYXJpZXMubWluWCA9IGJvdW5kaW5nUmVjdC5sZWZ0O1xuICAgICAgICB0aGlzLmJvdW5kYXJpZXMubWF4WCA9IGJvdW5kaW5nUmVjdC5sZWZ0ICsgYm91bmRpbmdSZWN0LndpZHRoO1xuICAgICAgICB0aGlzLmJvdW5kYXJpZXMubWluWSA9IGJvdW5kaW5nUmVjdC50b3A7XG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5tYXhZID0gYm91bmRpbmdSZWN0LmJvdHRvbTtcbiAgICAgICAgdGhpcy5wcm9taXNlZiA9IFEuZGVsYXkoZXZ0LCB0aGlzLmRlbGF5KS50aGVuKHRoaXMuZik7XG4gICAgfVxufTtcblxuVG91Y2hQdXNoQnV0dG9uLnByb3RvdHlwZS5vblRvdWNobW92ZSA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICBpZih0aGlzLmFjdGl2ZSAmJiAhdGhpcy5sZWZ0T3JFbmRlZCkge1xuICAgICAgICB2YXIgdG91Y2ggPSB0aGlzLl9nZXRUb3VjaChldnQuY2hhbmdlZFRvdWNoZXMpO1xuICAgICAgICBpZiAodG91Y2gpIHtcbiAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYoIXRoaXMuX2lzSW5BY3RpdmVab25lKHRvdWNoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZUNscygpO1xuICAgICAgICAgICAgICAgIHRoaXMubGVmdE9yRW5kZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvbWlzZWZcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGV2dClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuZylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maW5hbGx5KHRoaXMuX2RvbmUoZXZ0KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kb25lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5Ub3VjaFB1c2hCdXR0b24ucHJvdG90eXBlLl9kb25lID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIHZhciBidG4gPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmKGJ0bi5tb25vdG91Y2hhYmxlKSBidG4udW5sb2NrKCk7XG4gICAgICAgIGJ0bi5vblRvdWNoY2FuY2VsKGV2dCk7XG4gICAgfTtcbn07XG5cblRvdWNoUHVzaEJ1dHRvbi5wcm90b3R5cGUub25Ub3VjaGVuZCA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICBpZih0aGlzLmFjdGl2ZSAmJiAhdGhpcy5sZWZ0T3JFbmRlZCkge1xuICAgICAgICBpZiAodGhpcy5fZ2V0VG91Y2goZXZ0LmNoYW5nZWRUb3VjaGVzKSkge1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlQ2xzKCk7XG4gICAgICAgICAgICB0aGlzLmxlZnRPckVuZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMucHJvbWlzZWZcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZXZ0KVxuICAgICAgICAgICAgICAgICAgICAudGhlbih0aGlzLmcpXG4gICAgICAgICAgICAgICAgICAgIC5maW5hbGx5KHRoaXMuX2RvbmUoZXZ0KSlcbiAgICAgICAgICAgICAgICAgICAgLmRvbmUoKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblRvdWNoUHVzaEJ1dHRvbi5wcm90b3R5cGUub25Ub3VjaGNhbmNlbCA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICB0aGlzLnNldEFjdGl2ZShmYWxzZSk7XG4gICAgdGhpcy5sZWZ0T3JFbmRlZCA9IGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUb3VjaFB1c2hCdXR0b247XG4iLCIvKlxuICogZGVmYXVsdC90b3VjaGVuZC1idXR0b24uanNcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIFEgPSByZXF1aXJlKCdxJyksXG4gICAgQnV0dG9uID0gcmVxdWlyZSgnLi8uLi8uLi9idXR0b24nKTtcblxudmFyIFRvdWNoZW5kQnV0dG9uID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBCdXR0b24ucHJvdG90eXBlLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgdGhpcy5hY3RpdmVCb3JkZXIgPSBvcHRpb25zLmFjdGl2ZUJvcmRlciB8fCA1MDtcbiAgICB0aGlzLmJvdW5kYXJpZXMgPSB7IG1pblggOiAwLCBtYXhYIDogMCwgbWluWSA6IDAsIG1heFkgOiAwIH07XG4gICAgdGhpcy5pZGVudGlmaWVyID0gbnVsbDtcbn07XG5cblRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZSA9IChmdW5jdGlvbiAocHJvdG8pIHtcbiAgICBmdW5jdGlvbiBGKCkge307XG4gICAgRi5wcm90b3R5cGUgPSBwcm90bztcbiAgICByZXR1cm4gbmV3IEYoKTtcbn0pKEJ1dHRvbi5wcm90b3R5cGUpO1xuXG5Ub3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUb3VjaGVuZEJ1dHRvbjtcblxuVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlLnNldEFjdGl2ZUJvcmRlciA9IGZ1bmN0aW9uIChsZW4pIHtcbiAgICB0aGlzLmFjdGl2ZUJvcmRlciA9IGxlbjtcbn07XG5cblRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZS5fZ2V0VG91Y2ggPSBmdW5jdGlvbiAoY2hhbmdlZFRvdWNoZXMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjaGFuZ2VkVG91Y2hlc1tpXS5pZGVudGlmaWVyID09PSB0aGlzLmlkZW50aWZpZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGFuZ2VkVG91Y2hlc1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cblRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZS5faXNJbkFjdGl2ZVpvbmUgPSBmdW5jdGlvbiAodG91Y2gpIHtcbiAgICB2YXIgeCA9IHRvdWNoLmNsaWVudFgsXG4gICAgICAgIHkgPSB0b3VjaC5jbGllbnRZLFxuICAgICAgICBiID0gdGhpcy5ib3VuZGFyaWVzO1xuICAgIHJldHVybiB4IDwgYi5tYXhYICYmIHggPiBiLm1pblggJiYgeSA8IGIubWF4WSAmJiB5ID4gYi5taW5ZO1xufTtcblxuVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgQnV0dG9uLnByb3RvdHlwZS5iaW5kLmNhbGwodGhpcyk7XG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcywgZmFsc2UpO1xuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcywgZmFsc2UpO1xuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLCBmYWxzZSk7XG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMsIGZhbHNlKTtcbiAgICB0aGlzLmJpbmRlZCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5Ub3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUudW5iaW5kID0gZnVuY3Rpb24gKCkge1xuICAgIEJ1dHRvbi5wcm90b3R5cGUudW5iaW5kLmNhbGwodGhpcyk7XG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcywgZmFsc2UpO1xuICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcywgZmFsc2UpO1xuICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLCBmYWxzZSk7XG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMsIGZhbHNlKTtcbiAgICB0aGlzLmJpbmRlZCA9IGZhbHNlO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIHN3aXRjaChldnQudHlwZSkge1xuICAgICAgICBjYXNlICd0b3VjaHN0YXJ0JzpcbiAgICAgICAgICAgIHRoaXMub25Ub3VjaHN0YXJ0KGV2dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndG91Y2htb3ZlJzpcbiAgICAgICAgICAgIHRoaXMub25Ub3VjaG1vdmUoZXZ0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0b3VjaGVuZCc6XG4gICAgICAgICAgICB0aGlzLm9uVG91Y2hlbmQoZXZ0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0b3VjaGNhbmNlbCc6XG4gICAgICAgICAgICB0aGlzLm9uVG91Y2hjYW5jZWwoZXZ0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cblRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZS5vblRvdWNoc3RhcnQgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYoIXRoaXMuYWN0aXZlICYmICghdGhpcy5tb25vdG91Y2hhYmxlIHx8ICF0aGlzLmlzTG9ja2VkKCkpKSB7XG4gICAgICAgIGlmKHRoaXMubW9ub3RvdWNoYWJsZSkgdGhpcy5sb2NrKCk7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50cmlnZ2VyT25Ub3VjaGVuZCA9IHRydWU7XG4gICAgICAgIHRoaXMuaWRlbnRpZmllciA9IGV2dC5jaGFuZ2VkVG91Y2hlc1swXS5pZGVudGlmaWVyO1xuICAgICAgICB2YXIgYm91bmRpbmdSZWN0ID0gdGhpcy5lbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdGhpcy5ib3VuZGFyaWVzLm1pblggPSBib3VuZGluZ1JlY3QubGVmdCAtIHRoaXMuYWN0aXZlQm9yZGVyO1xuICAgICAgICB0aGlzLmJvdW5kYXJpZXMubWF4WCA9IGJvdW5kaW5nUmVjdC5sZWZ0ICsgYm91bmRpbmdSZWN0LndpZHRoICsgdGhpcy5hY3RpdmVCb3JkZXI7XG4gICAgICAgIHRoaXMuYm91bmRhcmllcy5taW5ZID0gYm91bmRpbmdSZWN0LnRvcCAtIHRoaXMuYWN0aXZlQm9yZGVyO1xuICAgICAgICB0aGlzLmJvdW5kYXJpZXMubWF4WSA9IGJvdW5kaW5nUmVjdC5ib3R0b20gKyAgdGhpcy5hY3RpdmVCb3JkZXI7XG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCh0aGlzLmFjdGl2ZUNscyk7XG4gICAgfVxufTtcblxuVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlLm9uVG91Y2htb3ZlID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIGlmKHRoaXMuYWN0aXZlKSB7XG4gICAgICAgIHZhciB0b3VjaCA9IHRoaXMuX2dldFRvdWNoKGV2dC5jaGFuZ2VkVG91Y2hlcyk7XG4gICAgICAgIGlmICh0b3VjaCkge1xuICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZih0aGlzLl9pc0luQWN0aXZlWm9uZSh0b3VjaCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJPblRvdWNoZW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRDbHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlck9uVG91Y2hlbmQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVDbHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cblRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZS5fZG9uZSA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICB2YXIgYnRuID0gdGhpcztcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZihidG4ubW9ub3RvdWNoYWJsZSkgYnRuLnVubG9jaygpO1xuICAgICAgICBidG4ub25Ub3VjaGNhbmNlbChldnQpO1xuICAgIH07XG59O1xuXG5Ub3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUub25Ub3VjaGVuZCA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICBpZih0aGlzLmFjdGl2ZSkge1xuICAgICAgICBpZiAodGhpcy5fZ2V0VG91Y2goZXZ0LmNoYW5nZWRUb3VjaGVzKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMudHJpZ2dlck9uVG91Y2hlbmQpIHtcbiAgICAgICAgICAgICAgICB2YXIgYnRuID0gdGhpcztcbiAgICAgICAgICAgICAgICBidG4uX3JlbW92ZUNscygpO1xuICAgICAgICAgICAgICAgIFEoZXZ0KS50aGVuKGJ0bi5mKS5maW5hbGx5KGJ0bi5fZG9uZShldnQpKS5kb25lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kb25lKGV2dCkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cblRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZS5vblRvdWNoY2FuY2VsID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIHRoaXMuX3JlbW92ZUNscygpO1xuICAgIGlmKHRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUb3VjaGVuZEJ1dHRvbjtcbiIsIi8qXG4gKiBkZWZhdWx0L3RvdWNoc3RhcnQtYnV0dG9uLmpzXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBRID0gcmVxdWlyZSgncScpLFxuICAgIEJ1dHRvbiA9IHJlcXVpcmUoJy4vLi4vLi4vYnV0dG9uJyk7XG5cbnZhciBUb3VjaHN0YXJ0QnV0dG9uID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBCdXR0b24ucHJvdG90eXBlLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgdGhpcy5kZWxheSA9IG9wdGlvbnMuZGVsYXkgPiAwID8gb3B0aW9ucy5kZWxheSA6IDA7XG59O1xuXG5Ub3VjaHN0YXJ0QnV0dG9uLnByb3RvdHlwZSA9IChmdW5jdGlvbiAocHJvdG8pIHtcbiAgICBmdW5jdGlvbiBGKCkge307XG4gICAgRi5wcm90b3R5cGUgPSBwcm90bztcbiAgICByZXR1cm4gbmV3IEYoKTtcbn0pKEJ1dHRvbi5wcm90b3R5cGUpO1xuXG5Ub3VjaHN0YXJ0QnV0dG9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRvdWNoc3RhcnRCdXR0b247XG5cblRvdWNoc3RhcnRCdXR0b24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgQnV0dG9uLnByb3RvdHlwZS5iaW5kLmNhbGwodGhpcyk7XG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcywgZmFsc2UpO1xuICAgIHRoaXMuYmluZGVkID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cblRvdWNoc3RhcnRCdXR0b24ucHJvdG90eXBlLnVuYmluZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBCdXR0b24ucHJvdG90eXBlLnVuYmluZC5jYWxsKHRoaXMpO1xuICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMsIGZhbHNlKTtcbiAgICB0aGlzLmJpbmRlZCA9IGZhbHNlO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuVG91Y2hzdGFydEJ1dHRvbi5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgc3dpdGNoKGV2dC50eXBlKSB7XG4gICAgICAgIGNhc2UgJ3RvdWNoc3RhcnQnOlxuICAgICAgICAgICAgdGhpcy5vblRvdWNoc3RhcnQoZXZ0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIF9kb25lKGJ0bikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmKGJ0bi5tb25vdG91Y2hhYmxlKSBidG4udW5sb2NrKCk7XG4gICAgICAgIGJ0bi5zZXRBY3RpdmUoZmFsc2UpO1xuICAgIH07XG59O1xuXG5Ub3VjaHN0YXJ0QnV0dG9uLnByb3RvdHlwZS5vblRvdWNoc3RhcnQgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYgKCF0aGlzLmFjdGl2ZSAmJiAoIXRoaXMubW9ub3RvdWNoYWJsZSB8fCAhdGhpcy5pc0xvY2tlZCgpKSkge1xuICAgICAgICB2YXIgYnRuID0gdGhpcztcbiAgICAgICAgaWYoYnRuLm1vbm90b3VjaGFibGUpIGJ0bi5sb2NrKCk7XG4gICAgICAgIGJ0bi5zZXRBY3RpdmUodHJ1ZSk7XG4gICAgICAgIFEuZGVsYXkoZXZ0LCBidG4uZGVsYXkpLnRoZW4oYnRuLmYpLmZpbmFsbHkoX2RvbmUoYnRuKSkuZG9uZSgpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVG91Y2hzdGFydEJ1dHRvbjtcbiIsIi8qXG4gKiBzY3JvbGxhYmxlLXgvdG91Y2hlbmQtYnV0dG9uLmpzXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBUb3VjaGVuZEJ1dHRvbiA9IHJlcXVpcmUoJy4vLi4vZGVmYXVsdC90b3VjaGVuZC1idXR0b24nKTtcblxudmFyIFNjcm9sbGFibGVYVG91Y2hlbmRCdXR0b24gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIFRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICAgIHRoaXMudG9sZXJhbmNlID0gb3B0aW9ucy50b2xlcmFuY2UgfHwgMTA7XG59O1xuXG5TY3JvbGxhYmxlWFRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZSA9IChmdW5jdGlvbiAocHJvdG8pIHtcbiAgICBmdW5jdGlvbiBGKCkge307XG4gICAgRi5wcm90b3R5cGUgPSBwcm90bztcbiAgICByZXR1cm4gbmV3IEYoKTtcbn0pKFRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZSk7XG5cblNjcm9sbGFibGVYVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2Nyb2xsYWJsZVhUb3VjaGVuZEJ1dHRvbjtcblxuU2Nyb2xsYWJsZVhUb3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUub25Ub3VjaHN0YXJ0ID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIGlmKCF0aGlzLmFjdGl2ZSAmJiAoIXRoaXMubW9ub3RvdWNoYWJsZSB8fCAhdGhpcy5pc0xvY2tlZCgpKSlcbiAgICAgICAgdGhpcy5zdGFydFggPSBldnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICBUb3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUub25Ub3VjaHN0YXJ0LmNhbGwodGhpcywgZXZ0KTtcbn07XG5cblNjcm9sbGFibGVYVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlLl9pc0luQWN0aXZlWm9uZSA9IGZ1bmN0aW9uICh0b3VjaCkge1xuICAgIHZhciB5ID0gdG91Y2guY2xpZW50WSxcbiAgICAgICAgZCA9IE1hdGguYWJzKHRvdWNoLmNsaWVudFggLSB0aGlzLnN0YXJ0WCksXG4gICAgICAgIGIgPSB0aGlzLmJvdW5kYXJpZXM7XG4gICAgcmV0dXJuIHkgPCBiLm1heFkgJiYgeSA+IGIubWluWSAmJiBkIDwgdGhpcy50b2xlcmFuY2U7XG59O1xuXG5TY3JvbGxhYmxlWFRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZS5vblRvdWNobW92ZSA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICBpZih0aGlzLmFjdGl2ZSkge1xuICAgICAgICB2YXIgdG91Y2ggPSB0aGlzLl9nZXRUb3VjaChldnQuY2hhbmdlZFRvdWNoZXMpO1xuICAgICAgICBpZiAodG91Y2gpIHtcbiAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYodGhpcy5faXNJbkFjdGl2ZVpvbmUodG91Y2gpKSB0aGlzLl9hZGRDbHMoKTtcbiAgICAgICAgICAgIGVsc2UgdGhpcy5fZG9uZS5jYWxsKHRoaXMsIGV2dCkoKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2Nyb2xsYWJsZVhUb3VjaGVuZEJ1dHRvbjtcbiIsIi8qXG4gKiBzY3JvbGxhYmxlLXkvdG91Y2hlbmQtYnV0dG9uLmpzXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBUb3VjaGVuZEJ1dHRvbiA9IHJlcXVpcmUoJy4vLi4vZGVmYXVsdC90b3VjaGVuZC1idXR0b24nKTtcblxudmFyIFNjcm9sbGFibGVZVG91Y2hlbmRCdXR0b24gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIFRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICAgIHRoaXMudG9sZXJhbmNlID0gb3B0aW9ucy50b2xlcmFuY2UgfHwgMTA7XG59O1xuXG5TY3JvbGxhYmxlWVRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZSA9IChmdW5jdGlvbiAocHJvdG8pIHtcbiAgICBmdW5jdGlvbiBGKCkge307XG4gICAgRi5wcm90b3R5cGUgPSBwcm90bztcbiAgICByZXR1cm4gbmV3IEYoKTtcbn0pKFRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZSk7XG5cblNjcm9sbGFibGVZVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2Nyb2xsYWJsZVlUb3VjaGVuZEJ1dHRvbjtcblxuU2Nyb2xsYWJsZVlUb3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUub25Ub3VjaHN0YXJ0ID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIGlmKCF0aGlzLmFjdGl2ZSAmJiAoIXRoaXMubW9ub3RvdWNoYWJsZSB8fCAhdGhpcy5pc0xvY2tlZCgpKSlcbiAgICAgICAgdGhpcy5zdGFydFkgPSBldnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICBUb3VjaGVuZEJ1dHRvbi5wcm90b3R5cGUub25Ub3VjaHN0YXJ0LmNhbGwodGhpcywgZXZ0KTtcbn07XG5cblNjcm9sbGFibGVZVG91Y2hlbmRCdXR0b24ucHJvdG90eXBlLl9pc0luQWN0aXZlWm9uZSA9IGZ1bmN0aW9uICh0b3VjaCkge1xuICAgIHZhciB4ID0gdG91Y2guY2xpZW50WCxcbiAgICAgICAgZCA9IE1hdGguYWJzKHRvdWNoLmNsaWVudFkgLSB0aGlzLnN0YXJ0WSksXG4gICAgICAgIGIgPSB0aGlzLmJvdW5kYXJpZXM7XG4gICAgcmV0dXJuIHggPCBiLm1heFggJiYgeCA+IGIubWluWCAmJiBkIDwgdGhpcy50b2xlcmFuY2U7XG59O1xuXG5TY3JvbGxhYmxlWVRvdWNoZW5kQnV0dG9uLnByb3RvdHlwZS5vblRvdWNobW92ZSA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICBpZih0aGlzLmFjdGl2ZSkge1xuICAgICAgICB2YXIgdG91Y2ggPSB0aGlzLl9nZXRUb3VjaChldnQuY2hhbmdlZFRvdWNoZXMpO1xuICAgICAgICBpZiAodG91Y2gpIHtcbiAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYodGhpcy5faXNJbkFjdGl2ZVpvbmUodG91Y2gpKSB0aGlzLl9hZGRDbHMoKTtcbiAgICAgICAgICAgIGVsc2UgdGhpcy5fZG9uZS5jYWxsKHRoaXMsIGV2dCkoKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2Nyb2xsYWJsZVlUb3VjaGVuZEJ1dHRvbjtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsIi8qISBpU2Nyb2xsIHY1LjEuMSB+IChjKSAyMDA4LTIwMTQgTWF0dGVvIFNwaW5lbGxpIH4gaHR0cDovL2N1YmlxLm9yZy9saWNlbnNlICovXG4oZnVuY3Rpb24gKHdpbmRvdywgZG9jdW1lbnQsIE1hdGgpIHtcbnZhciByQUYgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXHR8fFxuXHR3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lXHR8fFxuXHR3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lXHRcdHx8XG5cdHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lXHRcdHx8XG5cdHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZVx0XHR8fFxuXHRmdW5jdGlvbiAoY2FsbGJhY2spIHsgd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCk7IH07XG5cbnZhciB1dGlscyA9IChmdW5jdGlvbiAoKSB7XG5cdHZhciBtZSA9IHt9O1xuXG5cdHZhciBfZWxlbWVudFN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jykuc3R5bGU7XG5cdHZhciBfdmVuZG9yID0gKGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgdmVuZG9ycyA9IFsndCcsICd3ZWJraXRUJywgJ01velQnLCAnbXNUJywgJ09UJ10sXG5cdFx0XHR0cmFuc2Zvcm0sXG5cdFx0XHRpID0gMCxcblx0XHRcdGwgPSB2ZW5kb3JzLmxlbmd0aDtcblxuXHRcdGZvciAoIDsgaSA8IGw7IGkrKyApIHtcblx0XHRcdHRyYW5zZm9ybSA9IHZlbmRvcnNbaV0gKyAncmFuc2Zvcm0nO1xuXHRcdFx0aWYgKCB0cmFuc2Zvcm0gaW4gX2VsZW1lbnRTdHlsZSApIHJldHVybiB2ZW5kb3JzW2ldLnN1YnN0cigwLCB2ZW5kb3JzW2ldLmxlbmd0aC0xKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pKCk7XG5cblx0ZnVuY3Rpb24gX3ByZWZpeFN0eWxlIChzdHlsZSkge1xuXHRcdGlmICggX3ZlbmRvciA9PT0gZmFsc2UgKSByZXR1cm4gZmFsc2U7XG5cdFx0aWYgKCBfdmVuZG9yID09PSAnJyApIHJldHVybiBzdHlsZTtcblx0XHRyZXR1cm4gX3ZlbmRvciArIHN0eWxlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3R5bGUuc3Vic3RyKDEpO1xuXHR9XG5cblx0bWUuZ2V0VGltZSA9IERhdGUubm93IHx8IGZ1bmN0aW9uIGdldFRpbWUgKCkgeyByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7IH07XG5cblx0bWUuZXh0ZW5kID0gZnVuY3Rpb24gKHRhcmdldCwgb2JqKSB7XG5cdFx0Zm9yICggdmFyIGkgaW4gb2JqICkge1xuXHRcdFx0dGFyZ2V0W2ldID0gb2JqW2ldO1xuXHRcdH1cblx0fTtcblxuXHRtZS5hZGRFdmVudCA9IGZ1bmN0aW9uIChlbCwgdHlwZSwgZm4sIGNhcHR1cmUpIHtcblx0XHRlbC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZuLCAhIWNhcHR1cmUpO1xuXHR9O1xuXG5cdG1lLnJlbW92ZUV2ZW50ID0gZnVuY3Rpb24gKGVsLCB0eXBlLCBmbiwgY2FwdHVyZSkge1xuXHRcdGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgZm4sICEhY2FwdHVyZSk7XG5cdH07XG5cblx0bWUubW9tZW50dW0gPSBmdW5jdGlvbiAoY3VycmVudCwgc3RhcnQsIHRpbWUsIGxvd2VyTWFyZ2luLCB3cmFwcGVyU2l6ZSwgZGVjZWxlcmF0aW9uKSB7XG5cdFx0dmFyIGRpc3RhbmNlID0gY3VycmVudCAtIHN0YXJ0LFxuXHRcdFx0c3BlZWQgPSBNYXRoLmFicyhkaXN0YW5jZSkgLyB0aW1lLFxuXHRcdFx0ZGVzdGluYXRpb24sXG5cdFx0XHRkdXJhdGlvbjtcblxuXHRcdGRlY2VsZXJhdGlvbiA9IGRlY2VsZXJhdGlvbiA9PT0gdW5kZWZpbmVkID8gMC4wMDA2IDogZGVjZWxlcmF0aW9uO1xuXG5cdFx0ZGVzdGluYXRpb24gPSBjdXJyZW50ICsgKCBzcGVlZCAqIHNwZWVkICkgLyAoIDIgKiBkZWNlbGVyYXRpb24gKSAqICggZGlzdGFuY2UgPCAwID8gLTEgOiAxICk7XG5cdFx0ZHVyYXRpb24gPSBzcGVlZCAvIGRlY2VsZXJhdGlvbjtcblxuXHRcdGlmICggZGVzdGluYXRpb24gPCBsb3dlck1hcmdpbiApIHtcblx0XHRcdGRlc3RpbmF0aW9uID0gd3JhcHBlclNpemUgPyBsb3dlck1hcmdpbiAtICggd3JhcHBlclNpemUgLyAyLjUgKiAoIHNwZWVkIC8gOCApICkgOiBsb3dlck1hcmdpbjtcblx0XHRcdGRpc3RhbmNlID0gTWF0aC5hYnMoZGVzdGluYXRpb24gLSBjdXJyZW50KTtcblx0XHRcdGR1cmF0aW9uID0gZGlzdGFuY2UgLyBzcGVlZDtcblx0XHR9IGVsc2UgaWYgKCBkZXN0aW5hdGlvbiA+IDAgKSB7XG5cdFx0XHRkZXN0aW5hdGlvbiA9IHdyYXBwZXJTaXplID8gd3JhcHBlclNpemUgLyAyLjUgKiAoIHNwZWVkIC8gOCApIDogMDtcblx0XHRcdGRpc3RhbmNlID0gTWF0aC5hYnMoY3VycmVudCkgKyBkZXN0aW5hdGlvbjtcblx0XHRcdGR1cmF0aW9uID0gZGlzdGFuY2UgLyBzcGVlZDtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0ZGVzdGluYXRpb246IE1hdGgucm91bmQoZGVzdGluYXRpb24pLFxuXHRcdFx0ZHVyYXRpb246IGR1cmF0aW9uXG5cdFx0fTtcblx0fTtcblxuXHR2YXIgX3RyYW5zZm9ybSA9IF9wcmVmaXhTdHlsZSgndHJhbnNmb3JtJyk7XG5cblx0bWUuZXh0ZW5kKG1lLCB7XG5cdFx0aGFzVHJhbnNmb3JtOiBfdHJhbnNmb3JtICE9PSBmYWxzZSxcblx0XHRoYXNQZXJzcGVjdGl2ZTogX3ByZWZpeFN0eWxlKCdwZXJzcGVjdGl2ZScpIGluIF9lbGVtZW50U3R5bGUsXG5cdFx0aGFzVG91Y2g6ICdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyxcblx0XHRoYXNQb2ludGVyOiBuYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCxcblx0XHRoYXNUcmFuc2l0aW9uOiBfcHJlZml4U3R5bGUoJ3RyYW5zaXRpb24nKSBpbiBfZWxlbWVudFN0eWxlXG5cdH0pO1xuXG5cdC8vIFRoaXMgc2hvdWxkIGZpbmQgYWxsIEFuZHJvaWQgYnJvd3NlcnMgbG93ZXIgdGhhbiBidWlsZCA1MzUuMTkgKGJvdGggc3RvY2sgYnJvd3NlciBhbmQgd2Vidmlldylcblx0bWUuaXNCYWRBbmRyb2lkID0gL0FuZHJvaWQgLy50ZXN0KHdpbmRvdy5uYXZpZ2F0b3IuYXBwVmVyc2lvbikgJiYgISgvQ2hyb21lXFwvXFxkLy50ZXN0KHdpbmRvdy5uYXZpZ2F0b3IuYXBwVmVyc2lvbikpO1xuXG5cdG1lLmV4dGVuZChtZS5zdHlsZSA9IHt9LCB7XG5cdFx0dHJhbnNmb3JtOiBfdHJhbnNmb3JtLFxuXHRcdHRyYW5zaXRpb25UaW1pbmdGdW5jdGlvbjogX3ByZWZpeFN0eWxlKCd0cmFuc2l0aW9uVGltaW5nRnVuY3Rpb24nKSxcblx0XHR0cmFuc2l0aW9uRHVyYXRpb246IF9wcmVmaXhTdHlsZSgndHJhbnNpdGlvbkR1cmF0aW9uJyksXG5cdFx0dHJhbnNpdGlvbkRlbGF5OiBfcHJlZml4U3R5bGUoJ3RyYW5zaXRpb25EZWxheScpLFxuXHRcdHRyYW5zZm9ybU9yaWdpbjogX3ByZWZpeFN0eWxlKCd0cmFuc2Zvcm1PcmlnaW4nKVxuXHR9KTtcblxuXHRtZS5oYXNDbGFzcyA9IGZ1bmN0aW9uIChlLCBjKSB7XG5cdFx0dmFyIHJlID0gbmV3IFJlZ0V4cChcIihefFxcXFxzKVwiICsgYyArIFwiKFxcXFxzfCQpXCIpO1xuXHRcdHJldHVybiByZS50ZXN0KGUuY2xhc3NOYW1lKTtcblx0fTtcblxuXHRtZS5hZGRDbGFzcyA9IGZ1bmN0aW9uIChlLCBjKSB7XG5cdFx0aWYgKCBtZS5oYXNDbGFzcyhlLCBjKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgbmV3Y2xhc3MgPSBlLmNsYXNzTmFtZS5zcGxpdCgnICcpO1xuXHRcdG5ld2NsYXNzLnB1c2goYyk7XG5cdFx0ZS5jbGFzc05hbWUgPSBuZXdjbGFzcy5qb2luKCcgJyk7XG5cdH07XG5cblx0bWUucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiAoZSwgYykge1xuXHRcdGlmICggIW1lLmhhc0NsYXNzKGUsIGMpICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciByZSA9IG5ldyBSZWdFeHAoXCIoXnxcXFxccylcIiArIGMgKyBcIihcXFxcc3wkKVwiLCAnZycpO1xuXHRcdGUuY2xhc3NOYW1lID0gZS5jbGFzc05hbWUucmVwbGFjZShyZSwgJyAnKTtcblx0fTtcblxuXHRtZS5vZmZzZXQgPSBmdW5jdGlvbiAoZWwpIHtcblx0XHR2YXIgbGVmdCA9IC1lbC5vZmZzZXRMZWZ0LFxuXHRcdFx0dG9wID0gLWVsLm9mZnNldFRvcDtcblxuXHRcdC8vIGpzaGludCAtVzA4NFxuXHRcdHdoaWxlIChlbCA9IGVsLm9mZnNldFBhcmVudCkge1xuXHRcdFx0bGVmdCAtPSBlbC5vZmZzZXRMZWZ0O1xuXHRcdFx0dG9wIC09IGVsLm9mZnNldFRvcDtcblx0XHR9XG5cdFx0Ly8ganNoaW50ICtXMDg0XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0bGVmdDogbGVmdCxcblx0XHRcdHRvcDogdG9wXG5cdFx0fTtcblx0fTtcblxuXHRtZS5wcmV2ZW50RGVmYXVsdEV4Y2VwdGlvbiA9IGZ1bmN0aW9uIChlbCwgZXhjZXB0aW9ucykge1xuXHRcdGZvciAoIHZhciBpIGluIGV4Y2VwdGlvbnMgKSB7XG5cdFx0XHRpZiAoIGV4Y2VwdGlvbnNbaV0udGVzdChlbFtpXSkgKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcblxuXHRtZS5leHRlbmQobWUuZXZlbnRUeXBlID0ge30sIHtcblx0XHR0b3VjaHN0YXJ0OiAxLFxuXHRcdHRvdWNobW92ZTogMSxcblx0XHR0b3VjaGVuZDogMSxcblxuXHRcdG1vdXNlZG93bjogMixcblx0XHRtb3VzZW1vdmU6IDIsXG5cdFx0bW91c2V1cDogMixcblxuXHRcdE1TUG9pbnRlckRvd246IDMsXG5cdFx0TVNQb2ludGVyTW92ZTogMyxcblx0XHRNU1BvaW50ZXJVcDogM1xuXHR9KTtcblxuXHRtZS5leHRlbmQobWUuZWFzZSA9IHt9LCB7XG5cdFx0cXVhZHJhdGljOiB7XG5cdFx0XHRzdHlsZTogJ2N1YmljLWJlemllcigwLjI1LCAwLjQ2LCAwLjQ1LCAwLjk0KScsXG5cdFx0XHRmbjogZnVuY3Rpb24gKGspIHtcblx0XHRcdFx0cmV0dXJuIGsgKiAoIDIgLSBrICk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjaXJjdWxhcjoge1xuXHRcdFx0c3R5bGU6ICdjdWJpYy1iZXppZXIoMC4xLCAwLjU3LCAwLjEsIDEpJyxcdC8vIE5vdCBwcm9wZXJseSBcImNpcmN1bGFyXCIgYnV0IHRoaXMgbG9va3MgYmV0dGVyLCBpdCBzaG91bGQgYmUgKDAuMDc1LCAwLjgyLCAwLjE2NSwgMSlcblx0XHRcdGZuOiBmdW5jdGlvbiAoaykge1xuXHRcdFx0XHRyZXR1cm4gTWF0aC5zcXJ0KCAxIC0gKCAtLWsgKiBrICkgKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGJhY2s6IHtcblx0XHRcdHN0eWxlOiAnY3ViaWMtYmV6aWVyKDAuMTc1LCAwLjg4NSwgMC4zMiwgMS4yNzUpJyxcblx0XHRcdGZuOiBmdW5jdGlvbiAoaykge1xuXHRcdFx0XHR2YXIgYiA9IDQ7XG5cdFx0XHRcdHJldHVybiAoIGsgPSBrIC0gMSApICogayAqICggKCBiICsgMSApICogayArIGIgKSArIDE7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRib3VuY2U6IHtcblx0XHRcdHN0eWxlOiAnJyxcblx0XHRcdGZuOiBmdW5jdGlvbiAoaykge1xuXHRcdFx0XHRpZiAoICggayAvPSAxICkgPCAoIDEgLyAyLjc1ICkgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIDcuNTYyNSAqIGsgKiBrO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBrIDwgKCAyIC8gMi43NSApICkge1xuXHRcdFx0XHRcdHJldHVybiA3LjU2MjUgKiAoIGsgLT0gKCAxLjUgLyAyLjc1ICkgKSAqIGsgKyAwLjc1O1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBrIDwgKCAyLjUgLyAyLjc1ICkgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIDcuNTYyNSAqICggayAtPSAoIDIuMjUgLyAyLjc1ICkgKSAqIGsgKyAwLjkzNzU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIDcuNTYyNSAqICggayAtPSAoIDIuNjI1IC8gMi43NSApICkgKiBrICsgMC45ODQzNzU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdGVsYXN0aWM6IHtcblx0XHRcdHN0eWxlOiAnJyxcblx0XHRcdGZuOiBmdW5jdGlvbiAoaykge1xuXHRcdFx0XHR2YXIgZiA9IDAuMjIsXG5cdFx0XHRcdFx0ZSA9IDAuNDtcblxuXHRcdFx0XHRpZiAoIGsgPT09IDAgKSB7IHJldHVybiAwOyB9XG5cdFx0XHRcdGlmICggayA9PSAxICkgeyByZXR1cm4gMTsgfVxuXG5cdFx0XHRcdHJldHVybiAoIGUgKiBNYXRoLnBvdyggMiwgLSAxMCAqIGsgKSAqIE1hdGguc2luKCAoIGsgLSBmIC8gNCApICogKCAyICogTWF0aC5QSSApIC8gZiApICsgMSApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0bWUudGFwID0gZnVuY3Rpb24gKGUsIGV2ZW50TmFtZSkge1xuXHRcdHZhciBldiA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuXHRcdGV2LmluaXRFdmVudChldmVudE5hbWUsIHRydWUsIHRydWUpO1xuXHRcdGV2LnBhZ2VYID0gZS5wYWdlWDtcblx0XHRldi5wYWdlWSA9IGUucGFnZVk7XG5cdFx0ZS50YXJnZXQuZGlzcGF0Y2hFdmVudChldik7XG5cdH07XG5cblx0bWUuY2xpY2sgPSBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciB0YXJnZXQgPSBlLnRhcmdldCxcblx0XHRcdGV2O1xuXG5cdFx0aWYgKCAhKC8oU0VMRUNUfElOUFVUfFRFWFRBUkVBKS9pKS50ZXN0KHRhcmdldC50YWdOYW1lKSApIHtcblx0XHRcdGV2ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnRzJyk7XG5cdFx0XHRldi5pbml0TW91c2VFdmVudCgnY2xpY2snLCB0cnVlLCB0cnVlLCBlLnZpZXcsIDEsXG5cdFx0XHRcdHRhcmdldC5zY3JlZW5YLCB0YXJnZXQuc2NyZWVuWSwgdGFyZ2V0LmNsaWVudFgsIHRhcmdldC5jbGllbnRZLFxuXHRcdFx0XHRlLmN0cmxLZXksIGUuYWx0S2V5LCBlLnNoaWZ0S2V5LCBlLm1ldGFLZXksXG5cdFx0XHRcdDAsIG51bGwpO1xuXG5cdFx0XHRldi5fY29uc3RydWN0ZWQgPSB0cnVlO1xuXHRcdFx0dGFyZ2V0LmRpc3BhdGNoRXZlbnQoZXYpO1xuXHRcdH1cblx0fTtcblxuXHRyZXR1cm4gbWU7XG59KSgpO1xuXG5mdW5jdGlvbiBJU2Nyb2xsIChlbCwgb3B0aW9ucykge1xuXHR0aGlzLndyYXBwZXIgPSB0eXBlb2YgZWwgPT0gJ3N0cmluZycgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsKSA6IGVsO1xuXHR0aGlzLnNjcm9sbGVyID0gdGhpcy53cmFwcGVyLmNoaWxkcmVuWzBdO1xuXHR0aGlzLnNjcm9sbGVyU3R5bGUgPSB0aGlzLnNjcm9sbGVyLnN0eWxlO1x0XHQvLyBjYWNoZSBzdHlsZSBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG5cblx0dGhpcy5vcHRpb25zID0ge1xuXG5cdFx0cmVzaXplU2Nyb2xsYmFyczogdHJ1ZSxcblxuXHRcdG1vdXNlV2hlZWxTcGVlZDogMjAsXG5cblx0XHRzbmFwVGhyZXNob2xkOiAwLjMzNCxcblxuLy8gSU5TRVJUIFBPSU5UOiBPUFRJT05TIFxuXG5cdFx0c3RhcnRYOiAwLFxuXHRcdHN0YXJ0WTogMCxcblx0XHRzY3JvbGxZOiB0cnVlLFxuXHRcdGRpcmVjdGlvbkxvY2tUaHJlc2hvbGQ6IDUsXG5cdFx0bW9tZW50dW06IHRydWUsXG5cblx0XHRib3VuY2U6IHRydWUsXG5cdFx0Ym91bmNlVGltZTogNjAwLFxuXHRcdGJvdW5jZUVhc2luZzogJycsXG5cblx0XHRwcmV2ZW50RGVmYXVsdDogdHJ1ZSxcblx0XHRwcmV2ZW50RGVmYXVsdEV4Y2VwdGlvbjogeyB0YWdOYW1lOiAvXihJTlBVVHxURVhUQVJFQXxCVVRUT058U0VMRUNUKSQvIH0sXG5cblx0XHRIV0NvbXBvc2l0aW5nOiB0cnVlLFxuXHRcdHVzZVRyYW5zaXRpb246IHRydWUsXG5cdFx0dXNlVHJhbnNmb3JtOiB0cnVlXG5cdH07XG5cblx0Zm9yICggdmFyIGkgaW4gb3B0aW9ucyApIHtcblx0XHR0aGlzLm9wdGlvbnNbaV0gPSBvcHRpb25zW2ldO1xuXHR9XG5cblx0Ly8gTm9ybWFsaXplIG9wdGlvbnNcblx0dGhpcy50cmFuc2xhdGVaID0gdGhpcy5vcHRpb25zLkhXQ29tcG9zaXRpbmcgJiYgdXRpbHMuaGFzUGVyc3BlY3RpdmUgPyAnIHRyYW5zbGF0ZVooMCknIDogJyc7XG5cblx0dGhpcy5vcHRpb25zLnVzZVRyYW5zaXRpb24gPSB1dGlscy5oYXNUcmFuc2l0aW9uICYmIHRoaXMub3B0aW9ucy51c2VUcmFuc2l0aW9uO1xuXHR0aGlzLm9wdGlvbnMudXNlVHJhbnNmb3JtID0gdXRpbHMuaGFzVHJhbnNmb3JtICYmIHRoaXMub3B0aW9ucy51c2VUcmFuc2Zvcm07XG5cblx0dGhpcy5vcHRpb25zLmV2ZW50UGFzc3Rocm91Z2ggPSB0aGlzLm9wdGlvbnMuZXZlbnRQYXNzdGhyb3VnaCA9PT0gdHJ1ZSA/ICd2ZXJ0aWNhbCcgOiB0aGlzLm9wdGlvbnMuZXZlbnRQYXNzdGhyb3VnaDtcblx0dGhpcy5vcHRpb25zLnByZXZlbnREZWZhdWx0ID0gIXRoaXMub3B0aW9ucy5ldmVudFBhc3N0aHJvdWdoICYmIHRoaXMub3B0aW9ucy5wcmV2ZW50RGVmYXVsdDtcblxuXHQvLyBJZiB5b3Ugd2FudCBldmVudFBhc3N0aHJvdWdoIEkgaGF2ZSB0byBsb2NrIG9uZSBvZiB0aGUgYXhlc1xuXHR0aGlzLm9wdGlvbnMuc2Nyb2xsWSA9IHRoaXMub3B0aW9ucy5ldmVudFBhc3N0aHJvdWdoID09ICd2ZXJ0aWNhbCcgPyBmYWxzZSA6IHRoaXMub3B0aW9ucy5zY3JvbGxZO1xuXHR0aGlzLm9wdGlvbnMuc2Nyb2xsWCA9IHRoaXMub3B0aW9ucy5ldmVudFBhc3N0aHJvdWdoID09ICdob3Jpem9udGFsJyA/IGZhbHNlIDogdGhpcy5vcHRpb25zLnNjcm9sbFg7XG5cblx0Ly8gV2l0aCBldmVudFBhc3N0aHJvdWdoIHdlIGFsc28gbmVlZCBsb2NrRGlyZWN0aW9uIG1lY2hhbmlzbVxuXHR0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbCA9IHRoaXMub3B0aW9ucy5mcmVlU2Nyb2xsICYmICF0aGlzLm9wdGlvbnMuZXZlbnRQYXNzdGhyb3VnaDtcblx0dGhpcy5vcHRpb25zLmRpcmVjdGlvbkxvY2tUaHJlc2hvbGQgPSB0aGlzLm9wdGlvbnMuZXZlbnRQYXNzdGhyb3VnaCA/IDAgOiB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uTG9ja1RocmVzaG9sZDtcblxuXHR0aGlzLm9wdGlvbnMuYm91bmNlRWFzaW5nID0gdHlwZW9mIHRoaXMub3B0aW9ucy5ib3VuY2VFYXNpbmcgPT0gJ3N0cmluZycgPyB1dGlscy5lYXNlW3RoaXMub3B0aW9ucy5ib3VuY2VFYXNpbmddIHx8IHV0aWxzLmVhc2UuY2lyY3VsYXIgOiB0aGlzLm9wdGlvbnMuYm91bmNlRWFzaW5nO1xuXG5cdHRoaXMub3B0aW9ucy5yZXNpemVQb2xsaW5nID0gdGhpcy5vcHRpb25zLnJlc2l6ZVBvbGxpbmcgPT09IHVuZGVmaW5lZCA/IDYwIDogdGhpcy5vcHRpb25zLnJlc2l6ZVBvbGxpbmc7XG5cblx0aWYgKCB0aGlzLm9wdGlvbnMudGFwID09PSB0cnVlICkge1xuXHRcdHRoaXMub3B0aW9ucy50YXAgPSAndGFwJztcblx0fVxuXG5cdGlmICggdGhpcy5vcHRpb25zLnNocmlua1Njcm9sbGJhcnMgPT0gJ3NjYWxlJyApIHtcblx0XHR0aGlzLm9wdGlvbnMudXNlVHJhbnNpdGlvbiA9IGZhbHNlO1xuXHR9XG5cblx0dGhpcy5vcHRpb25zLmludmVydFdoZWVsRGlyZWN0aW9uID0gdGhpcy5vcHRpb25zLmludmVydFdoZWVsRGlyZWN0aW9uID8gLTEgOiAxO1xuXG4vLyBJTlNFUlQgUE9JTlQ6IE5PUk1BTElaQVRJT05cblxuXHQvLyBTb21lIGRlZmF1bHRzXHRcblx0dGhpcy54ID0gMDtcblx0dGhpcy55ID0gMDtcblx0dGhpcy5kaXJlY3Rpb25YID0gMDtcblx0dGhpcy5kaXJlY3Rpb25ZID0gMDtcblx0dGhpcy5fZXZlbnRzID0ge307XG5cbi8vIElOU0VSVCBQT0lOVDogREVGQVVMVFNcblxuXHR0aGlzLl9pbml0KCk7XG5cdHRoaXMucmVmcmVzaCgpO1xuXG5cdHRoaXMuc2Nyb2xsVG8odGhpcy5vcHRpb25zLnN0YXJ0WCwgdGhpcy5vcHRpb25zLnN0YXJ0WSk7XG5cdHRoaXMuZW5hYmxlKCk7XG59XG5cbklTY3JvbGwucHJvdG90eXBlID0ge1xuXHR2ZXJzaW9uOiAnNS4xLjEnLFxuXG5cdF9pbml0OiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5faW5pdEV2ZW50cygpO1xuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuc2Nyb2xsYmFycyB8fCB0aGlzLm9wdGlvbnMuaW5kaWNhdG9ycyApIHtcblx0XHRcdHRoaXMuX2luaXRJbmRpY2F0b3JzKCk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMubW91c2VXaGVlbCApIHtcblx0XHRcdHRoaXMuX2luaXRXaGVlbCgpO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5vcHRpb25zLnNuYXAgKSB7XG5cdFx0XHR0aGlzLl9pbml0U25hcCgpO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5vcHRpb25zLmtleUJpbmRpbmdzICkge1xuXHRcdFx0dGhpcy5faW5pdEtleXMoKTtcblx0XHR9XG5cbi8vIElOU0VSVCBQT0lOVDogX2luaXRcblxuXHR9LFxuXG5cdGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLl9pbml0RXZlbnRzKHRydWUpO1xuXG5cdFx0dGhpcy5fZXhlY0V2ZW50KCdkZXN0cm95Jyk7XG5cdH0sXG5cblx0X3RyYW5zaXRpb25FbmQ6IGZ1bmN0aW9uIChlKSB7XG5cdFx0aWYgKCBlLnRhcmdldCAhPSB0aGlzLnNjcm9sbGVyIHx8ICF0aGlzLmlzSW5UcmFuc2l0aW9uICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuX3RyYW5zaXRpb25UaW1lKCk7XG5cdFx0aWYgKCAhdGhpcy5yZXNldFBvc2l0aW9uKHRoaXMub3B0aW9ucy5ib3VuY2VUaW1lKSApIHtcblx0XHRcdHRoaXMuaXNJblRyYW5zaXRpb24gPSBmYWxzZTtcblx0XHRcdHRoaXMuX2V4ZWNFdmVudCgnc2Nyb2xsRW5kJyk7XG5cdFx0fVxuXHR9LFxuXG5cdF9zdGFydDogZnVuY3Rpb24gKGUpIHtcblx0XHQvLyBSZWFjdCB0byBsZWZ0IG1vdXNlIGJ1dHRvbiBvbmx5XG5cdFx0aWYgKCB1dGlscy5ldmVudFR5cGVbZS50eXBlXSAhPSAxICkge1xuXHRcdFx0aWYgKCBlLmJ1dHRvbiAhPT0gMCApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICggIXRoaXMuZW5hYmxlZCB8fCAodGhpcy5pbml0aWF0ZWQgJiYgdXRpbHMuZXZlbnRUeXBlW2UudHlwZV0gIT09IHRoaXMuaW5pdGlhdGVkKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5wcmV2ZW50RGVmYXVsdCAmJiAhdXRpbHMuaXNCYWRBbmRyb2lkICYmICF1dGlscy5wcmV2ZW50RGVmYXVsdEV4Y2VwdGlvbihlLnRhcmdldCwgdGhpcy5vcHRpb25zLnByZXZlbnREZWZhdWx0RXhjZXB0aW9uKSApIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cblx0XHR2YXIgcG9pbnQgPSBlLnRvdWNoZXMgPyBlLnRvdWNoZXNbMF0gOiBlLFxuXHRcdFx0cG9zO1xuXG5cdFx0dGhpcy5pbml0aWF0ZWRcdD0gdXRpbHMuZXZlbnRUeXBlW2UudHlwZV07XG5cdFx0dGhpcy5tb3ZlZFx0XHQ9IGZhbHNlO1xuXHRcdHRoaXMuZGlzdFhcdFx0PSAwO1xuXHRcdHRoaXMuZGlzdFlcdFx0PSAwO1xuXHRcdHRoaXMuZGlyZWN0aW9uWCA9IDA7XG5cdFx0dGhpcy5kaXJlY3Rpb25ZID0gMDtcblx0XHR0aGlzLmRpcmVjdGlvbkxvY2tlZCA9IDA7XG5cblx0XHR0aGlzLl90cmFuc2l0aW9uVGltZSgpO1xuXG5cdFx0dGhpcy5zdGFydFRpbWUgPSB1dGlscy5nZXRUaW1lKCk7XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy51c2VUcmFuc2l0aW9uICYmIHRoaXMuaXNJblRyYW5zaXRpb24gKSB7XG5cdFx0XHR0aGlzLmlzSW5UcmFuc2l0aW9uID0gZmFsc2U7XG5cdFx0XHRwb3MgPSB0aGlzLmdldENvbXB1dGVkUG9zaXRpb24oKTtcblx0XHRcdHRoaXMuX3RyYW5zbGF0ZShNYXRoLnJvdW5kKHBvcy54KSwgTWF0aC5yb3VuZChwb3MueSkpO1xuXHRcdFx0dGhpcy5fZXhlY0V2ZW50KCdzY3JvbGxFbmQnKTtcblx0XHR9IGVsc2UgaWYgKCAhdGhpcy5vcHRpb25zLnVzZVRyYW5zaXRpb24gJiYgdGhpcy5pc0FuaW1hdGluZyApIHtcblx0XHRcdHRoaXMuaXNBbmltYXRpbmcgPSBmYWxzZTtcblx0XHRcdHRoaXMuX2V4ZWNFdmVudCgnc2Nyb2xsRW5kJyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5zdGFydFggICAgPSB0aGlzLng7XG5cdFx0dGhpcy5zdGFydFkgICAgPSB0aGlzLnk7XG5cdFx0dGhpcy5hYnNTdGFydFggPSB0aGlzLng7XG5cdFx0dGhpcy5hYnNTdGFydFkgPSB0aGlzLnk7XG5cdFx0dGhpcy5wb2ludFggICAgPSBwb2ludC5wYWdlWDtcblx0XHR0aGlzLnBvaW50WSAgICA9IHBvaW50LnBhZ2VZO1xuXG5cdFx0dGhpcy5fZXhlY0V2ZW50KCdiZWZvcmVTY3JvbGxTdGFydCcpO1xuXHR9LFxuXG5cdF9tb3ZlOiBmdW5jdGlvbiAoZSkge1xuXHRcdGlmICggIXRoaXMuZW5hYmxlZCB8fCB1dGlscy5ldmVudFR5cGVbZS50eXBlXSAhPT0gdGhpcy5pbml0aWF0ZWQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMucHJldmVudERlZmF1bHQgKSB7XHQvLyBpbmNyZWFzZXMgcGVyZm9ybWFuY2Ugb24gQW5kcm9pZD8gVE9ETzogY2hlY2shXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXG5cdFx0dmFyIHBvaW50XHRcdD0gZS50b3VjaGVzID8gZS50b3VjaGVzWzBdIDogZSxcblx0XHRcdGRlbHRhWFx0XHQ9IHBvaW50LnBhZ2VYIC0gdGhpcy5wb2ludFgsXG5cdFx0XHRkZWx0YVlcdFx0PSBwb2ludC5wYWdlWSAtIHRoaXMucG9pbnRZLFxuXHRcdFx0dGltZXN0YW1wXHQ9IHV0aWxzLmdldFRpbWUoKSxcblx0XHRcdG5ld1gsIG5ld1ksXG5cdFx0XHRhYnNEaXN0WCwgYWJzRGlzdFk7XG5cblx0XHR0aGlzLnBvaW50WFx0XHQ9IHBvaW50LnBhZ2VYO1xuXHRcdHRoaXMucG9pbnRZXHRcdD0gcG9pbnQucGFnZVk7XG5cblx0XHR0aGlzLmRpc3RYXHRcdCs9IGRlbHRhWDtcblx0XHR0aGlzLmRpc3RZXHRcdCs9IGRlbHRhWTtcblx0XHRhYnNEaXN0WFx0XHQ9IE1hdGguYWJzKHRoaXMuZGlzdFgpO1xuXHRcdGFic0Rpc3RZXHRcdD0gTWF0aC5hYnModGhpcy5kaXN0WSk7XG5cblx0XHQvLyBXZSBuZWVkIHRvIG1vdmUgYXQgbGVhc3QgMTAgcGl4ZWxzIGZvciB0aGUgc2Nyb2xsaW5nIHRvIGluaXRpYXRlXG5cdFx0aWYgKCB0aW1lc3RhbXAgLSB0aGlzLmVuZFRpbWUgPiAzMDAgJiYgKGFic0Rpc3RYIDwgMTAgJiYgYWJzRGlzdFkgPCAxMCkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gSWYgeW91IGFyZSBzY3JvbGxpbmcgaW4gb25lIGRpcmVjdGlvbiBsb2NrIHRoZSBvdGhlclxuXHRcdGlmICggIXRoaXMuZGlyZWN0aW9uTG9ja2VkICYmICF0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbCApIHtcblx0XHRcdGlmICggYWJzRGlzdFggPiBhYnNEaXN0WSArIHRoaXMub3B0aW9ucy5kaXJlY3Rpb25Mb2NrVGhyZXNob2xkICkge1xuXHRcdFx0XHR0aGlzLmRpcmVjdGlvbkxvY2tlZCA9ICdoJztcdFx0Ly8gbG9jayBob3Jpem9udGFsbHlcblx0XHRcdH0gZWxzZSBpZiAoIGFic0Rpc3RZID49IGFic0Rpc3RYICsgdGhpcy5vcHRpb25zLmRpcmVjdGlvbkxvY2tUaHJlc2hvbGQgKSB7XG5cdFx0XHRcdHRoaXMuZGlyZWN0aW9uTG9ja2VkID0gJ3YnO1x0XHQvLyBsb2NrIHZlcnRpY2FsbHlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuZGlyZWN0aW9uTG9ja2VkID0gJ24nO1x0XHQvLyBubyBsb2NrXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLmRpcmVjdGlvbkxvY2tlZCA9PSAnaCcgKSB7XG5cdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5ldmVudFBhc3N0aHJvdWdoID09ICd2ZXJ0aWNhbCcgKSB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdH0gZWxzZSBpZiAoIHRoaXMub3B0aW9ucy5ldmVudFBhc3N0aHJvdWdoID09ICdob3Jpem9udGFsJyApIHtcblx0XHRcdFx0dGhpcy5pbml0aWF0ZWQgPSBmYWxzZTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRkZWx0YVkgPSAwO1xuXHRcdH0gZWxzZSBpZiAoIHRoaXMuZGlyZWN0aW9uTG9ja2VkID09ICd2JyApIHtcblx0XHRcdGlmICggdGhpcy5vcHRpb25zLmV2ZW50UGFzc3Rocm91Z2ggPT0gJ2hvcml6b250YWwnICkge1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9IGVsc2UgaWYgKCB0aGlzLm9wdGlvbnMuZXZlbnRQYXNzdGhyb3VnaCA9PSAndmVydGljYWwnICkge1xuXHRcdFx0XHR0aGlzLmluaXRpYXRlZCA9IGZhbHNlO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGRlbHRhWCA9IDA7XG5cdFx0fVxuXG5cdFx0ZGVsdGFYID0gdGhpcy5oYXNIb3Jpem9udGFsU2Nyb2xsID8gZGVsdGFYIDogMDtcblx0XHRkZWx0YVkgPSB0aGlzLmhhc1ZlcnRpY2FsU2Nyb2xsID8gZGVsdGFZIDogMDtcblxuXHRcdG5ld1ggPSB0aGlzLnggKyBkZWx0YVg7XG5cdFx0bmV3WSA9IHRoaXMueSArIGRlbHRhWTtcblxuXHRcdC8vIFNsb3cgZG93biBpZiBvdXRzaWRlIG9mIHRoZSBib3VuZGFyaWVzXG5cdFx0aWYgKCBuZXdYID4gMCB8fCBuZXdYIDwgdGhpcy5tYXhTY3JvbGxYICkge1xuXHRcdFx0bmV3WCA9IHRoaXMub3B0aW9ucy5ib3VuY2UgPyB0aGlzLnggKyBkZWx0YVggLyAzIDogbmV3WCA+IDAgPyAwIDogdGhpcy5tYXhTY3JvbGxYO1xuXHRcdH1cblx0XHRpZiAoIG5ld1kgPiAwIHx8IG5ld1kgPCB0aGlzLm1heFNjcm9sbFkgKSB7XG5cdFx0XHRuZXdZID0gdGhpcy5vcHRpb25zLmJvdW5jZSA/IHRoaXMueSArIGRlbHRhWSAvIDMgOiBuZXdZID4gMCA/IDAgOiB0aGlzLm1heFNjcm9sbFk7XG5cdFx0fVxuXG5cdFx0dGhpcy5kaXJlY3Rpb25YID0gZGVsdGFYID4gMCA/IC0xIDogZGVsdGFYIDwgMCA/IDEgOiAwO1xuXHRcdHRoaXMuZGlyZWN0aW9uWSA9IGRlbHRhWSA+IDAgPyAtMSA6IGRlbHRhWSA8IDAgPyAxIDogMDtcblxuXHRcdGlmICggIXRoaXMubW92ZWQgKSB7XG5cdFx0XHR0aGlzLl9leGVjRXZlbnQoJ3Njcm9sbFN0YXJ0Jyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5tb3ZlZCA9IHRydWU7XG5cblx0XHR0aGlzLl90cmFuc2xhdGUobmV3WCwgbmV3WSk7XG5cbi8qIFJFUExBQ0UgU1RBUlQ6IF9tb3ZlICovXG5cblx0XHRpZiAoIHRpbWVzdGFtcCAtIHRoaXMuc3RhcnRUaW1lID4gMzAwICkge1xuXHRcdFx0dGhpcy5zdGFydFRpbWUgPSB0aW1lc3RhbXA7XG5cdFx0XHR0aGlzLnN0YXJ0WCA9IHRoaXMueDtcblx0XHRcdHRoaXMuc3RhcnRZID0gdGhpcy55O1xuXHRcdH1cblxuLyogUkVQTEFDRSBFTkQ6IF9tb3ZlICovXG5cblx0fSxcblxuXHRfZW5kOiBmdW5jdGlvbiAoZSkge1xuXHRcdGlmICggIXRoaXMuZW5hYmxlZCB8fCB1dGlscy5ldmVudFR5cGVbZS50eXBlXSAhPT0gdGhpcy5pbml0aWF0ZWQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMucHJldmVudERlZmF1bHQgJiYgIXV0aWxzLnByZXZlbnREZWZhdWx0RXhjZXB0aW9uKGUudGFyZ2V0LCB0aGlzLm9wdGlvbnMucHJldmVudERlZmF1bHRFeGNlcHRpb24pICkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblxuXHRcdHZhciBwb2ludCA9IGUuY2hhbmdlZFRvdWNoZXMgPyBlLmNoYW5nZWRUb3VjaGVzWzBdIDogZSxcblx0XHRcdG1vbWVudHVtWCxcblx0XHRcdG1vbWVudHVtWSxcblx0XHRcdGR1cmF0aW9uID0gdXRpbHMuZ2V0VGltZSgpIC0gdGhpcy5zdGFydFRpbWUsXG5cdFx0XHRuZXdYID0gTWF0aC5yb3VuZCh0aGlzLngpLFxuXHRcdFx0bmV3WSA9IE1hdGgucm91bmQodGhpcy55KSxcblx0XHRcdGRpc3RhbmNlWCA9IE1hdGguYWJzKG5ld1ggLSB0aGlzLnN0YXJ0WCksXG5cdFx0XHRkaXN0YW5jZVkgPSBNYXRoLmFicyhuZXdZIC0gdGhpcy5zdGFydFkpLFxuXHRcdFx0dGltZSA9IDAsXG5cdFx0XHRlYXNpbmcgPSAnJztcblxuXHRcdHRoaXMuaXNJblRyYW5zaXRpb24gPSAwO1xuXHRcdHRoaXMuaW5pdGlhdGVkID0gMDtcblx0XHR0aGlzLmVuZFRpbWUgPSB1dGlscy5nZXRUaW1lKCk7XG5cblx0XHQvLyByZXNldCBpZiB3ZSBhcmUgb3V0c2lkZSBvZiB0aGUgYm91bmRhcmllc1xuXHRcdGlmICggdGhpcy5yZXNldFBvc2l0aW9uKHRoaXMub3B0aW9ucy5ib3VuY2VUaW1lKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnNjcm9sbFRvKG5ld1gsIG5ld1kpO1x0Ly8gZW5zdXJlcyB0aGF0IHRoZSBsYXN0IHBvc2l0aW9uIGlzIHJvdW5kZWRcblxuXHRcdC8vIHdlIHNjcm9sbGVkIGxlc3MgdGhhbiAxMCBwaXhlbHNcblx0XHRpZiAoICF0aGlzLm1vdmVkICkge1xuXHRcdFx0aWYgKCB0aGlzLm9wdGlvbnMudGFwICkge1xuXHRcdFx0XHR1dGlscy50YXAoZSwgdGhpcy5vcHRpb25zLnRhcCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggdGhpcy5vcHRpb25zLmNsaWNrICkge1xuXHRcdFx0XHR1dGlscy5jbGljayhlKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5fZXhlY0V2ZW50KCdzY3JvbGxDYW5jZWwnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuX2V2ZW50cy5mbGljayAmJiBkdXJhdGlvbiA8IDIwMCAmJiBkaXN0YW5jZVggPCAxMDAgJiYgZGlzdGFuY2VZIDwgMTAwICkge1xuXHRcdFx0dGhpcy5fZXhlY0V2ZW50KCdmbGljaycpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIHN0YXJ0IG1vbWVudHVtIGFuaW1hdGlvbiBpZiBuZWVkZWRcblx0XHRpZiAoIHRoaXMub3B0aW9ucy5tb21lbnR1bSAmJiBkdXJhdGlvbiA8IDMwMCApIHtcblx0XHRcdG1vbWVudHVtWCA9IHRoaXMuaGFzSG9yaXpvbnRhbFNjcm9sbCA/IHV0aWxzLm1vbWVudHVtKHRoaXMueCwgdGhpcy5zdGFydFgsIGR1cmF0aW9uLCB0aGlzLm1heFNjcm9sbFgsIHRoaXMub3B0aW9ucy5ib3VuY2UgPyB0aGlzLndyYXBwZXJXaWR0aCA6IDAsIHRoaXMub3B0aW9ucy5kZWNlbGVyYXRpb24pIDogeyBkZXN0aW5hdGlvbjogbmV3WCwgZHVyYXRpb246IDAgfTtcblx0XHRcdG1vbWVudHVtWSA9IHRoaXMuaGFzVmVydGljYWxTY3JvbGwgPyB1dGlscy5tb21lbnR1bSh0aGlzLnksIHRoaXMuc3RhcnRZLCBkdXJhdGlvbiwgdGhpcy5tYXhTY3JvbGxZLCB0aGlzLm9wdGlvbnMuYm91bmNlID8gdGhpcy53cmFwcGVySGVpZ2h0IDogMCwgdGhpcy5vcHRpb25zLmRlY2VsZXJhdGlvbikgOiB7IGRlc3RpbmF0aW9uOiBuZXdZLCBkdXJhdGlvbjogMCB9O1xuXHRcdFx0bmV3WCA9IG1vbWVudHVtWC5kZXN0aW5hdGlvbjtcblx0XHRcdG5ld1kgPSBtb21lbnR1bVkuZGVzdGluYXRpb247XG5cdFx0XHR0aW1lID0gTWF0aC5tYXgobW9tZW50dW1YLmR1cmF0aW9uLCBtb21lbnR1bVkuZHVyYXRpb24pO1xuXHRcdFx0dGhpcy5pc0luVHJhbnNpdGlvbiA9IDE7XG5cdFx0fVxuXG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5zbmFwICkge1xuXHRcdFx0dmFyIHNuYXAgPSB0aGlzLl9uZWFyZXN0U25hcChuZXdYLCBuZXdZKTtcblx0XHRcdHRoaXMuY3VycmVudFBhZ2UgPSBzbmFwO1xuXHRcdFx0dGltZSA9IHRoaXMub3B0aW9ucy5zbmFwU3BlZWQgfHwgTWF0aC5tYXgoXG5cdFx0XHRcdFx0TWF0aC5tYXgoXG5cdFx0XHRcdFx0XHRNYXRoLm1pbihNYXRoLmFicyhuZXdYIC0gc25hcC54KSwgMTAwMCksXG5cdFx0XHRcdFx0XHRNYXRoLm1pbihNYXRoLmFicyhuZXdZIC0gc25hcC55KSwgMTAwMClcblx0XHRcdFx0XHQpLCAzMDApO1xuXHRcdFx0bmV3WCA9IHNuYXAueDtcblx0XHRcdG5ld1kgPSBzbmFwLnk7XG5cblx0XHRcdHRoaXMuZGlyZWN0aW9uWCA9IDA7XG5cdFx0XHR0aGlzLmRpcmVjdGlvblkgPSAwO1xuXHRcdFx0ZWFzaW5nID0gdGhpcy5vcHRpb25zLmJvdW5jZUVhc2luZztcblx0XHR9XG5cbi8vIElOU0VSVCBQT0lOVDogX2VuZFxuXG5cdFx0aWYgKCBuZXdYICE9IHRoaXMueCB8fCBuZXdZICE9IHRoaXMueSApIHtcblx0XHRcdC8vIGNoYW5nZSBlYXNpbmcgZnVuY3Rpb24gd2hlbiBzY3JvbGxlciBnb2VzIG91dCBvZiB0aGUgYm91bmRhcmllc1xuXHRcdFx0aWYgKCBuZXdYID4gMCB8fCBuZXdYIDwgdGhpcy5tYXhTY3JvbGxYIHx8IG5ld1kgPiAwIHx8IG5ld1kgPCB0aGlzLm1heFNjcm9sbFkgKSB7XG5cdFx0XHRcdGVhc2luZyA9IHV0aWxzLmVhc2UucXVhZHJhdGljO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNjcm9sbFRvKG5ld1gsIG5ld1ksIHRpbWUsIGVhc2luZyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5fZXhlY0V2ZW50KCdzY3JvbGxFbmQnKTtcblx0fSxcblxuXHRfcmVzaXplOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMucmVzaXplVGltZW91dCk7XG5cblx0XHR0aGlzLnJlc2l6ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdHRoYXQucmVmcmVzaCgpO1xuXHRcdH0sIHRoaXMub3B0aW9ucy5yZXNpemVQb2xsaW5nKTtcblx0fSxcblxuXHRyZXNldFBvc2l0aW9uOiBmdW5jdGlvbiAodGltZSkge1xuXHRcdHZhciB4ID0gdGhpcy54LFxuXHRcdFx0eSA9IHRoaXMueTtcblxuXHRcdHRpbWUgPSB0aW1lIHx8IDA7XG5cblx0XHRpZiAoICF0aGlzLmhhc0hvcml6b250YWxTY3JvbGwgfHwgdGhpcy54ID4gMCApIHtcblx0XHRcdHggPSAwO1xuXHRcdH0gZWxzZSBpZiAoIHRoaXMueCA8IHRoaXMubWF4U2Nyb2xsWCApIHtcblx0XHRcdHggPSB0aGlzLm1heFNjcm9sbFg7XG5cdFx0fVxuXG5cdFx0aWYgKCAhdGhpcy5oYXNWZXJ0aWNhbFNjcm9sbCB8fCB0aGlzLnkgPiAwICkge1xuXHRcdFx0eSA9IDA7XG5cdFx0fSBlbHNlIGlmICggdGhpcy55IDwgdGhpcy5tYXhTY3JvbGxZICkge1xuXHRcdFx0eSA9IHRoaXMubWF4U2Nyb2xsWTtcblx0XHR9XG5cblx0XHRpZiAoIHggPT0gdGhpcy54ICYmIHkgPT0gdGhpcy55ICkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHRoaXMuc2Nyb2xsVG8oeCwgeSwgdGltZSwgdGhpcy5vcHRpb25zLmJvdW5jZUVhc2luZyk7XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblxuXHRkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5lbmFibGVkID0gZmFsc2U7XG5cdH0sXG5cblx0ZW5hYmxlOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5lbmFibGVkID0gdHJ1ZTtcblx0fSxcblxuXHRyZWZyZXNoOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIHJmID0gdGhpcy53cmFwcGVyLm9mZnNldEhlaWdodDtcdFx0Ly8gRm9yY2UgcmVmbG93XG5cblx0XHR0aGlzLndyYXBwZXJXaWR0aFx0PSB0aGlzLndyYXBwZXIuY2xpZW50V2lkdGg7XG5cdFx0dGhpcy53cmFwcGVySGVpZ2h0XHQ9IHRoaXMud3JhcHBlci5jbGllbnRIZWlnaHQ7XG5cbi8qIFJFUExBQ0UgU1RBUlQ6IHJlZnJlc2ggKi9cblxuXHRcdHRoaXMuc2Nyb2xsZXJXaWR0aFx0PSB0aGlzLnNjcm9sbGVyLm9mZnNldFdpZHRoO1xuXHRcdHRoaXMuc2Nyb2xsZXJIZWlnaHRcdD0gdGhpcy5zY3JvbGxlci5vZmZzZXRIZWlnaHQ7XG5cblx0XHR0aGlzLm1heFNjcm9sbFhcdFx0PSB0aGlzLndyYXBwZXJXaWR0aCAtIHRoaXMuc2Nyb2xsZXJXaWR0aDtcblx0XHR0aGlzLm1heFNjcm9sbFlcdFx0PSB0aGlzLndyYXBwZXJIZWlnaHQgLSB0aGlzLnNjcm9sbGVySGVpZ2h0O1xuXG4vKiBSRVBMQUNFIEVORDogcmVmcmVzaCAqL1xuXG5cdFx0dGhpcy5oYXNIb3Jpem9udGFsU2Nyb2xsXHQ9IHRoaXMub3B0aW9ucy5zY3JvbGxYICYmIHRoaXMubWF4U2Nyb2xsWCA8IDA7XG5cdFx0dGhpcy5oYXNWZXJ0aWNhbFNjcm9sbFx0XHQ9IHRoaXMub3B0aW9ucy5zY3JvbGxZICYmIHRoaXMubWF4U2Nyb2xsWSA8IDA7XG5cblx0XHRpZiAoICF0aGlzLmhhc0hvcml6b250YWxTY3JvbGwgKSB7XG5cdFx0XHR0aGlzLm1heFNjcm9sbFggPSAwO1xuXHRcdFx0dGhpcy5zY3JvbGxlcldpZHRoID0gdGhpcy53cmFwcGVyV2lkdGg7XG5cdFx0fVxuXG5cdFx0aWYgKCAhdGhpcy5oYXNWZXJ0aWNhbFNjcm9sbCApIHtcblx0XHRcdHRoaXMubWF4U2Nyb2xsWSA9IDA7XG5cdFx0XHR0aGlzLnNjcm9sbGVySGVpZ2h0ID0gdGhpcy53cmFwcGVySGVpZ2h0O1xuXHRcdH1cblxuXHRcdHRoaXMuZW5kVGltZSA9IDA7XG5cdFx0dGhpcy5kaXJlY3Rpb25YID0gMDtcblx0XHR0aGlzLmRpcmVjdGlvblkgPSAwO1xuXG5cdFx0dGhpcy53cmFwcGVyT2Zmc2V0ID0gdXRpbHMub2Zmc2V0KHRoaXMud3JhcHBlcik7XG5cblx0XHR0aGlzLl9leGVjRXZlbnQoJ3JlZnJlc2gnKTtcblxuXHRcdHRoaXMucmVzZXRQb3NpdGlvbigpO1xuXG4vLyBJTlNFUlQgUE9JTlQ6IF9yZWZyZXNoXG5cblx0fSxcblxuXHRvbjogZnVuY3Rpb24gKHR5cGUsIGZuKSB7XG5cdFx0aWYgKCAhdGhpcy5fZXZlbnRzW3R5cGVdICkge1xuXHRcdFx0dGhpcy5fZXZlbnRzW3R5cGVdID0gW107XG5cdFx0fVxuXG5cdFx0dGhpcy5fZXZlbnRzW3R5cGVdLnB1c2goZm4pO1xuXHR9LFxuXG5cdG9mZjogZnVuY3Rpb24gKHR5cGUsIGZuKSB7XG5cdFx0aWYgKCAhdGhpcy5fZXZlbnRzW3R5cGVdICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBpbmRleCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5pbmRleE9mKGZuKTtcblxuXHRcdGlmICggaW5kZXggPiAtMSApIHtcblx0XHRcdHRoaXMuX2V2ZW50c1t0eXBlXS5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdH1cblx0fSxcblxuXHRfZXhlY0V2ZW50OiBmdW5jdGlvbiAodHlwZSkge1xuXHRcdGlmICggIXRoaXMuX2V2ZW50c1t0eXBlXSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgaSA9IDAsXG5cdFx0XHRsID0gdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcblxuXHRcdGlmICggIWwgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Zm9yICggOyBpIDwgbDsgaSsrICkge1xuXHRcdFx0dGhpcy5fZXZlbnRzW3R5cGVdW2ldLmFwcGx5KHRoaXMsIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG5cdFx0fVxuXHR9LFxuXG5cdHNjcm9sbEJ5OiBmdW5jdGlvbiAoeCwgeSwgdGltZSwgZWFzaW5nKSB7XG5cdFx0eCA9IHRoaXMueCArIHg7XG5cdFx0eSA9IHRoaXMueSArIHk7XG5cdFx0dGltZSA9IHRpbWUgfHwgMDtcblxuXHRcdHRoaXMuc2Nyb2xsVG8oeCwgeSwgdGltZSwgZWFzaW5nKTtcblx0fSxcblxuXHRzY3JvbGxUbzogZnVuY3Rpb24gKHgsIHksIHRpbWUsIGVhc2luZykge1xuXHRcdGVhc2luZyA9IGVhc2luZyB8fCB1dGlscy5lYXNlLmNpcmN1bGFyO1xuXG5cdFx0dGhpcy5pc0luVHJhbnNpdGlvbiA9IHRoaXMub3B0aW9ucy51c2VUcmFuc2l0aW9uICYmIHRpbWUgPiAwO1xuXG5cdFx0aWYgKCAhdGltZSB8fCAodGhpcy5vcHRpb25zLnVzZVRyYW5zaXRpb24gJiYgZWFzaW5nLnN0eWxlKSApIHtcblx0XHRcdHRoaXMuX3RyYW5zaXRpb25UaW1pbmdGdW5jdGlvbihlYXNpbmcuc3R5bGUpO1xuXHRcdFx0dGhpcy5fdHJhbnNpdGlvblRpbWUodGltZSk7XG5cdFx0XHR0aGlzLl90cmFuc2xhdGUoeCwgeSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2FuaW1hdGUoeCwgeSwgdGltZSwgZWFzaW5nLmZuKTtcblx0XHR9XG5cdH0sXG5cblx0c2Nyb2xsVG9FbGVtZW50OiBmdW5jdGlvbiAoZWwsIHRpbWUsIG9mZnNldFgsIG9mZnNldFksIGVhc2luZykge1xuXHRcdGVsID0gZWwubm9kZVR5cGUgPyBlbCA6IHRoaXMuc2Nyb2xsZXIucXVlcnlTZWxlY3RvcihlbCk7XG5cblx0XHRpZiAoICFlbCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgcG9zID0gdXRpbHMub2Zmc2V0KGVsKTtcblxuXHRcdHBvcy5sZWZ0IC09IHRoaXMud3JhcHBlck9mZnNldC5sZWZ0O1xuXHRcdHBvcy50b3AgIC09IHRoaXMud3JhcHBlck9mZnNldC50b3A7XG5cblx0XHQvLyBpZiBvZmZzZXRYL1kgYXJlIHRydWUgd2UgY2VudGVyIHRoZSBlbGVtZW50IHRvIHRoZSBzY3JlZW5cblx0XHRpZiAoIG9mZnNldFggPT09IHRydWUgKSB7XG5cdFx0XHRvZmZzZXRYID0gTWF0aC5yb3VuZChlbC5vZmZzZXRXaWR0aCAvIDIgLSB0aGlzLndyYXBwZXIub2Zmc2V0V2lkdGggLyAyKTtcblx0XHR9XG5cdFx0aWYgKCBvZmZzZXRZID09PSB0cnVlICkge1xuXHRcdFx0b2Zmc2V0WSA9IE1hdGgucm91bmQoZWwub2Zmc2V0SGVpZ2h0IC8gMiAtIHRoaXMud3JhcHBlci5vZmZzZXRIZWlnaHQgLyAyKTtcblx0XHR9XG5cblx0XHRwb3MubGVmdCAtPSBvZmZzZXRYIHx8IDA7XG5cdFx0cG9zLnRvcCAgLT0gb2Zmc2V0WSB8fCAwO1xuXG5cdFx0cG9zLmxlZnQgPSBwb3MubGVmdCA+IDAgPyAwIDogcG9zLmxlZnQgPCB0aGlzLm1heFNjcm9sbFggPyB0aGlzLm1heFNjcm9sbFggOiBwb3MubGVmdDtcblx0XHRwb3MudG9wICA9IHBvcy50b3AgID4gMCA/IDAgOiBwb3MudG9wICA8IHRoaXMubWF4U2Nyb2xsWSA/IHRoaXMubWF4U2Nyb2xsWSA6IHBvcy50b3A7XG5cblx0XHR0aW1lID0gdGltZSA9PT0gdW5kZWZpbmVkIHx8IHRpbWUgPT09IG51bGwgfHwgdGltZSA9PT0gJ2F1dG8nID8gTWF0aC5tYXgoTWF0aC5hYnModGhpcy54LXBvcy5sZWZ0KSwgTWF0aC5hYnModGhpcy55LXBvcy50b3ApKSA6IHRpbWU7XG5cblx0XHR0aGlzLnNjcm9sbFRvKHBvcy5sZWZ0LCBwb3MudG9wLCB0aW1lLCBlYXNpbmcpO1xuXHR9LFxuXG5cdF90cmFuc2l0aW9uVGltZTogZnVuY3Rpb24gKHRpbWUpIHtcblx0XHR0aW1lID0gdGltZSB8fCAwO1xuXG5cdFx0dGhpcy5zY3JvbGxlclN0eWxlW3V0aWxzLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbl0gPSB0aW1lICsgJ21zJztcblxuXHRcdGlmICggIXRpbWUgJiYgdXRpbHMuaXNCYWRBbmRyb2lkICkge1xuXHRcdFx0dGhpcy5zY3JvbGxlclN0eWxlW3V0aWxzLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbl0gPSAnMC4wMDFzJztcblx0XHR9XG5cblxuXHRcdGlmICggdGhpcy5pbmRpY2F0b3JzICkge1xuXHRcdFx0Zm9yICggdmFyIGkgPSB0aGlzLmluZGljYXRvcnMubGVuZ3RoOyBpLS07ICkge1xuXHRcdFx0XHR0aGlzLmluZGljYXRvcnNbaV0udHJhbnNpdGlvblRpbWUodGltZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cbi8vIElOU0VSVCBQT0lOVDogX3RyYW5zaXRpb25UaW1lXG5cblx0fSxcblxuXHRfdHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uOiBmdW5jdGlvbiAoZWFzaW5nKSB7XG5cdFx0dGhpcy5zY3JvbGxlclN0eWxlW3V0aWxzLnN0eWxlLnRyYW5zaXRpb25UaW1pbmdGdW5jdGlvbl0gPSBlYXNpbmc7XG5cblxuXHRcdGlmICggdGhpcy5pbmRpY2F0b3JzICkge1xuXHRcdFx0Zm9yICggdmFyIGkgPSB0aGlzLmluZGljYXRvcnMubGVuZ3RoOyBpLS07ICkge1xuXHRcdFx0XHR0aGlzLmluZGljYXRvcnNbaV0udHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uKGVhc2luZyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cbi8vIElOU0VSVCBQT0lOVDogX3RyYW5zaXRpb25UaW1pbmdGdW5jdGlvblxuXG5cdH0sXG5cblx0X3RyYW5zbGF0ZTogZnVuY3Rpb24gKHgsIHkpIHtcblx0XHRpZiAoIHRoaXMub3B0aW9ucy51c2VUcmFuc2Zvcm0gKSB7XG5cbi8qIFJFUExBQ0UgU1RBUlQ6IF90cmFuc2xhdGUgKi9cblxuXHRcdFx0dGhpcy5zY3JvbGxlclN0eWxlW3V0aWxzLnN0eWxlLnRyYW5zZm9ybV0gPSAndHJhbnNsYXRlKCcgKyB4ICsgJ3B4LCcgKyB5ICsgJ3B4KScgKyB0aGlzLnRyYW5zbGF0ZVo7XG5cbi8qIFJFUExBQ0UgRU5EOiBfdHJhbnNsYXRlICovXG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0eCA9IE1hdGgucm91bmQoeCk7XG5cdFx0XHR5ID0gTWF0aC5yb3VuZCh5KTtcblx0XHRcdHRoaXMuc2Nyb2xsZXJTdHlsZS5sZWZ0ID0geCArICdweCc7XG5cdFx0XHR0aGlzLnNjcm9sbGVyU3R5bGUudG9wID0geSArICdweCc7XG5cdFx0fVxuXG5cdFx0dGhpcy54ID0geDtcblx0XHR0aGlzLnkgPSB5O1xuXG5cblx0aWYgKCB0aGlzLmluZGljYXRvcnMgKSB7XG5cdFx0Zm9yICggdmFyIGkgPSB0aGlzLmluZGljYXRvcnMubGVuZ3RoOyBpLS07ICkge1xuXHRcdFx0dGhpcy5pbmRpY2F0b3JzW2ldLnVwZGF0ZVBvc2l0aW9uKCk7XG5cdFx0fVxuXHR9XG5cblxuLy8gSU5TRVJUIFBPSU5UOiBfdHJhbnNsYXRlXG5cblx0fSxcblxuXHRfaW5pdEV2ZW50czogZnVuY3Rpb24gKHJlbW92ZSkge1xuXHRcdHZhciBldmVudFR5cGUgPSByZW1vdmUgPyB1dGlscy5yZW1vdmVFdmVudCA6IHV0aWxzLmFkZEV2ZW50LFxuXHRcdFx0dGFyZ2V0ID0gdGhpcy5vcHRpb25zLmJpbmRUb1dyYXBwZXIgPyB0aGlzLndyYXBwZXIgOiB3aW5kb3c7XG5cblx0XHRldmVudFR5cGUod2luZG93LCAnb3JpZW50YXRpb25jaGFuZ2UnLCB0aGlzKTtcblx0XHRldmVudFR5cGUod2luZG93LCAncmVzaXplJywgdGhpcyk7XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5jbGljayApIHtcblx0XHRcdGV2ZW50VHlwZSh0aGlzLndyYXBwZXIsICdjbGljaycsIHRoaXMsIHRydWUpO1xuXHRcdH1cblxuXHRcdGlmICggIXRoaXMub3B0aW9ucy5kaXNhYmxlTW91c2UgKSB7XG5cdFx0XHRldmVudFR5cGUodGhpcy53cmFwcGVyLCAnbW91c2Vkb3duJywgdGhpcyk7XG5cdFx0XHRldmVudFR5cGUodGFyZ2V0LCAnbW91c2Vtb3ZlJywgdGhpcyk7XG5cdFx0XHRldmVudFR5cGUodGFyZ2V0LCAnbW91c2VjYW5jZWwnLCB0aGlzKTtcblx0XHRcdGV2ZW50VHlwZSh0YXJnZXQsICdtb3VzZXVwJywgdGhpcyk7XG5cdFx0fVxuXG5cdFx0aWYgKCB1dGlscy5oYXNQb2ludGVyICYmICF0aGlzLm9wdGlvbnMuZGlzYWJsZVBvaW50ZXIgKSB7XG5cdFx0XHRldmVudFR5cGUodGhpcy53cmFwcGVyLCAnTVNQb2ludGVyRG93bicsIHRoaXMpO1xuXHRcdFx0ZXZlbnRUeXBlKHRhcmdldCwgJ01TUG9pbnRlck1vdmUnLCB0aGlzKTtcblx0XHRcdGV2ZW50VHlwZSh0YXJnZXQsICdNU1BvaW50ZXJDYW5jZWwnLCB0aGlzKTtcblx0XHRcdGV2ZW50VHlwZSh0YXJnZXQsICdNU1BvaW50ZXJVcCcsIHRoaXMpO1xuXHRcdH1cblxuXHRcdGlmICggdXRpbHMuaGFzVG91Y2ggJiYgIXRoaXMub3B0aW9ucy5kaXNhYmxlVG91Y2ggKSB7XG5cdFx0XHRldmVudFR5cGUodGhpcy53cmFwcGVyLCAndG91Y2hzdGFydCcsIHRoaXMpO1xuXHRcdFx0ZXZlbnRUeXBlKHRhcmdldCwgJ3RvdWNobW92ZScsIHRoaXMpO1xuXHRcdFx0ZXZlbnRUeXBlKHRhcmdldCwgJ3RvdWNoY2FuY2VsJywgdGhpcyk7XG5cdFx0XHRldmVudFR5cGUodGFyZ2V0LCAndG91Y2hlbmQnLCB0aGlzKTtcblx0XHR9XG5cblx0XHRldmVudFR5cGUodGhpcy5zY3JvbGxlciwgJ3RyYW5zaXRpb25lbmQnLCB0aGlzKTtcblx0XHRldmVudFR5cGUodGhpcy5zY3JvbGxlciwgJ3dlYmtpdFRyYW5zaXRpb25FbmQnLCB0aGlzKTtcblx0XHRldmVudFR5cGUodGhpcy5zY3JvbGxlciwgJ29UcmFuc2l0aW9uRW5kJywgdGhpcyk7XG5cdFx0ZXZlbnRUeXBlKHRoaXMuc2Nyb2xsZXIsICdNU1RyYW5zaXRpb25FbmQnLCB0aGlzKTtcblx0fSxcblxuXHRnZXRDb21wdXRlZFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIG1hdHJpeCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMuc2Nyb2xsZXIsIG51bGwpLFxuXHRcdFx0eCwgeTtcblxuXHRcdGlmICggdGhpcy5vcHRpb25zLnVzZVRyYW5zZm9ybSApIHtcblx0XHRcdG1hdHJpeCA9IG1hdHJpeFt1dGlscy5zdHlsZS50cmFuc2Zvcm1dLnNwbGl0KCcpJylbMF0uc3BsaXQoJywgJyk7XG5cdFx0XHR4ID0gKyhtYXRyaXhbMTJdIHx8IG1hdHJpeFs0XSk7XG5cdFx0XHR5ID0gKyhtYXRyaXhbMTNdIHx8IG1hdHJpeFs1XSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHggPSArbWF0cml4LmxlZnQucmVwbGFjZSgvW14tXFxkLl0vZywgJycpO1xuXHRcdFx0eSA9ICttYXRyaXgudG9wLnJlcGxhY2UoL1teLVxcZC5dL2csICcnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4geyB4OiB4LCB5OiB5IH07XG5cdH0sXG5cblx0X2luaXRJbmRpY2F0b3JzOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGludGVyYWN0aXZlID0gdGhpcy5vcHRpb25zLmludGVyYWN0aXZlU2Nyb2xsYmFycyxcblx0XHRcdGN1c3RvbVN0eWxlID0gdHlwZW9mIHRoaXMub3B0aW9ucy5zY3JvbGxiYXJzICE9ICdzdHJpbmcnLFxuXHRcdFx0aW5kaWNhdG9ycyA9IFtdLFxuXHRcdFx0aW5kaWNhdG9yO1xuXG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdFx0dGhpcy5pbmRpY2F0b3JzID0gW107XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5zY3JvbGxiYXJzICkge1xuXHRcdFx0Ly8gVmVydGljYWwgc2Nyb2xsYmFyXG5cdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5zY3JvbGxZICkge1xuXHRcdFx0XHRpbmRpY2F0b3IgPSB7XG5cdFx0XHRcdFx0ZWw6IGNyZWF0ZURlZmF1bHRTY3JvbGxiYXIoJ3YnLCBpbnRlcmFjdGl2ZSwgdGhpcy5vcHRpb25zLnNjcm9sbGJhcnMpLFxuXHRcdFx0XHRcdGludGVyYWN0aXZlOiBpbnRlcmFjdGl2ZSxcblx0XHRcdFx0XHRkZWZhdWx0U2Nyb2xsYmFyczogdHJ1ZSxcblx0XHRcdFx0XHRjdXN0b21TdHlsZTogY3VzdG9tU3R5bGUsXG5cdFx0XHRcdFx0cmVzaXplOiB0aGlzLm9wdGlvbnMucmVzaXplU2Nyb2xsYmFycyxcblx0XHRcdFx0XHRzaHJpbms6IHRoaXMub3B0aW9ucy5zaHJpbmtTY3JvbGxiYXJzLFxuXHRcdFx0XHRcdGZhZGU6IHRoaXMub3B0aW9ucy5mYWRlU2Nyb2xsYmFycyxcblx0XHRcdFx0XHRsaXN0ZW5YOiBmYWxzZVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHRoaXMud3JhcHBlci5hcHBlbmRDaGlsZChpbmRpY2F0b3IuZWwpO1xuXHRcdFx0XHRpbmRpY2F0b3JzLnB1c2goaW5kaWNhdG9yKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSG9yaXpvbnRhbCBzY3JvbGxiYXJcblx0XHRcdGlmICggdGhpcy5vcHRpb25zLnNjcm9sbFggKSB7XG5cdFx0XHRcdGluZGljYXRvciA9IHtcblx0XHRcdFx0XHRlbDogY3JlYXRlRGVmYXVsdFNjcm9sbGJhcignaCcsIGludGVyYWN0aXZlLCB0aGlzLm9wdGlvbnMuc2Nyb2xsYmFycyksXG5cdFx0XHRcdFx0aW50ZXJhY3RpdmU6IGludGVyYWN0aXZlLFxuXHRcdFx0XHRcdGRlZmF1bHRTY3JvbGxiYXJzOiB0cnVlLFxuXHRcdFx0XHRcdGN1c3RvbVN0eWxlOiBjdXN0b21TdHlsZSxcblx0XHRcdFx0XHRyZXNpemU6IHRoaXMub3B0aW9ucy5yZXNpemVTY3JvbGxiYXJzLFxuXHRcdFx0XHRcdHNocmluazogdGhpcy5vcHRpb25zLnNocmlua1Njcm9sbGJhcnMsXG5cdFx0XHRcdFx0ZmFkZTogdGhpcy5vcHRpb25zLmZhZGVTY3JvbGxiYXJzLFxuXHRcdFx0XHRcdGxpc3Rlblk6IGZhbHNlXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dGhpcy53cmFwcGVyLmFwcGVuZENoaWxkKGluZGljYXRvci5lbCk7XG5cdFx0XHRcdGluZGljYXRvcnMucHVzaChpbmRpY2F0b3IpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICggdGhpcy5vcHRpb25zLmluZGljYXRvcnMgKSB7XG5cdFx0XHQvLyBUT0RPOiBjaGVjayBjb25jYXQgY29tcGF0aWJpbGl0eVxuXHRcdFx0aW5kaWNhdG9ycyA9IGluZGljYXRvcnMuY29uY2F0KHRoaXMub3B0aW9ucy5pbmRpY2F0b3JzKTtcblx0XHR9XG5cblx0XHRmb3IgKCB2YXIgaSA9IGluZGljYXRvcnMubGVuZ3RoOyBpLS07ICkge1xuXHRcdFx0dGhpcy5pbmRpY2F0b3JzLnB1c2goIG5ldyBJbmRpY2F0b3IodGhpcywgaW5kaWNhdG9yc1tpXSkgKTtcblx0XHR9XG5cblx0XHQvLyBUT0RPOiBjaGVjayBpZiB3ZSBjYW4gdXNlIGFycmF5Lm1hcCAod2lkZSBjb21wYXRpYmlsaXR5IGFuZCBwZXJmb3JtYW5jZSBpc3N1ZXMpXG5cdFx0ZnVuY3Rpb24gX2luZGljYXRvcnNNYXAgKGZuKSB7XG5cdFx0XHRmb3IgKCB2YXIgaSA9IHRoYXQuaW5kaWNhdG9ycy5sZW5ndGg7IGktLTsgKSB7XG5cdFx0XHRcdGZuLmNhbGwodGhhdC5pbmRpY2F0b3JzW2ldKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5mYWRlU2Nyb2xsYmFycyApIHtcblx0XHRcdHRoaXMub24oJ3Njcm9sbEVuZCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0X2luZGljYXRvcnNNYXAoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHRoaXMuZmFkZSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLm9uKCdzY3JvbGxDYW5jZWwnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdF9pbmRpY2F0b3JzTWFwKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHR0aGlzLmZhZGUoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5vbignc2Nyb2xsU3RhcnQnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdF9pbmRpY2F0b3JzTWFwKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHR0aGlzLmZhZGUoMSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMub24oJ2JlZm9yZVNjcm9sbFN0YXJ0JywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRfaW5kaWNhdG9yc01hcChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0dGhpcy5mYWRlKDEsIHRydWUpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXG5cdFx0dGhpcy5vbigncmVmcmVzaCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdF9pbmRpY2F0b3JzTWFwKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dGhpcy5yZWZyZXNoKCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdHRoaXMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRfaW5kaWNhdG9yc01hcChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHRoaXMuZGVzdHJveSgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGRlbGV0ZSB0aGlzLmluZGljYXRvcnM7XG5cdFx0fSk7XG5cdH0sXG5cblx0X2luaXRXaGVlbDogZnVuY3Rpb24gKCkge1xuXHRcdHV0aWxzLmFkZEV2ZW50KHRoaXMud3JhcHBlciwgJ3doZWVsJywgdGhpcyk7XG5cdFx0dXRpbHMuYWRkRXZlbnQodGhpcy53cmFwcGVyLCAnbW91c2V3aGVlbCcsIHRoaXMpO1xuXHRcdHV0aWxzLmFkZEV2ZW50KHRoaXMud3JhcHBlciwgJ0RPTU1vdXNlU2Nyb2xsJywgdGhpcyk7XG5cblx0XHR0aGlzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuXHRcdFx0dXRpbHMucmVtb3ZlRXZlbnQodGhpcy53cmFwcGVyLCAnd2hlZWwnLCB0aGlzKTtcblx0XHRcdHV0aWxzLnJlbW92ZUV2ZW50KHRoaXMud3JhcHBlciwgJ21vdXNld2hlZWwnLCB0aGlzKTtcblx0XHRcdHV0aWxzLnJlbW92ZUV2ZW50KHRoaXMud3JhcHBlciwgJ0RPTU1vdXNlU2Nyb2xsJywgdGhpcyk7XG5cdFx0fSk7XG5cdH0sXG5cblx0X3doZWVsOiBmdW5jdGlvbiAoZSkge1xuXHRcdGlmICggIXRoaXMuZW5hYmxlZCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHZhciB3aGVlbERlbHRhWCwgd2hlZWxEZWx0YVksXG5cdFx0XHRuZXdYLCBuZXdZLFxuXHRcdFx0dGhhdCA9IHRoaXM7XG5cblx0XHRpZiAoIHRoaXMud2hlZWxUaW1lb3V0ID09PSB1bmRlZmluZWQgKSB7XG5cdFx0XHR0aGF0Ll9leGVjRXZlbnQoJ3Njcm9sbFN0YXJ0Jyk7XG5cdFx0fVxuXG5cdFx0Ly8gRXhlY3V0ZSB0aGUgc2Nyb2xsRW5kIGV2ZW50IGFmdGVyIDQwMG1zIHRoZSB3aGVlbCBzdG9wcGVkIHNjcm9sbGluZ1xuXHRcdGNsZWFyVGltZW91dCh0aGlzLndoZWVsVGltZW91dCk7XG5cdFx0dGhpcy53aGVlbFRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdHRoYXQuX2V4ZWNFdmVudCgnc2Nyb2xsRW5kJyk7XG5cdFx0XHR0aGF0LndoZWVsVGltZW91dCA9IHVuZGVmaW5lZDtcblx0XHR9LCA0MDApO1xuXG5cdFx0aWYgKCAnZGVsdGFYJyBpbiBlICkge1xuXHRcdFx0d2hlZWxEZWx0YVggPSAtZS5kZWx0YVg7XG5cdFx0XHR3aGVlbERlbHRhWSA9IC1lLmRlbHRhWTtcblx0XHR9IGVsc2UgaWYgKCAnd2hlZWxEZWx0YVgnIGluIGUgKSB7XG5cdFx0XHR3aGVlbERlbHRhWCA9IGUud2hlZWxEZWx0YVggLyAxMjAgKiB0aGlzLm9wdGlvbnMubW91c2VXaGVlbFNwZWVkO1xuXHRcdFx0d2hlZWxEZWx0YVkgPSBlLndoZWVsRGVsdGFZIC8gMTIwICogdGhpcy5vcHRpb25zLm1vdXNlV2hlZWxTcGVlZDtcblx0XHR9IGVsc2UgaWYgKCAnd2hlZWxEZWx0YScgaW4gZSApIHtcblx0XHRcdHdoZWVsRGVsdGFYID0gd2hlZWxEZWx0YVkgPSBlLndoZWVsRGVsdGEgLyAxMjAgKiB0aGlzLm9wdGlvbnMubW91c2VXaGVlbFNwZWVkO1xuXHRcdH0gZWxzZSBpZiAoICdkZXRhaWwnIGluIGUgKSB7XG5cdFx0XHR3aGVlbERlbHRhWCA9IHdoZWVsRGVsdGFZID0gLWUuZGV0YWlsIC8gMyAqIHRoaXMub3B0aW9ucy5tb3VzZVdoZWVsU3BlZWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR3aGVlbERlbHRhWCAqPSB0aGlzLm9wdGlvbnMuaW52ZXJ0V2hlZWxEaXJlY3Rpb247XG5cdFx0d2hlZWxEZWx0YVkgKj0gdGhpcy5vcHRpb25zLmludmVydFdoZWVsRGlyZWN0aW9uO1xuXG5cdFx0aWYgKCAhdGhpcy5oYXNWZXJ0aWNhbFNjcm9sbCApIHtcblx0XHRcdHdoZWVsRGVsdGFYID0gd2hlZWxEZWx0YVk7XG5cdFx0XHR3aGVlbERlbHRhWSA9IDA7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuc25hcCApIHtcblx0XHRcdG5ld1ggPSB0aGlzLmN1cnJlbnRQYWdlLnBhZ2VYO1xuXHRcdFx0bmV3WSA9IHRoaXMuY3VycmVudFBhZ2UucGFnZVk7XG5cblx0XHRcdGlmICggd2hlZWxEZWx0YVggPiAwICkge1xuXHRcdFx0XHRuZXdYLS07XG5cdFx0XHR9IGVsc2UgaWYgKCB3aGVlbERlbHRhWCA8IDAgKSB7XG5cdFx0XHRcdG5ld1grKztcblx0XHRcdH1cblxuXHRcdFx0aWYgKCB3aGVlbERlbHRhWSA+IDAgKSB7XG5cdFx0XHRcdG5ld1ktLTtcblx0XHRcdH0gZWxzZSBpZiAoIHdoZWVsRGVsdGFZIDwgMCApIHtcblx0XHRcdFx0bmV3WSsrO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmdvVG9QYWdlKG5ld1gsIG5ld1kpO1xuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bmV3WCA9IHRoaXMueCArIE1hdGgucm91bmQodGhpcy5oYXNIb3Jpem9udGFsU2Nyb2xsID8gd2hlZWxEZWx0YVggOiAwKTtcblx0XHRuZXdZID0gdGhpcy55ICsgTWF0aC5yb3VuZCh0aGlzLmhhc1ZlcnRpY2FsU2Nyb2xsID8gd2hlZWxEZWx0YVkgOiAwKTtcblxuXHRcdGlmICggbmV3WCA+IDAgKSB7XG5cdFx0XHRuZXdYID0gMDtcblx0XHR9IGVsc2UgaWYgKCBuZXdYIDwgdGhpcy5tYXhTY3JvbGxYICkge1xuXHRcdFx0bmV3WCA9IHRoaXMubWF4U2Nyb2xsWDtcblx0XHR9XG5cblx0XHRpZiAoIG5ld1kgPiAwICkge1xuXHRcdFx0bmV3WSA9IDA7XG5cdFx0fSBlbHNlIGlmICggbmV3WSA8IHRoaXMubWF4U2Nyb2xsWSApIHtcblx0XHRcdG5ld1kgPSB0aGlzLm1heFNjcm9sbFk7XG5cdFx0fVxuXG5cdFx0dGhpcy5zY3JvbGxUbyhuZXdYLCBuZXdZLCAwKTtcblxuLy8gSU5TRVJUIFBPSU5UOiBfd2hlZWxcblx0fSxcblxuXHRfaW5pdFNuYXA6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmN1cnJlbnRQYWdlID0ge307XG5cblx0XHRpZiAoIHR5cGVvZiB0aGlzLm9wdGlvbnMuc25hcCA9PSAnc3RyaW5nJyApIHtcblx0XHRcdHRoaXMub3B0aW9ucy5zbmFwID0gdGhpcy5zY3JvbGxlci5xdWVyeVNlbGVjdG9yQWxsKHRoaXMub3B0aW9ucy5zbmFwKTtcblx0XHR9XG5cblx0XHR0aGlzLm9uKCdyZWZyZXNoJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0dmFyIGkgPSAwLCBsLFxuXHRcdFx0XHRtID0gMCwgbixcblx0XHRcdFx0Y3gsIGN5LFxuXHRcdFx0XHR4ID0gMCwgeSxcblx0XHRcdFx0c3RlcFggPSB0aGlzLm9wdGlvbnMuc25hcFN0ZXBYIHx8IHRoaXMud3JhcHBlcldpZHRoLFxuXHRcdFx0XHRzdGVwWSA9IHRoaXMub3B0aW9ucy5zbmFwU3RlcFkgfHwgdGhpcy53cmFwcGVySGVpZ2h0LFxuXHRcdFx0XHRlbDtcblxuXHRcdFx0dGhpcy5wYWdlcyA9IFtdO1xuXG5cdFx0XHRpZiAoICF0aGlzLndyYXBwZXJXaWR0aCB8fCAhdGhpcy53cmFwcGVySGVpZ2h0IHx8ICF0aGlzLnNjcm9sbGVyV2lkdGggfHwgIXRoaXMuc2Nyb2xsZXJIZWlnaHQgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCB0aGlzLm9wdGlvbnMuc25hcCA9PT0gdHJ1ZSApIHtcblx0XHRcdFx0Y3ggPSBNYXRoLnJvdW5kKCBzdGVwWCAvIDIgKTtcblx0XHRcdFx0Y3kgPSBNYXRoLnJvdW5kKCBzdGVwWSAvIDIgKTtcblxuXHRcdFx0XHR3aGlsZSAoIHggPiAtdGhpcy5zY3JvbGxlcldpZHRoICkge1xuXHRcdFx0XHRcdHRoaXMucGFnZXNbaV0gPSBbXTtcblx0XHRcdFx0XHRsID0gMDtcblx0XHRcdFx0XHR5ID0gMDtcblxuXHRcdFx0XHRcdHdoaWxlICggeSA+IC10aGlzLnNjcm9sbGVySGVpZ2h0ICkge1xuXHRcdFx0XHRcdFx0dGhpcy5wYWdlc1tpXVtsXSA9IHtcblx0XHRcdFx0XHRcdFx0eDogTWF0aC5tYXgoeCwgdGhpcy5tYXhTY3JvbGxYKSxcblx0XHRcdFx0XHRcdFx0eTogTWF0aC5tYXgoeSwgdGhpcy5tYXhTY3JvbGxZKSxcblx0XHRcdFx0XHRcdFx0d2lkdGg6IHN0ZXBYLFxuXHRcdFx0XHRcdFx0XHRoZWlnaHQ6IHN0ZXBZLFxuXHRcdFx0XHRcdFx0XHRjeDogeCAtIGN4LFxuXHRcdFx0XHRcdFx0XHRjeTogeSAtIGN5XG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHR5IC09IHN0ZXBZO1xuXHRcdFx0XHRcdFx0bCsrO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHggLT0gc3RlcFg7XG5cdFx0XHRcdFx0aSsrO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRlbCA9IHRoaXMub3B0aW9ucy5zbmFwO1xuXHRcdFx0XHRsID0gZWwubGVuZ3RoO1xuXHRcdFx0XHRuID0gLTE7XG5cblx0XHRcdFx0Zm9yICggOyBpIDwgbDsgaSsrICkge1xuXHRcdFx0XHRcdGlmICggaSA9PT0gMCB8fCBlbFtpXS5vZmZzZXRMZWZ0IDw9IGVsW2ktMV0ub2Zmc2V0TGVmdCApIHtcblx0XHRcdFx0XHRcdG0gPSAwO1xuXHRcdFx0XHRcdFx0bisrO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICggIXRoaXMucGFnZXNbbV0gKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnBhZ2VzW21dID0gW107XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0eCA9IE1hdGgubWF4KC1lbFtpXS5vZmZzZXRMZWZ0LCB0aGlzLm1heFNjcm9sbFgpO1xuXHRcdFx0XHRcdHkgPSBNYXRoLm1heCgtZWxbaV0ub2Zmc2V0VG9wLCB0aGlzLm1heFNjcm9sbFkpO1xuXHRcdFx0XHRcdGN4ID0geCAtIE1hdGgucm91bmQoZWxbaV0ub2Zmc2V0V2lkdGggLyAyKTtcblx0XHRcdFx0XHRjeSA9IHkgLSBNYXRoLnJvdW5kKGVsW2ldLm9mZnNldEhlaWdodCAvIDIpO1xuXG5cdFx0XHRcdFx0dGhpcy5wYWdlc1ttXVtuXSA9IHtcblx0XHRcdFx0XHRcdHg6IHgsXG5cdFx0XHRcdFx0XHR5OiB5LFxuXHRcdFx0XHRcdFx0d2lkdGg6IGVsW2ldLm9mZnNldFdpZHRoLFxuXHRcdFx0XHRcdFx0aGVpZ2h0OiBlbFtpXS5vZmZzZXRIZWlnaHQsXG5cdFx0XHRcdFx0XHRjeDogY3gsXG5cdFx0XHRcdFx0XHRjeTogY3lcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0aWYgKCB4ID4gdGhpcy5tYXhTY3JvbGxYICkge1xuXHRcdFx0XHRcdFx0bSsrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmdvVG9QYWdlKHRoaXMuY3VycmVudFBhZ2UucGFnZVggfHwgMCwgdGhpcy5jdXJyZW50UGFnZS5wYWdlWSB8fCAwLCAwKTtcblxuXHRcdFx0Ly8gVXBkYXRlIHNuYXAgdGhyZXNob2xkIGlmIG5lZWRlZFxuXHRcdFx0aWYgKCB0aGlzLm9wdGlvbnMuc25hcFRocmVzaG9sZCAlIDEgPT09IDAgKSB7XG5cdFx0XHRcdHRoaXMuc25hcFRocmVzaG9sZFggPSB0aGlzLm9wdGlvbnMuc25hcFRocmVzaG9sZDtcblx0XHRcdFx0dGhpcy5zbmFwVGhyZXNob2xkWSA9IHRoaXMub3B0aW9ucy5zbmFwVGhyZXNob2xkO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zbmFwVGhyZXNob2xkWCA9IE1hdGgucm91bmQodGhpcy5wYWdlc1t0aGlzLmN1cnJlbnRQYWdlLnBhZ2VYXVt0aGlzLmN1cnJlbnRQYWdlLnBhZ2VZXS53aWR0aCAqIHRoaXMub3B0aW9ucy5zbmFwVGhyZXNob2xkKTtcblx0XHRcdFx0dGhpcy5zbmFwVGhyZXNob2xkWSA9IE1hdGgucm91bmQodGhpcy5wYWdlc1t0aGlzLmN1cnJlbnRQYWdlLnBhZ2VYXVt0aGlzLmN1cnJlbnRQYWdlLnBhZ2VZXS5oZWlnaHQgKiB0aGlzLm9wdGlvbnMuc25hcFRocmVzaG9sZCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR0aGlzLm9uKCdmbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciB0aW1lID0gdGhpcy5vcHRpb25zLnNuYXBTcGVlZCB8fCBNYXRoLm1heChcblx0XHRcdFx0XHRNYXRoLm1heChcblx0XHRcdFx0XHRcdE1hdGgubWluKE1hdGguYWJzKHRoaXMueCAtIHRoaXMuc3RhcnRYKSwgMTAwMCksXG5cdFx0XHRcdFx0XHRNYXRoLm1pbihNYXRoLmFicyh0aGlzLnkgLSB0aGlzLnN0YXJ0WSksIDEwMDApXG5cdFx0XHRcdFx0KSwgMzAwKTtcblxuXHRcdFx0dGhpcy5nb1RvUGFnZShcblx0XHRcdFx0dGhpcy5jdXJyZW50UGFnZS5wYWdlWCArIHRoaXMuZGlyZWN0aW9uWCxcblx0XHRcdFx0dGhpcy5jdXJyZW50UGFnZS5wYWdlWSArIHRoaXMuZGlyZWN0aW9uWSxcblx0XHRcdFx0dGltZVxuXHRcdFx0KTtcblx0XHR9KTtcblx0fSxcblxuXHRfbmVhcmVzdFNuYXA6IGZ1bmN0aW9uICh4LCB5KSB7XG5cdFx0aWYgKCAhdGhpcy5wYWdlcy5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm4geyB4OiAwLCB5OiAwLCBwYWdlWDogMCwgcGFnZVk6IDAgfTtcblx0XHR9XG5cblx0XHR2YXIgaSA9IDAsXG5cdFx0XHRsID0gdGhpcy5wYWdlcy5sZW5ndGgsXG5cdFx0XHRtID0gMDtcblxuXHRcdC8vIENoZWNrIGlmIHdlIGV4Y2VlZGVkIHRoZSBzbmFwIHRocmVzaG9sZFxuXHRcdGlmICggTWF0aC5hYnMoeCAtIHRoaXMuYWJzU3RhcnRYKSA8IHRoaXMuc25hcFRocmVzaG9sZFggJiZcblx0XHRcdE1hdGguYWJzKHkgLSB0aGlzLmFic1N0YXJ0WSkgPCB0aGlzLnNuYXBUaHJlc2hvbGRZICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3VycmVudFBhZ2U7XG5cdFx0fVxuXG5cdFx0aWYgKCB4ID4gMCApIHtcblx0XHRcdHggPSAwO1xuXHRcdH0gZWxzZSBpZiAoIHggPCB0aGlzLm1heFNjcm9sbFggKSB7XG5cdFx0XHR4ID0gdGhpcy5tYXhTY3JvbGxYO1xuXHRcdH1cblxuXHRcdGlmICggeSA+IDAgKSB7XG5cdFx0XHR5ID0gMDtcblx0XHR9IGVsc2UgaWYgKCB5IDwgdGhpcy5tYXhTY3JvbGxZICkge1xuXHRcdFx0eSA9IHRoaXMubWF4U2Nyb2xsWTtcblx0XHR9XG5cblx0XHRmb3IgKCA7IGkgPCBsOyBpKysgKSB7XG5cdFx0XHRpZiAoIHggPj0gdGhpcy5wYWdlc1tpXVswXS5jeCApIHtcblx0XHRcdFx0eCA9IHRoaXMucGFnZXNbaV1bMF0ueDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bCA9IHRoaXMucGFnZXNbaV0ubGVuZ3RoO1xuXG5cdFx0Zm9yICggOyBtIDwgbDsgbSsrICkge1xuXHRcdFx0aWYgKCB5ID49IHRoaXMucGFnZXNbMF1bbV0uY3kgKSB7XG5cdFx0XHRcdHkgPSB0aGlzLnBhZ2VzWzBdW21dLnk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICggaSA9PSB0aGlzLmN1cnJlbnRQYWdlLnBhZ2VYICkge1xuXHRcdFx0aSArPSB0aGlzLmRpcmVjdGlvblg7XG5cblx0XHRcdGlmICggaSA8IDAgKSB7XG5cdFx0XHRcdGkgPSAwO1xuXHRcdFx0fSBlbHNlIGlmICggaSA+PSB0aGlzLnBhZ2VzLmxlbmd0aCApIHtcblx0XHRcdFx0aSA9IHRoaXMucGFnZXMubGVuZ3RoIC0gMTtcblx0XHRcdH1cblxuXHRcdFx0eCA9IHRoaXMucGFnZXNbaV1bMF0ueDtcblx0XHR9XG5cblx0XHRpZiAoIG0gPT0gdGhpcy5jdXJyZW50UGFnZS5wYWdlWSApIHtcblx0XHRcdG0gKz0gdGhpcy5kaXJlY3Rpb25ZO1xuXG5cdFx0XHRpZiAoIG0gPCAwICkge1xuXHRcdFx0XHRtID0gMDtcblx0XHRcdH0gZWxzZSBpZiAoIG0gPj0gdGhpcy5wYWdlc1swXS5sZW5ndGggKSB7XG5cdFx0XHRcdG0gPSB0aGlzLnBhZ2VzWzBdLmxlbmd0aCAtIDE7XG5cdFx0XHR9XG5cblx0XHRcdHkgPSB0aGlzLnBhZ2VzWzBdW21dLnk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHg6IHgsXG5cdFx0XHR5OiB5LFxuXHRcdFx0cGFnZVg6IGksXG5cdFx0XHRwYWdlWTogbVxuXHRcdH07XG5cdH0sXG5cblx0Z29Ub1BhZ2U6IGZ1bmN0aW9uICh4LCB5LCB0aW1lLCBlYXNpbmcpIHtcblx0XHRlYXNpbmcgPSBlYXNpbmcgfHwgdGhpcy5vcHRpb25zLmJvdW5jZUVhc2luZztcblxuXHRcdGlmICggeCA+PSB0aGlzLnBhZ2VzLmxlbmd0aCApIHtcblx0XHRcdHggPSB0aGlzLnBhZ2VzLmxlbmd0aCAtIDE7XG5cdFx0fSBlbHNlIGlmICggeCA8IDAgKSB7XG5cdFx0XHR4ID0gMDtcblx0XHR9XG5cblx0XHRpZiAoIHkgPj0gdGhpcy5wYWdlc1t4XS5sZW5ndGggKSB7XG5cdFx0XHR5ID0gdGhpcy5wYWdlc1t4XS5sZW5ndGggLSAxO1xuXHRcdH0gZWxzZSBpZiAoIHkgPCAwICkge1xuXHRcdFx0eSA9IDA7XG5cdFx0fVxuXG5cdFx0dmFyIHBvc1ggPSB0aGlzLnBhZ2VzW3hdW3ldLngsXG5cdFx0XHRwb3NZID0gdGhpcy5wYWdlc1t4XVt5XS55O1xuXG5cdFx0dGltZSA9IHRpbWUgPT09IHVuZGVmaW5lZCA/IHRoaXMub3B0aW9ucy5zbmFwU3BlZWQgfHwgTWF0aC5tYXgoXG5cdFx0XHRNYXRoLm1heChcblx0XHRcdFx0TWF0aC5taW4oTWF0aC5hYnMocG9zWCAtIHRoaXMueCksIDEwMDApLFxuXHRcdFx0XHRNYXRoLm1pbihNYXRoLmFicyhwb3NZIC0gdGhpcy55KSwgMTAwMClcblx0XHRcdCksIDMwMCkgOiB0aW1lO1xuXG5cdFx0dGhpcy5jdXJyZW50UGFnZSA9IHtcblx0XHRcdHg6IHBvc1gsXG5cdFx0XHR5OiBwb3NZLFxuXHRcdFx0cGFnZVg6IHgsXG5cdFx0XHRwYWdlWTogeVxuXHRcdH07XG5cblx0XHR0aGlzLnNjcm9sbFRvKHBvc1gsIHBvc1ksIHRpbWUsIGVhc2luZyk7XG5cdH0sXG5cblx0bmV4dDogZnVuY3Rpb24gKHRpbWUsIGVhc2luZykge1xuXHRcdHZhciB4ID0gdGhpcy5jdXJyZW50UGFnZS5wYWdlWCxcblx0XHRcdHkgPSB0aGlzLmN1cnJlbnRQYWdlLnBhZ2VZO1xuXG5cdFx0eCsrO1xuXG5cdFx0aWYgKCB4ID49IHRoaXMucGFnZXMubGVuZ3RoICYmIHRoaXMuaGFzVmVydGljYWxTY3JvbGwgKSB7XG5cdFx0XHR4ID0gMDtcblx0XHRcdHkrKztcblx0XHR9XG5cblx0XHR0aGlzLmdvVG9QYWdlKHgsIHksIHRpbWUsIGVhc2luZyk7XG5cdH0sXG5cblx0cHJldjogZnVuY3Rpb24gKHRpbWUsIGVhc2luZykge1xuXHRcdHZhciB4ID0gdGhpcy5jdXJyZW50UGFnZS5wYWdlWCxcblx0XHRcdHkgPSB0aGlzLmN1cnJlbnRQYWdlLnBhZ2VZO1xuXG5cdFx0eC0tO1xuXG5cdFx0aWYgKCB4IDwgMCAmJiB0aGlzLmhhc1ZlcnRpY2FsU2Nyb2xsICkge1xuXHRcdFx0eCA9IDA7XG5cdFx0XHR5LS07XG5cdFx0fVxuXG5cdFx0dGhpcy5nb1RvUGFnZSh4LCB5LCB0aW1lLCBlYXNpbmcpO1xuXHR9LFxuXG5cdF9pbml0S2V5czogZnVuY3Rpb24gKGUpIHtcblx0XHQvLyBkZWZhdWx0IGtleSBiaW5kaW5nc1xuXHRcdHZhciBrZXlzID0ge1xuXHRcdFx0cGFnZVVwOiAzMyxcblx0XHRcdHBhZ2VEb3duOiAzNCxcblx0XHRcdGVuZDogMzUsXG5cdFx0XHRob21lOiAzNixcblx0XHRcdGxlZnQ6IDM3LFxuXHRcdFx0dXA6IDM4LFxuXHRcdFx0cmlnaHQ6IDM5LFxuXHRcdFx0ZG93bjogNDBcblx0XHR9O1xuXHRcdHZhciBpO1xuXG5cdFx0Ly8gaWYgeW91IGdpdmUgbWUgY2hhcmFjdGVycyBJIGdpdmUgeW91IGtleWNvZGVcblx0XHRpZiAoIHR5cGVvZiB0aGlzLm9wdGlvbnMua2V5QmluZGluZ3MgPT0gJ29iamVjdCcgKSB7XG5cdFx0XHRmb3IgKCBpIGluIHRoaXMub3B0aW9ucy5rZXlCaW5kaW5ncyApIHtcblx0XHRcdFx0aWYgKCB0eXBlb2YgdGhpcy5vcHRpb25zLmtleUJpbmRpbmdzW2ldID09ICdzdHJpbmcnICkge1xuXHRcdFx0XHRcdHRoaXMub3B0aW9ucy5rZXlCaW5kaW5nc1tpXSA9IHRoaXMub3B0aW9ucy5rZXlCaW5kaW5nc1tpXS50b1VwcGVyQ2FzZSgpLmNoYXJDb2RlQXQoMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5vcHRpb25zLmtleUJpbmRpbmdzID0ge307XG5cdFx0fVxuXG5cdFx0Zm9yICggaSBpbiBrZXlzICkge1xuXHRcdFx0dGhpcy5vcHRpb25zLmtleUJpbmRpbmdzW2ldID0gdGhpcy5vcHRpb25zLmtleUJpbmRpbmdzW2ldIHx8IGtleXNbaV07XG5cdFx0fVxuXG5cdFx0dXRpbHMuYWRkRXZlbnQod2luZG93LCAna2V5ZG93bicsIHRoaXMpO1xuXG5cdFx0dGhpcy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHV0aWxzLnJlbW92ZUV2ZW50KHdpbmRvdywgJ2tleWRvd24nLCB0aGlzKTtcblx0XHR9KTtcblx0fSxcblxuXHRfa2V5OiBmdW5jdGlvbiAoZSkge1xuXHRcdGlmICggIXRoaXMuZW5hYmxlZCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgc25hcCA9IHRoaXMub3B0aW9ucy5zbmFwLFx0Ly8gd2UgYXJlIHVzaW5nIHRoaXMgYWxvdCwgYmV0dGVyIHRvIGNhY2hlIGl0XG5cdFx0XHRuZXdYID0gc25hcCA/IHRoaXMuY3VycmVudFBhZ2UucGFnZVggOiB0aGlzLngsXG5cdFx0XHRuZXdZID0gc25hcCA/IHRoaXMuY3VycmVudFBhZ2UucGFnZVkgOiB0aGlzLnksXG5cdFx0XHRub3cgPSB1dGlscy5nZXRUaW1lKCksXG5cdFx0XHRwcmV2VGltZSA9IHRoaXMua2V5VGltZSB8fCAwLFxuXHRcdFx0YWNjZWxlcmF0aW9uID0gMC4yNTAsXG5cdFx0XHRwb3M7XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy51c2VUcmFuc2l0aW9uICYmIHRoaXMuaXNJblRyYW5zaXRpb24gKSB7XG5cdFx0XHRwb3MgPSB0aGlzLmdldENvbXB1dGVkUG9zaXRpb24oKTtcblxuXHRcdFx0dGhpcy5fdHJhbnNsYXRlKE1hdGgucm91bmQocG9zLngpLCBNYXRoLnJvdW5kKHBvcy55KSk7XG5cdFx0XHR0aGlzLmlzSW5UcmFuc2l0aW9uID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0dGhpcy5rZXlBY2NlbGVyYXRpb24gPSBub3cgLSBwcmV2VGltZSA8IDIwMCA/IE1hdGgubWluKHRoaXMua2V5QWNjZWxlcmF0aW9uICsgYWNjZWxlcmF0aW9uLCA1MCkgOiAwO1xuXG5cdFx0c3dpdGNoICggZS5rZXlDb2RlICkge1xuXHRcdFx0Y2FzZSB0aGlzLm9wdGlvbnMua2V5QmluZGluZ3MucGFnZVVwOlxuXHRcdFx0XHRpZiAoIHRoaXMuaGFzSG9yaXpvbnRhbFNjcm9sbCAmJiAhdGhpcy5oYXNWZXJ0aWNhbFNjcm9sbCApIHtcblx0XHRcdFx0XHRuZXdYICs9IHNuYXAgPyAxIDogdGhpcy53cmFwcGVyV2lkdGg7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bmV3WSArPSBzbmFwID8gMSA6IHRoaXMud3JhcHBlckhlaWdodDtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgdGhpcy5vcHRpb25zLmtleUJpbmRpbmdzLnBhZ2VEb3duOlxuXHRcdFx0XHRpZiAoIHRoaXMuaGFzSG9yaXpvbnRhbFNjcm9sbCAmJiAhdGhpcy5oYXNWZXJ0aWNhbFNjcm9sbCApIHtcblx0XHRcdFx0XHRuZXdYIC09IHNuYXAgPyAxIDogdGhpcy53cmFwcGVyV2lkdGg7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bmV3WSAtPSBzbmFwID8gMSA6IHRoaXMud3JhcHBlckhlaWdodDtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgdGhpcy5vcHRpb25zLmtleUJpbmRpbmdzLmVuZDpcblx0XHRcdFx0bmV3WCA9IHNuYXAgPyB0aGlzLnBhZ2VzLmxlbmd0aC0xIDogdGhpcy5tYXhTY3JvbGxYO1xuXHRcdFx0XHRuZXdZID0gc25hcCA/IHRoaXMucGFnZXNbMF0ubGVuZ3RoLTEgOiB0aGlzLm1heFNjcm9sbFk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSB0aGlzLm9wdGlvbnMua2V5QmluZGluZ3MuaG9tZTpcblx0XHRcdFx0bmV3WCA9IDA7XG5cdFx0XHRcdG5ld1kgPSAwO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgdGhpcy5vcHRpb25zLmtleUJpbmRpbmdzLmxlZnQ6XG5cdFx0XHRcdG5ld1ggKz0gc25hcCA/IC0xIDogNSArIHRoaXMua2V5QWNjZWxlcmF0aW9uPj4wO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgdGhpcy5vcHRpb25zLmtleUJpbmRpbmdzLnVwOlxuXHRcdFx0XHRuZXdZICs9IHNuYXAgPyAxIDogNSArIHRoaXMua2V5QWNjZWxlcmF0aW9uPj4wO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgdGhpcy5vcHRpb25zLmtleUJpbmRpbmdzLnJpZ2h0OlxuXHRcdFx0XHRuZXdYIC09IHNuYXAgPyAtMSA6IDUgKyB0aGlzLmtleUFjY2VsZXJhdGlvbj4+MDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIHRoaXMub3B0aW9ucy5rZXlCaW5kaW5ncy5kb3duOlxuXHRcdFx0XHRuZXdZIC09IHNuYXAgPyAxIDogNSArIHRoaXMua2V5QWNjZWxlcmF0aW9uPj4wO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIHNuYXAgKSB7XG5cdFx0XHR0aGlzLmdvVG9QYWdlKG5ld1gsIG5ld1kpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggbmV3WCA+IDAgKSB7XG5cdFx0XHRuZXdYID0gMDtcblx0XHRcdHRoaXMua2V5QWNjZWxlcmF0aW9uID0gMDtcblx0XHR9IGVsc2UgaWYgKCBuZXdYIDwgdGhpcy5tYXhTY3JvbGxYICkge1xuXHRcdFx0bmV3WCA9IHRoaXMubWF4U2Nyb2xsWDtcblx0XHRcdHRoaXMua2V5QWNjZWxlcmF0aW9uID0gMDtcblx0XHR9XG5cblx0XHRpZiAoIG5ld1kgPiAwICkge1xuXHRcdFx0bmV3WSA9IDA7XG5cdFx0XHR0aGlzLmtleUFjY2VsZXJhdGlvbiA9IDA7XG5cdFx0fSBlbHNlIGlmICggbmV3WSA8IHRoaXMubWF4U2Nyb2xsWSApIHtcblx0XHRcdG5ld1kgPSB0aGlzLm1heFNjcm9sbFk7XG5cdFx0XHR0aGlzLmtleUFjY2VsZXJhdGlvbiA9IDA7XG5cdFx0fVxuXG5cdFx0dGhpcy5zY3JvbGxUbyhuZXdYLCBuZXdZLCAwKTtcblxuXHRcdHRoaXMua2V5VGltZSA9IG5vdztcblx0fSxcblxuXHRfYW5pbWF0ZTogZnVuY3Rpb24gKGRlc3RYLCBkZXN0WSwgZHVyYXRpb24sIGVhc2luZ0ZuKSB7XG5cdFx0dmFyIHRoYXQgPSB0aGlzLFxuXHRcdFx0c3RhcnRYID0gdGhpcy54LFxuXHRcdFx0c3RhcnRZID0gdGhpcy55LFxuXHRcdFx0c3RhcnRUaW1lID0gdXRpbHMuZ2V0VGltZSgpLFxuXHRcdFx0ZGVzdFRpbWUgPSBzdGFydFRpbWUgKyBkdXJhdGlvbjtcblxuXHRcdGZ1bmN0aW9uIHN0ZXAgKCkge1xuXHRcdFx0dmFyIG5vdyA9IHV0aWxzLmdldFRpbWUoKSxcblx0XHRcdFx0bmV3WCwgbmV3WSxcblx0XHRcdFx0ZWFzaW5nO1xuXG5cdFx0XHRpZiAoIG5vdyA+PSBkZXN0VGltZSApIHtcblx0XHRcdFx0dGhhdC5pc0FuaW1hdGluZyA9IGZhbHNlO1xuXHRcdFx0XHR0aGF0Ll90cmFuc2xhdGUoZGVzdFgsIGRlc3RZKTtcblxuXHRcdFx0XHRpZiAoICF0aGF0LnJlc2V0UG9zaXRpb24odGhhdC5vcHRpb25zLmJvdW5jZVRpbWUpICkge1xuXHRcdFx0XHRcdHRoYXQuX2V4ZWNFdmVudCgnc2Nyb2xsRW5kJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdG5vdyA9ICggbm93IC0gc3RhcnRUaW1lICkgLyBkdXJhdGlvbjtcblx0XHRcdGVhc2luZyA9IGVhc2luZ0ZuKG5vdyk7XG5cdFx0XHRuZXdYID0gKCBkZXN0WCAtIHN0YXJ0WCApICogZWFzaW5nICsgc3RhcnRYO1xuXHRcdFx0bmV3WSA9ICggZGVzdFkgLSBzdGFydFkgKSAqIGVhc2luZyArIHN0YXJ0WTtcblx0XHRcdHRoYXQuX3RyYW5zbGF0ZShuZXdYLCBuZXdZKTtcblxuXHRcdFx0aWYgKCB0aGF0LmlzQW5pbWF0aW5nICkge1xuXHRcdFx0XHRyQUYoc3RlcCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5pc0FuaW1hdGluZyA9IHRydWU7XG5cdFx0c3RlcCgpO1xuXHR9LFxuXHRoYW5kbGVFdmVudDogZnVuY3Rpb24gKGUpIHtcblx0XHRzd2l0Y2ggKCBlLnR5cGUgKSB7XG5cdFx0XHRjYXNlICd0b3VjaHN0YXJ0Jzpcblx0XHRcdGNhc2UgJ01TUG9pbnRlckRvd24nOlxuXHRcdFx0Y2FzZSAnbW91c2Vkb3duJzpcblx0XHRcdFx0dGhpcy5fc3RhcnQoZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAndG91Y2htb3ZlJzpcblx0XHRcdGNhc2UgJ01TUG9pbnRlck1vdmUnOlxuXHRcdFx0Y2FzZSAnbW91c2Vtb3ZlJzpcblx0XHRcdFx0dGhpcy5fbW92ZShlKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICd0b3VjaGVuZCc6XG5cdFx0XHRjYXNlICdNU1BvaW50ZXJVcCc6XG5cdFx0XHRjYXNlICdtb3VzZXVwJzpcblx0XHRcdGNhc2UgJ3RvdWNoY2FuY2VsJzpcblx0XHRcdGNhc2UgJ01TUG9pbnRlckNhbmNlbCc6XG5cdFx0XHRjYXNlICdtb3VzZWNhbmNlbCc6XG5cdFx0XHRcdHRoaXMuX2VuZChlKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdvcmllbnRhdGlvbmNoYW5nZSc6XG5cdFx0XHRjYXNlICdyZXNpemUnOlxuXHRcdFx0XHR0aGlzLl9yZXNpemUoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICd0cmFuc2l0aW9uZW5kJzpcblx0XHRcdGNhc2UgJ3dlYmtpdFRyYW5zaXRpb25FbmQnOlxuXHRcdFx0Y2FzZSAnb1RyYW5zaXRpb25FbmQnOlxuXHRcdFx0Y2FzZSAnTVNUcmFuc2l0aW9uRW5kJzpcblx0XHRcdFx0dGhpcy5fdHJhbnNpdGlvbkVuZChlKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICd3aGVlbCc6XG5cdFx0XHRjYXNlICdET01Nb3VzZVNjcm9sbCc6XG5cdFx0XHRjYXNlICdtb3VzZXdoZWVsJzpcblx0XHRcdFx0dGhpcy5fd2hlZWwoZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAna2V5ZG93bic6XG5cdFx0XHRcdHRoaXMuX2tleShlKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdjbGljayc6XG5cdFx0XHRcdGlmICggIWUuX2NvbnN0cnVjdGVkICkge1xuXHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxufTtcbmZ1bmN0aW9uIGNyZWF0ZURlZmF1bHRTY3JvbGxiYXIgKGRpcmVjdGlvbiwgaW50ZXJhY3RpdmUsIHR5cGUpIHtcblx0dmFyIHNjcm9sbGJhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuXHRcdGluZGljYXRvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG5cdGlmICggdHlwZSA9PT0gdHJ1ZSApIHtcblx0XHRzY3JvbGxiYXIuc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjphYnNvbHV0ZTt6LWluZGV4Ojk5OTknO1xuXHRcdGluZGljYXRvci5zdHlsZS5jc3NUZXh0ID0gJy13ZWJraXQtYm94LXNpemluZzpib3JkZXItYm94Oy1tb3otYm94LXNpemluZzpib3JkZXItYm94O2JveC1zaXppbmc6Ym9yZGVyLWJveDtwb3NpdGlvbjphYnNvbHV0ZTtiYWNrZ3JvdW5kOnJnYmEoMCwwLDAsMC41KTtib3JkZXI6MXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC45KTtib3JkZXItcmFkaXVzOjNweCc7XG5cdH1cblxuXHRpbmRpY2F0b3IuY2xhc3NOYW1lID0gJ2lTY3JvbGxJbmRpY2F0b3InO1xuXG5cdGlmICggZGlyZWN0aW9uID09ICdoJyApIHtcblx0XHRpZiAoIHR5cGUgPT09IHRydWUgKSB7XG5cdFx0XHRzY3JvbGxiYXIuc3R5bGUuY3NzVGV4dCArPSAnO2hlaWdodDo3cHg7bGVmdDoycHg7cmlnaHQ6MnB4O2JvdHRvbTowJztcblx0XHRcdGluZGljYXRvci5zdHlsZS5oZWlnaHQgPSAnMTAwJSc7XG5cdFx0fVxuXHRcdHNjcm9sbGJhci5jbGFzc05hbWUgPSAnaVNjcm9sbEhvcml6b250YWxTY3JvbGxiYXInO1xuXHR9IGVsc2Uge1xuXHRcdGlmICggdHlwZSA9PT0gdHJ1ZSApIHtcblx0XHRcdHNjcm9sbGJhci5zdHlsZS5jc3NUZXh0ICs9ICc7d2lkdGg6N3B4O2JvdHRvbToycHg7dG9wOjJweDtyaWdodDoxcHgnO1xuXHRcdFx0aW5kaWNhdG9yLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuXHRcdH1cblx0XHRzY3JvbGxiYXIuY2xhc3NOYW1lID0gJ2lTY3JvbGxWZXJ0aWNhbFNjcm9sbGJhcic7XG5cdH1cblxuXHRzY3JvbGxiYXIuc3R5bGUuY3NzVGV4dCArPSAnO292ZXJmbG93OmhpZGRlbic7XG5cblx0aWYgKCAhaW50ZXJhY3RpdmUgKSB7XG5cdFx0c2Nyb2xsYmFyLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XG5cdH1cblxuXHRzY3JvbGxiYXIuYXBwZW5kQ2hpbGQoaW5kaWNhdG9yKTtcblxuXHRyZXR1cm4gc2Nyb2xsYmFyO1xufVxuXG5mdW5jdGlvbiBJbmRpY2F0b3IgKHNjcm9sbGVyLCBvcHRpb25zKSB7XG5cdHRoaXMud3JhcHBlciA9IHR5cGVvZiBvcHRpb25zLmVsID09ICdzdHJpbmcnID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihvcHRpb25zLmVsKSA6IG9wdGlvbnMuZWw7XG5cdHRoaXMud3JhcHBlclN0eWxlID0gdGhpcy53cmFwcGVyLnN0eWxlO1xuXHR0aGlzLmluZGljYXRvciA9IHRoaXMud3JhcHBlci5jaGlsZHJlblswXTtcblx0dGhpcy5pbmRpY2F0b3JTdHlsZSA9IHRoaXMuaW5kaWNhdG9yLnN0eWxlO1xuXHR0aGlzLnNjcm9sbGVyID0gc2Nyb2xsZXI7XG5cblx0dGhpcy5vcHRpb25zID0ge1xuXHRcdGxpc3Rlblg6IHRydWUsXG5cdFx0bGlzdGVuWTogdHJ1ZSxcblx0XHRpbnRlcmFjdGl2ZTogZmFsc2UsXG5cdFx0cmVzaXplOiB0cnVlLFxuXHRcdGRlZmF1bHRTY3JvbGxiYXJzOiBmYWxzZSxcblx0XHRzaHJpbms6IGZhbHNlLFxuXHRcdGZhZGU6IGZhbHNlLFxuXHRcdHNwZWVkUmF0aW9YOiAwLFxuXHRcdHNwZWVkUmF0aW9ZOiAwXG5cdH07XG5cblx0Zm9yICggdmFyIGkgaW4gb3B0aW9ucyApIHtcblx0XHR0aGlzLm9wdGlvbnNbaV0gPSBvcHRpb25zW2ldO1xuXHR9XG5cblx0dGhpcy5zaXplUmF0aW9YID0gMTtcblx0dGhpcy5zaXplUmF0aW9ZID0gMTtcblx0dGhpcy5tYXhQb3NYID0gMDtcblx0dGhpcy5tYXhQb3NZID0gMDtcblxuXHRpZiAoIHRoaXMub3B0aW9ucy5pbnRlcmFjdGl2ZSApIHtcblx0XHRpZiAoICF0aGlzLm9wdGlvbnMuZGlzYWJsZVRvdWNoICkge1xuXHRcdFx0dXRpbHMuYWRkRXZlbnQodGhpcy5pbmRpY2F0b3IsICd0b3VjaHN0YXJ0JywgdGhpcyk7XG5cdFx0XHR1dGlscy5hZGRFdmVudCh3aW5kb3csICd0b3VjaGVuZCcsIHRoaXMpO1xuXHRcdH1cblx0XHRpZiAoICF0aGlzLm9wdGlvbnMuZGlzYWJsZVBvaW50ZXIgKSB7XG5cdFx0XHR1dGlscy5hZGRFdmVudCh0aGlzLmluZGljYXRvciwgJ01TUG9pbnRlckRvd24nLCB0aGlzKTtcblx0XHRcdHV0aWxzLmFkZEV2ZW50KHdpbmRvdywgJ01TUG9pbnRlclVwJywgdGhpcyk7XG5cdFx0fVxuXHRcdGlmICggIXRoaXMub3B0aW9ucy5kaXNhYmxlTW91c2UgKSB7XG5cdFx0XHR1dGlscy5hZGRFdmVudCh0aGlzLmluZGljYXRvciwgJ21vdXNlZG93bicsIHRoaXMpO1xuXHRcdFx0dXRpbHMuYWRkRXZlbnQod2luZG93LCAnbW91c2V1cCcsIHRoaXMpO1xuXHRcdH1cblx0fVxuXG5cdGlmICggdGhpcy5vcHRpb25zLmZhZGUgKSB7XG5cdFx0dGhpcy53cmFwcGVyU3R5bGVbdXRpbHMuc3R5bGUudHJhbnNmb3JtXSA9IHRoaXMuc2Nyb2xsZXIudHJhbnNsYXRlWjtcblx0XHR0aGlzLndyYXBwZXJTdHlsZVt1dGlscy5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb25dID0gdXRpbHMuaXNCYWRBbmRyb2lkID8gJzAuMDAxcycgOiAnMG1zJztcblx0XHR0aGlzLndyYXBwZXJTdHlsZS5vcGFjaXR5ID0gJzAnO1xuXHR9XG59XG5cbkluZGljYXRvci5wcm90b3R5cGUgPSB7XG5cdGhhbmRsZUV2ZW50OiBmdW5jdGlvbiAoZSkge1xuXHRcdHN3aXRjaCAoIGUudHlwZSApIHtcblx0XHRcdGNhc2UgJ3RvdWNoc3RhcnQnOlxuXHRcdFx0Y2FzZSAnTVNQb2ludGVyRG93bic6XG5cdFx0XHRjYXNlICdtb3VzZWRvd24nOlxuXHRcdFx0XHR0aGlzLl9zdGFydChlKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICd0b3VjaG1vdmUnOlxuXHRcdFx0Y2FzZSAnTVNQb2ludGVyTW92ZSc6XG5cdFx0XHRjYXNlICdtb3VzZW1vdmUnOlxuXHRcdFx0XHR0aGlzLl9tb3ZlKGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ3RvdWNoZW5kJzpcblx0XHRcdGNhc2UgJ01TUG9pbnRlclVwJzpcblx0XHRcdGNhc2UgJ21vdXNldXAnOlxuXHRcdFx0Y2FzZSAndG91Y2hjYW5jZWwnOlxuXHRcdFx0Y2FzZSAnTVNQb2ludGVyQ2FuY2VsJzpcblx0XHRcdGNhc2UgJ21vdXNlY2FuY2VsJzpcblx0XHRcdFx0dGhpcy5fZW5kKGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH0sXG5cblx0ZGVzdHJveTogZnVuY3Rpb24gKCkge1xuXHRcdGlmICggdGhpcy5vcHRpb25zLmludGVyYWN0aXZlICkge1xuXHRcdFx0dXRpbHMucmVtb3ZlRXZlbnQodGhpcy5pbmRpY2F0b3IsICd0b3VjaHN0YXJ0JywgdGhpcyk7XG5cdFx0XHR1dGlscy5yZW1vdmVFdmVudCh0aGlzLmluZGljYXRvciwgJ01TUG9pbnRlckRvd24nLCB0aGlzKTtcblx0XHRcdHV0aWxzLnJlbW92ZUV2ZW50KHRoaXMuaW5kaWNhdG9yLCAnbW91c2Vkb3duJywgdGhpcyk7XG5cblx0XHRcdHV0aWxzLnJlbW92ZUV2ZW50KHdpbmRvdywgJ3RvdWNobW92ZScsIHRoaXMpO1xuXHRcdFx0dXRpbHMucmVtb3ZlRXZlbnQod2luZG93LCAnTVNQb2ludGVyTW92ZScsIHRoaXMpO1xuXHRcdFx0dXRpbHMucmVtb3ZlRXZlbnQod2luZG93LCAnbW91c2Vtb3ZlJywgdGhpcyk7XG5cblx0XHRcdHV0aWxzLnJlbW92ZUV2ZW50KHdpbmRvdywgJ3RvdWNoZW5kJywgdGhpcyk7XG5cdFx0XHR1dGlscy5yZW1vdmVFdmVudCh3aW5kb3csICdNU1BvaW50ZXJVcCcsIHRoaXMpO1xuXHRcdFx0dXRpbHMucmVtb3ZlRXZlbnQod2luZG93LCAnbW91c2V1cCcsIHRoaXMpO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5vcHRpb25zLmRlZmF1bHRTY3JvbGxiYXJzICkge1xuXHRcdFx0dGhpcy53cmFwcGVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy53cmFwcGVyKTtcblx0XHR9XG5cdH0sXG5cblx0X3N0YXJ0OiBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBwb2ludCA9IGUudG91Y2hlcyA/IGUudG91Y2hlc1swXSA6IGU7XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHRoaXMudHJhbnNpdGlvblRpbWUoKTtcblxuXHRcdHRoaXMuaW5pdGlhdGVkID0gdHJ1ZTtcblx0XHR0aGlzLm1vdmVkID0gZmFsc2U7XG5cdFx0dGhpcy5sYXN0UG9pbnRYXHQ9IHBvaW50LnBhZ2VYO1xuXHRcdHRoaXMubGFzdFBvaW50WVx0PSBwb2ludC5wYWdlWTtcblxuXHRcdHRoaXMuc3RhcnRUaW1lXHQ9IHV0aWxzLmdldFRpbWUoKTtcblxuXHRcdGlmICggIXRoaXMub3B0aW9ucy5kaXNhYmxlVG91Y2ggKSB7XG5cdFx0XHR1dGlscy5hZGRFdmVudCh3aW5kb3csICd0b3VjaG1vdmUnLCB0aGlzKTtcblx0XHR9XG5cdFx0aWYgKCAhdGhpcy5vcHRpb25zLmRpc2FibGVQb2ludGVyICkge1xuXHRcdFx0dXRpbHMuYWRkRXZlbnQod2luZG93LCAnTVNQb2ludGVyTW92ZScsIHRoaXMpO1xuXHRcdH1cblx0XHRpZiAoICF0aGlzLm9wdGlvbnMuZGlzYWJsZU1vdXNlICkge1xuXHRcdFx0dXRpbHMuYWRkRXZlbnQod2luZG93LCAnbW91c2Vtb3ZlJywgdGhpcyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5zY3JvbGxlci5fZXhlY0V2ZW50KCdiZWZvcmVTY3JvbGxTdGFydCcpO1xuXHR9LFxuXG5cdF9tb3ZlOiBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBwb2ludCA9IGUudG91Y2hlcyA/IGUudG91Y2hlc1swXSA6IGUsXG5cdFx0XHRkZWx0YVgsIGRlbHRhWSxcblx0XHRcdG5ld1gsIG5ld1ksXG5cdFx0XHR0aW1lc3RhbXAgPSB1dGlscy5nZXRUaW1lKCk7XG5cblx0XHRpZiAoICF0aGlzLm1vdmVkICkge1xuXHRcdFx0dGhpcy5zY3JvbGxlci5fZXhlY0V2ZW50KCdzY3JvbGxTdGFydCcpO1xuXHRcdH1cblxuXHRcdHRoaXMubW92ZWQgPSB0cnVlO1xuXG5cdFx0ZGVsdGFYID0gcG9pbnQucGFnZVggLSB0aGlzLmxhc3RQb2ludFg7XG5cdFx0dGhpcy5sYXN0UG9pbnRYID0gcG9pbnQucGFnZVg7XG5cblx0XHRkZWx0YVkgPSBwb2ludC5wYWdlWSAtIHRoaXMubGFzdFBvaW50WTtcblx0XHR0aGlzLmxhc3RQb2ludFkgPSBwb2ludC5wYWdlWTtcblxuXHRcdG5ld1ggPSB0aGlzLnggKyBkZWx0YVg7XG5cdFx0bmV3WSA9IHRoaXMueSArIGRlbHRhWTtcblxuXHRcdHRoaXMuX3BvcyhuZXdYLCBuZXdZKTtcblxuLy8gSU5TRVJUIFBPSU5UOiBpbmRpY2F0b3IuX21vdmVcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRlLnN0b3BQcm9wYWdhdGlvbigpO1xuXHR9LFxuXG5cdF9lbmQ6IGZ1bmN0aW9uIChlKSB7XG5cdFx0aWYgKCAhdGhpcy5pbml0aWF0ZWQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5pbml0aWF0ZWQgPSBmYWxzZTtcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dXRpbHMucmVtb3ZlRXZlbnQod2luZG93LCAndG91Y2htb3ZlJywgdGhpcyk7XG5cdFx0dXRpbHMucmVtb3ZlRXZlbnQod2luZG93LCAnTVNQb2ludGVyTW92ZScsIHRoaXMpO1xuXHRcdHV0aWxzLnJlbW92ZUV2ZW50KHdpbmRvdywgJ21vdXNlbW92ZScsIHRoaXMpO1xuXG5cdFx0aWYgKCB0aGlzLnNjcm9sbGVyLm9wdGlvbnMuc25hcCApIHtcblx0XHRcdHZhciBzbmFwID0gdGhpcy5zY3JvbGxlci5fbmVhcmVzdFNuYXAodGhpcy5zY3JvbGxlci54LCB0aGlzLnNjcm9sbGVyLnkpO1xuXG5cdFx0XHR2YXIgdGltZSA9IHRoaXMub3B0aW9ucy5zbmFwU3BlZWQgfHwgTWF0aC5tYXgoXG5cdFx0XHRcdFx0TWF0aC5tYXgoXG5cdFx0XHRcdFx0XHRNYXRoLm1pbihNYXRoLmFicyh0aGlzLnNjcm9sbGVyLnggLSBzbmFwLngpLCAxMDAwKSxcblx0XHRcdFx0XHRcdE1hdGgubWluKE1hdGguYWJzKHRoaXMuc2Nyb2xsZXIueSAtIHNuYXAueSksIDEwMDApXG5cdFx0XHRcdFx0KSwgMzAwKTtcblxuXHRcdFx0aWYgKCB0aGlzLnNjcm9sbGVyLnggIT0gc25hcC54IHx8IHRoaXMuc2Nyb2xsZXIueSAhPSBzbmFwLnkgKSB7XG5cdFx0XHRcdHRoaXMuc2Nyb2xsZXIuZGlyZWN0aW9uWCA9IDA7XG5cdFx0XHRcdHRoaXMuc2Nyb2xsZXIuZGlyZWN0aW9uWSA9IDA7XG5cdFx0XHRcdHRoaXMuc2Nyb2xsZXIuY3VycmVudFBhZ2UgPSBzbmFwO1xuXHRcdFx0XHR0aGlzLnNjcm9sbGVyLnNjcm9sbFRvKHNuYXAueCwgc25hcC55LCB0aW1lLCB0aGlzLnNjcm9sbGVyLm9wdGlvbnMuYm91bmNlRWFzaW5nKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIHRoaXMubW92ZWQgKSB7XG5cdFx0XHR0aGlzLnNjcm9sbGVyLl9leGVjRXZlbnQoJ3Njcm9sbEVuZCcpO1xuXHRcdH1cblx0fSxcblxuXHR0cmFuc2l0aW9uVGltZTogZnVuY3Rpb24gKHRpbWUpIHtcblx0XHR0aW1lID0gdGltZSB8fCAwO1xuXHRcdHRoaXMuaW5kaWNhdG9yU3R5bGVbdXRpbHMuc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uXSA9IHRpbWUgKyAnbXMnO1xuXG5cdFx0aWYgKCAhdGltZSAmJiB1dGlscy5pc0JhZEFuZHJvaWQgKSB7XG5cdFx0XHR0aGlzLmluZGljYXRvclN0eWxlW3V0aWxzLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbl0gPSAnMC4wMDFzJztcblx0XHR9XG5cdH0sXG5cblx0dHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uOiBmdW5jdGlvbiAoZWFzaW5nKSB7XG5cdFx0dGhpcy5pbmRpY2F0b3JTdHlsZVt1dGlscy5zdHlsZS50cmFuc2l0aW9uVGltaW5nRnVuY3Rpb25dID0gZWFzaW5nO1xuXHR9LFxuXG5cdHJlZnJlc2g6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnRyYW5zaXRpb25UaW1lKCk7XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5saXN0ZW5YICYmICF0aGlzLm9wdGlvbnMubGlzdGVuWSApIHtcblx0XHRcdHRoaXMuaW5kaWNhdG9yU3R5bGUuZGlzcGxheSA9IHRoaXMuc2Nyb2xsZXIuaGFzSG9yaXpvbnRhbFNjcm9sbCA/ICdibG9jaycgOiAnbm9uZSc7XG5cdFx0fSBlbHNlIGlmICggdGhpcy5vcHRpb25zLmxpc3RlblkgJiYgIXRoaXMub3B0aW9ucy5saXN0ZW5YICkge1xuXHRcdFx0dGhpcy5pbmRpY2F0b3JTdHlsZS5kaXNwbGF5ID0gdGhpcy5zY3JvbGxlci5oYXNWZXJ0aWNhbFNjcm9sbCA/ICdibG9jaycgOiAnbm9uZSc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuaW5kaWNhdG9yU3R5bGUuZGlzcGxheSA9IHRoaXMuc2Nyb2xsZXIuaGFzSG9yaXpvbnRhbFNjcm9sbCB8fCB0aGlzLnNjcm9sbGVyLmhhc1ZlcnRpY2FsU2Nyb2xsID8gJ2Jsb2NrJyA6ICdub25lJztcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuc2Nyb2xsZXIuaGFzSG9yaXpvbnRhbFNjcm9sbCAmJiB0aGlzLnNjcm9sbGVyLmhhc1ZlcnRpY2FsU2Nyb2xsICkge1xuXHRcdFx0dXRpbHMuYWRkQ2xhc3ModGhpcy53cmFwcGVyLCAnaVNjcm9sbEJvdGhTY3JvbGxiYXJzJyk7XG5cdFx0XHR1dGlscy5yZW1vdmVDbGFzcyh0aGlzLndyYXBwZXIsICdpU2Nyb2xsTG9uZVNjcm9sbGJhcicpO1xuXG5cdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5kZWZhdWx0U2Nyb2xsYmFycyAmJiB0aGlzLm9wdGlvbnMuY3VzdG9tU3R5bGUgKSB7XG5cdFx0XHRcdGlmICggdGhpcy5vcHRpb25zLmxpc3RlblggKSB7XG5cdFx0XHRcdFx0dGhpcy53cmFwcGVyLnN0eWxlLnJpZ2h0ID0gJzhweCc7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy53cmFwcGVyLnN0eWxlLmJvdHRvbSA9ICc4cHgnO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHV0aWxzLnJlbW92ZUNsYXNzKHRoaXMud3JhcHBlciwgJ2lTY3JvbGxCb3RoU2Nyb2xsYmFycycpO1xuXHRcdFx0dXRpbHMuYWRkQ2xhc3ModGhpcy53cmFwcGVyLCAnaVNjcm9sbExvbmVTY3JvbGxiYXInKTtcblxuXHRcdFx0aWYgKCB0aGlzLm9wdGlvbnMuZGVmYXVsdFNjcm9sbGJhcnMgJiYgdGhpcy5vcHRpb25zLmN1c3RvbVN0eWxlICkge1xuXHRcdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5saXN0ZW5YICkge1xuXHRcdFx0XHRcdHRoaXMud3JhcHBlci5zdHlsZS5yaWdodCA9ICcycHgnO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMud3JhcHBlci5zdHlsZS5ib3R0b20gPSAnMnB4Jztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHZhciByID0gdGhpcy53cmFwcGVyLm9mZnNldEhlaWdodDtcdC8vIGZvcmNlIHJlZnJlc2hcblxuXHRcdGlmICggdGhpcy5vcHRpb25zLmxpc3RlblggKSB7XG5cdFx0XHR0aGlzLndyYXBwZXJXaWR0aCA9IHRoaXMud3JhcHBlci5jbGllbnRXaWR0aDtcblx0XHRcdGlmICggdGhpcy5vcHRpb25zLnJlc2l6ZSApIHtcblx0XHRcdFx0dGhpcy5pbmRpY2F0b3JXaWR0aCA9IE1hdGgubWF4KE1hdGgucm91bmQodGhpcy53cmFwcGVyV2lkdGggKiB0aGlzLndyYXBwZXJXaWR0aCAvICh0aGlzLnNjcm9sbGVyLnNjcm9sbGVyV2lkdGggfHwgdGhpcy53cmFwcGVyV2lkdGggfHwgMSkpLCA4KTtcblx0XHRcdFx0dGhpcy5pbmRpY2F0b3JTdHlsZS53aWR0aCA9IHRoaXMuaW5kaWNhdG9yV2lkdGggKyAncHgnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5pbmRpY2F0b3JXaWR0aCA9IHRoaXMuaW5kaWNhdG9yLmNsaWVudFdpZHRoO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLm1heFBvc1ggPSB0aGlzLndyYXBwZXJXaWR0aCAtIHRoaXMuaW5kaWNhdG9yV2lkdGg7XG5cblx0XHRcdGlmICggdGhpcy5vcHRpb25zLnNocmluayA9PSAnY2xpcCcgKSB7XG5cdFx0XHRcdHRoaXMubWluQm91bmRhcnlYID0gLXRoaXMuaW5kaWNhdG9yV2lkdGggKyA4O1xuXHRcdFx0XHR0aGlzLm1heEJvdW5kYXJ5WCA9IHRoaXMud3JhcHBlcldpZHRoIC0gODtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubWluQm91bmRhcnlYID0gMDtcblx0XHRcdFx0dGhpcy5tYXhCb3VuZGFyeVggPSB0aGlzLm1heFBvc1g7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2l6ZVJhdGlvWCA9IHRoaXMub3B0aW9ucy5zcGVlZFJhdGlvWCB8fCAodGhpcy5zY3JvbGxlci5tYXhTY3JvbGxYICYmICh0aGlzLm1heFBvc1ggLyB0aGlzLnNjcm9sbGVyLm1heFNjcm9sbFgpKTtcdFxuXHRcdH1cblxuXHRcdGlmICggdGhpcy5vcHRpb25zLmxpc3RlblkgKSB7XG5cdFx0XHR0aGlzLndyYXBwZXJIZWlnaHQgPSB0aGlzLndyYXBwZXIuY2xpZW50SGVpZ2h0O1xuXHRcdFx0aWYgKCB0aGlzLm9wdGlvbnMucmVzaXplICkge1xuXHRcdFx0XHR0aGlzLmluZGljYXRvckhlaWdodCA9IE1hdGgubWF4KE1hdGgucm91bmQodGhpcy53cmFwcGVySGVpZ2h0ICogdGhpcy53cmFwcGVySGVpZ2h0IC8gKHRoaXMuc2Nyb2xsZXIuc2Nyb2xsZXJIZWlnaHQgfHwgdGhpcy53cmFwcGVySGVpZ2h0IHx8IDEpKSwgOCk7XG5cdFx0XHRcdHRoaXMuaW5kaWNhdG9yU3R5bGUuaGVpZ2h0ID0gdGhpcy5pbmRpY2F0b3JIZWlnaHQgKyAncHgnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5pbmRpY2F0b3JIZWlnaHQgPSB0aGlzLmluZGljYXRvci5jbGllbnRIZWlnaHQ7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMubWF4UG9zWSA9IHRoaXMud3JhcHBlckhlaWdodCAtIHRoaXMuaW5kaWNhdG9ySGVpZ2h0O1xuXG5cdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5zaHJpbmsgPT0gJ2NsaXAnICkge1xuXHRcdFx0XHR0aGlzLm1pbkJvdW5kYXJ5WSA9IC10aGlzLmluZGljYXRvckhlaWdodCArIDg7XG5cdFx0XHRcdHRoaXMubWF4Qm91bmRhcnlZID0gdGhpcy53cmFwcGVySGVpZ2h0IC0gODtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubWluQm91bmRhcnlZID0gMDtcblx0XHRcdFx0dGhpcy5tYXhCb3VuZGFyeVkgPSB0aGlzLm1heFBvc1k7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMubWF4UG9zWSA9IHRoaXMud3JhcHBlckhlaWdodCAtIHRoaXMuaW5kaWNhdG9ySGVpZ2h0O1xuXHRcdFx0dGhpcy5zaXplUmF0aW9ZID0gdGhpcy5vcHRpb25zLnNwZWVkUmF0aW9ZIHx8ICh0aGlzLnNjcm9sbGVyLm1heFNjcm9sbFkgJiYgKHRoaXMubWF4UG9zWSAvIHRoaXMuc2Nyb2xsZXIubWF4U2Nyb2xsWSkpO1xuXHRcdH1cblxuXHRcdHRoaXMudXBkYXRlUG9zaXRpb24oKTtcblx0fSxcblxuXHR1cGRhdGVQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuXHRcdHZhciB4ID0gdGhpcy5vcHRpb25zLmxpc3RlblggJiYgTWF0aC5yb3VuZCh0aGlzLnNpemVSYXRpb1ggKiB0aGlzLnNjcm9sbGVyLngpIHx8IDAsXG5cdFx0XHR5ID0gdGhpcy5vcHRpb25zLmxpc3RlblkgJiYgTWF0aC5yb3VuZCh0aGlzLnNpemVSYXRpb1kgKiB0aGlzLnNjcm9sbGVyLnkpIHx8IDA7XG5cblx0XHRpZiAoICF0aGlzLm9wdGlvbnMuaWdub3JlQm91bmRhcmllcyApIHtcblx0XHRcdGlmICggeCA8IHRoaXMubWluQm91bmRhcnlYICkge1xuXHRcdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5zaHJpbmsgPT0gJ3NjYWxlJyApIHtcblx0XHRcdFx0XHR0aGlzLndpZHRoID0gTWF0aC5tYXgodGhpcy5pbmRpY2F0b3JXaWR0aCArIHgsIDgpO1xuXHRcdFx0XHRcdHRoaXMuaW5kaWNhdG9yU3R5bGUud2lkdGggPSB0aGlzLndpZHRoICsgJ3B4Jztcblx0XHRcdFx0fVxuXHRcdFx0XHR4ID0gdGhpcy5taW5Cb3VuZGFyeVg7XG5cdFx0XHR9IGVsc2UgaWYgKCB4ID4gdGhpcy5tYXhCb3VuZGFyeVggKSB7XG5cdFx0XHRcdGlmICggdGhpcy5vcHRpb25zLnNocmluayA9PSAnc2NhbGUnICkge1xuXHRcdFx0XHRcdHRoaXMud2lkdGggPSBNYXRoLm1heCh0aGlzLmluZGljYXRvcldpZHRoIC0gKHggLSB0aGlzLm1heFBvc1gpLCA4KTtcblx0XHRcdFx0XHR0aGlzLmluZGljYXRvclN0eWxlLndpZHRoID0gdGhpcy53aWR0aCArICdweCc7XG5cdFx0XHRcdFx0eCA9IHRoaXMubWF4UG9zWCArIHRoaXMuaW5kaWNhdG9yV2lkdGggLSB0aGlzLndpZHRoO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHggPSB0aGlzLm1heEJvdW5kYXJ5WDtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmICggdGhpcy5vcHRpb25zLnNocmluayA9PSAnc2NhbGUnICYmIHRoaXMud2lkdGggIT0gdGhpcy5pbmRpY2F0b3JXaWR0aCApIHtcblx0XHRcdFx0dGhpcy53aWR0aCA9IHRoaXMuaW5kaWNhdG9yV2lkdGg7XG5cdFx0XHRcdHRoaXMuaW5kaWNhdG9yU3R5bGUud2lkdGggPSB0aGlzLndpZHRoICsgJ3B4Jztcblx0XHRcdH1cblxuXHRcdFx0aWYgKCB5IDwgdGhpcy5taW5Cb3VuZGFyeVkgKSB7XG5cdFx0XHRcdGlmICggdGhpcy5vcHRpb25zLnNocmluayA9PSAnc2NhbGUnICkge1xuXHRcdFx0XHRcdHRoaXMuaGVpZ2h0ID0gTWF0aC5tYXgodGhpcy5pbmRpY2F0b3JIZWlnaHQgKyB5ICogMywgOCk7XG5cdFx0XHRcdFx0dGhpcy5pbmRpY2F0b3JTdHlsZS5oZWlnaHQgPSB0aGlzLmhlaWdodCArICdweCc7XG5cdFx0XHRcdH1cblx0XHRcdFx0eSA9IHRoaXMubWluQm91bmRhcnlZO1xuXHRcdFx0fSBlbHNlIGlmICggeSA+IHRoaXMubWF4Qm91bmRhcnlZICkge1xuXHRcdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5zaHJpbmsgPT0gJ3NjYWxlJyApIHtcblx0XHRcdFx0XHR0aGlzLmhlaWdodCA9IE1hdGgubWF4KHRoaXMuaW5kaWNhdG9ySGVpZ2h0IC0gKHkgLSB0aGlzLm1heFBvc1kpICogMywgOCk7XG5cdFx0XHRcdFx0dGhpcy5pbmRpY2F0b3JTdHlsZS5oZWlnaHQgPSB0aGlzLmhlaWdodCArICdweCc7XG5cdFx0XHRcdFx0eSA9IHRoaXMubWF4UG9zWSArIHRoaXMuaW5kaWNhdG9ySGVpZ2h0IC0gdGhpcy5oZWlnaHQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0eSA9IHRoaXMubWF4Qm91bmRhcnlZO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKCB0aGlzLm9wdGlvbnMuc2hyaW5rID09ICdzY2FsZScgJiYgdGhpcy5oZWlnaHQgIT0gdGhpcy5pbmRpY2F0b3JIZWlnaHQgKSB7XG5cdFx0XHRcdHRoaXMuaGVpZ2h0ID0gdGhpcy5pbmRpY2F0b3JIZWlnaHQ7XG5cdFx0XHRcdHRoaXMuaW5kaWNhdG9yU3R5bGUuaGVpZ2h0ID0gdGhpcy5oZWlnaHQgKyAncHgnO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMueCA9IHg7XG5cdFx0dGhpcy55ID0geTtcblxuXHRcdGlmICggdGhpcy5zY3JvbGxlci5vcHRpb25zLnVzZVRyYW5zZm9ybSApIHtcblx0XHRcdHRoaXMuaW5kaWNhdG9yU3R5bGVbdXRpbHMuc3R5bGUudHJhbnNmb3JtXSA9ICd0cmFuc2xhdGUoJyArIHggKyAncHgsJyArIHkgKyAncHgpJyArIHRoaXMuc2Nyb2xsZXIudHJhbnNsYXRlWjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5pbmRpY2F0b3JTdHlsZS5sZWZ0ID0geCArICdweCc7XG5cdFx0XHR0aGlzLmluZGljYXRvclN0eWxlLnRvcCA9IHkgKyAncHgnO1xuXHRcdH1cblx0fSxcblxuXHRfcG9zOiBmdW5jdGlvbiAoeCwgeSkge1xuXHRcdGlmICggeCA8IDAgKSB7XG5cdFx0XHR4ID0gMDtcblx0XHR9IGVsc2UgaWYgKCB4ID4gdGhpcy5tYXhQb3NYICkge1xuXHRcdFx0eCA9IHRoaXMubWF4UG9zWDtcblx0XHR9XG5cblx0XHRpZiAoIHkgPCAwICkge1xuXHRcdFx0eSA9IDA7XG5cdFx0fSBlbHNlIGlmICggeSA+IHRoaXMubWF4UG9zWSApIHtcblx0XHRcdHkgPSB0aGlzLm1heFBvc1k7XG5cdFx0fVxuXG5cdFx0eCA9IHRoaXMub3B0aW9ucy5saXN0ZW5YID8gTWF0aC5yb3VuZCh4IC8gdGhpcy5zaXplUmF0aW9YKSA6IHRoaXMuc2Nyb2xsZXIueDtcblx0XHR5ID0gdGhpcy5vcHRpb25zLmxpc3RlblkgPyBNYXRoLnJvdW5kKHkgLyB0aGlzLnNpemVSYXRpb1kpIDogdGhpcy5zY3JvbGxlci55O1xuXG5cdFx0dGhpcy5zY3JvbGxlci5zY3JvbGxUbyh4LCB5KTtcblx0fSxcblxuXHRmYWRlOiBmdW5jdGlvbiAodmFsLCBob2xkKSB7XG5cdFx0aWYgKCBob2xkICYmICF0aGlzLnZpc2libGUgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuZmFkZVRpbWVvdXQpO1xuXHRcdHRoaXMuZmFkZVRpbWVvdXQgPSBudWxsO1xuXG5cdFx0dmFyIHRpbWUgPSB2YWwgPyAyNTAgOiA1MDAsXG5cdFx0XHRkZWxheSA9IHZhbCA/IDAgOiAzMDA7XG5cblx0XHR2YWwgPSB2YWwgPyAnMScgOiAnMCc7XG5cblx0XHR0aGlzLndyYXBwZXJTdHlsZVt1dGlscy5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb25dID0gdGltZSArICdtcyc7XG5cblx0XHR0aGlzLmZhZGVUaW1lb3V0ID0gc2V0VGltZW91dCgoZnVuY3Rpb24gKHZhbCkge1xuXHRcdFx0dGhpcy53cmFwcGVyU3R5bGUub3BhY2l0eSA9IHZhbDtcblx0XHRcdHRoaXMudmlzaWJsZSA9ICt2YWw7XG5cdFx0fSkuYmluZCh0aGlzLCB2YWwpLCBkZWxheSk7XG5cdH1cbn07XG5cbklTY3JvbGwudXRpbHMgPSB1dGlscztcblxuaWYgKCB0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzICkge1xuXHRtb2R1bGUuZXhwb3J0cyA9IElTY3JvbGw7XG59IGVsc2Uge1xuXHR3aW5kb3cuSVNjcm9sbCA9IElTY3JvbGw7XG59XG5cbn0pKHdpbmRvdywgZG9jdW1lbnQsIE1hdGgpOyIsInZhciBwcm9jZXNzPXJlcXVpcmUoXCJfX2Jyb3dzZXJpZnlfcHJvY2Vzc1wiKTsvLyB2aW06dHM9NDpzdHM9NDpzdz00OlxuLyohXG4gKlxuICogQ29weXJpZ2h0IDIwMDktMjAxMiBLcmlzIEtvd2FsIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUXG4gKiBsaWNlbnNlIGZvdW5kIGF0IGh0dHA6Ly9naXRodWIuY29tL2tyaXNrb3dhbC9xL3Jhdy9tYXN0ZXIvTElDRU5TRVxuICpcbiAqIFdpdGggcGFydHMgYnkgVHlsZXIgQ2xvc2VcbiAqIENvcHlyaWdodCAyMDA3LTIwMDkgVHlsZXIgQ2xvc2UgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBNSVQgWCBsaWNlbnNlIGZvdW5kXG4gKiBhdCBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLmh0bWxcbiAqIEZvcmtlZCBhdCByZWZfc2VuZC5qcyB2ZXJzaW9uOiAyMDA5LTA1LTExXG4gKlxuICogV2l0aCBwYXJ0cyBieSBNYXJrIE1pbGxlclxuICogQ29weXJpZ2h0IChDKSAyMDExIEdvb2dsZSBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICovXG5cbihmdW5jdGlvbiAoZGVmaW5pdGlvbikge1xuICAgIC8vIFR1cm4gb2ZmIHN0cmljdCBtb2RlIGZvciB0aGlzIGZ1bmN0aW9uIHNvIHdlIGNhbiBhc3NpZ24gdG8gZ2xvYmFsLlFcbiAgICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqL1xuXG4gICAgLy8gVGhpcyBmaWxlIHdpbGwgZnVuY3Rpb24gcHJvcGVybHkgYXMgYSA8c2NyaXB0PiB0YWcsIG9yIGEgbW9kdWxlXG4gICAgLy8gdXNpbmcgQ29tbW9uSlMgYW5kIE5vZGVKUyBvciBSZXF1aXJlSlMgbW9kdWxlIGZvcm1hdHMuICBJblxuICAgIC8vIENvbW1vbi9Ob2RlL1JlcXVpcmVKUywgdGhlIG1vZHVsZSBleHBvcnRzIHRoZSBRIEFQSSBhbmQgd2hlblxuICAgIC8vIGV4ZWN1dGVkIGFzIGEgc2ltcGxlIDxzY3JpcHQ+LCBpdCBjcmVhdGVzIGEgUSBnbG9iYWwgaW5zdGVhZC5cblxuICAgIC8vIE1vbnRhZ2UgUmVxdWlyZVxuICAgIGlmICh0eXBlb2YgYm9vdHN0cmFwID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgYm9vdHN0cmFwKFwicHJvbWlzZVwiLCBkZWZpbml0aW9uKTtcblxuICAgIC8vIENvbW1vbkpTXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKTtcblxuICAgIC8vIFJlcXVpcmVKU1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKGRlZmluaXRpb24pO1xuXG4gICAgLy8gU0VTIChTZWN1cmUgRWNtYVNjcmlwdClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZXMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKCFzZXMub2soKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VzLm1ha2VRID0gZGVmaW5pdGlvbjtcbiAgICAgICAgfVxuXG4gICAgLy8gPHNjcmlwdD5cbiAgICB9IGVsc2Uge1xuICAgICAgICBRID0gZGVmaW5pdGlvbigpO1xuICAgIH1cblxufSkoZnVuY3Rpb24gKCkge1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBoYXNTdGFja3MgPSBmYWxzZTtcbnRyeSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCk7XG59IGNhdGNoIChlKSB7XG4gICAgaGFzU3RhY2tzID0gISFlLnN0YWNrO1xufVxuXG4vLyBBbGwgY29kZSBhZnRlciB0aGlzIHBvaW50IHdpbGwgYmUgZmlsdGVyZWQgZnJvbSBzdGFjayB0cmFjZXMgcmVwb3J0ZWRcbi8vIGJ5IFEuXG52YXIgcVN0YXJ0aW5nTGluZSA9IGNhcHR1cmVMaW5lKCk7XG52YXIgcUZpbGVOYW1lO1xuXG4vLyBzaGltc1xuXG4vLyB1c2VkIGZvciBmYWxsYmFjayBpbiBcImFsbFJlc29sdmVkXCJcbnZhciBub29wID0gZnVuY3Rpb24gKCkge307XG5cbi8vIFVzZSB0aGUgZmFzdGVzdCBwb3NzaWJsZSBtZWFucyB0byBleGVjdXRlIGEgdGFzayBpbiBhIGZ1dHVyZSB0dXJuXG4vLyBvZiB0aGUgZXZlbnQgbG9vcC5cbnZhciBuZXh0VGljayA9KGZ1bmN0aW9uICgpIHtcbiAgICAvLyBsaW5rZWQgbGlzdCBvZiB0YXNrcyAoc2luZ2xlLCB3aXRoIGhlYWQgbm9kZSlcbiAgICB2YXIgaGVhZCA9IHt0YXNrOiB2b2lkIDAsIG5leHQ6IG51bGx9O1xuICAgIHZhciB0YWlsID0gaGVhZDtcbiAgICB2YXIgZmx1c2hpbmcgPSBmYWxzZTtcbiAgICB2YXIgcmVxdWVzdFRpY2sgPSB2b2lkIDA7XG4gICAgdmFyIGlzTm9kZUpTID0gZmFsc2U7XG5cbiAgICBmdW5jdGlvbiBmbHVzaCgpIHtcbiAgICAgICAgLyoganNoaW50IGxvb3BmdW5jOiB0cnVlICovXG5cbiAgICAgICAgd2hpbGUgKGhlYWQubmV4dCkge1xuICAgICAgICAgICAgaGVhZCA9IGhlYWQubmV4dDtcbiAgICAgICAgICAgIHZhciB0YXNrID0gaGVhZC50YXNrO1xuICAgICAgICAgICAgaGVhZC50YXNrID0gdm9pZCAwO1xuICAgICAgICAgICAgdmFyIGRvbWFpbiA9IGhlYWQuZG9tYWluO1xuXG4gICAgICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICAgICAgaGVhZC5kb21haW4gPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgZG9tYWluLmVudGVyKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGFzaygpO1xuXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzTm9kZUpTKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEluIG5vZGUsIHVuY2F1Z2h0IGV4Y2VwdGlvbnMgYXJlIGNvbnNpZGVyZWQgZmF0YWwgZXJyb3JzLlxuICAgICAgICAgICAgICAgICAgICAvLyBSZS10aHJvdyB0aGVtIHN5bmNocm9ub3VzbHkgdG8gaW50ZXJydXB0IGZsdXNoaW5nIVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIEVuc3VyZSBjb250aW51YXRpb24gaWYgdGhlIHVuY2F1Z2h0IGV4Y2VwdGlvbiBpcyBzdXBwcmVzc2VkXG4gICAgICAgICAgICAgICAgICAgIC8vIGxpc3RlbmluZyBcInVuY2F1Z2h0RXhjZXB0aW9uXCIgZXZlbnRzIChhcyBkb21haW5zIGRvZXMpLlxuICAgICAgICAgICAgICAgICAgICAvLyBDb250aW51ZSBpbiBuZXh0IGV2ZW50IHRvIGF2b2lkIHRpY2sgcmVjdXJzaW9uLlxuICAgICAgICAgICAgICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb21haW4uZXhpdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZmx1c2gsIDApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb21haW4uZW50ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBJbiBicm93c2VycywgdW5jYXVnaHQgZXhjZXB0aW9ucyBhcmUgbm90IGZhdGFsLlxuICAgICAgICAgICAgICAgICAgICAvLyBSZS10aHJvdyB0aGVtIGFzeW5jaHJvbm91c2x5IHRvIGF2b2lkIHNsb3ctZG93bnMuXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgIGRvbWFpbi5leGl0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmbHVzaGluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIG5leHRUaWNrID0gZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgdGFpbCA9IHRhaWwubmV4dCA9IHtcbiAgICAgICAgICAgIHRhc2s6IHRhc2ssXG4gICAgICAgICAgICBkb21haW46IGlzTm9kZUpTICYmIHByb2Nlc3MuZG9tYWluLFxuICAgICAgICAgICAgbmV4dDogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICghZmx1c2hpbmcpIHtcbiAgICAgICAgICAgIGZsdXNoaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSBcInVuZGVmaW5lZFwiICYmIHByb2Nlc3MubmV4dFRpY2spIHtcbiAgICAgICAgLy8gTm9kZS5qcyBiZWZvcmUgMC45LiBOb3RlIHRoYXQgc29tZSBmYWtlLU5vZGUgZW52aXJvbm1lbnRzLCBsaWtlIHRoZVxuICAgICAgICAvLyBNb2NoYSB0ZXN0IHJ1bm5lciwgaW50cm9kdWNlIGEgYHByb2Nlc3NgIGdsb2JhbCB3aXRob3V0IGEgYG5leHRUaWNrYC5cbiAgICAgICAgaXNOb2RlSlMgPSB0cnVlO1xuXG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmbHVzaCk7XG4gICAgICAgIH07XG5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAvLyBJbiBJRTEwLCBOb2RlLmpzIDAuOSssIG9yIGh0dHBzOi8vZ2l0aHViLmNvbS9Ob2JsZUpTL3NldEltbWVkaWF0ZVxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmVxdWVzdFRpY2sgPSBzZXRJbW1lZGlhdGUuYmluZCh3aW5kb3csIGZsdXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNldEltbWVkaWF0ZShmbHVzaCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAvLyBtb2Rlcm4gYnJvd3NlcnNcbiAgICAgICAgLy8gaHR0cDovL3d3dy5ub25ibG9ja2luZy5pby8yMDExLzA2L3dpbmRvd25leHR0aWNrLmh0bWxcbiAgICAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgICAgLy8gQXQgbGVhc3QgU2FmYXJpIFZlcnNpb24gNi4wLjUgKDg1MzYuMzAuMSkgaW50ZXJtaXR0ZW50bHkgY2Fubm90IGNyZWF0ZVxuICAgICAgICAvLyB3b3JraW5nIG1lc3NhZ2UgcG9ydHMgdGhlIGZpcnN0IHRpbWUgYSBwYWdlIGxvYWRzLlxuICAgICAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrID0gcmVxdWVzdFBvcnRUaWNrO1xuICAgICAgICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmbHVzaDtcbiAgICAgICAgICAgIGZsdXNoKCk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciByZXF1ZXN0UG9ydFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBPcGVyYSByZXF1aXJlcyB1cyB0byBwcm92aWRlIGEgbWVzc2FnZSBwYXlsb2FkLCByZWdhcmRsZXNzIG9mXG4gICAgICAgICAgICAvLyB3aGV0aGVyIHdlIHVzZSBpdC5cbiAgICAgICAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgICAgICByZXF1ZXN0UG9ydFRpY2soKTtcbiAgICAgICAgfTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG9sZCBicm93c2Vyc1xuICAgICAgICByZXF1ZXN0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZmx1c2gsIDApO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBuZXh0VGljaztcbn0pKCk7XG5cbi8vIEF0dGVtcHQgdG8gbWFrZSBnZW5lcmljcyBzYWZlIGluIHRoZSBmYWNlIG9mIGRvd25zdHJlYW1cbi8vIG1vZGlmaWNhdGlvbnMuXG4vLyBUaGVyZSBpcyBubyBzaXR1YXRpb24gd2hlcmUgdGhpcyBpcyBuZWNlc3NhcnkuXG4vLyBJZiB5b3UgbmVlZCBhIHNlY3VyaXR5IGd1YXJhbnRlZSwgdGhlc2UgcHJpbW9yZGlhbHMgbmVlZCB0byBiZVxuLy8gZGVlcGx5IGZyb3plbiBhbnl3YXksIGFuZCBpZiB5b3UgZG9u4oCZdCBuZWVkIGEgc2VjdXJpdHkgZ3VhcmFudGVlLFxuLy8gdGhpcyBpcyBqdXN0IHBsYWluIHBhcmFub2lkLlxuLy8gSG93ZXZlciwgdGhpcyAqKm1pZ2h0KiogaGF2ZSB0aGUgbmljZSBzaWRlLWVmZmVjdCBvZiByZWR1Y2luZyB0aGUgc2l6ZSBvZlxuLy8gdGhlIG1pbmlmaWVkIGNvZGUgYnkgcmVkdWNpbmcgeC5jYWxsKCkgdG8gbWVyZWx5IHgoKVxuLy8gU2VlIE1hcmsgTWlsbGVy4oCZcyBleHBsYW5hdGlvbiBvZiB3aGF0IHRoaXMgZG9lcy5cbi8vIGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWNvbnZlbnRpb25zOnNhZmVfbWV0YV9wcm9ncmFtbWluZ1xudmFyIGNhbGwgPSBGdW5jdGlvbi5jYWxsO1xuZnVuY3Rpb24gdW5jdXJyeVRoaXMoZikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBjYWxsLmFwcGx5KGYsIGFyZ3VtZW50cyk7XG4gICAgfTtcbn1cbi8vIFRoaXMgaXMgZXF1aXZhbGVudCwgYnV0IHNsb3dlcjpcbi8vIHVuY3VycnlUaGlzID0gRnVuY3Rpb25fYmluZC5iaW5kKEZ1bmN0aW9uX2JpbmQuY2FsbCk7XG4vLyBodHRwOi8vanNwZXJmLmNvbS91bmN1cnJ5dGhpc1xuXG52YXIgYXJyYXlfc2xpY2UgPSB1bmN1cnJ5VGhpcyhBcnJheS5wcm90b3R5cGUuc2xpY2UpO1xuXG52YXIgYXJyYXlfcmVkdWNlID0gdW5jdXJyeVRoaXMoXG4gICAgQXJyYXkucHJvdG90eXBlLnJlZHVjZSB8fCBmdW5jdGlvbiAoY2FsbGJhY2ssIGJhc2lzKSB7XG4gICAgICAgIHZhciBpbmRleCA9IDAsXG4gICAgICAgICAgICBsZW5ndGggPSB0aGlzLmxlbmd0aDtcbiAgICAgICAgLy8gY29uY2VybmluZyB0aGUgaW5pdGlhbCB2YWx1ZSwgaWYgb25lIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgLy8gc2VlayB0byB0aGUgZmlyc3QgdmFsdWUgaW4gdGhlIGFycmF5LCBhY2NvdW50aW5nXG4gICAgICAgICAgICAvLyBmb3IgdGhlIHBvc3NpYmlsaXR5IHRoYXQgaXMgaXMgYSBzcGFyc2UgYXJyYXlcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggaW4gdGhpcykge1xuICAgICAgICAgICAgICAgICAgICBiYXNpcyA9IHRoaXNbaW5kZXgrK107XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoKytpbmRleCA+PSBsZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gd2hpbGUgKDEpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlZHVjZVxuICAgICAgICBmb3IgKDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIC8vIGFjY291bnQgZm9yIHRoZSBwb3NzaWJpbGl0eSB0aGF0IHRoZSBhcnJheSBpcyBzcGFyc2VcbiAgICAgICAgICAgIGlmIChpbmRleCBpbiB0aGlzKSB7XG4gICAgICAgICAgICAgICAgYmFzaXMgPSBjYWxsYmFjayhiYXNpcywgdGhpc1tpbmRleF0sIGluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmFzaXM7XG4gICAgfVxuKTtcblxudmFyIGFycmF5X2luZGV4T2YgPSB1bmN1cnJ5VGhpcyhcbiAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiB8fCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbm90IGEgdmVyeSBnb29kIHNoaW0sIGJ1dCBnb29kIGVub3VnaCBmb3Igb3VyIG9uZSB1c2Ugb2YgaXRcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpc1tpXSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuKTtcblxudmFyIGFycmF5X21hcCA9IHVuY3VycnlUaGlzKFxuICAgIEFycmF5LnByb3RvdHlwZS5tYXAgfHwgZnVuY3Rpb24gKGNhbGxiYWNrLCB0aGlzcCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBjb2xsZWN0ID0gW107XG4gICAgICAgIGFycmF5X3JlZHVjZShzZWxmLCBmdW5jdGlvbiAodW5kZWZpbmVkLCB2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIGNvbGxlY3QucHVzaChjYWxsYmFjay5jYWxsKHRoaXNwLCB2YWx1ZSwgaW5kZXgsIHNlbGYpKTtcbiAgICAgICAgfSwgdm9pZCAwKTtcbiAgICAgICAgcmV0dXJuIGNvbGxlY3Q7XG4gICAgfVxuKTtcblxudmFyIG9iamVjdF9jcmVhdGUgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIChwcm90b3R5cGUpIHtcbiAgICBmdW5jdGlvbiBUeXBlKCkgeyB9XG4gICAgVHlwZS5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gICAgcmV0dXJuIG5ldyBUeXBlKCk7XG59O1xuXG52YXIgb2JqZWN0X2hhc093blByb3BlcnR5ID0gdW5jdXJyeVRoaXMoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSk7XG5cbnZhciBvYmplY3Rfa2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgaWYgKG9iamVjdF9oYXNPd25Qcm9wZXJ0eShvYmplY3QsIGtleSkpIHtcbiAgICAgICAgICAgIGtleXMucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xufTtcblxudmFyIG9iamVjdF90b1N0cmluZyA9IHVuY3VycnlUaGlzKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcpO1xuXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gT2JqZWN0KHZhbHVlKTtcbn1cblxuLy8gZ2VuZXJhdG9yIHJlbGF0ZWQgc2hpbXNcblxuLy8gRklYTUU6IFJlbW92ZSB0aGlzIGZ1bmN0aW9uIG9uY2UgRVM2IGdlbmVyYXRvcnMgYXJlIGluIFNwaWRlck1vbmtleS5cbmZ1bmN0aW9uIGlzU3RvcEl0ZXJhdGlvbihleGNlcHRpb24pIHtcbiAgICByZXR1cm4gKFxuICAgICAgICBvYmplY3RfdG9TdHJpbmcoZXhjZXB0aW9uKSA9PT0gXCJbb2JqZWN0IFN0b3BJdGVyYXRpb25dXCIgfHxcbiAgICAgICAgZXhjZXB0aW9uIGluc3RhbmNlb2YgUVJldHVyblZhbHVlXG4gICAgKTtcbn1cblxuLy8gRklYTUU6IFJlbW92ZSB0aGlzIGhlbHBlciBhbmQgUS5yZXR1cm4gb25jZSBFUzYgZ2VuZXJhdG9ycyBhcmUgaW5cbi8vIFNwaWRlck1vbmtleS5cbnZhciBRUmV0dXJuVmFsdWU7XG5pZiAodHlwZW9mIFJldHVyblZhbHVlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgUVJldHVyblZhbHVlID0gUmV0dXJuVmFsdWU7XG59IGVsc2Uge1xuICAgIFFSZXR1cm5WYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfTtcbn1cblxuLy8gbG9uZyBzdGFjayB0cmFjZXNcblxudmFyIFNUQUNLX0pVTVBfU0VQQVJBVE9SID0gXCJGcm9tIHByZXZpb3VzIGV2ZW50OlwiO1xuXG5mdW5jdGlvbiBtYWtlU3RhY2tUcmFjZUxvbmcoZXJyb3IsIHByb21pc2UpIHtcbiAgICAvLyBJZiBwb3NzaWJsZSwgdHJhbnNmb3JtIHRoZSBlcnJvciBzdGFjayB0cmFjZSBieSByZW1vdmluZyBOb2RlIGFuZCBRXG4gICAgLy8gY3J1ZnQsIHRoZW4gY29uY2F0ZW5hdGluZyB3aXRoIHRoZSBzdGFjayB0cmFjZSBvZiBgcHJvbWlzZWAuIFNlZSAjNTcuXG4gICAgaWYgKGhhc1N0YWNrcyAmJlxuICAgICAgICBwcm9taXNlLnN0YWNrICYmXG4gICAgICAgIHR5cGVvZiBlcnJvciA9PT0gXCJvYmplY3RcIiAmJlxuICAgICAgICBlcnJvciAhPT0gbnVsbCAmJlxuICAgICAgICBlcnJvci5zdGFjayAmJlxuICAgICAgICBlcnJvci5zdGFjay5pbmRleE9mKFNUQUNLX0pVTVBfU0VQQVJBVE9SKSA9PT0gLTFcbiAgICApIHtcbiAgICAgICAgdmFyIHN0YWNrcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBwID0gcHJvbWlzZTsgISFwOyBwID0gcC5zb3VyY2UpIHtcbiAgICAgICAgICAgIGlmIChwLnN0YWNrKSB7XG4gICAgICAgICAgICAgICAgc3RhY2tzLnVuc2hpZnQocC5zdGFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3RhY2tzLnVuc2hpZnQoZXJyb3Iuc3RhY2spO1xuXG4gICAgICAgIHZhciBjb25jYXRlZFN0YWNrcyA9IHN0YWNrcy5qb2luKFwiXFxuXCIgKyBTVEFDS19KVU1QX1NFUEFSQVRPUiArIFwiXFxuXCIpO1xuICAgICAgICBlcnJvci5zdGFjayA9IGZpbHRlclN0YWNrU3RyaW5nKGNvbmNhdGVkU3RhY2tzKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGZpbHRlclN0YWNrU3RyaW5nKHN0YWNrU3RyaW5nKSB7XG4gICAgdmFyIGxpbmVzID0gc3RhY2tTdHJpbmcuc3BsaXQoXCJcXG5cIik7XG4gICAgdmFyIGRlc2lyZWRMaW5lcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGxpbmUgPSBsaW5lc1tpXTtcblxuICAgICAgICBpZiAoIWlzSW50ZXJuYWxGcmFtZShsaW5lKSAmJiAhaXNOb2RlRnJhbWUobGluZSkgJiYgbGluZSkge1xuICAgICAgICAgICAgZGVzaXJlZExpbmVzLnB1c2gobGluZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRlc2lyZWRMaW5lcy5qb2luKFwiXFxuXCIpO1xufVxuXG5mdW5jdGlvbiBpc05vZGVGcmFtZShzdGFja0xpbmUpIHtcbiAgICByZXR1cm4gc3RhY2tMaW5lLmluZGV4T2YoXCIobW9kdWxlLmpzOlwiKSAhPT0gLTEgfHxcbiAgICAgICAgICAgc3RhY2tMaW5lLmluZGV4T2YoXCIobm9kZS5qczpcIikgIT09IC0xO1xufVxuXG5mdW5jdGlvbiBnZXRGaWxlTmFtZUFuZExpbmVOdW1iZXIoc3RhY2tMaW5lKSB7XG4gICAgLy8gTmFtZWQgZnVuY3Rpb25zOiBcImF0IGZ1bmN0aW9uTmFtZSAoZmlsZW5hbWU6bGluZU51bWJlcjpjb2x1bW5OdW1iZXIpXCJcbiAgICAvLyBJbiBJRTEwIGZ1bmN0aW9uIG5hbWUgY2FuIGhhdmUgc3BhY2VzIChcIkFub255bW91cyBmdW5jdGlvblwiKSBPX29cbiAgICB2YXIgYXR0ZW1wdDEgPSAvYXQgLisgXFwoKC4rKTooXFxkKyk6KD86XFxkKylcXCkkLy5leGVjKHN0YWNrTGluZSk7XG4gICAgaWYgKGF0dGVtcHQxKSB7XG4gICAgICAgIHJldHVybiBbYXR0ZW1wdDFbMV0sIE51bWJlcihhdHRlbXB0MVsyXSldO1xuICAgIH1cblxuICAgIC8vIEFub255bW91cyBmdW5jdGlvbnM6IFwiYXQgZmlsZW5hbWU6bGluZU51bWJlcjpjb2x1bW5OdW1iZXJcIlxuICAgIHZhciBhdHRlbXB0MiA9IC9hdCAoW14gXSspOihcXGQrKTooPzpcXGQrKSQvLmV4ZWMoc3RhY2tMaW5lKTtcbiAgICBpZiAoYXR0ZW1wdDIpIHtcbiAgICAgICAgcmV0dXJuIFthdHRlbXB0MlsxXSwgTnVtYmVyKGF0dGVtcHQyWzJdKV07XG4gICAgfVxuXG4gICAgLy8gRmlyZWZveCBzdHlsZTogXCJmdW5jdGlvbkBmaWxlbmFtZTpsaW5lTnVtYmVyIG9yIEBmaWxlbmFtZTpsaW5lTnVtYmVyXCJcbiAgICB2YXIgYXR0ZW1wdDMgPSAvLipAKC4rKTooXFxkKykkLy5leGVjKHN0YWNrTGluZSk7XG4gICAgaWYgKGF0dGVtcHQzKSB7XG4gICAgICAgIHJldHVybiBbYXR0ZW1wdDNbMV0sIE51bWJlcihhdHRlbXB0M1syXSldO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNJbnRlcm5hbEZyYW1lKHN0YWNrTGluZSkge1xuICAgIHZhciBmaWxlTmFtZUFuZExpbmVOdW1iZXIgPSBnZXRGaWxlTmFtZUFuZExpbmVOdW1iZXIoc3RhY2tMaW5lKTtcblxuICAgIGlmICghZmlsZU5hbWVBbmRMaW5lTnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgZmlsZU5hbWUgPSBmaWxlTmFtZUFuZExpbmVOdW1iZXJbMF07XG4gICAgdmFyIGxpbmVOdW1iZXIgPSBmaWxlTmFtZUFuZExpbmVOdW1iZXJbMV07XG5cbiAgICByZXR1cm4gZmlsZU5hbWUgPT09IHFGaWxlTmFtZSAmJlxuICAgICAgICBsaW5lTnVtYmVyID49IHFTdGFydGluZ0xpbmUgJiZcbiAgICAgICAgbGluZU51bWJlciA8PSBxRW5kaW5nTGluZTtcbn1cblxuLy8gZGlzY292ZXIgb3duIGZpbGUgbmFtZSBhbmQgbGluZSBudW1iZXIgcmFuZ2UgZm9yIGZpbHRlcmluZyBzdGFja1xuLy8gdHJhY2VzXG5mdW5jdGlvbiBjYXB0dXJlTGluZSgpIHtcbiAgICBpZiAoIWhhc1N0YWNrcykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB2YXIgbGluZXMgPSBlLnN0YWNrLnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICB2YXIgZmlyc3RMaW5lID0gbGluZXNbMF0uaW5kZXhPZihcIkBcIikgPiAwID8gbGluZXNbMV0gOiBsaW5lc1syXTtcbiAgICAgICAgdmFyIGZpbGVOYW1lQW5kTGluZU51bWJlciA9IGdldEZpbGVOYW1lQW5kTGluZU51bWJlcihmaXJzdExpbmUpO1xuICAgICAgICBpZiAoIWZpbGVOYW1lQW5kTGluZU51bWJlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcUZpbGVOYW1lID0gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzBdO1xuICAgICAgICByZXR1cm4gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzFdO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZGVwcmVjYXRlKGNhbGxiYWNrLCBuYW1lLCBhbHRlcm5hdGl2ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICAgICAgICAgdHlwZW9mIGNvbnNvbGUud2FybiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4obmFtZSArIFwiIGlzIGRlcHJlY2F0ZWQsIHVzZSBcIiArIGFsdGVybmF0aXZlICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBcIiBpbnN0ZWFkLlwiLCBuZXcgRXJyb3IoXCJcIikuc3RhY2spO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseShjYWxsYmFjaywgYXJndW1lbnRzKTtcbiAgICB9O1xufVxuXG4vLyBlbmQgb2Ygc2hpbXNcbi8vIGJlZ2lubmluZyBvZiByZWFsIHdvcmtcblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgcHJvbWlzZSBmb3IgYW4gaW1tZWRpYXRlIHJlZmVyZW5jZSwgcGFzc2VzIHByb21pc2VzIHRocm91Z2gsIG9yXG4gKiBjb2VyY2VzIHByb21pc2VzIGZyb20gZGlmZmVyZW50IHN5c3RlbXMuXG4gKiBAcGFyYW0gdmFsdWUgaW1tZWRpYXRlIHJlZmVyZW5jZSBvciBwcm9taXNlXG4gKi9cbmZ1bmN0aW9uIFEodmFsdWUpIHtcbiAgICAvLyBJZiB0aGUgb2JqZWN0IGlzIGFscmVhZHkgYSBQcm9taXNlLCByZXR1cm4gaXQgZGlyZWN0bHkuICBUaGlzIGVuYWJsZXNcbiAgICAvLyB0aGUgcmVzb2x2ZSBmdW5jdGlvbiB0byBib3RoIGJlIHVzZWQgdG8gY3JlYXRlZCByZWZlcmVuY2VzIGZyb20gb2JqZWN0cyxcbiAgICAvLyBidXQgdG8gdG9sZXJhYmx5IGNvZXJjZSBub24tcHJvbWlzZXMgdG8gcHJvbWlzZXMuXG4gICAgaWYgKGlzUHJvbWlzZSh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIC8vIGFzc2ltaWxhdGUgdGhlbmFibGVzXG4gICAgaWYgKGlzUHJvbWlzZUFsaWtlKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gY29lcmNlKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZnVsZmlsbCh2YWx1ZSk7XG4gICAgfVxufVxuUS5yZXNvbHZlID0gUTtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIHRhc2sgaW4gYSBmdXR1cmUgdHVybiBvZiB0aGUgZXZlbnQgbG9vcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRhc2tcbiAqL1xuUS5uZXh0VGljayA9IG5leHRUaWNrO1xuXG4vKipcbiAqIENvbnRyb2xzIHdoZXRoZXIgb3Igbm90IGxvbmcgc3RhY2sgdHJhY2VzIHdpbGwgYmUgb25cbiAqL1xuUS5sb25nU3RhY2tTdXBwb3J0ID0gZmFsc2U7XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIHtwcm9taXNlLCByZXNvbHZlLCByZWplY3R9IG9iamVjdC5cbiAqXG4gKiBgcmVzb2x2ZWAgaXMgYSBjYWxsYmFjayB0byBpbnZva2Ugd2l0aCBhIG1vcmUgcmVzb2x2ZWQgdmFsdWUgZm9yIHRoZVxuICogcHJvbWlzZS4gVG8gZnVsZmlsbCB0aGUgcHJvbWlzZSwgaW52b2tlIGByZXNvbHZlYCB3aXRoIGFueSB2YWx1ZSB0aGF0IGlzXG4gKiBub3QgYSB0aGVuYWJsZS4gVG8gcmVqZWN0IHRoZSBwcm9taXNlLCBpbnZva2UgYHJlc29sdmVgIHdpdGggYSByZWplY3RlZFxuICogdGhlbmFibGUsIG9yIGludm9rZSBgcmVqZWN0YCB3aXRoIHRoZSByZWFzb24gZGlyZWN0bHkuIFRvIHJlc29sdmUgdGhlXG4gKiBwcm9taXNlIHRvIGFub3RoZXIgdGhlbmFibGUsIHRodXMgcHV0dGluZyBpdCBpbiB0aGUgc2FtZSBzdGF0ZSwgaW52b2tlXG4gKiBgcmVzb2x2ZWAgd2l0aCB0aGF0IG90aGVyIHRoZW5hYmxlLlxuICovXG5RLmRlZmVyID0gZGVmZXI7XG5mdW5jdGlvbiBkZWZlcigpIHtcbiAgICAvLyBpZiBcIm1lc3NhZ2VzXCIgaXMgYW4gXCJBcnJheVwiLCB0aGF0IGluZGljYXRlcyB0aGF0IHRoZSBwcm9taXNlIGhhcyBub3QgeWV0XG4gICAgLy8gYmVlbiByZXNvbHZlZC4gIElmIGl0IGlzIFwidW5kZWZpbmVkXCIsIGl0IGhhcyBiZWVuIHJlc29sdmVkLiAgRWFjaFxuICAgIC8vIGVsZW1lbnQgb2YgdGhlIG1lc3NhZ2VzIGFycmF5IGlzIGl0c2VsZiBhbiBhcnJheSBvZiBjb21wbGV0ZSBhcmd1bWVudHMgdG9cbiAgICAvLyBmb3J3YXJkIHRvIHRoZSByZXNvbHZlZCBwcm9taXNlLiAgV2UgY29lcmNlIHRoZSByZXNvbHV0aW9uIHZhbHVlIHRvIGFcbiAgICAvLyBwcm9taXNlIHVzaW5nIHRoZSBgcmVzb2x2ZWAgZnVuY3Rpb24gYmVjYXVzZSBpdCBoYW5kbGVzIGJvdGggZnVsbHlcbiAgICAvLyBub24tdGhlbmFibGUgdmFsdWVzIGFuZCBvdGhlciB0aGVuYWJsZXMgZ3JhY2VmdWxseS5cbiAgICB2YXIgbWVzc2FnZXMgPSBbXSwgcHJvZ3Jlc3NMaXN0ZW5lcnMgPSBbXSwgcmVzb2x2ZWRQcm9taXNlO1xuXG4gICAgdmFyIGRlZmVycmVkID0gb2JqZWN0X2NyZWF0ZShkZWZlci5wcm90b3R5cGUpO1xuICAgIHZhciBwcm9taXNlID0gb2JqZWN0X2NyZWF0ZShQcm9taXNlLnByb3RvdHlwZSk7XG5cbiAgICBwcm9taXNlLnByb21pc2VEaXNwYXRjaCA9IGZ1bmN0aW9uIChyZXNvbHZlLCBvcCwgb3BlcmFuZHMpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMpO1xuICAgICAgICBpZiAobWVzc2FnZXMpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goYXJncyk7XG4gICAgICAgICAgICBpZiAob3AgPT09IFwid2hlblwiICYmIG9wZXJhbmRzWzFdKSB7IC8vIHByb2dyZXNzIG9wZXJhbmRcbiAgICAgICAgICAgICAgICBwcm9ncmVzc0xpc3RlbmVycy5wdXNoKG9wZXJhbmRzWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlZFByb21pc2UucHJvbWlzZURpc3BhdGNoLmFwcGx5KHJlc29sdmVkUHJvbWlzZSwgYXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBYWFggZGVwcmVjYXRlZFxuICAgIHByb21pc2UudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbmVhcmVyVmFsdWUgPSBuZWFyZXIocmVzb2x2ZWRQcm9taXNlKTtcbiAgICAgICAgaWYgKGlzUHJvbWlzZShuZWFyZXJWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJlc29sdmVkUHJvbWlzZSA9IG5lYXJlclZhbHVlOyAvLyBzaG9ydGVuIGNoYWluXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5lYXJlclZhbHVlO1xuICAgIH07XG5cbiAgICBwcm9taXNlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghcmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdGF0ZTogXCJwZW5kaW5nXCIgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x2ZWRQcm9taXNlLmluc3BlY3QoKTtcbiAgICB9O1xuXG4gICAgaWYgKFEubG9uZ1N0YWNrU3VwcG9ydCAmJiBoYXNTdGFja3MpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBOT1RFOiBkb24ndCB0cnkgdG8gdXNlIGBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZWAgb3IgdHJhbnNmZXIgdGhlXG4gICAgICAgICAgICAvLyBhY2Nlc3NvciBhcm91bmQ7IHRoYXQgY2F1c2VzIG1lbW9yeSBsZWFrcyBhcyBwZXIgR0gtMTExLiBKdXN0XG4gICAgICAgICAgICAvLyByZWlmeSB0aGUgc3RhY2sgdHJhY2UgYXMgYSBzdHJpbmcgQVNBUC5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBBdCB0aGUgc2FtZSB0aW1lLCBjdXQgb2ZmIHRoZSBmaXJzdCBsaW5lOyBpdCdzIGFsd2F5cyBqdXN0XG4gICAgICAgICAgICAvLyBcIltvYmplY3QgUHJvbWlzZV1cXG5cIiwgYXMgcGVyIHRoZSBgdG9TdHJpbmdgLlxuICAgICAgICAgICAgcHJvbWlzZS5zdGFjayA9IGUuc3RhY2suc3Vic3RyaW5nKGUuc3RhY2suaW5kZXhPZihcIlxcblwiKSArIDEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gTk9URTogd2UgZG8gdGhlIGNoZWNrcyBmb3IgYHJlc29sdmVkUHJvbWlzZWAgaW4gZWFjaCBtZXRob2QsIGluc3RlYWQgb2ZcbiAgICAvLyBjb25zb2xpZGF0aW5nIHRoZW0gaW50byBgYmVjb21lYCwgc2luY2Ugb3RoZXJ3aXNlIHdlJ2QgY3JlYXRlIG5ld1xuICAgIC8vIHByb21pc2VzIHdpdGggdGhlIGxpbmVzIGBiZWNvbWUod2hhdGV2ZXIodmFsdWUpKWAuIFNlZSBlLmcuIEdILTI1Mi5cblxuICAgIGZ1bmN0aW9uIGJlY29tZShuZXdQcm9taXNlKSB7XG4gICAgICAgIHJlc29sdmVkUHJvbWlzZSA9IG5ld1Byb21pc2U7XG4gICAgICAgIHByb21pc2Uuc291cmNlID0gbmV3UHJvbWlzZTtcblxuICAgICAgICBhcnJheV9yZWR1Y2UobWVzc2FnZXMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIG5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBuZXdQcm9taXNlLnByb21pc2VEaXNwYXRjaC5hcHBseShuZXdQcm9taXNlLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB2b2lkIDApO1xuXG4gICAgICAgIG1lc3NhZ2VzID0gdm9pZCAwO1xuICAgICAgICBwcm9ncmVzc0xpc3RlbmVycyA9IHZvaWQgMDtcbiAgICB9XG5cbiAgICBkZWZlcnJlZC5wcm9taXNlID0gcHJvbWlzZTtcbiAgICBkZWZlcnJlZC5yZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmIChyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGJlY29tZShRKHZhbHVlKSk7XG4gICAgfTtcblxuICAgIGRlZmVycmVkLmZ1bGZpbGwgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVjb21lKGZ1bGZpbGwodmFsdWUpKTtcbiAgICB9O1xuICAgIGRlZmVycmVkLnJlamVjdCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVjb21lKHJlamVjdChyZWFzb24pKTtcbiAgICB9O1xuICAgIGRlZmVycmVkLm5vdGlmeSA9IGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICBpZiAocmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhcnJheV9yZWR1Y2UocHJvZ3Jlc3NMaXN0ZW5lcnMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHByb2dyZXNzTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIG5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBwcm9ncmVzc0xpc3RlbmVyKHByb2dyZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB2b2lkIDApO1xuICAgIH07XG5cbiAgICByZXR1cm4gZGVmZXJyZWQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIE5vZGUtc3R5bGUgY2FsbGJhY2sgdGhhdCB3aWxsIHJlc29sdmUgb3IgcmVqZWN0IHRoZSBkZWZlcnJlZFxuICogcHJvbWlzZS5cbiAqIEByZXR1cm5zIGEgbm9kZWJhY2tcbiAqL1xuZGVmZXIucHJvdG90eXBlLm1ha2VOb2RlUmVzb2x2ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXJyb3IsIHZhbHVlKSB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgc2VsZi5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICBzZWxmLnJlc29sdmUoYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLnJlc29sdmUodmFsdWUpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHJlc29sdmVyIHtGdW5jdGlvbn0gYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgbm90aGluZyBhbmQgYWNjZXB0c1xuICogdGhlIHJlc29sdmUsIHJlamVjdCwgYW5kIG5vdGlmeSBmdW5jdGlvbnMgZm9yIGEgZGVmZXJyZWQuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgdGhhdCBtYXkgYmUgcmVzb2x2ZWQgd2l0aCB0aGUgZ2l2ZW4gcmVzb2x2ZSBhbmQgcmVqZWN0XG4gKiBmdW5jdGlvbnMsIG9yIHJlamVjdGVkIGJ5IGEgdGhyb3duIGV4Y2VwdGlvbiBpbiByZXNvbHZlclxuICovXG5RLlByb21pc2UgPSBwcm9taXNlOyAvLyBFUzZcblEucHJvbWlzZSA9IHByb21pc2U7XG5mdW5jdGlvbiBwcm9taXNlKHJlc29sdmVyKSB7XG4gICAgaWYgKHR5cGVvZiByZXNvbHZlciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJyZXNvbHZlciBtdXN0IGJlIGEgZnVuY3Rpb24uXCIpO1xuICAgIH1cbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIHRyeSB7XG4gICAgICAgIHJlc29sdmVyKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCwgZGVmZXJyZWQubm90aWZ5KTtcbiAgICB9IGNhdGNoIChyZWFzb24pIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHJlYXNvbik7XG4gICAgfVxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuXG5wcm9taXNlLnJhY2UgPSByYWNlOyAvLyBFUzZcbnByb21pc2UuYWxsID0gYWxsOyAvLyBFUzZcbnByb21pc2UucmVqZWN0ID0gcmVqZWN0OyAvLyBFUzZcbnByb21pc2UucmVzb2x2ZSA9IFE7IC8vIEVTNlxuXG4vLyBYWFggZXhwZXJpbWVudGFsLiAgVGhpcyBtZXRob2QgaXMgYSB3YXkgdG8gZGVub3RlIHRoYXQgYSBsb2NhbCB2YWx1ZSBpc1xuLy8gc2VyaWFsaXphYmxlIGFuZCBzaG91bGQgYmUgaW1tZWRpYXRlbHkgZGlzcGF0Y2hlZCB0byBhIHJlbW90ZSB1cG9uIHJlcXVlc3QsXG4vLyBpbnN0ZWFkIG9mIHBhc3NpbmcgYSByZWZlcmVuY2UuXG5RLnBhc3NCeUNvcHkgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgLy9mcmVlemUob2JqZWN0KTtcbiAgICAvL3Bhc3NCeUNvcGllcy5zZXQob2JqZWN0LCB0cnVlKTtcbiAgICByZXR1cm4gb2JqZWN0O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUucGFzc0J5Q29weSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL2ZyZWV6ZShvYmplY3QpO1xuICAgIC8vcGFzc0J5Q29waWVzLnNldChvYmplY3QsIHRydWUpO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJZiB0d28gcHJvbWlzZXMgZXZlbnR1YWxseSBmdWxmaWxsIHRvIHRoZSBzYW1lIHZhbHVlLCBwcm9taXNlcyB0aGF0IHZhbHVlLFxuICogYnV0IG90aGVyd2lzZSByZWplY3RzLlxuICogQHBhcmFtIHgge0FueSp9XG4gKiBAcGFyYW0geSB7QW55Kn1cbiAqIEByZXR1cm5zIHtBbnkqfSBhIHByb21pc2UgZm9yIHggYW5kIHkgaWYgdGhleSBhcmUgdGhlIHNhbWUsIGJ1dCBhIHJlamVjdGlvblxuICogb3RoZXJ3aXNlLlxuICpcbiAqL1xuUS5qb2luID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICByZXR1cm4gUSh4KS5qb2luKHkpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuam9pbiA9IGZ1bmN0aW9uICh0aGF0KSB7XG4gICAgcmV0dXJuIFEoW3RoaXMsIHRoYXRdKS5zcHJlYWQoZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgaWYgKHggPT09IHkpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IFwiPT09XCIgc2hvdWxkIGJlIE9iamVjdC5pcyBvciBlcXVpdlxuICAgICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBqb2luOiBub3QgdGhlIHNhbWU6IFwiICsgeCArIFwiIFwiICsgeSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSBmaXJzdCBvZiBhbiBhcnJheSBvZiBwcm9taXNlcyB0byBiZWNvbWUgZnVsZmlsbGVkLlxuICogQHBhcmFtIGFuc3dlcnMge0FycmF5W0FueSpdfSBwcm9taXNlcyB0byByYWNlXG4gKiBAcmV0dXJucyB7QW55Kn0gdGhlIGZpcnN0IHByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cblEucmFjZSA9IHJhY2U7XG5mdW5jdGlvbiByYWNlKGFuc3dlclBzKSB7XG4gICAgcmV0dXJuIHByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIC8vIFN3aXRjaCB0byB0aGlzIG9uY2Ugd2UgY2FuIGFzc3VtZSBhdCBsZWFzdCBFUzVcbiAgICAgICAgLy8gYW5zd2VyUHMuZm9yRWFjaChmdW5jdGlvbihhbnN3ZXJQKSB7XG4gICAgICAgIC8vICAgICBRKGFuc3dlclApLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIC8vIFVzZSB0aGlzIGluIHRoZSBtZWFudGltZVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYW5zd2VyUHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIFEoYW5zd2VyUHNbaV0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5yYWNlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4oUS5yYWNlKTtcbn07XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIFByb21pc2Ugd2l0aCBhIHByb21pc2UgZGVzY3JpcHRvciBvYmplY3QgYW5kIG9wdGlvbmFsIGZhbGxiYWNrXG4gKiBmdW5jdGlvbi4gIFRoZSBkZXNjcmlwdG9yIGNvbnRhaW5zIG1ldGhvZHMgbGlrZSB3aGVuKHJlamVjdGVkKSwgZ2V0KG5hbWUpLFxuICogc2V0KG5hbWUsIHZhbHVlKSwgcG9zdChuYW1lLCBhcmdzKSwgYW5kIGRlbGV0ZShuYW1lKSwgd2hpY2ggYWxsXG4gKiByZXR1cm4gZWl0aGVyIGEgdmFsdWUsIGEgcHJvbWlzZSBmb3IgYSB2YWx1ZSwgb3IgYSByZWplY3Rpb24uICBUaGUgZmFsbGJhY2tcbiAqIGFjY2VwdHMgdGhlIG9wZXJhdGlvbiBuYW1lLCBhIHJlc29sdmVyLCBhbmQgYW55IGZ1cnRoZXIgYXJndW1lbnRzIHRoYXQgd291bGRcbiAqIGhhdmUgYmVlbiBmb3J3YXJkZWQgdG8gdGhlIGFwcHJvcHJpYXRlIG1ldGhvZCBhYm92ZSBoYWQgYSBtZXRob2QgYmVlblxuICogcHJvdmlkZWQgd2l0aCB0aGUgcHJvcGVyIG5hbWUuICBUaGUgQVBJIG1ha2VzIG5vIGd1YXJhbnRlZXMgYWJvdXQgdGhlIG5hdHVyZVxuICogb2YgdGhlIHJldHVybmVkIG9iamVjdCwgYXBhcnQgZnJvbSB0aGF0IGl0IGlzIHVzYWJsZSB3aGVyZWV2ZXIgcHJvbWlzZXMgYXJlXG4gKiBib3VnaHQgYW5kIHNvbGQuXG4gKi9cblEubWFrZVByb21pc2UgPSBQcm9taXNlO1xuZnVuY3Rpb24gUHJvbWlzZShkZXNjcmlwdG9yLCBmYWxsYmFjaywgaW5zcGVjdCkge1xuICAgIGlmIChmYWxsYmFjayA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGZhbGxiYWNrID0gZnVuY3Rpb24gKG9wKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBcIlByb21pc2UgZG9lcyBub3Qgc3VwcG9ydCBvcGVyYXRpb246IFwiICsgb3BcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAoaW5zcGVjdCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge3N0YXRlOiBcInVua25vd25cIn07XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIHByb21pc2UgPSBvYmplY3RfY3JlYXRlKFByb21pc2UucHJvdG90eXBlKTtcblxuICAgIHByb21pc2UucHJvbWlzZURpc3BhdGNoID0gZnVuY3Rpb24gKHJlc29sdmUsIG9wLCBhcmdzKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoZGVzY3JpcHRvcltvcF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBkZXNjcmlwdG9yW29wXS5hcHBseShwcm9taXNlLCBhcmdzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsbGJhY2suY2FsbChwcm9taXNlLCBvcCwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlc29sdmUpIHtcbiAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcm9taXNlLmluc3BlY3QgPSBpbnNwZWN0O1xuXG4gICAgLy8gWFhYIGRlcHJlY2F0ZWQgYHZhbHVlT2ZgIGFuZCBgZXhjZXB0aW9uYCBzdXBwb3J0XG4gICAgaWYgKGluc3BlY3QpIHtcbiAgICAgICAgdmFyIGluc3BlY3RlZCA9IGluc3BlY3QoKTtcbiAgICAgICAgaWYgKGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiKSB7XG4gICAgICAgICAgICBwcm9taXNlLmV4Y2VwdGlvbiA9IGluc3BlY3RlZC5yZWFzb247XG4gICAgICAgIH1cblxuICAgICAgICBwcm9taXNlLnZhbHVlT2YgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaW5zcGVjdGVkID0gaW5zcGVjdCgpO1xuICAgICAgICAgICAgaWYgKGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJwZW5kaW5nXCIgfHxcbiAgICAgICAgICAgICAgICBpbnNwZWN0ZWQuc3RhdGUgPT09IFwicmVqZWN0ZWRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGluc3BlY3RlZC52YWx1ZTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBQcm9taXNlXVwiO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzc2VkKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdmFyIGRvbmUgPSBmYWxzZTsgICAvLyBlbnN1cmUgdGhlIHVudHJ1c3RlZCBwcm9taXNlIG1ha2VzIGF0IG1vc3QgYVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luZ2xlIGNhbGwgdG8gb25lIG9mIHRoZSBjYWxsYmFja3NcblxuICAgIGZ1bmN0aW9uIF9mdWxmaWxsZWQodmFsdWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgZnVsZmlsbGVkID09PSBcImZ1bmN0aW9uXCIgPyBmdWxmaWxsZWQodmFsdWUpIDogdmFsdWU7XG4gICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChleGNlcHRpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JlamVjdGVkKGV4Y2VwdGlvbikge1xuICAgICAgICBpZiAodHlwZW9mIHJlamVjdGVkID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIG1ha2VTdGFja1RyYWNlTG9uZyhleGNlcHRpb24sIHNlbGYpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0ZWQoZXhjZXB0aW9uKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKG5ld0V4Y2VwdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3RXhjZXB0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3Byb2dyZXNzZWQodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBwcm9ncmVzc2VkID09PSBcImZ1bmN0aW9uXCIgPyBwcm9ncmVzc2VkKHZhbHVlKSA6IHZhbHVlO1xuICAgIH1cblxuICAgIG5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5wcm9taXNlRGlzcGF0Y2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKF9mdWxmaWxsZWQodmFsdWUpKTtcbiAgICAgICAgfSwgXCJ3aGVuXCIsIFtmdW5jdGlvbiAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKF9yZWplY3RlZChleGNlcHRpb24pKTtcbiAgICAgICAgfV0pO1xuICAgIH0pO1xuXG4gICAgLy8gUHJvZ3Jlc3MgcHJvcGFnYXRvciBuZWVkIHRvIGJlIGF0dGFjaGVkIGluIHRoZSBjdXJyZW50IHRpY2suXG4gICAgc2VsZi5wcm9taXNlRGlzcGF0Y2godm9pZCAwLCBcIndoZW5cIiwgW3ZvaWQgMCwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBuZXdWYWx1ZTtcbiAgICAgICAgdmFyIHRocmV3ID0gZmFsc2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBuZXdWYWx1ZSA9IF9wcm9ncmVzc2VkKHZhbHVlKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyZXcgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKFEub25lcnJvcikge1xuICAgICAgICAgICAgICAgIFEub25lcnJvcihlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhyZXcpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLm5vdGlmeShuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXJzIGFuIG9ic2VydmVyIG9uIGEgcHJvbWlzZS5cbiAqXG4gKiBHdWFyYW50ZWVzOlxuICpcbiAqIDEuIHRoYXQgZnVsZmlsbGVkIGFuZCByZWplY3RlZCB3aWxsIGJlIGNhbGxlZCBvbmx5IG9uY2UuXG4gKiAyLiB0aGF0IGVpdGhlciB0aGUgZnVsZmlsbGVkIGNhbGxiYWNrIG9yIHRoZSByZWplY3RlZCBjYWxsYmFjayB3aWxsIGJlXG4gKiAgICBjYWxsZWQsIGJ1dCBub3QgYm90aC5cbiAqIDMuIHRoYXQgZnVsZmlsbGVkIGFuZCByZWplY3RlZCB3aWxsIG5vdCBiZSBjYWxsZWQgaW4gdGhpcyB0dXJuLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSAgICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSB0byBvYnNlcnZlXG4gKiBAcGFyYW0gZnVsZmlsbGVkICBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2l0aCB0aGUgZnVsZmlsbGVkIHZhbHVlXG4gKiBAcGFyYW0gcmVqZWN0ZWQgICBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2l0aCB0aGUgcmVqZWN0aW9uIGV4Y2VwdGlvblxuICogQHBhcmFtIHByb2dyZXNzZWQgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG9uIGFueSBwcm9ncmVzcyBub3RpZmljYXRpb25zXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWUgZnJvbSB0aGUgaW52b2tlZCBjYWxsYmFja1xuICovXG5RLndoZW4gPSB3aGVuO1xuZnVuY3Rpb24gd2hlbih2YWx1ZSwgZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3NlZCkge1xuICAgIHJldHVybiBRKHZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzZWQpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuUmVzb2x2ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKCkgeyByZXR1cm4gdmFsdWU7IH0pO1xufTtcblxuUS50aGVuUmVzb2x2ZSA9IGZ1bmN0aW9uIChwcm9taXNlLCB2YWx1ZSkge1xuICAgIHJldHVybiBRKHByb21pc2UpLnRoZW5SZXNvbHZlKHZhbHVlKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnRoZW5SZWplY3QgPSBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAoKSB7IHRocm93IHJlYXNvbjsgfSk7XG59O1xuXG5RLnRoZW5SZWplY3QgPSBmdW5jdGlvbiAocHJvbWlzZSwgcmVhc29uKSB7XG4gICAgcmV0dXJuIFEocHJvbWlzZSkudGhlblJlamVjdChyZWFzb24pO1xufTtcblxuLyoqXG4gKiBJZiBhbiBvYmplY3QgaXMgbm90IGEgcHJvbWlzZSwgaXQgaXMgYXMgXCJuZWFyXCIgYXMgcG9zc2libGUuXG4gKiBJZiBhIHByb21pc2UgaXMgcmVqZWN0ZWQsIGl0IGlzIGFzIFwibmVhclwiIGFzIHBvc3NpYmxlIHRvby5cbiAqIElmIGl04oCZcyBhIGZ1bGZpbGxlZCBwcm9taXNlLCB0aGUgZnVsZmlsbG1lbnQgdmFsdWUgaXMgbmVhcmVyLlxuICogSWYgaXTigJlzIGEgZGVmZXJyZWQgcHJvbWlzZSBhbmQgdGhlIGRlZmVycmVkIGhhcyBiZWVuIHJlc29sdmVkLCB0aGVcbiAqIHJlc29sdXRpb24gaXMgXCJuZWFyZXJcIi5cbiAqIEBwYXJhbSBvYmplY3RcbiAqIEByZXR1cm5zIG1vc3QgcmVzb2x2ZWQgKG5lYXJlc3QpIGZvcm0gb2YgdGhlIG9iamVjdFxuICovXG5cbi8vIFhYWCBzaG91bGQgd2UgcmUtZG8gdGhpcz9cblEubmVhcmVyID0gbmVhcmVyO1xuZnVuY3Rpb24gbmVhcmVyKHZhbHVlKSB7XG4gICAgaWYgKGlzUHJvbWlzZSh2YWx1ZSkpIHtcbiAgICAgICAgdmFyIGluc3BlY3RlZCA9IHZhbHVlLmluc3BlY3QoKTtcbiAgICAgICAgaWYgKGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJmdWxmaWxsZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuIGluc3BlY3RlZC52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbi8qKlxuICogQHJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGEgcHJvbWlzZS5cbiAqIE90aGVyd2lzZSBpdCBpcyBhIGZ1bGZpbGxlZCB2YWx1ZS5cbiAqL1xuUS5pc1Byb21pc2UgPSBpc1Byb21pc2U7XG5mdW5jdGlvbiBpc1Byb21pc2Uob2JqZWN0KSB7XG4gICAgcmV0dXJuIGlzT2JqZWN0KG9iamVjdCkgJiZcbiAgICAgICAgdHlwZW9mIG9iamVjdC5wcm9taXNlRGlzcGF0Y2ggPT09IFwiZnVuY3Rpb25cIiAmJlxuICAgICAgICB0eXBlb2Ygb2JqZWN0Lmluc3BlY3QgPT09IFwiZnVuY3Rpb25cIjtcbn1cblxuUS5pc1Byb21pc2VBbGlrZSA9IGlzUHJvbWlzZUFsaWtlO1xuZnVuY3Rpb24gaXNQcm9taXNlQWxpa2Uob2JqZWN0KSB7XG4gICAgcmV0dXJuIGlzT2JqZWN0KG9iamVjdCkgJiYgdHlwZW9mIG9iamVjdC50aGVuID09PSBcImZ1bmN0aW9uXCI7XG59XG5cbi8qKlxuICogQHJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGEgcGVuZGluZyBwcm9taXNlLCBtZWFuaW5nIG5vdFxuICogZnVsZmlsbGVkIG9yIHJlamVjdGVkLlxuICovXG5RLmlzUGVuZGluZyA9IGlzUGVuZGluZztcbmZ1bmN0aW9uIGlzUGVuZGluZyhvYmplY3QpIHtcbiAgICByZXR1cm4gaXNQcm9taXNlKG9iamVjdCkgJiYgb2JqZWN0Lmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJwZW5kaW5nXCI7XG59XG5cblByb21pc2UucHJvdG90eXBlLmlzUGVuZGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnNwZWN0KCkuc3RhdGUgPT09IFwicGVuZGluZ1wiO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSB2YWx1ZSBvciBmdWxmaWxsZWRcbiAqIHByb21pc2UuXG4gKi9cblEuaXNGdWxmaWxsZWQgPSBpc0Z1bGZpbGxlZDtcbmZ1bmN0aW9uIGlzRnVsZmlsbGVkKG9iamVjdCkge1xuICAgIHJldHVybiAhaXNQcm9taXNlKG9iamVjdCkgfHwgb2JqZWN0Lmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJmdWxmaWxsZWRcIjtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuaXNGdWxmaWxsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zcGVjdCgpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSByZWplY3RlZCBwcm9taXNlLlxuICovXG5RLmlzUmVqZWN0ZWQgPSBpc1JlamVjdGVkO1xuZnVuY3Rpb24gaXNSZWplY3RlZChvYmplY3QpIHtcbiAgICByZXR1cm4gaXNQcm9taXNlKG9iamVjdCkgJiYgb2JqZWN0Lmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5pc1JlamVjdGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiO1xufTtcblxuLy8vLyBCRUdJTiBVTkhBTkRMRUQgUkVKRUNUSU9OIFRSQUNLSU5HXG5cbi8vIFRoaXMgcHJvbWlzZSBsaWJyYXJ5IGNvbnN1bWVzIGV4Y2VwdGlvbnMgdGhyb3duIGluIGhhbmRsZXJzIHNvIHRoZXkgY2FuIGJlXG4vLyBoYW5kbGVkIGJ5IGEgc3Vic2VxdWVudCBwcm9taXNlLiAgVGhlIGV4Y2VwdGlvbnMgZ2V0IGFkZGVkIHRvIHRoaXMgYXJyYXkgd2hlblxuLy8gdGhleSBhcmUgY3JlYXRlZCwgYW5kIHJlbW92ZWQgd2hlbiB0aGV5IGFyZSBoYW5kbGVkLiAgTm90ZSB0aGF0IGluIEVTNiBvclxuLy8gc2hpbW1lZCBlbnZpcm9ubWVudHMsIHRoaXMgd291bGQgbmF0dXJhbGx5IGJlIGEgYFNldGAuXG52YXIgdW5oYW5kbGVkUmVhc29ucyA9IFtdO1xudmFyIHVuaGFuZGxlZFJlamVjdGlvbnMgPSBbXTtcbnZhciB0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMgPSB0cnVlO1xuXG5mdW5jdGlvbiByZXNldFVuaGFuZGxlZFJlamVjdGlvbnMoKSB7XG4gICAgdW5oYW5kbGVkUmVhc29ucy5sZW5ndGggPSAwO1xuICAgIHVuaGFuZGxlZFJlamVjdGlvbnMubGVuZ3RoID0gMDtcblxuICAgIGlmICghdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zKSB7XG4gICAgICAgIHRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucyA9IHRydWU7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB0cmFja1JlamVjdGlvbihwcm9taXNlLCByZWFzb24pIHtcbiAgICBpZiAoIXRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5wdXNoKHByb21pc2UpO1xuICAgIGlmIChyZWFzb24gJiYgdHlwZW9mIHJlYXNvbi5zdGFjayAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnB1c2gocmVhc29uLnN0YWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnB1c2goXCIobm8gc3RhY2spIFwiICsgcmVhc29uKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHVudHJhY2tSZWplY3Rpb24ocHJvbWlzZSkge1xuICAgIGlmICghdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYXQgPSBhcnJheV9pbmRleE9mKHVuaGFuZGxlZFJlamVjdGlvbnMsIHByb21pc2UpO1xuICAgIGlmIChhdCAhPT0gLTEpIHtcbiAgICAgICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5zcGxpY2UoYXQsIDEpO1xuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnNwbGljZShhdCwgMSk7XG4gICAgfVxufVxuXG5RLnJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucyA9IHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucztcblxuUS5nZXRVbmhhbmRsZWRSZWFzb25zID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIE1ha2UgYSBjb3B5IHNvIHRoYXQgY29uc3VtZXJzIGNhbid0IGludGVyZmVyZSB3aXRoIG91ciBpbnRlcm5hbCBzdGF0ZS5cbiAgICByZXR1cm4gdW5oYW5kbGVkUmVhc29ucy5zbGljZSgpO1xufTtcblxuUS5zdG9wVW5oYW5kbGVkUmVqZWN0aW9uVHJhY2tpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zKCk7XG4gICAgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gZmFsc2U7XG59O1xuXG5yZXNldFVuaGFuZGxlZFJlamVjdGlvbnMoKTtcblxuLy8vLyBFTkQgVU5IQU5ETEVEIFJFSkVDVElPTiBUUkFDS0lOR1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSByZWplY3RlZCBwcm9taXNlLlxuICogQHBhcmFtIHJlYXNvbiB2YWx1ZSBkZXNjcmliaW5nIHRoZSBmYWlsdXJlXG4gKi9cblEucmVqZWN0ID0gcmVqZWN0O1xuZnVuY3Rpb24gcmVqZWN0KHJlYXNvbikge1xuICAgIHZhciByZWplY3Rpb24gPSBQcm9taXNlKHtcbiAgICAgICAgXCJ3aGVuXCI6IGZ1bmN0aW9uIChyZWplY3RlZCkge1xuICAgICAgICAgICAgLy8gbm90ZSB0aGF0IHRoZSBlcnJvciBoYXMgYmVlbiBoYW5kbGVkXG4gICAgICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB1bnRyYWNrUmVqZWN0aW9uKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdGVkID8gcmVqZWN0ZWQocmVhc29uKSA6IHRoaXM7XG4gICAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiBmYWxsYmFjaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSwgZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwicmVqZWN0ZWRcIiwgcmVhc29uOiByZWFzb24gfTtcbiAgICB9KTtcblxuICAgIC8vIE5vdGUgdGhhdCB0aGUgcmVhc29uIGhhcyBub3QgYmVlbiBoYW5kbGVkLlxuICAgIHRyYWNrUmVqZWN0aW9uKHJlamVjdGlvbiwgcmVhc29uKTtcblxuICAgIHJldHVybiByZWplY3Rpb247XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGZ1bGZpbGxlZCBwcm9taXNlIGZvciBhbiBpbW1lZGlhdGUgcmVmZXJlbmNlLlxuICogQHBhcmFtIHZhbHVlIGltbWVkaWF0ZSByZWZlcmVuY2VcbiAqL1xuUS5mdWxmaWxsID0gZnVsZmlsbDtcbmZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHtcbiAgICByZXR1cm4gUHJvbWlzZSh7XG4gICAgICAgIFwid2hlblwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVbbmFtZV07XG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uIChuYW1lLCByaHMpIHtcbiAgICAgICAgICAgIHZhbHVlW25hbWVdID0gcmhzO1xuICAgICAgICB9LFxuICAgICAgICBcImRlbGV0ZVwiOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlW25hbWVdO1xuICAgICAgICB9LFxuICAgICAgICBcInBvc3RcIjogZnVuY3Rpb24gKG5hbWUsIGFyZ3MpIHtcbiAgICAgICAgICAgIC8vIE1hcmsgTWlsbGVyIHByb3Bvc2VzIHRoYXQgcG9zdCB3aXRoIG5vIG5hbWUgc2hvdWxkIGFwcGx5IGFcbiAgICAgICAgICAgIC8vIHByb21pc2VkIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKG5hbWUgPT09IG51bGwgfHwgbmFtZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmFwcGx5KHZvaWQgMCwgYXJncyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZVtuYW1lXS5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiYXBwbHlcIjogZnVuY3Rpb24gKHRoaXNwLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuYXBwbHkodGhpc3AsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBcImtleXNcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG9iamVjdF9rZXlzKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0sIHZvaWQgMCwgZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwiZnVsZmlsbGVkXCIsIHZhbHVlOiB2YWx1ZSB9O1xuICAgIH0pO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIHRoZW5hYmxlcyB0byBRIHByb21pc2VzLlxuICogQHBhcmFtIHByb21pc2UgdGhlbmFibGUgcHJvbWlzZVxuICogQHJldHVybnMgYSBRIHByb21pc2VcbiAqL1xuZnVuY3Rpb24gY29lcmNlKHByb21pc2UpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHByb21pc2UudGhlbihkZWZlcnJlZC5yZXNvbHZlLCBkZWZlcnJlZC5yZWplY3QsIGRlZmVycmVkLm5vdGlmeSk7XG4gICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuLyoqXG4gKiBBbm5vdGF0ZXMgYW4gb2JqZWN0IHN1Y2ggdGhhdCBpdCB3aWxsIG5ldmVyIGJlXG4gKiB0cmFuc2ZlcnJlZCBhd2F5IGZyb20gdGhpcyBwcm9jZXNzIG92ZXIgYW55IHByb21pc2VcbiAqIGNvbW11bmljYXRpb24gY2hhbm5lbC5cbiAqIEBwYXJhbSBvYmplY3RcbiAqIEByZXR1cm5zIHByb21pc2UgYSB3cmFwcGluZyBvZiB0aGF0IG9iamVjdCB0aGF0XG4gKiBhZGRpdGlvbmFsbHkgcmVzcG9uZHMgdG8gdGhlIFwiaXNEZWZcIiBtZXNzYWdlXG4gKiB3aXRob3V0IGEgcmVqZWN0aW9uLlxuICovXG5RLm1hc3RlciA9IG1hc3RlcjtcbmZ1bmN0aW9uIG1hc3RlcihvYmplY3QpIHtcbiAgICByZXR1cm4gUHJvbWlzZSh7XG4gICAgICAgIFwiaXNEZWZcIjogZnVuY3Rpb24gKCkge31cbiAgICB9LCBmdW5jdGlvbiBmYWxsYmFjayhvcCwgYXJncykge1xuICAgICAgICByZXR1cm4gZGlzcGF0Y2gob2JqZWN0LCBvcCwgYXJncyk7XG4gICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gUShvYmplY3QpLmluc3BlY3QoKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBTcHJlYWRzIHRoZSB2YWx1ZXMgb2YgYSBwcm9taXNlZCBhcnJheSBvZiBhcmd1bWVudHMgaW50byB0aGVcbiAqIGZ1bGZpbGxtZW50IGNhbGxiYWNrLlxuICogQHBhcmFtIGZ1bGZpbGxlZCBjYWxsYmFjayB0aGF0IHJlY2VpdmVzIHZhcmlhZGljIGFyZ3VtZW50cyBmcm9tIHRoZVxuICogcHJvbWlzZWQgYXJyYXlcbiAqIEBwYXJhbSByZWplY3RlZCBjYWxsYmFjayB0aGF0IHJlY2VpdmVzIHRoZSBleGNlcHRpb24gaWYgdGhlIHByb21pc2VcbiAqIGlzIHJlamVjdGVkLlxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlIG9yIHRocm93biBleGNlcHRpb24gb2ZcbiAqIGVpdGhlciBjYWxsYmFjay5cbiAqL1xuUS5zcHJlYWQgPSBzcHJlYWQ7XG5mdW5jdGlvbiBzcHJlYWQodmFsdWUsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gUSh2YWx1ZSkuc3ByZWFkKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5zcHJlYWQgPSBmdW5jdGlvbiAoZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICAgIHJldHVybiB0aGlzLmFsbCgpLnRoZW4oZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgICAgIHJldHVybiBmdWxmaWxsZWQuYXBwbHkodm9pZCAwLCBhcnJheSk7XG4gICAgfSwgcmVqZWN0ZWQpO1xufTtcblxuLyoqXG4gKiBUaGUgYXN5bmMgZnVuY3Rpb24gaXMgYSBkZWNvcmF0b3IgZm9yIGdlbmVyYXRvciBmdW5jdGlvbnMsIHR1cm5pbmdcbiAqIHRoZW0gaW50byBhc3luY2hyb25vdXMgZ2VuZXJhdG9ycy4gIEFsdGhvdWdoIGdlbmVyYXRvcnMgYXJlIG9ubHkgcGFydFxuICogb2YgdGhlIG5ld2VzdCBFQ01BU2NyaXB0IDYgZHJhZnRzLCB0aGlzIGNvZGUgZG9lcyBub3QgY2F1c2Ugc3ludGF4XG4gKiBlcnJvcnMgaW4gb2xkZXIgZW5naW5lcy4gIFRoaXMgY29kZSBzaG91bGQgY29udGludWUgdG8gd29yayBhbmQgd2lsbFxuICogaW4gZmFjdCBpbXByb3ZlIG92ZXIgdGltZSBhcyB0aGUgbGFuZ3VhZ2UgaW1wcm92ZXMuXG4gKlxuICogRVM2IGdlbmVyYXRvcnMgYXJlIGN1cnJlbnRseSBwYXJ0IG9mIFY4IHZlcnNpb24gMy4xOSB3aXRoIHRoZVxuICogLS1oYXJtb255LWdlbmVyYXRvcnMgcnVudGltZSBmbGFnIGVuYWJsZWQuICBTcGlkZXJNb25rZXkgaGFzIGhhZCB0aGVtXG4gKiBmb3IgbG9uZ2VyLCBidXQgdW5kZXIgYW4gb2xkZXIgUHl0aG9uLWluc3BpcmVkIGZvcm0uICBUaGlzIGZ1bmN0aW9uXG4gKiB3b3JrcyBvbiBib3RoIGtpbmRzIG9mIGdlbmVyYXRvcnMuXG4gKlxuICogRGVjb3JhdGVzIGEgZ2VuZXJhdG9yIGZ1bmN0aW9uIHN1Y2ggdGhhdDpcbiAqICAtIGl0IG1heSB5aWVsZCBwcm9taXNlc1xuICogIC0gZXhlY3V0aW9uIHdpbGwgY29udGludWUgd2hlbiB0aGF0IHByb21pc2UgaXMgZnVsZmlsbGVkXG4gKiAgLSB0aGUgdmFsdWUgb2YgdGhlIHlpZWxkIGV4cHJlc3Npb24gd2lsbCBiZSB0aGUgZnVsZmlsbGVkIHZhbHVlXG4gKiAgLSBpdCByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZSAod2hlbiB0aGUgZ2VuZXJhdG9yXG4gKiAgICBzdG9wcyBpdGVyYXRpbmcpXG4gKiAgLSB0aGUgZGVjb3JhdGVkIGZ1bmN0aW9uIHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXG4gKiAgICBvZiB0aGUgZ2VuZXJhdG9yIG9yIHRoZSBmaXJzdCByZWplY3RlZCBwcm9taXNlIGFtb25nIHRob3NlXG4gKiAgICB5aWVsZGVkLlxuICogIC0gaWYgYW4gZXJyb3IgaXMgdGhyb3duIGluIHRoZSBnZW5lcmF0b3IsIGl0IHByb3BhZ2F0ZXMgdGhyb3VnaFxuICogICAgZXZlcnkgZm9sbG93aW5nIHlpZWxkIHVudGlsIGl0IGlzIGNhdWdodCwgb3IgdW50aWwgaXQgZXNjYXBlc1xuICogICAgdGhlIGdlbmVyYXRvciBmdW5jdGlvbiBhbHRvZ2V0aGVyLCBhbmQgaXMgdHJhbnNsYXRlZCBpbnRvIGFcbiAqICAgIHJlamVjdGlvbiBmb3IgdGhlIHByb21pc2UgcmV0dXJuZWQgYnkgdGhlIGRlY29yYXRlZCBnZW5lcmF0b3IuXG4gKi9cblEuYXN5bmMgPSBhc3luYztcbmZ1bmN0aW9uIGFzeW5jKG1ha2VHZW5lcmF0b3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyB3aGVuIHZlcmIgaXMgXCJzZW5kXCIsIGFyZyBpcyBhIHZhbHVlXG4gICAgICAgIC8vIHdoZW4gdmVyYiBpcyBcInRocm93XCIsIGFyZyBpcyBhbiBleGNlcHRpb25cbiAgICAgICAgZnVuY3Rpb24gY29udGludWVyKHZlcmIsIGFyZykge1xuICAgICAgICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgICAgICAgLy8gVW50aWwgVjggMy4xOSAvIENocm9taXVtIDI5IGlzIHJlbGVhc2VkLCBTcGlkZXJNb25rZXkgaXMgdGhlIG9ubHlcbiAgICAgICAgICAgIC8vIGVuZ2luZSB0aGF0IGhhcyBhIGRlcGxveWVkIGJhc2Ugb2YgYnJvd3NlcnMgdGhhdCBzdXBwb3J0IGdlbmVyYXRvcnMuXG4gICAgICAgICAgICAvLyBIb3dldmVyLCBTTSdzIGdlbmVyYXRvcnMgdXNlIHRoZSBQeXRob24taW5zcGlyZWQgc2VtYW50aWNzIG9mXG4gICAgICAgICAgICAvLyBvdXRkYXRlZCBFUzYgZHJhZnRzLiAgV2Ugd291bGQgbGlrZSB0byBzdXBwb3J0IEVTNiwgYnV0IHdlJ2QgYWxzb1xuICAgICAgICAgICAgLy8gbGlrZSB0byBtYWtlIGl0IHBvc3NpYmxlIHRvIHVzZSBnZW5lcmF0b3JzIGluIGRlcGxveWVkIGJyb3dzZXJzLCBzb1xuICAgICAgICAgICAgLy8gd2UgYWxzbyBzdXBwb3J0IFB5dGhvbi1zdHlsZSBnZW5lcmF0b3JzLiAgQXQgc29tZSBwb2ludCB3ZSBjYW4gcmVtb3ZlXG4gICAgICAgICAgICAvLyB0aGlzIGJsb2NrLlxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIFN0b3BJdGVyYXRpb24gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAvLyBFUzYgR2VuZXJhdG9yc1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGdlbmVyYXRvclt2ZXJiXShhcmcpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuZG9uZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0LnZhbHVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB3aGVuKHJlc3VsdC52YWx1ZSwgY2FsbGJhY2ssIGVycmJhY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU3BpZGVyTW9ua2V5IEdlbmVyYXRvcnNcbiAgICAgICAgICAgICAgICAvLyBGSVhNRTogUmVtb3ZlIHRoaXMgY2FzZSB3aGVuIFNNIGRvZXMgRVM2IGdlbmVyYXRvcnMuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZ2VuZXJhdG9yW3ZlcmJdKGFyZyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1N0b3BJdGVyYXRpb24oZXhjZXB0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4Y2VwdGlvbi52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gd2hlbihyZXN1bHQsIGNhbGxiYWNrLCBlcnJiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZ2VuZXJhdG9yID0gbWFrZUdlbmVyYXRvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSBjb250aW51ZXIuYmluZChjb250aW51ZXIsIFwibmV4dFwiKTtcbiAgICAgICAgdmFyIGVycmJhY2sgPSBjb250aW51ZXIuYmluZChjb250aW51ZXIsIFwidGhyb3dcIik7XG4gICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgIH07XG59XG5cbi8qKlxuICogVGhlIHNwYXduIGZ1bmN0aW9uIGlzIGEgc21hbGwgd3JhcHBlciBhcm91bmQgYXN5bmMgdGhhdCBpbW1lZGlhdGVseVxuICogY2FsbHMgdGhlIGdlbmVyYXRvciBhbmQgYWxzbyBlbmRzIHRoZSBwcm9taXNlIGNoYWluLCBzbyB0aGF0IGFueVxuICogdW5oYW5kbGVkIGVycm9ycyBhcmUgdGhyb3duIGluc3RlYWQgb2YgZm9yd2FyZGVkIHRvIHRoZSBlcnJvclxuICogaGFuZGxlci4gVGhpcyBpcyB1c2VmdWwgYmVjYXVzZSBpdCdzIGV4dHJlbWVseSBjb21tb24gdG8gcnVuXG4gKiBnZW5lcmF0b3JzIGF0IHRoZSB0b3AtbGV2ZWwgdG8gd29yayB3aXRoIGxpYnJhcmllcy5cbiAqL1xuUS5zcGF3biA9IHNwYXduO1xuZnVuY3Rpb24gc3Bhd24obWFrZUdlbmVyYXRvcikge1xuICAgIFEuZG9uZShRLmFzeW5jKG1ha2VHZW5lcmF0b3IpKCkpO1xufVxuXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgaW50ZXJmYWNlIG9uY2UgRVM2IGdlbmVyYXRvcnMgYXJlIGluIFNwaWRlck1vbmtleS5cbi8qKlxuICogVGhyb3dzIGEgUmV0dXJuVmFsdWUgZXhjZXB0aW9uIHRvIHN0b3AgYW4gYXN5bmNocm9ub3VzIGdlbmVyYXRvci5cbiAqXG4gKiBUaGlzIGludGVyZmFjZSBpcyBhIHN0b3AtZ2FwIG1lYXN1cmUgdG8gc3VwcG9ydCBnZW5lcmF0b3IgcmV0dXJuXG4gKiB2YWx1ZXMgaW4gb2xkZXIgRmlyZWZveC9TcGlkZXJNb25rZXkuICBJbiBicm93c2VycyB0aGF0IHN1cHBvcnQgRVM2XG4gKiBnZW5lcmF0b3JzIGxpa2UgQ2hyb21pdW0gMjksIGp1c3QgdXNlIFwicmV0dXJuXCIgaW4geW91ciBnZW5lcmF0b3JcbiAqIGZ1bmN0aW9ucy5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgdGhlIHJldHVybiB2YWx1ZSBmb3IgdGhlIHN1cnJvdW5kaW5nIGdlbmVyYXRvclxuICogQHRocm93cyBSZXR1cm5WYWx1ZSBleGNlcHRpb24gd2l0aCB0aGUgdmFsdWUuXG4gKiBAZXhhbXBsZVxuICogLy8gRVM2IHN0eWxlXG4gKiBRLmFzeW5jKGZ1bmN0aW9uKiAoKSB7XG4gKiAgICAgIHZhciBmb28gPSB5aWVsZCBnZXRGb29Qcm9taXNlKCk7XG4gKiAgICAgIHZhciBiYXIgPSB5aWVsZCBnZXRCYXJQcm9taXNlKCk7XG4gKiAgICAgIHJldHVybiBmb28gKyBiYXI7XG4gKiB9KVxuICogLy8gT2xkZXIgU3BpZGVyTW9ua2V5IHN0eWxlXG4gKiBRLmFzeW5jKGZ1bmN0aW9uICgpIHtcbiAqICAgICAgdmFyIGZvbyA9IHlpZWxkIGdldEZvb1Byb21pc2UoKTtcbiAqICAgICAgdmFyIGJhciA9IHlpZWxkIGdldEJhclByb21pc2UoKTtcbiAqICAgICAgUS5yZXR1cm4oZm9vICsgYmFyKTtcbiAqIH0pXG4gKi9cblFbXCJyZXR1cm5cIl0gPSBfcmV0dXJuO1xuZnVuY3Rpb24gX3JldHVybih2YWx1ZSkge1xuICAgIHRocm93IG5ldyBRUmV0dXJuVmFsdWUodmFsdWUpO1xufVxuXG4vKipcbiAqIFRoZSBwcm9taXNlZCBmdW5jdGlvbiBkZWNvcmF0b3IgZW5zdXJlcyB0aGF0IGFueSBwcm9taXNlIGFyZ3VtZW50c1xuICogYXJlIHNldHRsZWQgYW5kIHBhc3NlZCBhcyB2YWx1ZXMgKGB0aGlzYCBpcyBhbHNvIHNldHRsZWQgYW5kIHBhc3NlZFxuICogYXMgYSB2YWx1ZSkuICBJdCB3aWxsIGFsc28gZW5zdXJlIHRoYXQgdGhlIHJlc3VsdCBvZiBhIGZ1bmN0aW9uIGlzXG4gKiBhbHdheXMgYSBwcm9taXNlLlxuICpcbiAqIEBleGFtcGxlXG4gKiB2YXIgYWRkID0gUS5wcm9taXNlZChmdW5jdGlvbiAoYSwgYikge1xuICogICAgIHJldHVybiBhICsgYjtcbiAqIH0pO1xuICogYWRkKFEoYSksIFEoQikpO1xuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBkZWNvcmF0ZVxuICogQHJldHVybnMge2Z1bmN0aW9ufSBhIGZ1bmN0aW9uIHRoYXQgaGFzIGJlZW4gZGVjb3JhdGVkLlxuICovXG5RLnByb21pc2VkID0gcHJvbWlzZWQ7XG5mdW5jdGlvbiBwcm9taXNlZChjYWxsYmFjaykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBzcHJlYWQoW3RoaXMsIGFsbChhcmd1bWVudHMpXSwgZnVuY3Rpb24gKHNlbGYsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBzZW5kcyBhIG1lc3NhZ2UgdG8gYSB2YWx1ZSBpbiBhIGZ1dHVyZSB0dXJuXG4gKiBAcGFyYW0gb2JqZWN0KiB0aGUgcmVjaXBpZW50XG4gKiBAcGFyYW0gb3AgdGhlIG5hbWUgb2YgdGhlIG1lc3NhZ2Ugb3BlcmF0aW9uLCBlLmcuLCBcIndoZW5cIixcbiAqIEBwYXJhbSBhcmdzIGZ1cnRoZXIgYXJndW1lbnRzIHRvIGJlIGZvcndhcmRlZCB0byB0aGUgb3BlcmF0aW9uXG4gKiBAcmV0dXJucyByZXN1bHQge1Byb21pc2V9IGEgcHJvbWlzZSBmb3IgdGhlIHJlc3VsdCBvZiB0aGUgb3BlcmF0aW9uXG4gKi9cblEuZGlzcGF0Y2ggPSBkaXNwYXRjaDtcbmZ1bmN0aW9uIGRpc3BhdGNoKG9iamVjdCwgb3AsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKG9wLCBhcmdzKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuZGlzcGF0Y2ggPSBmdW5jdGlvbiAob3AsIGFyZ3MpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBuZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKGRlZmVycmVkLnJlc29sdmUsIG9wLCBhcmdzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgdmFsdWUgb2YgYSBwcm9wZXJ0eSBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBwcm9wZXJ0eSB0byBnZXRcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHByb3BlcnR5IHZhbHVlXG4gKi9cblEuZ2V0ID0gZnVuY3Rpb24gKG9iamVjdCwga2V5KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImdldFwiLCBba2V5XSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJnZXRcIiwgW2tleV0pO1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIHByb3BlcnR5IGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3Igb2JqZWN0IG9iamVjdFxuICogQHBhcmFtIG5hbWUgICAgICBuYW1lIG9mIHByb3BlcnR5IHRvIHNldFxuICogQHBhcmFtIHZhbHVlICAgICBuZXcgdmFsdWUgb2YgcHJvcGVydHlcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICovXG5RLnNldCA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwic2V0XCIsIFtrZXksIHZhbHVlXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwic2V0XCIsIFtrZXksIHZhbHVlXSk7XG59O1xuXG4vKipcbiAqIERlbGV0ZXMgYSBwcm9wZXJ0eSBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBwcm9wZXJ0eSB0byBkZWxldGVcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICovXG5RLmRlbCA9IC8vIFhYWCBsZWdhY3lcblFbXCJkZWxldGVcIl0gPSBmdW5jdGlvbiAob2JqZWN0LCBrZXkpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwiZGVsZXRlXCIsIFtrZXldKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmRlbCA9IC8vIFhYWCBsZWdhY3lcblByb21pc2UucHJvdG90eXBlW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwiZGVsZXRlXCIsIFtrZXldKTtcbn07XG5cbi8qKlxuICogSW52b2tlcyBhIG1ldGhvZCBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBtZXRob2QgdG8gaW52b2tlXG4gKiBAcGFyYW0gdmFsdWUgICAgIGEgdmFsdWUgdG8gcG9zdCwgdHlwaWNhbGx5IGFuIGFycmF5IG9mXG4gKiAgICAgICAgICAgICAgICAgIGludm9jYXRpb24gYXJndW1lbnRzIGZvciBwcm9taXNlcyB0aGF0XG4gKiAgICAgICAgICAgICAgICAgIGFyZSB1bHRpbWF0ZWx5IGJhY2tlZCB3aXRoIGByZXNvbHZlYCB2YWx1ZXMsXG4gKiAgICAgICAgICAgICAgICAgIGFzIG9wcG9zZWQgdG8gdGhvc2UgYmFja2VkIHdpdGggVVJMc1xuICogICAgICAgICAgICAgICAgICB3aGVyZWluIHRoZSBwb3N0ZWQgdmFsdWUgY2FuIGJlIGFueVxuICogICAgICAgICAgICAgICAgICBKU09OIHNlcmlhbGl6YWJsZSBvYmplY3QuXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuLy8gYm91bmQgbG9jYWxseSBiZWNhdXNlIGl0IGlzIHVzZWQgYnkgb3RoZXIgbWV0aG9kc1xuUS5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUS5wb3N0ID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSwgYXJncykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcmdzXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUHJvbWlzZS5wcm90b3R5cGUucG9zdCA9IGZ1bmN0aW9uIChuYW1lLCBhcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcmdzXSk7XG59O1xuXG4vKipcbiAqIEludm9rZXMgYSBtZXRob2QgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgbWV0aG9kIHRvIGludm9rZVxuICogQHBhcmFtIC4uLmFyZ3MgICBhcnJheSBvZiBpbnZvY2F0aW9uIGFyZ3VtZW50c1xuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXG4gKi9cblEuc2VuZCA9IC8vIFhYWCBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIHBhcmxhbmNlXG5RLm1jYWxsID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblEuaW52b2tlID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcnJheV9zbGljZShhcmd1bWVudHMsIDIpXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5zZW5kID0gLy8gWFhYIE1hcmsgTWlsbGVyJ3MgcHJvcG9zZWQgcGFybGFuY2VcblByb21pc2UucHJvdG90eXBlLm1jYWxsID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblByb21pc2UucHJvdG90eXBlLmludm9rZSA9IGZ1bmN0aW9uIChuYW1lIC8qLi4uYXJncyovKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpXSk7XG59O1xuXG4vKipcbiAqIEFwcGxpZXMgdGhlIHByb21pc2VkIGZ1bmN0aW9uIGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IGZ1bmN0aW9uXG4gKiBAcGFyYW0gYXJncyAgICAgIGFycmF5IG9mIGFwcGxpY2F0aW9uIGFyZ3VtZW50c1xuICovXG5RLmZhcHBseSA9IGZ1bmN0aW9uIChvYmplY3QsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwiYXBwbHlcIiwgW3ZvaWQgMCwgYXJnc10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmFwcGx5ID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFyZ3NdKTtcbn07XG5cbi8qKlxuICogQ2FsbHMgdGhlIHByb21pc2VkIGZ1bmN0aW9uIGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IGZ1bmN0aW9uXG4gKiBAcGFyYW0gLi4uYXJncyAgIGFycmF5IG9mIGFwcGxpY2F0aW9uIGFyZ3VtZW50c1xuICovXG5RW1widHJ5XCJdID1cblEuZmNhbGwgPSBmdW5jdGlvbiAob2JqZWN0IC8qIC4uLmFyZ3MqLykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJhcHBseVwiLCBbdm9pZCAwLCBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5mY2FsbCA9IGZ1bmN0aW9uICgvKi4uLmFyZ3MqLykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwiYXBwbHlcIiwgW3ZvaWQgMCwgYXJyYXlfc2xpY2UoYXJndW1lbnRzKV0pO1xufTtcblxuLyoqXG4gKiBCaW5kcyB0aGUgcHJvbWlzZWQgZnVuY3Rpb24sIHRyYW5zZm9ybWluZyByZXR1cm4gdmFsdWVzIGludG8gYSBmdWxmaWxsZWRcbiAqIHByb21pc2UgYW5kIHRocm93biBlcnJvcnMgaW50byBhIHJlamVjdGVkIG9uZS5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgZnVuY3Rpb25cbiAqIEBwYXJhbSAuLi5hcmdzICAgYXJyYXkgb2YgYXBwbGljYXRpb24gYXJndW1lbnRzXG4gKi9cblEuZmJpbmQgPSBmdW5jdGlvbiAob2JqZWN0IC8qLi4uYXJncyovKSB7XG4gICAgdmFyIHByb21pc2UgPSBRKG9iamVjdCk7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBmdW5jdGlvbiBmYm91bmQoKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlLmRpc3BhdGNoKFwiYXBwbHlcIiwgW1xuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIGFyZ3MuY29uY2F0KGFycmF5X3NsaWNlKGFyZ3VtZW50cykpXG4gICAgICAgIF0pO1xuICAgIH07XG59O1xuUHJvbWlzZS5wcm90b3R5cGUuZmJpbmQgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgcHJvbWlzZSA9IHRoaXM7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMpO1xuICAgIHJldHVybiBmdW5jdGlvbiBmYm91bmQoKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlLmRpc3BhdGNoKFwiYXBwbHlcIiwgW1xuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIGFyZ3MuY29uY2F0KGFycmF5X3NsaWNlKGFyZ3VtZW50cykpXG4gICAgICAgIF0pO1xuICAgIH07XG59O1xuXG4vKipcbiAqIFJlcXVlc3RzIHRoZSBuYW1lcyBvZiB0aGUgb3duZWQgcHJvcGVydGllcyBvZiBhIHByb21pc2VkXG4gKiBvYmplY3QgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSBrZXlzIG9mIHRoZSBldmVudHVhbGx5IHNldHRsZWQgb2JqZWN0XG4gKi9cblEua2V5cyA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwia2V5c1wiLCBbXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwia2V5c1wiLCBbXSk7XG59O1xuXG4vKipcbiAqIFR1cm5zIGFuIGFycmF5IG9mIHByb21pc2VzIGludG8gYSBwcm9taXNlIGZvciBhbiBhcnJheS4gIElmIGFueSBvZlxuICogdGhlIHByb21pc2VzIGdldHMgcmVqZWN0ZWQsIHRoZSB3aG9sZSBhcnJheSBpcyByZWplY3RlZCBpbW1lZGlhdGVseS5cbiAqIEBwYXJhbSB7QXJyYXkqfSBhbiBhcnJheSAob3IgcHJvbWlzZSBmb3IgYW4gYXJyYXkpIG9mIHZhbHVlcyAob3JcbiAqIHByb21pc2VzIGZvciB2YWx1ZXMpXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIGFuIGFycmF5IG9mIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlc1xuICovXG4vLyBCeSBNYXJrIE1pbGxlclxuLy8gaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9c3RyYXdtYW46Y29uY3VycmVuY3kmcmV2PTEzMDg3NzY1MjEjYWxsZnVsZmlsbGVkXG5RLmFsbCA9IGFsbDtcbmZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICAgIHJldHVybiB3aGVuKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZXMpIHtcbiAgICAgICAgdmFyIGNvdW50RG93biA9IDA7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgICAgIGFycmF5X3JlZHVjZShwcm9taXNlcywgZnVuY3Rpb24gKHVuZGVmaW5lZCwgcHJvbWlzZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBzbmFwc2hvdDtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBpc1Byb21pc2UocHJvbWlzZSkgJiZcbiAgICAgICAgICAgICAgICAoc25hcHNob3QgPSBwcm9taXNlLmluc3BlY3QoKSkuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHByb21pc2VzW2luZGV4XSA9IHNuYXBzaG90LnZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICArK2NvdW50RG93bjtcbiAgICAgICAgICAgICAgICB3aGVuKFxuICAgICAgICAgICAgICAgICAgICBwcm9taXNlLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzW2luZGV4XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKC0tY291bnREb3duID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShwcm9taXNlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkoeyBpbmRleDogaW5kZXgsIHZhbHVlOiBwcm9ncmVzcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHZvaWQgMCk7XG4gICAgICAgIGlmIChjb3VudERvd24gPT09IDApIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocHJvbWlzZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0pO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5hbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGFsbCh0aGlzKTtcbn07XG5cbi8qKlxuICogV2FpdHMgZm9yIGFsbCBwcm9taXNlcyB0byBiZSBzZXR0bGVkLCBlaXRoZXIgZnVsZmlsbGVkIG9yXG4gKiByZWplY3RlZC4gIFRoaXMgaXMgZGlzdGluY3QgZnJvbSBgYWxsYCBzaW5jZSB0aGF0IHdvdWxkIHN0b3BcbiAqIHdhaXRpbmcgYXQgdGhlIGZpcnN0IHJlamVjdGlvbi4gIFRoZSBwcm9taXNlIHJldHVybmVkIGJ5XG4gKiBgYWxsUmVzb2x2ZWRgIHdpbGwgbmV2ZXIgYmUgcmVqZWN0ZWQuXG4gKiBAcGFyYW0gcHJvbWlzZXMgYSBwcm9taXNlIGZvciBhbiBhcnJheSAob3IgYW4gYXJyYXkpIG9mIHByb21pc2VzXG4gKiAob3IgdmFsdWVzKVxuICogQHJldHVybiBhIHByb21pc2UgZm9yIGFuIGFycmF5IG9mIHByb21pc2VzXG4gKi9cblEuYWxsUmVzb2x2ZWQgPSBkZXByZWNhdGUoYWxsUmVzb2x2ZWQsIFwiYWxsUmVzb2x2ZWRcIiwgXCJhbGxTZXR0bGVkXCIpO1xuZnVuY3Rpb24gYWxsUmVzb2x2ZWQocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gd2hlbihwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgICAgIHByb21pc2VzID0gYXJyYXlfbWFwKHByb21pc2VzLCBRKTtcbiAgICAgICAgcmV0dXJuIHdoZW4oYWxsKGFycmF5X21hcChwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB3aGVuKHByb21pc2UsIG5vb3AsIG5vb3ApO1xuICAgICAgICB9KSksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlcztcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cblByb21pc2UucHJvdG90eXBlLmFsbFJlc29sdmVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBhbGxSZXNvbHZlZCh0aGlzKTtcbn07XG5cbi8qKlxuICogQHNlZSBQcm9taXNlI2FsbFNldHRsZWRcbiAqL1xuUS5hbGxTZXR0bGVkID0gYWxsU2V0dGxlZDtcbmZ1bmN0aW9uIGFsbFNldHRsZWQocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gUShwcm9taXNlcykuYWxsU2V0dGxlZCgpO1xufVxuXG4vKipcbiAqIFR1cm5zIGFuIGFycmF5IG9mIHByb21pc2VzIGludG8gYSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiB0aGVpciBzdGF0ZXMgKGFzXG4gKiByZXR1cm5lZCBieSBgaW5zcGVjdGApIHdoZW4gdGhleSBoYXZlIGFsbCBzZXR0bGVkLlxuICogQHBhcmFtIHtBcnJheVtBbnkqXX0gdmFsdWVzIGFuIGFycmF5IChvciBwcm9taXNlIGZvciBhbiBhcnJheSkgb2YgdmFsdWVzIChvclxuICogcHJvbWlzZXMgZm9yIHZhbHVlcylcbiAqIEByZXR1cm5zIHtBcnJheVtTdGF0ZV19IGFuIGFycmF5IG9mIHN0YXRlcyBmb3IgdGhlIHJlc3BlY3RpdmUgdmFsdWVzLlxuICovXG5Qcm9taXNlLnByb3RvdHlwZS5hbGxTZXR0bGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgICAgIHJldHVybiBhbGwoYXJyYXlfbWFwKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgICAgICAgICAgcHJvbWlzZSA9IFEocHJvbWlzZSk7XG4gICAgICAgICAgICBmdW5jdGlvbiByZWdhcmRsZXNzKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlLmluc3BlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlLnRoZW4ocmVnYXJkbGVzcywgcmVnYXJkbGVzcyk7XG4gICAgICAgIH0pKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQ2FwdHVyZXMgdGhlIGZhaWx1cmUgb2YgYSBwcm9taXNlLCBnaXZpbmcgYW4gb3BvcnR1bml0eSB0byByZWNvdmVyXG4gKiB3aXRoIGEgY2FsbGJhY2suICBJZiB0aGUgZ2l2ZW4gcHJvbWlzZSBpcyBmdWxmaWxsZWQsIHRoZSByZXR1cm5lZFxuICogcHJvbWlzZSBpcyBmdWxmaWxsZWQuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2UgZm9yIHNvbWV0aGluZ1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgdG8gZnVsZmlsbCB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpZiB0aGVcbiAqIGdpdmVuIHByb21pc2UgaXMgcmVqZWN0ZWRcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgY2FsbGJhY2tcbiAqL1xuUS5mYWlsID0gLy8gWFhYIGxlZ2FjeVxuUVtcImNhdGNoXCJdID0gZnVuY3Rpb24gKG9iamVjdCwgcmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLnRoZW4odm9pZCAwLCByZWplY3RlZCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5mYWlsID0gLy8gWFhYIGxlZ2FjeVxuUHJvbWlzZS5wcm90b3R5cGVbXCJjYXRjaFwiXSA9IGZ1bmN0aW9uIChyZWplY3RlZCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4odm9pZCAwLCByZWplY3RlZCk7XG59O1xuXG4vKipcbiAqIEF0dGFjaGVzIGEgbGlzdGVuZXIgdGhhdCBjYW4gcmVzcG9uZCB0byBwcm9ncmVzcyBub3RpZmljYXRpb25zIGZyb20gYVxuICogcHJvbWlzZSdzIG9yaWdpbmF0aW5nIGRlZmVycmVkLiBUaGlzIGxpc3RlbmVyIHJlY2VpdmVzIHRoZSBleGFjdCBhcmd1bWVudHNcbiAqIHBhc3NlZCB0byBgYGRlZmVycmVkLm5vdGlmeWBgLlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlIGZvciBzb21ldGhpbmdcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHRvIHJlY2VpdmUgYW55IHByb2dyZXNzIG5vdGlmaWNhdGlvbnNcbiAqIEByZXR1cm5zIHRoZSBnaXZlbiBwcm9taXNlLCB1bmNoYW5nZWRcbiAqL1xuUS5wcm9ncmVzcyA9IHByb2dyZXNzO1xuZnVuY3Rpb24gcHJvZ3Jlc3Mob2JqZWN0LCBwcm9ncmVzc2VkKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS50aGVuKHZvaWQgMCwgdm9pZCAwLCBwcm9ncmVzc2VkKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUucHJvZ3Jlc3MgPSBmdW5jdGlvbiAocHJvZ3Jlc3NlZCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4odm9pZCAwLCB2b2lkIDAsIHByb2dyZXNzZWQpO1xufTtcblxuLyoqXG4gKiBQcm92aWRlcyBhbiBvcHBvcnR1bml0eSB0byBvYnNlcnZlIHRoZSBzZXR0bGluZyBvZiBhIHByb21pc2UsXG4gKiByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIHByb21pc2UgaXMgZnVsZmlsbGVkIG9yIHJlamVjdGVkLiAgRm9yd2FyZHNcbiAqIHRoZSByZXNvbHV0aW9uIHRvIHRoZSByZXR1cm5lZCBwcm9taXNlIHdoZW4gdGhlIGNhbGxiYWNrIGlzIGRvbmUuXG4gKiBUaGUgY2FsbGJhY2sgY2FuIHJldHVybiBhIHByb21pc2UgdG8gZGVmZXIgY29tcGxldGlvbi5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgdG8gb2JzZXJ2ZSB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW5cbiAqIHByb21pc2UsIHRha2VzIG5vIGFyZ3VtZW50cy5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2Ugd2hlblxuICogYGBmaW5gYCBpcyBkb25lLlxuICovXG5RLmZpbiA9IC8vIFhYWCBsZWdhY3lcblFbXCJmaW5hbGx5XCJdID0gZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gUShvYmplY3QpW1wiZmluYWxseVwiXShjYWxsYmFjayk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5maW4gPSAvLyBYWFggbGVnYWN5XG5Qcm9taXNlLnByb3RvdHlwZVtcImZpbmFsbHlcIl0gPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9IFEoY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5mY2FsbCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9KTtcbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIFRPRE8gYXR0ZW1wdCB0byByZWN5Y2xlIHRoZSByZWplY3Rpb24gd2l0aCBcInRoaXNcIi5cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmZjYWxsKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUZXJtaW5hdGVzIGEgY2hhaW4gb2YgcHJvbWlzZXMsIGZvcmNpbmcgcmVqZWN0aW9ucyB0byBiZVxuICogdGhyb3duIGFzIGV4Y2VwdGlvbnMuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2UgYXQgdGhlIGVuZCBvZiBhIGNoYWluIG9mIHByb21pc2VzXG4gKiBAcmV0dXJucyBub3RoaW5nXG4gKi9cblEuZG9uZSA9IGZ1bmN0aW9uIChvYmplY3QsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kb25lKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmRvbmUgPSBmdW5jdGlvbiAoZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3MpIHtcbiAgICB2YXIgb25VbmhhbmRsZWRFcnJvciA9IGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAvLyBmb3J3YXJkIHRvIGEgZnV0dXJlIHR1cm4gc28gdGhhdCBgYHdoZW5gYFxuICAgICAgICAvLyBkb2VzIG5vdCBjYXRjaCBpdCBhbmQgdHVybiBpdCBpbnRvIGEgcmVqZWN0aW9uLlxuICAgICAgICBuZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBtYWtlU3RhY2tUcmFjZUxvbmcoZXJyb3IsIHByb21pc2UpO1xuICAgICAgICAgICAgaWYgKFEub25lcnJvcikge1xuICAgICAgICAgICAgICAgIFEub25lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gQXZvaWQgdW5uZWNlc3NhcnkgYG5leHRUaWNrYGluZyB2aWEgYW4gdW5uZWNlc3NhcnkgYHdoZW5gLlxuICAgIHZhciBwcm9taXNlID0gZnVsZmlsbGVkIHx8IHJlamVjdGVkIHx8IHByb2dyZXNzID9cbiAgICAgICAgdGhpcy50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSA6XG4gICAgICAgIHRoaXM7XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgcHJvY2VzcyAmJiBwcm9jZXNzLmRvbWFpbikge1xuICAgICAgICBvblVuaGFuZGxlZEVycm9yID0gcHJvY2Vzcy5kb21haW4uYmluZChvblVuaGFuZGxlZEVycm9yKTtcbiAgICB9XG5cbiAgICBwcm9taXNlLnRoZW4odm9pZCAwLCBvblVuaGFuZGxlZEVycm9yKTtcbn07XG5cbi8qKlxuICogQ2F1c2VzIGEgcHJvbWlzZSB0byBiZSByZWplY3RlZCBpZiBpdCBkb2VzIG5vdCBnZXQgZnVsZmlsbGVkIGJlZm9yZVxuICogc29tZSBtaWxsaXNlY29uZHMgdGltZSBvdXQuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBtaWxsaXNlY29uZHMgdGltZW91dFxuICogQHBhcmFtIHtTdHJpbmd9IGN1c3RvbSBlcnJvciBtZXNzYWdlIChvcHRpb25hbClcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2UgaWYgaXQgaXNcbiAqIGZ1bGZpbGxlZCBiZWZvcmUgdGhlIHRpbWVvdXQsIG90aGVyd2lzZSByZWplY3RlZC5cbiAqL1xuUS50aW1lb3V0ID0gZnVuY3Rpb24gKG9iamVjdCwgbXMsIG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLnRpbWVvdXQobXMsIG1lc3NhZ2UpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uIChtcywgbWVzc2FnZSkge1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdmFyIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QobmV3IEVycm9yKG1lc3NhZ2UgfHwgXCJUaW1lZCBvdXQgYWZ0ZXIgXCIgKyBtcyArIFwiIG1zXCIpKTtcbiAgICB9LCBtcyk7XG5cbiAgICB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHZhbHVlKTtcbiAgICB9LCBmdW5jdGlvbiAoZXhjZXB0aW9uKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXhjZXB0aW9uKTtcbiAgICB9LCBkZWZlcnJlZC5ub3RpZnkpO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgZ2l2ZW4gdmFsdWUgKG9yIHByb21pc2VkIHZhbHVlKSwgc29tZVxuICogbWlsbGlzZWNvbmRzIGFmdGVyIGl0IHJlc29sdmVkLiBQYXNzZXMgcmVqZWN0aW9ucyBpbW1lZGlhdGVseS5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZVxuICogQHBhcmFtIHtOdW1iZXJ9IG1pbGxpc2Vjb25kc1xuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW4gcHJvbWlzZSBhZnRlciBtaWxsaXNlY29uZHNcbiAqIHRpbWUgaGFzIGVsYXBzZWQgc2luY2UgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2UuXG4gKiBJZiB0aGUgZ2l2ZW4gcHJvbWlzZSByZWplY3RzLCB0aGF0IGlzIHBhc3NlZCBpbW1lZGlhdGVseS5cbiAqL1xuUS5kZWxheSA9IGZ1bmN0aW9uIChvYmplY3QsIHRpbWVvdXQpIHtcbiAgICBpZiAodGltZW91dCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHRpbWVvdXQgPSBvYmplY3Q7XG4gICAgICAgIG9iamVjdCA9IHZvaWQgMDtcbiAgICB9XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kZWxheSh0aW1lb3V0KTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmRlbGF5ID0gZnVuY3Rpb24gKHRpbWVvdXQpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUodmFsdWUpO1xuICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFBhc3NlcyBhIGNvbnRpbnVhdGlvbiB0byBhIE5vZGUgZnVuY3Rpb24sIHdoaWNoIGlzIGNhbGxlZCB3aXRoIHRoZSBnaXZlblxuICogYXJndW1lbnRzIHByb3ZpZGVkIGFzIGFuIGFycmF5LCBhbmQgcmV0dXJucyBhIHByb21pc2UuXG4gKlxuICogICAgICBRLm5mYXBwbHkoRlMucmVhZEZpbGUsIFtfX2ZpbGVuYW1lXSlcbiAqICAgICAgLnRoZW4oZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAqICAgICAgfSlcbiAqXG4gKi9cblEubmZhcHBseSA9IGZ1bmN0aW9uIChjYWxsYmFjaywgYXJncykge1xuICAgIHJldHVybiBRKGNhbGxiYWNrKS5uZmFwcGx5KGFyZ3MpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubmZhcHBseSA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmdzKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgdGhpcy5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogUGFzc2VzIGEgY29udGludWF0aW9uIHRvIGEgTm9kZSBmdW5jdGlvbiwgd2hpY2ggaXMgY2FsbGVkIHdpdGggdGhlIGdpdmVuXG4gKiBhcmd1bWVudHMgcHJvdmlkZWQgaW5kaXZpZHVhbGx5LCBhbmQgcmV0dXJucyBhIHByb21pc2UuXG4gKiBAZXhhbXBsZVxuICogUS5uZmNhbGwoRlMucmVhZEZpbGUsIF9fZmlsZW5hbWUpXG4gKiAudGhlbihmdW5jdGlvbiAoY29udGVudCkge1xuICogfSlcbiAqXG4gKi9cblEubmZjYWxsID0gZnVuY3Rpb24gKGNhbGxiYWNrIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBRKGNhbGxiYWNrKS5uZmFwcGx5KGFyZ3MpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubmZjYWxsID0gZnVuY3Rpb24gKC8qLi4uYXJncyovKSB7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICB0aGlzLmZhcHBseShub2RlQXJncykuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBXcmFwcyBhIE5vZGVKUyBjb250aW51YXRpb24gcGFzc2luZyBmdW5jdGlvbiBhbmQgcmV0dXJucyBhbiBlcXVpdmFsZW50XG4gKiB2ZXJzaW9uIHRoYXQgcmV0dXJucyBhIHByb21pc2UuXG4gKiBAZXhhbXBsZVxuICogUS5uZmJpbmQoRlMucmVhZEZpbGUsIF9fZmlsZW5hbWUpKFwidXRmLThcIilcbiAqIC50aGVuKGNvbnNvbGUubG9nKVxuICogLmRvbmUoKVxuICovXG5RLm5mYmluZCA9XG5RLmRlbm9kZWlmeSA9IGZ1bmN0aW9uIChjYWxsYmFjayAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBiYXNlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG5vZGVBcmdzID0gYmFzZUFyZ3MuY29uY2F0KGFycmF5X3NsaWNlKGFyZ3VtZW50cykpO1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgICAgIFEoY2FsbGJhY2spLmZhcHBseShub2RlQXJncykuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubmZiaW5kID1cblByb21pc2UucHJvdG90eXBlLmRlbm9kZWlmeSA9IGZ1bmN0aW9uICgvKi4uLmFyZ3MqLykge1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG4gICAgcmV0dXJuIFEuZGVub2RlaWZ5LmFwcGx5KHZvaWQgMCwgYXJncyk7XG59O1xuXG5RLm5iaW5kID0gZnVuY3Rpb24gKGNhbGxiYWNrLCB0aGlzcCAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBiYXNlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG5vZGVBcmdzID0gYmFzZUFyZ3MuY29uY2F0KGFycmF5X3NsaWNlKGFyZ3VtZW50cykpO1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgICAgIGZ1bmN0aW9uIGJvdW5kKCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHRoaXNwLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgICAgIFEoYm91bmQpLmZhcHBseShub2RlQXJncykuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubmJpbmQgPSBmdW5jdGlvbiAoLyp0aGlzcCwgLi4uYXJncyovKSB7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDApO1xuICAgIGFyZ3MudW5zaGlmdCh0aGlzKTtcbiAgICByZXR1cm4gUS5uYmluZC5hcHBseSh2b2lkIDAsIGFyZ3MpO1xufTtcblxuLyoqXG4gKiBDYWxscyBhIG1ldGhvZCBvZiBhIE5vZGUtc3R5bGUgb2JqZWN0IHRoYXQgYWNjZXB0cyBhIE5vZGUtc3R5bGVcbiAqIGNhbGxiYWNrIHdpdGggYSBnaXZlbiBhcnJheSBvZiBhcmd1bWVudHMsIHBsdXMgYSBwcm92aWRlZCBjYWxsYmFjay5cbiAqIEBwYXJhbSBvYmplY3QgYW4gb2JqZWN0IHRoYXQgaGFzIHRoZSBuYW1lZCBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIG1ldGhvZCBvZiBvYmplY3RcbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3MgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZDsgdGhlIGNhbGxiYWNrXG4gKiB3aWxsIGJlIHByb3ZpZGVkIGJ5IFEgYW5kIGFwcGVuZGVkIHRvIHRoZXNlIGFyZ3VtZW50cy5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9yIGVycm9yXG4gKi9cblEubm1hcHBseSA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5RLm5wb3N0ID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSwgYXJncykge1xuICAgIHJldHVybiBRKG9iamVjdCkubnBvc3QobmFtZSwgYXJncyk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5ubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblByb21pc2UucHJvdG90eXBlLm5wb3N0ID0gZnVuY3Rpb24gKG5hbWUsIGFyZ3MpIHtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmdzIHx8IFtdKTtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgbm9kZUFyZ3NdKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIENhbGxzIGEgbWV0aG9kIG9mIGEgTm9kZS1zdHlsZSBvYmplY3QgdGhhdCBhY2NlcHRzIGEgTm9kZS1zdHlsZVxuICogY2FsbGJhY2ssIGZvcndhcmRpbmcgdGhlIGdpdmVuIHZhcmlhZGljIGFyZ3VtZW50cywgcGx1cyBhIHByb3ZpZGVkXG4gKiBjYWxsYmFjayBhcmd1bWVudC5cbiAqIEBwYXJhbSBvYmplY3QgYW4gb2JqZWN0IHRoYXQgaGFzIHRoZSBuYW1lZCBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIG1ldGhvZCBvZiBvYmplY3RcbiAqIEBwYXJhbSAuLi5hcmdzIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBtZXRob2Q7IHRoZSBjYWxsYmFjayB3aWxsXG4gKiBiZSBwcm92aWRlZCBieSBRIGFuZCBhcHBlbmRlZCB0byB0aGVzZSBhcmd1bWVudHMuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSB2YWx1ZSBvciBlcnJvclxuICovXG5RLm5zZW5kID0gLy8gWFhYIEJhc2VkIG9uIE1hcmsgTWlsbGVyJ3MgcHJvcG9zZWQgXCJzZW5kXCJcblEubm1jYWxsID0gLy8gWFhYIEJhc2VkIG9uIFwiUmVkc2FuZHJvJ3NcIiBwcm9wb3NhbFxuUS5uaW52b2tlID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMik7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgbm9kZUFyZ3NdKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uc2VuZCA9IC8vIFhYWCBCYXNlZCBvbiBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIFwic2VuZFwiXG5Qcm9taXNlLnByb3RvdHlwZS5ubWNhbGwgPSAvLyBYWFggQmFzZWQgb24gXCJSZWRzYW5kcm8nc1wiIHByb3Bvc2FsXG5Qcm9taXNlLnByb3RvdHlwZS5uaW52b2tlID0gZnVuY3Rpb24gKG5hbWUgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBub2RlQXJnc10pLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogSWYgYSBmdW5jdGlvbiB3b3VsZCBsaWtlIHRvIHN1cHBvcnQgYm90aCBOb2RlIGNvbnRpbnVhdGlvbi1wYXNzaW5nLXN0eWxlIGFuZFxuICogcHJvbWlzZS1yZXR1cm5pbmctc3R5bGUsIGl0IGNhbiBlbmQgaXRzIGludGVybmFsIHByb21pc2UgY2hhaW4gd2l0aFxuICogYG5vZGVpZnkobm9kZWJhY2spYCwgZm9yd2FyZGluZyB0aGUgb3B0aW9uYWwgbm9kZWJhY2sgYXJndW1lbnQuICBJZiB0aGUgdXNlclxuICogZWxlY3RzIHRvIHVzZSBhIG5vZGViYWNrLCB0aGUgcmVzdWx0IHdpbGwgYmUgc2VudCB0aGVyZS4gIElmIHRoZXkgZG8gbm90XG4gKiBwYXNzIGEgbm9kZWJhY2ssIHRoZXkgd2lsbCByZWNlaXZlIHRoZSByZXN1bHQgcHJvbWlzZS5cbiAqIEBwYXJhbSBvYmplY3QgYSByZXN1bHQgKG9yIGEgcHJvbWlzZSBmb3IgYSByZXN1bHQpXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBub2RlYmFjayBhIE5vZGUuanMtc3R5bGUgY2FsbGJhY2tcbiAqIEByZXR1cm5zIGVpdGhlciB0aGUgcHJvbWlzZSBvciBub3RoaW5nXG4gKi9cblEubm9kZWlmeSA9IG5vZGVpZnk7XG5mdW5jdGlvbiBub2RlaWZ5KG9iamVjdCwgbm9kZWJhY2spIHtcbiAgICByZXR1cm4gUShvYmplY3QpLm5vZGVpZnkobm9kZWJhY2spO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5ub2RlaWZ5ID0gZnVuY3Rpb24gKG5vZGViYWNrKSB7XG4gICAgaWYgKG5vZGViYWNrKSB7XG4gICAgICAgIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIG5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBub2RlYmFjayhudWxsLCB2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBuZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbm9kZWJhY2soZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn07XG5cbi8vIEFsbCBjb2RlIGJlZm9yZSB0aGlzIHBvaW50IHdpbGwgYmUgZmlsdGVyZWQgZnJvbSBzdGFjayB0cmFjZXMuXG52YXIgcUVuZGluZ0xpbmUgPSBjYXB0dXJlTGluZSgpO1xuXG5yZXR1cm4gUTtcblxufSk7XG4iLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKDIxKSIsIi8qKlxuICogcXN0YXJ0LmpzIC0gRE9NIHJlYWR5IHByb21pc2lmaWVkIHdpdGggUVxuICovXG5cbihmdW5jdGlvbiAoZGVmaW5pdGlvbikge1xuICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBRc3RhcnQgPSBkZWZpbml0aW9uKCk7XG4gICAgfVxuXG59KShmdW5jdGlvbiAoKSB7XG4gICAgdmFyIFEgPSB3aW5kb3cuUSB8fCByZXF1aXJlKCdxJyksXG4gICAgICAgIGQgPSBRLmRlZmVyKCksXG4gICAgICAgIHN1Y2Nlc3NmID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBlcnJvcmYpO1xuICAgICAgICAgICAgZC5yZXNvbHZlKHdpbmRvdy5kb2N1bWVudCk7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yZiA9IGZ1bmN0aW9uIChlcnIpIHsgZC5yZWplY3QoZXJyKTsgfTtcblxuICAgIHdpbmRvdy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwicmVhZHlzdGF0ZWNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09IFwiY29tcGxldGVcIikgc3VjY2Vzc2YoKTtcbiAgICB9LCBmYWxzZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBlcnJvcmYsIGZhbHNlKTtcbiAgICByZXR1cm4gZC5wcm9taXNlO1xufSk7XG4iXX0=
;