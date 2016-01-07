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
        var q = new Queue();

        //setInterval(function () {
        var name = random.string();
        q.push(function (next) {
            setTimeout(function () {
                console.log(name, 'done')
                next();
            }, random.number(100, 400));
        }, function () {
            console.log(this);
        });
        //});

        q.start();
        q.on('done', done);
    });
});


