var TouchstartBtn = require('../../lib/index').Touchstart,
    expect = require('expect.js');

describe('TouchstartButton', function () {
    it('must be an function', function () {
        expect(TouchstartBtn).to.be.an('function');
    });
});

