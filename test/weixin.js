/**
 * 文件描述
 * @author ydr.me
 * @create 2015-12-08 11:48
 */


'use strict';

var weixin = require('../libs/weixin.js');


weixin.config({
    cache: false,
    appId: '1',
    secret: '2'
});

weixin.getSignature('http://123.com', function (err, signature) {
    if(err){
        console.log(err.stack);
        return;
    }

    console.log(signature);
});
