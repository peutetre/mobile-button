/*
 * start-button.js
 */

"use strict";

var Q = require('q'),
    Button = require('./../../button');

var PointerstartButton = function (options) {
    Button.prototype.constructor.call(this, options);
    this.delay = options.delay > 0 ? options.delay : 0;
};

PointerstartButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(Button.prototype);

PointerstartButton.prototype.constructor = PointerstartButton;

PointerstartButton.prototype.bind = function () {
    Button.prototype.bind.call(this);
    if (window.MSPointerEvent)
        this.el.addEventListener('MSPointerDown', this, false);
    else
        this.el.addEventListener('pointerdown', this, false);;
    this.binded = true;
    return this;
};

PointerstartButton.prototype.unbind = function () {
    Button.prototype.unbind.call(this);
    if (window.MSPointerEvent)
        this.el.removeEventListener('MSPointerDown', this, false);
    else
        this.el.removeEventListener('pointerdown', this, false);;
    this.binded = false;
    return this;
};

PointerstartButton.prototype.handleEvent = function (evt) {
    switch(evt.type) {
        case 'MSPointerDown':
        case 'pointerdown':
            this.onPointerdown(evt);
            break;
    }
};

function _done(btn) {
    return function () { btn.setActive(false); };
};

PointerstartButton.prototype.onPointerdown = function (evt) {
    if (!this.active) {
        var btn = this;
        btn.setActive(true);
        Q.delay(evt, btn.delay).then(btn.f).done(_done(btn), _done(btn));
    }
};

module.exports = PointerstartButton;
