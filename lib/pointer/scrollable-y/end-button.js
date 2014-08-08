/*
 * end-button.js
 */

"use strict";

var PointerendButton = require('./../default/end-button');

var PointerendOnScrollableYButton = function (options) {
    PointerendButton.prototype.constructor.call(this, options);
    this.tolerance = options.tolerance || 10;
};

PointerendOnScrollableYButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(PointerendButton.prototype);

PointerendOnScrollableYButton.prototype.constructor = PointerendOnScrollableYButton;

PointerendOnScrollableYButton.prototype.onPointerdown = function (evt) {
    if (!this.active) this.startY = evt.clientY;
    PointerendButton.prototype.onPointerdown.call(this, evt);
};

PointerendOnScrollableYButton.prototype._isInActiveZone = function (evt) {
    var x = evt.clientX,
        d = Math.abs(evt.clientY - this.startY),
        b = this.boundaries;
    return x < b.maxX && x > b.minX && d < this.tolerance;
};

PointerendOnScrollableYButton.prototype.onPointermove = function (evt) {
    if (this.active) {
        if (this._isDownPointerId(evt.pointerId)) {
            evt.preventDefault();
            if (this._isInActiveZone(evt)) this._addCls();
            else this.onPointercancel.call(this, evt);
        }
    }
};

module.exports = PointerendOnScrollableYButton;
