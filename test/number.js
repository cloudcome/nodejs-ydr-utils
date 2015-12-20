/**
 * 文件描述
 * @author ydr.me
 * @create 2015-11-22 16:02
 */


'use strict';

var assert = require('assert');

var number = require('../libs/number.js');


describe('number', function () {
    it(62, function () {
        var a = 1000000;
        var number62 = number.to62(a);
        var number10 = number.from62(number62);

        assert.equal(number62, '4C92');
        assert.equal(number10, a);
    });
});

