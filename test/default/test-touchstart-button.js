var TouchstartBtn = require('../../lib/index').Touchstart,
    expect = require('expect.js');

describe('TouchstartButton', function () {
    it('must be an function', function () {
        expect(TouchstartBtn).to.be.an('function');
    });

    describe('instance', function () {
        it.skip('should raise an Error when calling .bind() if already binded', function () {

        });
        it.skip('should raise an Error when calling .unbind() if unbinded', function () {

        });
        it.skip('is active until the returned promise of the callback is resolved', function () {

        });
        it.skip('can not be activated if already activated', function () {

        });
        it.skip('should delay 1000 ms the execution of the callback if delay option set to 1000', function () {

        });
    });
});

