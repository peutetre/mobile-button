/*
 * end-button.js
 */

"use strict";

var Q = require('q'),
    Button = require('./../../button');

var PointerendOnScrollableYButton = function (options) {
    Button.prototype.constructor.call(this, options);
};

PointerendOnScrollableYButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(Button.prototype);

PointerendOnScrollableYButton.prototype.constructor = PointerendOnScrollableYButton;

PointerendOnScrollableYButton.prototype.bind = function () {
    Button.prototype.bind.call(this);
    return this;
};

PointerendOnScrollableYButton.prototype.unbind = function () {
    Button.prototype.unbind.call(this);
    return this;
};

module.exports = PointerendOnScrollableYButton;
