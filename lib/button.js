/*
 * button.js
 */

"use strict";

var Button = function Button (options) {
    options = options || {};
    if (typeof options.f !== 'function')
        throw new Error("Button options needs a f function.");
    this.f = options.f;
};

Button.prototype.set = function (f) {
    this.f = f;
};

module.exports = Button;
