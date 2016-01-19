/**
 * nodejs 日志系统
 * @author ydr.me
 * @create 2016-01-19 14:12
 */


'use strict';

var util = require('util');
var colors = require('colors/safe.js');

var log = function (prefix, args) {
    args.unshift(prefix);
    args.unshift('%s %s\n');
    process.stdout.write(util.format.apply(util, args));
};


exports.warn = function () {
    log('[WARN]', arguments);
};
