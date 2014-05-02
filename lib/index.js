/*
 * index.js - mobile-button module
 */

"use strict";

var ClickButton = require('./click/button'),

    TouchstartButton = require('./touch/default/touchstart-button'),
    TouchendButton = require('./touch/default/touchend-button'),
    TouchendOnScrollableYButton = require('./touch/scrollable-y/touchend-button'),
    TouchendOnScrollableXButton = require('./touch/scrollable-x/touchend-button'),

    PointerstartButton = require('./pointer/default/start-button'),
    PointerendButton = require('./pointer/default/end-button'),
    PointerendOnScrollableYButton = require('./pointer/scrollable-y/end-button'),
    PointerendOnScrollableXButton = require('./pointer/scrollable-x/end-button'),

    touchable = 'ontouchstart' in window,
    hasPointerEvents = window.navigator.msPointerEnabled;

module.exports = {
    Touchstart : touchable ? TouchstartButton : (hasPointerEvents ? PointerstartButton : ClickButton),
    Touchend : touchable ? TouchendButton : (hasPointerEvents ? PointerendButton : ClickButton),
    ScrollableY : {
        Touchend : touchable ? TouchendOnScrollableYButton : (hasPointerEvents ? PointerendOnScrollableYButton : ClickButton)
    },
    ScrollableX : {
        Touchend : touchable ? TouchendOnScrollableXButton : (hasPointerEvents ? PointerendOnScrollableXButton : ClickButton)
    }
};
