/**
 * 修正 global.console，以便可以在不同的环境打印不同级别的日志
 * @author ydr.me
 * @create 2015-12-10 21:35
 */


'use strict';

var allocation = require('./allocation.js');
var typeis = require('./typeis.js');


module.exports = function (whiteList, prefix) {
    var args = allocation.args(arguments);
    var pros = ['log', 'info', 'warn', 'error'];

    if(args.length === 1){
        if(typeof args[0] === 'string'){

        }
    }

    whiteList = whiteList || pros;

    var whiteMap = {};

    whiteList.forEach(function (can) {
        whiteMap[can] = true;
    });

    pros.forEach(function (pro) {
        if (whiteMap[pro]) {
            var old = global.console[pro];
            global.console[pro] = function () {
                old.apply(global.console, arguments);
            };
        } else {
            global.console[pro] = function () {
                // ignore
            };
        }
    });
};



