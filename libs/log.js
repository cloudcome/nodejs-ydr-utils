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
    process.stdout.write(wrapper(util.format.apply(util, args)));
};


exports.warn = function () {
    log(colors.yellow, '[WARN]', arguments);
};
