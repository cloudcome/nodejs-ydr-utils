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


/**
 * 颜色包装
 * @param color
 * @returns {*}
 */
var wrapper = function (color) {
    if (configs.color) {
        return log[color];
    }

    return log.normal;
};


/**
 * 普通日志
 */
console.log = function () {
    log.out(wrapper('normal').apply(console, arguments));
};


/**
 * 消息日志
 */
console.info = function () {
    log.out(wrapper('green').apply(console, arguments));
};


/**
 * 警告日志
 */
console.warn = function () {
    log.out(wrapper('yellow').apply(console, arguments));
};


/**
 * 错误日志
 */
console.error = function () {
    log.out(wrapper('red').apply(console, arguments));
};


/**
 * 打点
 * @param str
 */
console.point = function (str) {
    str = String(str) || '.';
    try {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
    } catch (err) {
        // ignore
    }
    process.stdout.write(str);
};
console.pointEnd = function () {
    try {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
    } catch (err) {
        // ignore
    }
};


var lineCursor = 0;
console.lineStart = function () {
    lineCursor = 0;
};
/**
 * 打线
 * @param str
 */
console.line = function (str) {
    str = String(str) || '=';
    try {
        process.stdout.cursorTo(lineCursor);
    } catch (err) {
        // ignore
    }
    process.stdout.write(str);
    lineCursor += str.length;
};
console.lineEnd = function (clear) {
    lineCursor = 0;

    if (clear) {
        global.console.pointEnd();
    } else {
        process.stdout.write('\n');
    }
};

var dictionaries = ['-', '\\', '|', '/', '-', '\\', '|', '/'];
var timer = 0;
console.loading = function (interval, _dictionaries) {
    if (timer) {
        global.console.loadingEnd();
    }

    var args = allocation.args(arguments);
    var times = 0;

    if (args.length === 1 && typeis.Array(args[0])) {
        _dictionaries = args[0];
        interval = null;
    }

    interval = interval || 80;
    _dictionaries = _dictionaries || dictionaries;
    var length = _dictionaries.length - 1;
    timer = setInterval(function () {
        var index = times % length;
        global.console.point(_dictionaries[index]);
        times++;
    }, interval);
};
console.loadingEnd = function () {
    clearInterval(timer);
    timer = 0;
    global.console.pointEnd();
};
