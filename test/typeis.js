/**
 * 文件描述
 * @author ydr.me
 * @create 2015-11-28 11:09
 */


'use strict';

var assert = require('assert');

var typeis = require('../libs/typeis.js');

describe('typeis', function () {
    it('localIP', function () {
        var ret1 = typeis.localIP('192.168.1.1');
        var ret2 = typeis.localIP('127.0.0.1');
        var ret3 = typeis.localIP('11.0.0.1');

        assert.equal(ret1, true);
        assert.equal(ret2, true);
        assert.equal(ret3, false);
    });
});





