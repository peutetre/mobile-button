/*
 * default-buttons.js
 */

var Q = require('q'),
    qstart = require('qstart'),
    MButton = require('../../../lib/index.js');

function main() {
    var log1 = document.getElementById('log1'),
        log2 = document.getElementById('log2'),
        log3 = document.getElementById('log3'),
        log4 = document.getElementById('log4'),
        btnEl1 = document.getElementById('start1'),
        btnEl2 = document.getElementById('start2'),
        btnEl3 = document.getElementById('end1'),
        btnEl4 = document.getElementById('end2'),
        emptyƒ = function () { },
        ƒ = function (logEl) {
            return function (evt) {
                logEl.innerHTML = 'start ƒ';
                return Q.delay(1000).then(function () {
                    logEl.innerHTML = 'end ƒ';
                    return Q.delay(1000).then(function () {
                        logEl.innerHTML = '';
                    });
                });
            }
        },
        btn1 = new MButton.Touchstart({
            el : btnEl1,
            monotouchable: true,
            f : ƒ(log1)
        }),
        btn2 = new MButton.Touchstart({
            el : btnEl2,
            monotouchable: true,
            f : ƒ(log2)
        }),
        btn3 = new MButton.Touchend({
            el : btnEl3,
            monotouchable: true,
            f : ƒ(log3)
        }),
        btn4 = new MButton.Touchend({
            el : btnEl4,
            monotouchable: true,
            f : ƒ(log4)
        });

    var backBtn = new MButton.Touchend({
            el : document.getElementById('back'),
            monotouchable: true,
            f : function () {
                window.location = '../../index.html';
            }
        })

    window.addEventListener('touchstart', function (evt) {
        evt.preventDefault();
    }, false);
}

qstart.then(main).done();
