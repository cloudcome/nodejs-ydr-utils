/**
 * nodejs 日志系统
 * @author ydr.me
 * @create 2016-01-19 14:12
 */


'use strict';

var util = require('util');
var colors = require('colors/safe.js');

var allocation = require('../libs/allocation.js');
var date = require('../libs/date.js');
var dato = require('../libs/dato.js');
var string = require('../libs/string.js');


// ==========================================
// ================[ configs ]===============
// ==========================================

var configs = {
    whiteList: ['log', 'warn', 'success', 'error'],
    whiteMap: {},
    placeholders: {}
};

var buildWhiteMap = function () {
    configs.whiteMap = {};
    dato.each(configs.whiteList, function (index, key) {
        configs.whiteMap[key] = true;
    });
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

            if (key === 'whiteList') {
                buildWhiteMap();
            }
        }
    }, arguments);
};
buildWhiteMap();


/**
 * 配置 placeholder
 * @returns {*}
 */
exports.placeholder = function () {
    return allocation.getset({
        get: function (key) {
            return configs.placeholders[key];
        },
        set: function (key, val) {
            configs.placeholders[key] = val;
        }
    }, arguments);
};


// ==========================================
// ================[ wrapper ]===============
// ==========================================
/**
 * 颜色包装器
 * @param color
 * @returns {Function}
 */
var makeColor = function (color) {
    return function () {
        var msg = util.format.apply(util, arguments);
        var args = [];

        args.push('\x1b[' + util.inspect.colors[color][0] + 'm%s\x1b[' + util.inspect.colors[color][1] + 'm');
        args.push(msg);

        return util.format.apply(util, args);
    };
};


// color
exports.red = makeColor('red');
exports.cyan = makeColor('cyan');
exports.green = makeColor('green');
exports.yellow = makeColor('yellow');
exports.magenta = makeColor('magenta');

// style
exports.bold = makeColor('bold');
exports.italic = makeColor('italic');
exports.underline = makeColor('underline');


// ==========================================
// ================[ output ]================
// ==========================================


/**
 * 日志出口
 * @param wrapper
 * @param prefix
 * @param args
 */
var log = function (wrapper, prefix, args) {
    args = allocation.args(args);
    args.unshift('%s');

    var str = colors.cyan(util.format('\n\n[%s] %s\n', date.format('YYYY-MM-DD HH:mm:ss.SSS'), prefix));

    try {
        str += wrapper(util.format.apply(util, args));
    } catch (err) {
        err.mmmmm = 123;
        return exports.error(err);
    }

    process.stdout.write(str + '\n');
};


/**
 * 普通日志
 */
exports.info = function () {
    log(function (str) {
        return str;
    }, '[INFO]', arguments);
};


/**
 * 警告日志
 */
exports.warn = function () {
    log(colors.yellow, '[WARN]', arguments);
};


/**
 * 错误日志
 */
exports.error = function () {
    var args = allocation.args(arguments);
    var defaultErrorKey = {
        type: true,
        message: true,
        name: true,
        stack: true
    };

    dato.each(args, function (index, arg) {
        if (arg && arg instanceof Error) {
            var msg = arg.stack || arg.message || String(arg);
            var name = arg.name || 'Error';
            dato.each(arg, function (key, val) {
                if (!defaultErrorKey[key]) {
                    msg += '\n' + name + ' ' + key + ': ' + val;
                }
            });
            args[index] = msg;
            return false;
        }
    });

    log(colors.red, '[ERROR]', args);
};
