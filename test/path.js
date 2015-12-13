/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-09-01 19:38
 */


'use strict';

var assert = require('assert');

var path = require('../libs/path.js');

describe('libs/path', function () {
    it('join', function () {
        assert.equal(path.join('\\a\\b', '../d/f'), 'd/f');
    });

    it('relative', function () {
        assert.equal(path.relative('\\a\\b', '../d/f'), '../../d/f');
    });

    //it('glob', function () {
    //    var files = path.glob([
    //        '*.js',
    //        '*.js'
    //    ], {
    //        srcDirname: __dirname
    //    });
    //
    //    console.log(files);
    //});

    it('path', function () {
        var ret1 = path.joinURI('http://abc.com', 'def/123');
        var ret2 = path.joinURI('http://abc.com', 'http://def/123');
        var ret3 = path.joinURI('http://abc.com/p1/p2/p3', '../pp');

        assert.equal(ret1, 'http://abc.com/def/123');
        assert.equal(ret2, 'http://def/123');
        assert.equal(ret3, 'http://abc.com/p1/p2/pp');
    });
});


