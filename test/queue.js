/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-06 23:24
 */


'use strict';

var Queue = require('../libs/queue.js');
var random = require('../libs/random.js');

describe('queue.js', function () {
    it('e', function (done) {
        var q = new Queue({
            auto: true
        });

        var i = 10;

        while (i--) {
            q.push(function (next) {
                setTimeout(function () {
                    console.log(random.string(), 'done');
                    next();
                }, random.number(100, 1000));
            });
        }

        q.start();
        q.on('done', function () {
            console.log('is done');
            done();
        });
    });
});


