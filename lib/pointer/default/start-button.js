/*
 * start-button.js
 */

"use strict";

var Q = require('q'),
    Button = require('./../../button');

var PointerstartButton = function (options) {
    Button.prototype.constructor.call(this, options);
};

PointerstartButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(Button.prototype);

PointerstartButton.prototype.constructor = PointerstartButton;

PointerstartButton.prototype.bind = function () {
    Button.prototype.bind.call(this);
    return this;
};

PointerstartButton.prototype.unbind = function () {
    Button.prototype.unbind.call(this);
    return this;
};

module.exports = PointerstartButton;
