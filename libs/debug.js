/**
 * 命令行日志
 * @author ydr.me
 * @create 2015-10-22 10:21
 */


'use strict';


var colors = require('colors/safe.js');

var dato = require('./dato.js');
var string = require('./string.js');


//console.log(colors.black('black'));
//console.log(colors.red('red'));
//console.log(colors.green('green'));
//console.log(colors.yellow('yellow'));
//console.log(colors.blue('blue'));
//console.log(colors.magenta('magenta'));
//console.log(colors.cyan('cyan'));
//console.log(colors.white('white'));
//console.log(colors.gray('gray'));
//console.log(colors.grey('grey'));
//
//
//console.log(colors.bgBlack('bgBlack'));
//console.log(colors.bgRed('bgRed'));
//console.log(colors.bgGreen('bgGreen'));
//console.log(colors.bgYellow('bgYellow'));
//console.log(colors.bgBlue('bgBlue'));
//console.log(colors.bgMagenta('bgMagenta'));
//console.log(colors.bgCyan('bgCyan'));
//console.log(colors.bgWhite('bgWhite'));
//
//
//console.log(colors.reset('reset'));
//console.log(colors.bold('bold'));
//console.log(colors.dim('dim'));
//console.log(colors.italic('italic'));
//console.log(colors.underline('underline'));
//console.log(colors.inverse('inverse'));
//console.log(colors.hidden('hidden'));
//console.log(colors.strikethrough('strikethrough'));
//
//
//console.log(colors.rainbow('rainbow'));
//console.log(colors.zebra('zebra'));
//console.log(colors.america('america'));
//console.log(colors.trap('trap'));
//console.log(colors.random('random'));

var REG_BREAK_LINE = /[\n\r]/g;
var configs = {
    eventLength: 20,
    eventAlign: 'right',
    arrow: ' => '
};


/**
 * 对齐消息
 * @param alignLength
 * @param msg
 * @param colorWrapper
 * @returns {*}
 */
var alignMsg = function (alignLength, msg, colorWrapper) {
    var msg2 = '';
    var space = '\n';

    dato.repeat(alignLength + configs.arrow.length, function () {
        space += ' ';
    });

    var messageList = String(msg).split(REG_BREAK_LINE);

    messageList.forEach(function (msg, index) {
        if (index) {
            msg2 += space + colorWrapper(msg);
        } else {
            msg2 += colorWrapper(msg);
        }
    });

    return msg2;
};


/**
 * 打印消息
 * @param type
 * @param event
 * @param msg
 */
var debug = function (type, event, msg) {
    var arrow = colors.blue.bold(configs.arrow);
    event = configs.eventAlign === 'left' ?
        string.padRight(event, configs.eventLength, '') :
        string.padLeft(event, configs.eventLength, '');

    var eventLength = event.length;

    event = colors.bold.cyan(event);
    switch (type) {
        case 'error':
            msg = alignMsg(eventLength, msg, colors.bold.red);
            break;

        case 'primary':
            msg = alignMsg(eventLength, msg, colors.bold.magenta);
            break;

        case 'warn':
            msg = alignMsg(eventLength, msg, colors.bold.yellow);
            break;

        case 'success':
            msg = alignMsg(eventLength, msg, colors.bold.green);
            break;

        default :
            msg = alignMsg(eventLength, msg, colors.bold.white);
            break;
    }

    console.log(event + arrow + msg);
};


module.exports = debug;


/**
 * 配置
 * @param _configs
 */
module.exports.config = function (_configs) {
    dato.extend(configs, _configs);
};


/**
 * 打印错误日志
 * @param event
 * @param message
 */
module.exports.error = module.exports.danger = function (event, message) {
    debug('error', event, message);
};


/**
 * 打印主要日志
 * @param event
 * @param message
 */
module.exports.primary = function (event, message) {
    debug('primary', event, message);
};


/**
 * 打印信息日志
 * @param event
 * @param message
 */
module.exports.info = module.exports.success = function (event, message) {
    debug('success', event, message);
};


/**
 * 打印警告日志
 * @param event
 * @param message
 */
module.exports.warn = module.exports.warning = function (event, message) {
    debug('warn', event, message);
};


/**
 * 打印普通日志
 * @param event
 * @param message
 */
module.exports.normal = module.exports.secondary = function (event, message) {
    debug('normal', event, message);
};





