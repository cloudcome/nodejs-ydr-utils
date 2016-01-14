'use strict';

var assert = require('assert');


var request = require('../libs/request.js');


describe('request', function () {
    xit('get nogzip', function (done) {
        var url = 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=&json=1&p=3';

        request({
            debug: true,
            url: url
        })
            .on('error', function (err) {
                console.error(err);
                done();
            })
            .on('body', function (body) {
                console.log('response', body.slice(0, 200));
                assert.equal(/baidu/.test(body), true);
                done();
            });
    });

    xit('get gzip', function (done) {
        var url = 'https://www.baidu.com';

        request({
            debug: true,
            url: url
        })
            .on('error', function (err) {
                console.error(err);
                done();
            })
            .on('body', function (body) {
                console.log('response', body.slice(0, 200));
                assert.equal(/baidu/.test(body), true);
                done();
            });
    });

    it('get 30x', function (done) {
        var url = 'https://baidu.com';

        request({
            debug: true,
            url: url
        })
            .on('error', function (err) {
                console.error(err);
                done();
            })
            .on('body', function (body) {
                console.log('response', body.slice(0, 200));
                assert.equal(/baidu/.test(body), true);
                done();
            });
    });
});

