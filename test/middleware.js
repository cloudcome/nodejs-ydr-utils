/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-30 15:52
 */


'use strict';

var assert = require('assert');

var Middleware = require('../libs/middleware.js');

describe('utils/middleware.js', function () {
    it('e', function (done) {
        var md = new Middleware();

        md.use(function (file, options, next) {
            options.code += '2';
            next();
        });

        md.use(function (file, options, next) {
            options.code += '3';
            next();
        });

        md.exec(__filename, {
            code: '1'
        }, function (file, options) {
            console.log(arguments);
            assert.equal(options.code, '123');
            done();
        });
    });
});


