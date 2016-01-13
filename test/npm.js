/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-29 18:02
 */


'use strict';

var assert = require('assert');

var npm = require('../libs/npm.js');

describe('libs/npm.js', function () {
    it('.getLatestVersion', function (done) {
        var name = 'coolie';
        npm.getLatestVersion(name, function (err, version, packageJSON) {
            console.log(name, 'latest version is', version);
            assert.equal(!err, true);
            assert.equal(version !== '', true);
            done();
        });
    });
});



