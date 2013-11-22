/*
 * index.js - mobile-button module
 */

"use strict";

module.exports = {

    Touchstart : require('./default/touchstart-button'),
    TouchEnd : require('./default/touchend-button'),
    ScrollableX : {
        Touchend : require('./scrollable-x/touchend-button')
    },
    ScrollableY : {
        Touchend : require('./scrollable-y/touchend-button')
    }
};
