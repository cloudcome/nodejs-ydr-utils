/**
 * 命令行分析器
 * @author ydr.me
 * @create 2015-10-29 15:29
 */


'use strict';

var dato = require('./dato.js');

var REG_LONG_ARG = /^--/;
var REG_SHORT_ARG = /^-/;

module.exports = function (argv) {
    var result = {
        node: argv.shift(),
        cwd: argv.shift(),
        input: argv.join(' '),
        command: null,
        args: {}
    };
    var lastArg = null;

    dato.each(argv, function (index, arg) {
        arg = arg.trim();

        if (!arg) {
            return;
        }

        if (REG_LONG_ARG.test(arg)) {
            lastArg = arg.slice(2);
            result.args[lastArg] = true;
        } else if (REG_SHORT_ARG.test(arg)) {
            lastArg = arg.slice(1);
            dato.repeat(lastArg.length, function (index) {
                var shortArg = lastArg[index];
                result.args[shortArg] = true;
            });
        } else if (lastArg) {
            result.args[lastArg] = arg;
            lastArg = null;
        } else {
            result.command = arg;
        }
    });

    return result;
};


