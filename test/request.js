'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');

var request = require('../libs/request.js');
var random = require('../libs/random.js');
var request2 = require('request');
var FormData = require('form-data');
//var request3 = require('superagent');
var http = require('http');
var ur = require('url');

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
        });
    });

    it('tmall', function (done) {
        var url = 'https://detail.tmall.com/item.htm?id=525112500172';

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
        });
    });

    it('pipe to', function (done) {
        var url = 'https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/bd_logo1_31bdc765.png';
        var file = path.join(__dirname, 'request1.png');

        request({
            url: url,
            debug: true
        }).pipe(fs.createWriteStream(file)).on('close', function () {
            done();
        });
    });

    it('pipe from 1', function (done) {
        var file = path.join(__dirname, 'image.png');
        var url = 'http://baidu.com/';
        var req = request({
            debug: true,
            url: url,
            method: 'post',
            timeout: 3000
        });

        req.form('user', 'cloudcome');
        req.form('file', function () {
            return fs.createReadStream(file);
        }, 'image.png');

        req.on('body', function (body) {
            console.log(body);
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
            timeout: 2000,
            headers: fd.getHeaders({})
        });

        fd.pipe(req);
        delay(done);
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

