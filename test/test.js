/*
 * test.js
 */

require('./test-button');
require('./default/test-touchstart-button');
require('./default/test-touchend-button');

onload = function () {
    setTimeout(function () {
        // getting leaks on saucelabs with ff
        // mocha.checkLeaks();
        mocha.run();
    }, 1000);
};
