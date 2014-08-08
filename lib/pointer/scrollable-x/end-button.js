/*
 * end-button.js
 */

"use strict";

var PointerendButton = require('./../default/end-button');

var PointerendOnScrollableXButton = function (options) {
    PointerendButton.prototype.constructor.call(this, options);
    this.tolerance = options.tolerance || 10;
};

PointerendOnScrollableXButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(PointerendButton.prototype);

PointerendOnScrollableXButton.prototype.constructor = PointerendOnScrollableXButton;

PointerendOnScrollableXButton.prototype.onPointerdown = function (evt) {
    if (!this.active) this.startX = evt.clientX;
    PointerendButton.prototype.onPointerdown.call(this, evt);
};

PointerendOnScrollableXButton.prototype._isInActiveZone = function (evt) {
    var y = evt.clientY,
        d = Math.abs(evt.clientX - this.startX),
        b = this.boundaries;
    return y < b.maxY && y > b.minY && d < this.tolerance;
};

PointerendOnScrollableXButton.prototype.onPointermove = function (evt) {
    if (this.active) {
        if (this._isDownPointerId(evt.pointerId)) {
            evt.preventDefault();
            if (this._isInActiveZone(evt)) this._addCls();
            else this.onPointercancel.call(this, evt);
        }
    }
};

module.exports = PointerendOnScrollableXButton;
