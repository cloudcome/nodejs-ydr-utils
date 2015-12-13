/**
 * 文件描述
 * @author ydr.me
 * @create 2015-12-13 14:18
 */


'use strict';


var aliOSS = require('../libs/ali-oss.js');

aliOSS.config({

});

describe('ali-oss', function () {
    it('singature', function () {
        var ret = aliOSS.signature('put', '/abc/def/123.jpg');

        console.log(ret);
    });
});



