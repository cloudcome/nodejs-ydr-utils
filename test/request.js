'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');

var request = require('../libs/request.js');
//var request2 = require('request');
//var request3 = require('superagent');
var http = require('http');
var ur = require('url');
var FormData = require('form-data');


describe('request', function () {
    xit('get nogzip', function (done) {
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

    xit('get gzip', function (done) {
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

    xit('get 30x', function (done) {
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

    xit('pipe to', function (done) {
        var url = 'https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/bd_logo1_31bdc765.png';
        var file = path.join(__dirname, 'request1.png');

        request(url).on('data', function (chunk) {
            console.log('data', chunk.length);
        }).on('close', function () {
            console.log('closed');
        }).on('end', function () {
            console.log('end');
        }).pipe(fs.createWriteStream(file));
    });

    xit('download', function (done) {
        var url = 'https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/bd_logo1_31bdc765.png';
        var file = path.join(__dirname, 'request2.png');

        request({
            url: url,
            encoding: 'binary'
        }).on('body', function (body) {
            fs.writeFileSync(file, body);
            done();
        }).on('data', function (chunk) {
            console.log('data', chunk.length);
        }).on('close', function () {
            console.log('closed');
        }).on('end', function () {
            console.log('end');
        });
    });

    xit('tmall', function (done) {
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

    xit('browser', function (done) {
        var url = 'https://baidu.com';

        request({
            debug: true,
            url: url,
            browser: false
        }).on('response', function (res) {
            done();
        });
    });

    xit('browser', function (done) {
        var url = 'https://baidu.com';

        request({
            debug: true,
            url: url,
            browser: false
        }).on('response', function (res) {
            done();
        });
    });

    it('pipe from1', function (done) {
        var file = fs.readFileSync(path.join(__dirname, 'image.png'));
        var fd = new FormData();

        fd.append('file', file, {
            contentType: 'image/png',
            filename: 'image.png'
        });
        fd.append('user', 'cloudcome');

        var url = 'http://192.168.0.162:10000/3/';
        var req = request({
            debug: true,
            url: url,
            method: 'post',
            strean: fd,
            timeout: 2000
        });

        req.on('response', function (res) {
            console.log(res.headers);
        }).on('body', function (body) {
            console.log(body);
            done();
        });
    });
});

