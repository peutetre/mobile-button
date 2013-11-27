var TouchendBtn = require('../../lib/index').Touchend,
    Q = require('q'),
    expect = require('expect.js');

describe('default/TouchendButton', function () {
    it('must be an function', function () {
        expect(TouchendBtn).to.be.an('function');
    });
});
