/*
 * end-button.js
 */

"use strict";

var Q = require('q'),
    Button = require('./../../button');

var PointerendButton = function (options) {
    Button.prototype.constructor.call(this, options);
};

PointerendButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(Button.prototype);

PointerendButton.prototype.constructor = PointerendButton;

PointerendButton.prototype.bind = function () {
    Button.prototype.bind.call(this);
    return this;
};

PointerendButton.prototype.unbind = function () {
    Button.prototype.unbind.call(this);
    return this;
};

module.exports = PointerendButton;
