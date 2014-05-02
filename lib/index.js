/*
 * index.js - mobile-button module
 */

"use strict";

var ClickButton = require('./click/button'),
    TouchstartButton = require('./touch/default/touchstart-button'),
    TouchendButton = require('./touch/default/touchend-button'),
    TouchendOnScrollableYButton = require('./touch/scrollable-y/touchend-button'),
    TouchendOnScrollableXButton = require('./touch/scrollable-x/touchend-button'),
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
