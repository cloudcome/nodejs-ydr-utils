/**
 * 文件描述
 * @author ydr.me
 * @create 2015-12-13 14:18
 */


'use strict';


var fs = require('fs');
var path = require('path');
var aliOSS = require('../libs/ali-oss.js');
var request = require('../libs/request.js');

aliOSS.config({
    accessKeyId: 'x',
    accessKeySecret: 'y',
    bucket: 'z',
    domain: 'z.com'
});

describe('ali-oss', function () {
    it('singature', function (done) {
        var ret = aliOSS.signature('put', '/test/image/im3.jpg');

        console.log(ret);
        done();
        //request.put({
        //    url: ret.requestURL,
        //    headers: ret.headers,
        //    body: fs.createReadStream(path.join(__dirname, './im.jpg'))
        //}, function (err, body, res) {
        //    console.log(this.options.headers);
        //    console.log(res.statusCode);
        //    console.log(res.headers);
        //    console.log(err);
        //    console.log(body);
        //    done();
        //});
    });
});



