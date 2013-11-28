/*
 * index.js
 */

var Q = require('q'),
    qstart = require('qstart'),
    MButton = require('../../lib/index.js');

function main() {
    var backBtn = new MButton.Touchend({
            el : document.getElementById('back'),
            f : function () {
                window.location = '../index.html';
            }
        })

    backBtn.bind();

    window.addEventListener('touchstart', function (evt) {
        evt.preventDefault();
    }, false);
}

qstart.then(main).done();
