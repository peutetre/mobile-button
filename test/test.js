/*
 * test.js
 */

require('./test-button');
require('./default/test-touchstart-button');

onload = function () {
    setTimeout(function () {
        // getting leaks on saucelabs with ff
        // mocha.checkLeaks();
        mocha.run();
    }, 1000);
};
