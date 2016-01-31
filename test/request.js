'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');

var request = require('../libs/request.js');
var random = require('../libs/random.js');
var FormData = require('form-data');
var http = require('http');

var delay = function (callback) {
    setTimeout(callback, 500);
};


describe('request', function () {
    it('get nogzip', function (done) {
        var url = 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=&json=1&p=3';

        request({
            debug: true,
            url: url
        }).on('error', function (err) {
            console.log('\n\n-------------------------------------');
            console.log('response error');
            console.error(err);
            done();
        }).on('body', function (body) {
            console.log('\n\n-------------------------------------');
            console.log('response body');
            console.log(body.slice(0, 200));
            assert.equal(/baidu/.test(body), true);
            done();
        });
    });

    it('get gzip', function (done) {
        var url = 'https://www.baidu.com';

        request({
            debug: true,
            url: url
        }).on('error', function (err) {
            console.log('\n\n-------------------------------------');
            console.log('response error');
            console.error(err);
            done();
        }).on('body', function (body) {
            console.log('\n\n-------------------------------------');
            console.log('response body');
            console.log(body.slice(0, 200));
            assert.equal(/baidu/.test(body), true);
            done();
        });
    });

    it('get 30x', function (done) {
        var url = 'https://baidu.com';

        request({
            debug: true,
            url: url
        }).on('error', function (err) {
            console.log('\n\n-------------------------------------');
            console.log('response error');
            console.error(err);
            done();
        }).on('body', function (body) {
            console.log('\n\n-------------------------------------');
            console.log('response body');
            console.log(body.slice(0, 200));
            assert.equal(/baidu/.test(body), true);
            done();
        });
    });

    it('download', function (done) {
        var url = 'https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/bd_logo1_31bdc765.png';
        var file = path.join(__dirname, 'request2.png');

        request({
            url: url,
            encoding: 'binary'
        }).on('body', function (body) {
            fs.writeFileSync(file, body);
            done();
        }).on('error', function (err) {
            console.log('\n\n-------------------------------------');
            console.log('response error');
            console.error(err);
            done();
        });
    });

    it('tmall', function (done) {
        var url = 'http://detail.m.tmall.com/item.htm?id=525112500172';

        var req = request({
            debug: true,
            url: url,
            cookies: {
                _tb_token_: '9JGzuptnBbCf',
                cookie2: '7dfb3f2bfda25390e64dc59867ae0bf2',
                t: '8e804a3b6310a204c90c8998ed1f3bf3'
            }
        }).on('error', function (err) {
            console.log('\n\n-------------------------------------');
            console.log('response error');
            console.error(err);
            done();
        }).on('body', function (body) {
            console.log('\n\n-------------------------------------');
            console.log('response body');
            console.log(req.getRedirectHistory());
            console.log(req.getCookies());
            console.log(body.slice(0, 200));
            assert.equal(/tmall/.test(body), true);
            done();
        });
    });

    it('browser false', function (done) {
        var url = 'https://baidu.com';

        request({
            debug: true,
            url: url,
            browser: false
        }).on('response', function (res) {
            done();
        }).on('error', function (err) {
            console.log('\n\n-------------------------------------');
            console.log('response error');
            console.error(err);
            done();
        });
    });

    it('pipe to', function (done) {
        var url = 'https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/bd_logo1_31bdc765.png';
        var file = path.join(__dirname, 'request1.png');

        request({
            url: url,
            debug: true
        }).on('error', function (err) {
            console.log('\n\n-------------------------------------');
            console.log('response error');
            console.error(err);
            done();
        }).pipe(fs.createWriteStream(file)).on('close', function () {
            done();
        }).on('error', function () {
            console.log('error');
            done();
        });
    });

    it('pipe from 1', function (done) {
        var file = path.join(__dirname, 'image.png');
        var url = 'http://baidu.com/';
        var req = request({
            debug: true,
            url: url,
            method: 'post'
        });

        req.formData('user', 'cloudcome');
        req.formData('file', function () {
            return fs.createReadStream(file);
        }, 'image.png');

        req.on('body', function (body) {
            console.log(body);
            done();
        }).on('error', function (err) {
            console.log('\n\n-------------------------------------');
            console.log('response error');
            console.error(err);
            done();
        });
    });

    it('pipe from 2', function (done) {
        var file = path.join(__dirname, 'image.png');
        var fd = new FormData();

        fd.append('user', 'cloudcome');
        fd.append('file', fs.createReadStream(file), {
            contentType: 'image/png'
        });

        var url = 'http://www.baidu.com/';
        var req = request({
            debug: true,
            url: url,
            method: 'post',
            headers: fd.getHeaders({})
        });

        fd.pipe(req).on('error', function (err) {
            console.log('\n\n-------------------------------------');
            console.log('response error');
            console.error(err);
            done();
        }).on('response', function () {
            done();
        });
    });

    it('callback', function (done) {
        var url = 'https://detail.tmall.com/item.htm?id=525112500172';

        request({
            debug: true,
            url: url
        }, function (err, body, res) {
            if (err) {
                console.log('\n\n-------------------------------------');
                console.log('response error');
                console.error(err);
                done();
                return;
            }

            console.log('\n\n-------------------------------------');
            console.log('response body');
            console.log(body.slice(0, 200));
            assert.equal(/tmall/.test(body), true);
            done();
        });
    });
});

