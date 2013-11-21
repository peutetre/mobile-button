/*
 * test.js
 */

require('./test-button');
require('./default/test-touchstart-button');

onload = function () {
    setTimeout(function () {
        mocha.checkLeaks();
        mocha.run();
    }, 1000);
};
