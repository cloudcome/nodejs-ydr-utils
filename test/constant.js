/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-09-27 15:32
 */


'use strict';

var assert = require('assert');

var constant = require('../libs/constant.js');

describe('constant', function () {
    it('a', function () {
        var o = constant('a', {
            b: 1
        });

        assert.equal(o.a.b, 1);

        try {
            o.a.b = 2;
        } catch (err) {
            // ignore
        }

        assert.equal(o.a.b, 1);
    });
});

