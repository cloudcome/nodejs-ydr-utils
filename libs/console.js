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


var pros = ['log', 'info', 'warn', 'error'];
var defaults = {
    whiteList: pros,
    prefix: function () {
        return '[' + date.format('YYYY-MM-DD HH:mm:ss:SSS') + ']';
    }
};


module.exports = function (options) {
    options = dato.extend({}, defaults, options);
    var whiteMap = {};

    options.whiteList.forEach(function (can) {
        whiteMap[can] = true;
    });

    pros.forEach(function (pro) {
        if (whiteMap[pro]) {
            var old = global.console[pro];
            var pro2 = pro.toUpperCase();

            global.console[pro] = function () {
                var args = allocation.args(arguments);

                args.unshift('[' + pro2 + ']');

                if (typeis.Function(options.prefix)) {
                    args.unshift(options.prefix());
                }

                old.apply(global.console, arguments);
            };
        } else {
            global.console[pro] = function () {
                // ignore
            };
        }
    });
};



