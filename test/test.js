/*
 * test.js
 */

require('./test-button');
require('./touch/default/test-touchstart-button');
require('./touch/default/test-touchend-button');
require('./touch/scrollable-x/test-touchend-button');
require('./touch/scrollable-y/test-touchend-button');

onload = function () {
    setTimeout(function () {
        // getting leaks on saucelabs with ff
        // mocha.checkLeaks();
        mocha.run();
    }, 1000);
};
