'use strict';

var assert = require('assert');


var request = require('../libs/request.js');


describe('request', function () {
    it('get', function (done) {
        var url = 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=&json=1&p=3';

        request({
            debug: true,
            url: url
        })
            .on('error', function (err) {
                console.log(err);
                done();
            })
            .on('close', function () {
                console.log('close');
                done();
            })
            .on('end', function () {
                console.log('close');
                done();
            })
            .on('readable', function () {
                console.log('readable');
            })
            .on('data', function () {
                console.log('data');
            })
            .on('body', function (body) {
                console.log('baidu body');
                assert.equal(/baidu/.test(body), true);
                done();
            });
    });
});

