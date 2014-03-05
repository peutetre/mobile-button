/*
 * index.js - mobile-button module
 */

"use strict";

var ClickButton = require('./click/button'),
    TouchstartButton = require('./default/touchstart-button'),
    TouchendButton = require('./default/touchend-button'),
    TouchendOnScrollableYButton = require('./scrollable-y/touchend-button'),
    TouchendOnScrollableXButton = require('./scrollable-x/touchend-button'),
    touchable = 'ontouchstart' in window;

module.exports = {
    Touchstart : touchable ? TouchstartButton : ClickButton,
    Touchend : touchable ? TouchendButton : ClickButton,
    ScrollableY : {
        Touchend : touchable ? TouchendOnScrollableYButton : ClickButton
    },
    ScrollableX : {
        Touchend : touchable ? TouchendOnScrollableXButton : ClickButton
    }
};
