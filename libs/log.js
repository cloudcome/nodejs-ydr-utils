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

var log = function (wrapper, prefix, args) {
    args = allocation.args(args);
    args.unshift('%s');

    var str = colors.cyan(util.format('\n\n[%s] %s\n', date.format('YYYY-MM-DD HH:mm:ss.SSS'), prefix));

    try {
        str += wrapper(util.format.apply(util, args));
    } catch (err) {
        return exports.error(err);
    }

    process.stdout.write(str + '\n');
};


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


exports.warn = function () {
    log(colors.yellow, '[WARN]', arguments);
};


exports.error = function () {
    var args = allocation.args(arguments);

    dato.each(args, function (index, arg) {
        if (arg && arg instanceof Error) {
            var msg = arg.stack || arg.message || String(arg);
            dato.each(arg, function (key, val) {
                if (key !== 'stack' && key !== 'message') {
                    msg += '\n' + key + ': ' + val;
                }
            });
            args[index] = msg;
            return false;
        }
    });

    log(colors.red, '[ERROR]', args);
};
