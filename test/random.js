/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-21 21:17
 */


'use strict';

var assert = require('assert');

var random = require('../libs/random.js');


describe('random', function () {
    it('number', function () {
        var ret = random.number(1, 10);
        assert.equal(ret >= 1, true);
        assert.equal(ret <= 10, true);
    });

    it('string', function () {
        assert.equal(random.string().length, 6);
    });

    it('guid', function () {
        assert.equal(random.guid().length, 16);
    });
});




