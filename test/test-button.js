var Button = require('../lib/button'),
    expect = require('expect.js');

describe('Button', function () {
    it('must be an function', function () {
        expect(Button).to.be.an('function');
    });

    describe('instance', function () {
        it('should have a setF method', function () {
            var btn = new Button({ autobind:false, f: function () { } });
            expect(btn.setF).to.be.an('function');
        });
        it('should raise an Error when calling .setF() with not a function as argument', function () {
            var btn = new Button({ autobind:false });
            expect(function () { btn.setF(1); }).to.throwException('Button setF method needs a f function as argument.');
        });
        it('should raise an Error when calling .setEl() when button is active', function() {
            var btn = new Button({ autobind:false });
            // fake active state
            btn.active = true;
            expect(function () { btn.setEl(document.createElement('div')); })
                .to.throwException("Can't change dom element, button is active.");
        });
        it('should raise an Error when calling .setEl() without DOM element as argument', function() {
            var btn = new Button({ autobind:false });
            expect(function () { btn.setEl(); })
                .to.throwException("Button setEl method needs a dom element as argument.");
        });
        it('should raise an Error when calling .bind() if it\'s not initialized', function() {
            var btn = new Button({ autobind:false });
            expect(function () { btn.bind(); })
                .to.throwException("Can't bind an uninitialized button.");
        });
        it('should raise an Error when calling .unbind() if it\'s not initialized', function() {
            var btn = new Button({ autobind:false });
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
        it('.setEl should return the button', function () {
            var btn = new Button({
                f : function () {},
                autobind : false
            });
            expect(btn.setEl(document.createElement('div'))).to.be.equal(btn);
        });
        it('.setF should return the button', function () {
            var btn = new Button({
                el : document.createElement('div'),
                autobind : false
            });
            expect(btn.setF(function () {})).to.be.equal(btn);
        });
    });
});
