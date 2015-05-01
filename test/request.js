'use strict';

var req = require('../libs/request.js');
var path = require('path');
var file = path.join(__dirname, 'alien.zip');
var fs = require('fs');
var writeStream = fs.createWriteStream(file);
var url = 'http://s-ydr-me.oss-cn-hangzhou.aliyuncs.com/p/j/alien.zip';
var unzip = require('unzip');

//var http = require('http');
//
//http.get(url, function (res) {
//    res.pipe(writeStream);
//});

req.down({
    url: url,
    timeout: 100000
}, function (err, stream, res) {
    stream.pipe(writeStream);
    //stream.pipe(unzip2.Extract({ path: 'output/path' })).on('error', function (err) {
    //    console.log(err);
    //    console.log(err.stack);
    //}).on('close', function () {
    //    console.log('zip close');
    //    process.exit();
    //});
});
