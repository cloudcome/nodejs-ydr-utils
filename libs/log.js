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


exports.red = function () {
    var args = allocation.args(arguments);

    args.unshift('\x1b[' + util.inspect.colors.red[0] + 'm%s\x1b[' + util.inspect.colors.red[1] + 'm');
    var str = util.format.apply(util, args);
    process.stdout.write(str + '\n');
};


exports.warn = function () {
    log(colors.yellow, '[WARN]', arguments);
};


exports.error = function () {
    log(colors.red, '[ERROR]', arguments);
};
