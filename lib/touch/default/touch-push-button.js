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
