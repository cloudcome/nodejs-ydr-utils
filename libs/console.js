/**
 * 修正 global.console，以便可以在不同的环境打印不同级别的日志
 * @author ydr.me
 * @create 2015-12-10 21:35
 */


'use strict';


var allocation = require('./allocation.js');
var dato = require('./dato.js');
var typeis = require('./typeis.js');
var date = require('./date.js');
var string = require('./string.js');
var log = require('./log.js');
var console = global.console;

var configs = {
    // 是否颜色输出
    // PM2 环境不建议输出颜色，否则日志文件内有很多颜色代码
    color: true
};


/**
 * 配置
 * @returns {*}
 */
exports.config = function () {
    return allocation.getset({
        get: function (key) {
            return configs[key];
        },
        set: function (key, val) {
            configs[key] = val;
        }
    }, arguments);
};


var wrapper = function (color) {
    if (configs.color) {
        return log[color];
    }

    return log.normal;
};


console.log = function () {
    wrapper('normal').apply(console, arguments);
};


console.success = function () {
    wrapper('green').apply(console, arguments);
};


//var pros = ['log', 'info', 'warn', 'error'];
//var defaults = {
//    whiteList: pros,
//    prefix: function () {
//        return '[' + date.format('YYYY-MM-DD HH:mm:ss:SSS') + ']';
//    }
//};
//var colorMap = {
//    log: log.normal,
//    info: log.cyan,
//    warn: log.yellow,
//    error: log.red
//};
//
//
//module.exports = function (options) {
//    if (typeis.Array(options)) {
//        options = {
//            whiteList: options
//        };
//    }
//
//    options = dato.extend({}, defaults, options);
//    var whiteMap = {};
//
//    options.whiteList.forEach(function (can) {
//        whiteMap[can] = true;
//    });
//
//    var old = global.console.log;
//    pros.forEach(function (pro) {
//        if (whiteMap[pro]) {
//            var pro2 = pro.toUpperCase();
//            pro2 = '[' + pro2 + ']';
//            pro2 = string.padRight(pro2, 8);
//
//            global.console[pro] = function () {
//                var args = allocation.args(arguments);
//
//                if (typeis.Function(options.prefix)) {
//                    args.unshift(options.prefix());
//                }
//
//                args.unshift(pro2);
//                args = args.map(function (item) {
//                    return colorMap[pro](item);
//                });
//                old.apply(global.console, args);
//            };
//        } else {
//            global.console[pro] = function () {
//                // ignore
//            };
//        }
//    });
//
//    return global.console;
//};
//
//
///**
// * 打点
// * @param str
// */
//global.console.point = function (str) {
//    str = String(str);
//    try {
//        process.stdout.clearLine();
//        process.stdout.cursorTo(0);
//    } catch (err) {
//        // ignore
//    }
//    process.stdout.write(str);
//};
//global.console.pointEnd = function () {
//    try {
//        process.stdout.clearLine();
//        process.stdout.cursorTo(0);
//    } catch (err) {
//        // ignore
//    }
//};
//
//
//var lineCursor = 0;
//global.console.lineStart = function () {
//    lineCursor = 0;
//};
///**
// * 打线
// * @param str
// */
//global.console.line = function (str) {
//    str = String(str);
//    try {
//        process.stdout.cursorTo(lineCursor);
//    } catch (err) {
//        // ignore
//    }
//    process.stdout.write(str);
//    lineCursor += str.length;
//};
//global.console.lineEnd = function (clear) {
//    lineCursor = 0;
//
//    if (clear) {
//        global.console.pointEnd();
//    } else {
//        process.stdout.write('\n');
//    }
//};
//
//var dictionaries = ['-', '\\', '|', '/', '-', '\\', '|', '/'];
//var timer = 0;
//global.console.loading = function (interval, _dictionaries) {
//    if (timer) {
//        global.console.loadingEnd();
//    }
//
//    var args = allocation.args(arguments);
//    var times = 0;
//
//    if (args.length === 1 && typeis.Array(args[0])) {
//        _dictionaries = args[0];
//        interval = null;
//    }
//
//    interval = interval || 80;
//    _dictionaries = _dictionaries || dictionaries;
//    var length = _dictionaries.length - 1;
//    timer = setInterval(function () {
//        var index = times % length;
//        global.console.point(_dictionaries[index]);
//        times++;
//    }, interval);
//};
//global.console.loadingEnd = function () {
//    clearInterval(timer);
//    timer = 0;
//    global.console.pointEnd();
//};
