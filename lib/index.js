/*
 * index.js - mobile-button module
 */

"use strict";

var MousedownButton = require('./mouse/default/down-button'),
    MouseupButton = require('./mouse/default/up-button'),
    MouseupOnScrollableYButton = require('./mouse/scrollable-y/up-button'),
    MouseupOnScrollableXButton = require('./mouse/scrollable-x/up-button'),

    TouchstartButton = require('./touch/default/touchstart-button'),
    TouchendButton = require('./touch/default/touchend-button'),
    TouchendOnScrollableYButton = require('./touch/scrollable-y/touchend-button'),
    TouchendOnScrollableXButton = require('./touch/scrollable-x/touchend-button'),

    PointerstartButton = require('./pointer/default/start-button'),
    PointerendButton = require('./pointer/default/end-button'),
    PointerendOnScrollableYButton = require('./pointer/scrollable-y/end-button'),
    PointerendOnScrollableXButton = require('./pointer/scrollable-x/end-button'),

    touchable = 'ontouchstart' in window,
    hasPointerEvents = !!window.MSPointerEvent || !!window.PointerEvent;

module.exports = {
    Touchstart : touchable ? TouchstartButton : (hasPointerEvents ? PointerstartButton : MousedownButton),
    Touchend : touchable ? TouchendButton : (hasPointerEvents ? PointerendButton : MouseupButton),
    ScrollableY : {
        Touchend : touchable ? TouchendOnScrollableYButton : (hasPointerEvents ? PointerendOnScrollableYButton : MouseupOnScrollableYButton)
    },
    ScrollableX : {
        Touchend : touchable ? TouchendOnScrollableXButton : (hasPointerEvents ? PointerendOnScrollableXButton : MouseupOnScrollableXButton)
    }
};
