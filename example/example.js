/*
 * example.js
 */

var Q = require('q'),
    qstart = require('qstart'),
    MButton = require('../lib/index.js');

function main() {
    var btnEl1 = document.getElementById('start1'),
        ƒ1 = function (evt) {
            console.log('start touchstart ƒ');
            return Q.delay(1000).then(function () {
                console.log('end touchstart ƒ');
                return;
            });
        },
        btn1 = new MButton.Touchstart({
            el : btnEl1,
            f : ƒ1
        });

    btn1.bind();
}

qstart.then(main).done();
