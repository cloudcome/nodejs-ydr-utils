/**
 * 文件描述
 * @author ydr.me
 * @create 2015-12-10 21:42
 */


'use strict';

require('../libs/console.js');


describe('console', function () {
    it('1', function () {
        console.log('log 日志');
        console.info('info 日志');
        console.warn('warn 日志');
        console.error('If the JavaScript Console window is closed, you can open it while you\'re debugging in ... Does not clear script that you entered into the console input prompt.');
    });

    it('point', function () {
        var points = ['-', '=', '>', '|', '<', '='];
        var times = 0;
        var time = setInterval(function () {
            var index = times % (points.length - 1);
            console.point(points[index]);

            if (times === 30) {
                clearInterval(time);
                console.pointEnd();
            }

            times++;
        }, 100);
    });

    it('loading', function () {
        console.loading();
        setTimeout(function () {
            console.loadingEnd();
        }, 5000);
    });

    it('line', function () {
        var times = 0;
        console.lineStart();
        var timer = setInterval(function () {
            console.line('=');
            times++;

            if (times === 20) {
                console.lineEnd(true);
                clearInterval(timer);
            }
        }, 100);
    });
});



