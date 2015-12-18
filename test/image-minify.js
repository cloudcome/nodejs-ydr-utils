/**
 * 文件描述
 * @author ydr.me
 * @create 2015-12-18 12:08
 */


'use strict';

var fs = require('fs');
var path = require('path');

var imageMinify = require('../libs/image-minify.js');

var src = path.join(__dirname, 'image.gif');
var dest = path.join(__dirname, 'image.min.gif');

imageMinify.zhitu(src, {debug: true},function (err, stream) {
    stream.pipe(fs.createWriteStream(dest)).on('end', function () {
        console.log('pipe end');
    }).on('close', function () {
        console.log('pipe close');
    });
});

