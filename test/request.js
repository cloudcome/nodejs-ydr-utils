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

    xit('get 30x', function (done) {
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

    it('timeout', function (done) {
        var url = 'http://192.168.0.161:10000/';

        request({
            debug: true,
            method: 'post',
            url: url,
            query: {
                a: 1,
                b: 2
            },
            body: {
                c: 3,
                d: 4
            },
            headers: {
                'content-type': 'application/json'
            }
        }).on('error', function (err) {
            console.error(err);
            done();
        }).on('body', function (body) {
            console.log('response', body.slice(0, 200));
            done();
        });
    });
});

