/**
 * 文件描述
 * @author ydr.me
 * @create 2015-12-10 21:42
 */


'use strict';

var howdo = require('howdo');

require('../libs/console.js');
var dato = require('../libs/dato.js');


describe('console', function () {
    it('color', function () {
        dato.each(console.colors, function (color) {
            console.log(console.colors[color](color));
        });
    });


    it('out', function () {
        console.config({
            //color: false,
            //level: ['error']
        });
        console.log('--------------------');
        console.log();
        console.log();
        console.log('--------------------');
        console.log('log 日志', {a: 1}, new Error('b'));
        console.info('info 日志', {a: 1}, new Error('b'));
        console.warn('warn 日志', {a: 1}, new Error('b'));
        console.error('error 日志', {a: 1}, new Error('b'));
        console.table([
            ['#', 'dqwd', 'dqw'],
            ['1', 'dqw', '99'],
            ['2', 'dqwdqwdqwdqw', '919'],
            ['3', '中文中文中文中文中文', '91119']
        ], {
            colors: ['red', 'bold', 'inverse']
        });
    });

    //it('串行', function (done) {
    //    howdo
    //        .task(function (done) {
    //            var points = ['-', '=', '>', '|', '<', '='];
    //            var times = 0;
    //            var time = setInterval(function () {
    //                var index = times % (points.length - 1);
    //                console.point(points[index]);
    //
    //                if (times === 30) {
    //                    clearInterval(time);
    //                    console.pointEnd();
    //                    done();
    //                }
    //
    //                times++;
    //            }, 100);
    //        })
    //        .task(function (done) {
    //            console.loading();
    //            setTimeout(function () {
    //                console.loadingEnd();
    //                done();
    //            }, 5000);
    //        })
    //        .task(function (done) {
    //            var times = 0;
    //            console.lineStart();
    //            var timer = setInterval(function () {
    //                console.line('=');
    //                times++;
    //
    //                if (times === 20) {
    //                    console.lineEnd(true);
    //                    clearInterval(timer);
    //                    done();
    //                }
    //            }, 100);
    //        })
    //        .follow(done);
    //});
});



