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

var REG_BREAK_LINE = /[\n\r]/g;
var configs = {
    nameLength: 20,
    nameAlign: 'right',
    nameArrow: ' >> '
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


var debugBuilder = function (color) {
    return function (name, desc, options) {
        var nameLines = [];
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
        console.log(console.styles.pretty(name, 'cyan'),
            options.nameArrow,
            console.styles.pretty(desc, [color, 'bold']));
    };
};


exports.primary = exports.success = debugBuilder('green');
exports.warning = exports.warn = debugBuilder('yellow');
exports.error = exports.danger = debugBuilder('red');
exports.normal = debugBuilder();
exports.ignore = debugBuilder('grey');


