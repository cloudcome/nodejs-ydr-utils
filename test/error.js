/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-09 15:11
 */


'use strict';

var assert = require('assert');

var error = require('../libs/error.js');
var log = require('../libs/log.js');


describe('error', function () {
    it('config', function () {
        var ret = error.config(401, {
            message: '呵呵',
            abc: 123
        });

        console.log(ret);
    });

    it('create', function () {
        var err = error(401);

        log.error(err);
        assert.equal(err.abc, 123);
        assert.equal(err.status, undefined);
        assert.equal(err.type, undefined);
        assert.equal(err.message, '呵呵');
        assert.equal(err.stack !== '', true);
    });
});


