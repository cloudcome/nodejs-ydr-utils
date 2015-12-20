/**
 * 文件描述
 * @author ydr.me
 * @create 2015-12-08 11:48
 */


'use strict';

var weixin = require('../libs/weixin.js');

describe('weixin', function () {
    it('signature', function (done) {
        weixin.config({
            cache: false,
            appId: '1',
            secret: '2'
        });

        weixin.getJSSDKSignature('http://123.com', function (err, signature) {
            console.log(signature);
            done();
        });
    });
});


