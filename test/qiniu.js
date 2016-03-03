/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-20 21:25
 */


'use strict';

var assert = require('assert');

var qiniu = require('../libs/qiniu.js');


describe('7niu', function () {
    it('signature', function () {
        qiniu.config({
            access_key: '-',
            secret_key: '-',
            bucket: 'fed-community',
            host: 'https://dn-fed.qbox.me/@/',
            dirname: '/res/'
        });

        var sign = qiniu.signature('abc.jpg');

        assert.equal(sign.key, 'res/abc.jpg');
        assert.equal(sign.url, 'https://dn-fed.qbox.me/@/res/abc.jpg');
    });
});


