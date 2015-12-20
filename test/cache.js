/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-01 21:15
 */


'use strict';

var assert = require('assert');

var cache = require('../libs/cache.js');


describe('cache', function () {
    it('=', function (done) {
        var time = Date.now();
        cache.set('a', 1, 1000, function () {
            console.log('timeout');
        });

        assert.equal(cache.get('a'), 1);

        cache.increase('a', 2);
        assert.equal(cache.get('a'), 3);

        cache.set('b', 'he');
        assert.equal(cache.get('b'), 'he');

        cache.remove('b');
        assert.equal(cache.get('b'), undefined);

        setTimeout(function () {
            assert.equal(cache.get('a'), undefined);
            assert.equal(Date.now() - time > 1000, true);
            done();
        }, 1100);
    });
});


