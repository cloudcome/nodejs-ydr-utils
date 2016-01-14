'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');


var request = require('../libs/request.js');


describe('request', function () {
    xit('get nogzip', function (done) {
        var url = 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=&json=1&p=3';

        request({
            debug: true,
            url: url
        })
            .on('error', function (err) {
                console.log('\n\n-------------------------------------');
                console.log('response error');
                console.error(err);
                done();
            })
            .on('body', function (body) {
                console.log('\n\n-------------------------------------');
                console.log('response body');
                console.log(body.slice(0, 200));
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
                console.log('\n\n-------------------------------------');
                console.log('response error');
                console.error(err);
                done();
            })
            .on('body', function (body) {
                console.log('\n\n-------------------------------------');
                console.log('response body');
                console.log(body.slice(0, 200));
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
                console.log('\n\n-------------------------------------');
                console.log('response error');
                console.error(err);
                done();
            })
            .on('body', function (body) {
                console.log('\n\n-------------------------------------');
                console.log('response body');
                console.log(body.slice(0, 200));
                assert.equal(/baidu/.test(body), true);
                done();
            });
    });

    it('download', function (done) {
        var url = 'https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/bd_logo1_31bdc765.png';
        var file1 = path.join(__dirname, 'request1.png');

        request({
            debug: true,
            method: 'get',
            url: url,
            query: {
                a: 1,
                b: 2
            },
            body: {
                c: 3,
                d: 4
            },
            encoding: 'binary'
        }).on('error', function (err) {
            console.log('\n\n-------------------------------------');
            console.log('response error');
            console.error(err);
            done();
        }).on('body', function (body) {
            console.log('\n\n-------------------------------------');
            console.log('response body');
            var file2 = path.join(__dirname, 'request2.png');
            fs.writeFileSync(file2, body, 'binary');
            done();
        }).on('response', function (res) {
            console.log('\n\n-------------------------------------');
            console.log('response headers');
            console.log(res.headers);
        }).pipe(fs.createWriteStream(file1));
    });
});

