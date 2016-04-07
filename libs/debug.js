/**
 * debug
 * @author ydr.me
 * @create 2015-10-22 10:21
 */


'use strict';

var util = require('util');

var typeis = require('./typeis.js');
var dato = require('./dato.js');
var string = require('./string.js');
var allocation = require('./allocation.js');
require('./console.js');

var configs = {
    nameLength: 20,
    nameAlign: 'right',
    nameArrow: ' >> ',
    colors: []
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


var debugFormat = function (color) {
    return function (name, desc, options) {
        var nameLines = [];

        name = console.styles.format(name);
        desc = console.styles.format(desc);
        options = dato.extend({}, configs, options);

        if (name.length > options.nameLength) {
            while (name.length > options.nameLength) {
                var temp = name.slice(0, options.nameLength);
                name = name.slice(options.nameLength);
                nameLines.push(temp);
            }

            if (name.length) {
                nameLines.push(name);
            }
        } else {
            nameLines = [name];
        }

        var lastName = nameLines[nameLines.length - 1];

        nameLines[nameLines.length - 1] = options.nameAlign === 'left' ?
            string.padRight(lastName, options.nameLength) :
            string.padLeft(lastName, options.nameLength);
        name = nameLines.join('\n');

        var descLines = desc.split('\n');
        var space = new Array(options.nameLength + 1 + options.nameArrow.length + 2).join(' ');

        dato.each(descLines, function (index, line) {
            if (index > 0) {
                descLines[index] = space + line;
            }
        });

        desc = descLines.join('\n');
        return console.styles.format(console.styles.pretty(name, 'blue', 'bold'),
            console.styles.pretty(options.nameArrow, 'grey'),
            console.styles.pretty(desc, color, options.colors));
    };
};


/**
 * 打印
 * @param formatter
 * @returns {Function}
 */
var debugPrint = function (formatter) {
    return function () {
        console.log(formatter.apply(global, arguments));
    };
};

/**
 * 输出主要类型消息
 * @type {Function}
 */
exports.primary = debugPrint(debugFormat('magenta'));


/**
 * 输出成功类型消息
 * @type {Function}
 */
exports.success = exports.info = debugPrint(debugFormat('green'));


/**
 * 输出警告类型消息
 * @type {Function}
 */
exports.warning = exports.warn = debugPrint(debugFormat('yellow'));


/**
 * 输出错误类型消息
 * @type {Function}
 */
exports.error = exports.danger = debugPrint(debugFormat('red'));


/**
 * 输出普通类型消息
 * @type {Function}
 */
exports.normal = debugPrint(debugFormat());


/**
 * 输出不紧要类型消息
 * @type {Function}
 */
exports.ignore = debugPrint(debugFormat('grey'));


/**
 * 等待消息
 * @param name
 * @param desc
 * @param options
 */
exports.wait = function (name, desc, options) {
    console.point(debugFormat()(name, desc, options));
};


/**
 * 等待结束
 * @param name
 * @param desc
 * @param options
 */
exports.waitEnd = function (name, desc, options) {
    console.pointEnd();

    if (name) {
        console.log(debugFormat()(name, desc, options));
    }
};
