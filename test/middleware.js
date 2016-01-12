/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-30 15:52
 */


'use strict';

var assert = require('assert');

var Middleware = require('../libs/middleware.js');

describe('utils/middleware.js', function () {
    it('async', function (done) {
        var md = new Middleware();

        md.use(function m1(file, options, next) {
            console.log('do m1');
            options.code += '2';
            setTimeout(function () {
                next(null);
            }, 1000);
        });

        md.use(function m2(file, options, next) {
            console.log('do m2');
            options.code += '3';
            setTimeout(function () {
                next();
            }, 1000);
        });

        md.catchError(function (err, middleware) {
            err.name = middleware.name;
            return err;
        });

        md.exec(__filename, {
            code: '1'
        }, function (err, file, options) {
            assert.equal(!err, true);
            assert.equal(options.code, '123');
            done();
        });
    });

    xit('sync', function () {
        var md = new Middleware({
            async: false
        });

        md.use(function (options) {
            options.code += '2';

            return options1;
        });

        md.use(function (options) {
            options.code += '3';

            return options;
        });

        md.on('error', function (err) {
            console.error(err);
        });

        var options = md.exec({
            code: '1'
        });

        console.log(options);
        assert.equal(options.code, '123');
    });
});



