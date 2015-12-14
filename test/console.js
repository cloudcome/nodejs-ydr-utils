/**
 * 文件描述
 * @author ydr.me
 * @create 2015-12-10 21:42
 */


'use strict';

require('../libs/console.js');

var points = ['-', '\\', '|', '/', '-', '\\', '|', '/'];

//console.log('log 日志');
//console.info('info 日志');
//console.warn('warn 日志');
//console.error('If the JavaScript Console window is closed, you can open it while you\'re debugging in ... Does not clear script that you entered into the console input prompt.');

//console.error('start');
////console.lineStart();
//var times = 0;
//var time = setInterval(function () {
//    var index = times % (points.length - 1);
//    //console.error(index);
//    console.point(points[index]);
//
//    if (times === 60) {
//        clearInterval(time);
//        console.pointEnd();
//        console.error('end');
//    }
//
//    times++;
//}, 100);


//console.loading();
//setTimeout(function () {
//    console.loadingEnd();
//}, 10000);



var times = 0;
var timer = setInterval(function () {
    console.line('=');
    times++;

    if(times === 40){
        console.lineEnd();
        clearInterval(timer);
    }
}, 100);

