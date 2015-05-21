/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-20 21:25
 */


'use strict';

var qiniu = require('../libs/qiniu.js');


qiniu.config({
    access_key: '1',
    secret_key: '2',
    bucket: '3',
    host: 'http://s.example.com'
});

var kat = qiniu.generateKeyAndToken();
console.log(kat);
