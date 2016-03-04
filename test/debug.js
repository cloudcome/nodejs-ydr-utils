/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 14:38
 */


'use strict';

var debug = require('../libs/debug.js');


describe('debug', function () {
    it('print', function () {
        debug.error('error', '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!\n' +
            '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!\n' +
            '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!');
        debug.primary('primaryprimaryprimaryprimary', '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!\n' +
            '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!\n' +
            '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!');
        debug.warn('warn', '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!');
        debug.success('success', '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!');
        debug.success('successsuccesssuccesssuccesssuccesssuccesssuccess[]', '春风吹北风吹春风吹北\n风吹春风吹北风吹 hello world!');
        debug.normal('normal', '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!');
        debug.ignore('ignore', '春风吹北风吹春风吹北风吹春风吹北风吹 hello world!');
    });

    it('progress', function (done) {
        var i = 0;
        var j = 20;
        var next = function () {
            if (i > j) {
                debug.progressEnd('find', '');
                done();
                return;
            }

            debug.progress('go', i, {
                color: 'red'
            });
            i++;
            setTimeout(next, 500);
        };

        next();
    });
});
