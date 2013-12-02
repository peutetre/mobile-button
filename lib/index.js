/*
 * index.js - mobile-button module
 */

"use strict";

module.exports = {

    Touchstart : require('./default/touchstart-button'),
    Touchend : require('./default/touchend-button'),
    ScrollableY : {
        Touchend : require('./scrollable-y/touchend-button')
    },
    ScrollableX : {
        Touchend : require('./scrollable-x/touchend-button')
    }
};
