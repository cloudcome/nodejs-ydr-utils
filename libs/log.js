/**
 * nodejs 日志系统
 * @author ydr.me
 * @create 2016-01-19 14:12
 */


'use strict';

var util = require('util');
var colors = require('colors/safe.js');

var allocation = require('../libs/allocation.js');

var log = function (wrapper, prefix, args) {
    args = allocation.args(args);
    args.unshift(prefix);
    args.unshift('prefix');
    args.unshift('%s %s\n%s\n');

    var str = '';
    try {
        str = wrapper(util.format.apply(util, args));
    } catch (err) {
        str = err.stack;
        return exports.error(str);
    }

    process.stdout.write(str);
};


exports.warn = function () {
    log(colors.yellow, '[WARN]', arguments);
};


exports.error = function () {
    log(colors.red, '[ERROR]', arguments);
};
