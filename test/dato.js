/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-02 12:55
 */


'use strict';

var dato = require('../libs/dato.js');

describe('dato', function () {
    it('gravatar', function () {
        var ga = dato.gravatar('cloudcome@163.com');

        console.log(ga);
    });
});

