var Button = require('../lib/button'),
    expect = require('expect.js');

describe('Button', function () {
    it('must be an function', function () {
        expect(Button).to.be.an('function');
    });

    describe('instance', function () {
        it('should be initialized if options contains a function and a dom element', function () {
            var btn = new Button({
                f : function () { },
                el : document.createElement('div')
            });
            expect(btn.initialized).to.be(true);
        });
        it('should have a set method', function () {
            var btn = new Button({ f: function () { } });
            expect(btn.set).to.be.an('function');
        });
        it('should raise an Error when calling .set() with not a function as argument', function () {
            var btn = new Button();
            expect(function () { btn.set(1); }).to.throwException('Button set method needs a f function as argument.');
        });
        it('should raise an Error when calling .attachTo() when button is active', function() {
            var btn = new Button();
            // fake active state
            btn.active = true;
            expect(function () { btn.attachTo(document.createElement('div')); })
                .to.throwException("Can't change dom element, button is active.");
        });
        it('should raise an Error when calling .attachTo() without DOM element as argument', function() {
            var btn = new Button();
            expect(function () { btn.attachTo(); })
                .to.throwException("Button attachTo method needs a dom element as argument.");
        });
        it('should raise an Error when calling .bind() if it\'s not initialized', function() {
            var btn = new Button();
            expect(function () { btn.bind(); })
                .to.throwException("Can't bind an uninitialized button.");
        });
        it('should raise an Error when calling .unbind() if it\'s not initialized', function() {
            var btn = new Button();
            expect(function () { btn.unbind(); })
                .to.throwException("Can't unbind an uninitialized button.");
        });
        it('should have a setActive() to style the dom element and set active', function () {
            var btn = new Button({
                f : function () {},
                el : document.createElement('div')
            });

            btn.setActive(true);
            expect(btn.el.className).to.be.equal('active');
            expect(btn.active).to.be(true);

            btn.setActive(false);
            expect(btn.el.className).to.be.equal('');
            expect(btn.active).to.be(false);
        });
    });
});
