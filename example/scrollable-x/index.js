/*
 * index.js
 */

var Q = require('q'),
    qstart = require('qstart'),
    IScroll = require('iscroll'),
    MButton = require('../../lib/index.js');

function main() {
    var h1 = document.querySelector('h1'),
        scrollView = new IScroll('#wrapper', {
            scrollX: true, scrollY: false, mouseWheel: true, disableMouse: true
        }),
        backBtn = new MButton.Touchend({
            el : document.getElementById('back'),
            f : function () {
                window.location = '../index.html';
            }
        }),
        btn1 = new MButton.ScrollableX.Touchend({
            tolerance: 10,
            el : document.getElementById('btn1'),
            f : function () {
                h1.style.color = 'rgb(219, 96, 96)';
            }
        }),
        btn2 = new MButton.ScrollableX.Touchend({
            tolerance: 10,
            el : document.getElementById('btn2'),
            f : function () {
                 h1.style.color = 'rgb(77, 158, 77)';
            }
        }),
        btn3 = new MButton.ScrollableX.Touchend({
            tolerance: 10,
            el : document.getElementById('btn3'),
            f : function () {
                h1.style.color = 'rgb(77, 136, 182)';
            }
        });
}

qstart.then(main).done();
