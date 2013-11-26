/*
 * default/touchstart-button.js
 */

"use strict";

var Q = require('q'),
    Button = require('./../button');

var TouchstartButton = function (options) {
    Button.prototype.constructor.call(this, options);
    this.delay = options.delay > 0 ? options.delay : 0;
};

TouchstartButton.prototype = (function (proto) {
    function F() {};
    F.prototype = proto;
    return new F();
})(Button.prototype);

TouchstartButton.prototype.bind = function () {
    Button.prototype.bind.call(this);
    this.el.addEventListener('touchstart', this, false);
    this.binded = true;
};

TouchstartButton.prototype.unbind = function () {
    Button.prototype.unbind.call(this);
    this.el.removeEventListener('touchstart', this, false);
    this.binded = false;
};

TouchstartButton.prototype.handleEvent = function (evt) {
    switch(evt.type) {
        case 'touchstart':
            this.onTouchstart(evt);
            break;
    }
};

TouchstartButton.prototype.onTouchstart = function (evt) {
    if (!this.active) {
        var btn = this;
        btn.setActive(true);
        Q.delay(evt, btn.delay).then(btn.f).done(function () {
            btn.setActive(false);
        });
    }
};

module.exports = TouchstartButton;
