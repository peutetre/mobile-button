/*
 * end-button.js
 */

"use strict";

var Q = require('q'),
    Button = require('./../../button');

var PointerendOnScrollableXButton = function (options) {
    Button.prototype.constructor.call(this, options);
};

PointerendOnScrollableXButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(Button.prototype);

PointerendOnScrollableXButton.prototype.constructor = PointerendOnScrollableXButton;

PointerendOnScrollableXButton.prototype.bind = function () {
    Button.prototype.bind.call(this);
    return this;
};

PointerendOnScrollableXButton.prototype.unbind = function () {
    Button.prototype.unbind.call(this);
    return this;
};

module.exports = PointerendOnScrollableXButton;
