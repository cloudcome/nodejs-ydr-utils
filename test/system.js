/**
 * 文件描述
 * @author ydr.me
 * @create 2015-11-28 11:09
 */


'use strict';

var assert = require('assert');

var system = require('../libs/system.js');

describe('system', function () {
    it('localIP', function () {
        var ip = system.localIP();

        console.log(ip);
        assert.equal(ip !== '', true);
    });

    it('remoteIP', function (done) {
        system.remoteIP(function (err, ip) {
            console.log(ip.replace(/\./g, '。'));
            assert.equal(ip !== '', true);
            done();
        });
    });

    it('parseIP', function (done) {
        system.parseIP(function (err, info) {
            console.log(info);
            done();
        });
    });

    it('info', function (done) {
        system.info(function (info) {
            console.log(info);
            done();
        });
    });
});





