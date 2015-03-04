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
    if(this.monotouchable) this.unlock();
    this.leftOrEnded = false;
};

module.exports = PointerPushButton;
