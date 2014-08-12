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
            Q(evt).then(btn.f).done(btn._done(evt), btn._done(evt));
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
