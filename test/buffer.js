/**
 * 文件描述
 * @author ydr.me
 * @create 2015-12-21 13:36
 */


'use strict';

var assert = require('assert');

var buffer = require('../libs/buffer.js');

describe('buffer.js', function () {
    it('.isUTF8', function () {
        var str1 = new Buffer('呵呵', 'utf-8');
        var str2 = new Buffer('呵呵', 'base64');
        var ret1 = buffer.isUTF8(str1);
        var ret2 = buffer.isUTF8(str2);

        assert.equal(ret1, true);
        assert.equal(ret2, false);
    });
});

