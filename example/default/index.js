/*
 * default-buttons.js
 */

var Q = require('q'),
    qstart = require('qstart'),
    MButton = require('../../lib/index.js');

function main() {
    var log1 = document.getElementById('log1'),
        log2 = document.getElementById('log2'),
        log3 = document.getElementById('log3'),
        log4 = document.getElementById('log4'),
        log5 = document.getElementById('log5'),
        log6 = document.getElementById('log6'),
        btnEl1 = document.getElementById('start1'),
        btnEl2 = document.getElementById('start2'),
        btnEl3 = document.getElementById('end1'),
        btnEl4 = document.getElementById('end2'),
        btnEl5 = document.getElementById('end3'),
        emptyƒ = function () { },
        ƒ = function (logEl, label) {
            return function (evt) {
                logEl.innerHTML = 'start ' + label;
                return Q.delay(1000).then(function () {
                    logEl.innerHTML = 'end ' + label;
                    return Q.delay(1000).then(function () {
                        logEl.innerHTML = '';
                    });
                });
            }
        },
        btn1 = new MButton.Touchstart({
            el : btnEl1,
            f : ƒ(log1, 'f')
        }),
        btn2 = new MButton.Touchstart({
            el : btnEl2,
            f : ƒ(log2, 'f')
        }),
        btn3 = new MButton.Touchend({
            el : btnEl3,
            f : ƒ(log3, 'f')
        }),
        btn4 = new MButton.Touchend({
            el : btnEl4,
            f : ƒ(log4, 'f')
        }),
        btn5 = new MButton.Push({
            el : btnEl5,
            f : ƒ(log5, 'f'),
            g : ƒ(log6, 'g')
        });

    var backBtn = new MButton.Touchend({
            el : document.getElementById('back'),
            f : function () {
                window.location = '../index.html';
            }
        })

    window.addEventListener('touchstart', function (evt) {
        evt.preventDefault();
    }, false);
}

qstart.then(main).done();
