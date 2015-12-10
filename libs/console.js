/**
 * 修正 global.console，以便可以在不同的环境打印不同级别的日志
 * @author ydr.me
 * @create 2015-12-10 21:35
 */


'use strict';

var colors = require('colors');

var allocation = require('./allocation.js');
var dato = require('./dato.js');
var typeis = require('./typeis.js');
var date = require('./date.js');
var string = require('./string.js');


var pros = ['log', 'info', 'warn', 'error'];
var defaults = {
    whiteList: pros,
    prefix: function () {
        return '[' + date.format('YYYY-MM-DD HH:mm:ss:SSS') + ']';
    }
};
var colorMap = {
    log: function (item) {
        return item;
    },
    info: colors.cyan,
    warn: colors.yellow,
    error: colors.red
};


module.exports = function (options) {
    if (typeis.Array(options)) {
        options = {
            whiteList: options
        };
    }

    options = dato.extend({}, defaults, options);
    var whiteMap = {};

    options.whiteList.forEach(function (can) {
        whiteMap[can] = true;
    });

    var old = global.console.log;
    pros.forEach(function (pro) {
        if (whiteMap[pro]) {
            var pro2 = pro.toUpperCase();
            pro2 = '[' + pro2 + ']';
            pro2 = string.padRight(pro2, 8);

            global.console[pro] = function () {
                var args = allocation.args(arguments);

                if (typeis.Function(options.prefix)) {
                    args.unshift(options.prefix());
                }

                args.unshift(pro2);
                args = args.map(function (item) {
                    return colorMap[pro](item);
                });
                old.apply(global.console, args);
            };
        } else {
            global.console[pro] = function () {
                // ignore
            };
        }
    });
};



