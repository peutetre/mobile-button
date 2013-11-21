/**
 * index.js - mobile-button module
 */

(function (definition) {
    if (typeof exports === "object") {
        module.exports = definition();
    } else {
        mobile-button = definition();
    }
})(function () {
    return function () {
        return "this is module mobile-button";
    };
});
