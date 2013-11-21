var Button = require('../lib/button'),
    expect = require('expect.js');

describe('Button', function () {
    it('must be an function', function () {
        expect(Button).to.be.an('function');
    });
});

describe('button, an instance of Button', function () {
    it('should raise an Error when given options has no f attribute', function () {
        expect(function () { new Button(); }).to.throwException("Button options needs a f function.");
    });
    it('should have a set method', function () {
        var btn = new Button({ f: function () { } });
        expect(btn.set).to.be.an('function');
    });
});
