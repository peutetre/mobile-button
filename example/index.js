/*
 * index.js
 */

var Q = require('q'),
    qstart = require('qstart'),
    MButton = require('../lib/index.js');

function main() {
    var defaultBtn = new MButton.Touchend({
            el : document.getElementById('default'),
            f : function () {
                window.location = 'default/index.html';
            }
        }),
        scrollablexBtn = new MButton.Touchend({
            el : document.getElementById('scrollablex'),
            f : function () {
                window.location = 'scrollable-x/index.html';
            }
        }),
        scrollableyBtn = new MButton.Touchend({
            el : document.getElementById('scrollabley'),
            f : function () {
                window.location = 'scrollable-y/index.html';
            }
        });

    window.addEventListener('touchstart', function (evt) {
        evt.preventDefault();
    }, false);
}

qstart.then(main).done();
