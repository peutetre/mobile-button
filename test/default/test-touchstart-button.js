var TouchstartBtn = require('../../lib/index').Touchstart,
    Q = require('q'),
    expect = require('expect.js');

describe('default/TouchstartButton', function () {
    it('must be an function', function () {
        expect(TouchstartBtn).to.be.an('function');
    });

    describe('instance', function () {
        it('should raise an Error when calling .bind() if already binded', function () {
            var btn = new TouchstartBtn({
                    el : document.createElement('div'),
                    f : function () { }
                });
            btn.bind();
            expect(function () { btn.bind(); }).to.throwException("Can't bind an already binded button.");
        });
        it('should raise an Error when calling .unbind() if unbinded', function () {
            var btn = new TouchstartBtn({
                    el : document.createElement('div'),
                    f : function () { }
                });
            expect(function () { btn.unbind(); }).to.throwException("Can't unbind a unbinded button.");
        });
        it('can not be activated if already activated', function (done) {
            var i = 0,
                btn = new TouchstartBtn({
                    el : document.createElement('div'),
                    f : function () { i = i+1; return Q.delay(200); }
                });
            btn.bind();
            // first fake activation
            btn.onTouchstart({});
            setTimeout(function () {
                // second activation while the first is not done
                btn.onTouchstart({});
            },100);
            setTimeout(function () {
                expect(i).to.be(1);
                done();
            },300);
        });
        it('should delay 1000 ms the execution of the callback if delay option set to 1000', function (done) {
            this.timeout(1500);

            var flag = false,
                btn = new TouchstartBtn({
                    el : document.createElement('div'),
                    f : function () { flag = true; },
                    delay : 1000
                });
            btn.bind();
            // fake activation
            btn.onTouchstart({});
            setTimeout(function () {
                expect(flag).to.be(false);
            },500);
            setTimeout(function () {
                expect(flag).to.be(true);
                done();
            },1100);
        });
        it('should add the `.active` css class on the underlying DOM element when active', function (done) {
            var btn = new TouchstartBtn({
                el : document.createElement('div'),
                f : function () { return Q.delay(200); }
            });

            btn.bind();
            // fake activation
            btn.onTouchstart({});

            setTimeout(function () {
                expect(btn.el.classList.contains('active')).to.be(true);
                done();
            },100);
        });
        it('should remove the `.active` css class on the underlying DOM element when callback ended', function (done) {
            var btn = new TouchstartBtn({
                el : document.createElement('div'),
                f : function () { return Q.delay(100); }
            });

            btn.bind();
            // fake activation
            btn.onTouchstart({});

            setTimeout(function () {
                expect(btn.el.classList.contains('active')).to.be(false);
                done();
            },200);
        });
        it('.bind should return the button', function () {
            var btn = new TouchstartBtn({
                el : document.createElement('div'),
                f : function () { }
            });
            expect(btn.bind()).to.be.equal(btn);
        });
        it('.unbind should return the button', function () {
            var btn = new TouchstartBtn({
                el : document.createElement('div'),
                f : function () { }
            });
            expect(btn.bind().unbind()).to.be.equal(btn);
        });
    });
});
