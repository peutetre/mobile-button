/*
 * button.js - the base of all buttons
 *
 * All buttons share two elements: a function, the callback of the button
 * and a DOM element.
 *
 * If the callback function returns a promise, the button will
 * keep is active state until the promise is resolved;
 */

"use strict";

var Button = function Button (options) {
    options = options || {};

    /* the callback function */
    this.f = null;
    /* the dom element representing the button */
    this.el = null;

    /* the state of the button */
    this.initialized = false;
    this.binded = false;
    this.active = false;

    /* default active css class*/
    this.activeCls = 'active';

    if(typeof options.activeCls === 'string') this.activeCls = options.activeCls;
    if(options.el instanceof HTMLElement) this.el = options.el;
    if(typeof options.f === 'function') this.f = options.f;

    if (this.f && this.el) this.initialized = true;
};

Button.prototype.attachTo = function (el) {
    if(this.active) throw new Error("Can't change dom element, button is active.");
    if(this.binded) this.unbind();
    if(options.el instanceof HTMLElement) {
        this.el = options.el;
        if (this.f && this.el) this.initialized = true;
    }
    else {
        throw new Error("Button attachTo method needs a dom element as argument.");
    }
};

Button.prototype.setActive = function (active) {
    if (active) this.el.classList.add(this.activeCls);
    else this.el.classList.remove(this.activeCls);
    this.active = active;
};

Button.prototype.set = function (f) {
    if (typeof f !== 'function')
        throw new Error("Button set method needs a f function as argument.");
    this.f = f;
};

/* impl. not completed, a child will redefine the bind method, call this one and set this.binded to true*/
Button.prototype.bind = function () {
    if(!this.initialized) throw new Error("Can't bind an uninitialized button.");
    if(this.binded) throw new Error("Can't bind an already binded button.");
};

/* impl. not completed, a child will redefine the bind method, call this one and set this.binded to false*/
Button.prototype.unbind = function () {
    if(!this.initialized) throw new Error("Can't unbind an uninitialized button.");
    if(!this.binded) throw new Error("Can't unbind a unbinded button.");
};

module.exports = Button;
