/**
 * 命令行执行器
 * @author ydr.me
 * @create 2015-10-29 15:29
 */


'use strict';

var dato = require('./dato.js');
var allocation = require('./allocation.js');
var typeis = require('./typeis.js');

var REG_LONG_ARG = /^--/;
var REG_SHORT_ARG = /^-/;
var NODE_EXEC_PATH = process.execPath;
var CWD = process.cwd();

// 别名配置
var aliasConfigs = {};

// 命令函数 map
var commanFunctionMap = {};

// 无法识别的命令回调
var elseFunction = function () {
    // noop
};

/**
 * 解析命令行参数
 * @param argv
 * @returns {{node: String, cwd: String, input: string, command: String, args: {}}}
 */
exports.parse = function (argv) {
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

        var relArg = null;

        if (REG_LONG_ARG.test(arg)) {
            lastArg = arg.slice(2);
            relArg = aliasConfigs[lastArg] || lastArg;
            result.args[relArg] = true;
        } else if (REG_SHORT_ARG.test(arg)) {
            lastArg = arg.slice(1);
            dato.repeat(lastArg.length, function (index) {
                var shortArg = lastArg[index];

                relArg = aliasConfigs[shortArg] || shortArg;
                result.args[relArg] = true;
            });
        } else if (lastArg) {
            relArg = aliasConfigs[lastArg] || lastArg;
            result.args[relArg] = arg;
            lastArg = null;
        } else {
            result.command = arg;
        }
    });

    if (!exports.exec(result.command, result.args, result)) {
        elseFunction.call(result, result.command, result.args);
    }

    return result;
};


/**
 * 设置命令行参数别名
 * @returns {*}
 */
exports.alias = function () {
    return allocation.getset({
        get: function (key) {
            return aliasConfigs[key];
        },
        set: function (key, val) {
            aliasConfigs[key] = val;
        }
    }, arguments);
};


/**
 * 匹配命令
 * @param command {String} 命令
 * @param callback {Function} 回调
 * @returns {Object}
 */
exports.if = function (command, callback) {
    if (typeis.function(callback)) {
        commanFunctionMap[command] = callback;
    }

    return exports;
};


/**
 * 未匹配的命令
 * @param callback {Function} 回调
 * @returns {Object}
 */
exports.else = function (callback) {
    if (typeis.function(callback)) {
        elseFunction = callback;
    }

    return exports;
};


/**
 * 手动执行某条命令
 * @param command {String} 命令名称
 * @param [args] {Object} 参数
 * @param [context] {Object} 上下文
 * @return {Object}
 */
exports.exec = function (command, args, context) {
    if (command && commanFunctionMap[command]) {
        args = args || {};
        context = context || {
                node: NODE_EXEC_PATH,
                cwd: CWD,
                command: command,
                args: args
            };
        commanFunctionMap[command].call(context, args);
        return true;
    }

    return false;
};

