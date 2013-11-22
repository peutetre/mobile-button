/*
 * example.js
 */

var Q = require('q'),
    qstart = require('qstart'),
    MButton = require('../lib/index.js');

function main() {
    var log1 = document.getElementById('log1'),
        log2 = document.getElementById('log2'),
        btnEl1 = document.getElementById('start1'),
        btnEl2 = document.getElementById('start2'),
        ƒ = function (logEl) {
            return function (evt) {
                logEl.innerHTML = 'start ƒ';
                return Q.delay(1000).then(function () {
                    logEl.innerHTML = 'end ƒ';
                    Q.delay(1000).then(function () {
                        logEl.innerHTML = '';
                    });
                    return;
                });
            }
        },
        btn1 = new MButton.Touchstart({
            el : btnEl1,
            f : ƒ(log1)
        }),
        btn2 = new MButton.Touchstart({
            el : btnEl2,
            f : ƒ(log2)
        });

    btn1.bind();
    btn2.bind();
}

qstart.then(main).done();
