/**
 * 文件描述
 * @author ydr.me
 * @create 2015-12-18 12:08
 */


'use strict';

var fs = require('fs');
var path = require('path');

var imageMinify = require('../libs/image-minify.js');

var src = path.join(__dirname, 'title.png');
var dest = path.join(__dirname, 'title.min.png');

imageMinify.zhitu(src, function (err, stream) {
    fs.writeFile(dest, stream);
});

