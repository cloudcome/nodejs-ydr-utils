/**
 * 命令行日志
 * @author ydr.me
 * @create 2015-10-22 10:21
 */


'use strict';


var typeis = require('./typeis.js');
var dato = require('./dato.js');
var string = require('./string.js');
var log = require('./log.js');

var REG_BREAK_LINE = /[\n\r]/g;
var configs = {
    eventLength: 20,
    eventAlign: 'right',
    eventArrow: ' >> '
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

    dato.repeat(alignLength + configs.eventArrow.length, function () {
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
 * @param [options] {Object} 配置
 */
var debug = function (type, event, msg, options) {
    if (typeis.boolean(options)) {
        options = {
            alignInverse: true
        };
    }

    options = dato.extend({}, configs, options);

    var eventArrow = colors.gray(options.eventArrow);
    var eventAlign = options.eventAlign;

    if (options.alignInverse) {
        eventAlign = eventAlign === 'left' ? 'right' : 'left';
    }

    event = eventAlign === 'left' ?
        string.padRight(event, options.eventLength, '') :
        string.padLeft(event, options.eventLength, '');

    var eventLength = event.length;

    var event2 = colors.yellow(event);
    switch (type) {
        case 'error':
            msg = alignMsg(eventLength, msg, colors.bgRed);
            break;

        case 'primary':
            msg = alignMsg(eventLength, msg, colors.cyan);
            break;

        case 'warn':
            msg = alignMsg(eventLength, msg, colors.magenta);
            break;

        case 'success':
            msg = alignMsg(eventLength, msg, colors.green);
            break;

        case 'normal':
            msg = alignMsg(eventLength, msg, colors.white);
            break;

        default :
            event2 = colors.grey(event);
            msg = alignMsg(eventLength, msg, colors.grey);
            break;
    }

    console.log(event2 + eventArrow + msg);
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
 * @param event {String} 事件名称
 * @param message {String} 事件内容
 * @param [options] {Object} 配置
 */
module.exports.error = module.exports.danger = function (event, message, options) {
    debug('error', event, message, options);
};


/**
 * 打印主要日志
 * @param event {String} 事件名称
 * @param message {String} 事件内容
 * @param [options] {Object} 配置
 */
module.exports.primary = function (event, message, options) {
    debug('primary', event, message, options);
};


/**
 * 打印成功日志
 * @param event {String} 事件名称
 * @param message {String} 事件内容
 * @param [options] {Object} 配置
 */
module.exports.info = module.exports.success = function (event, message, options) {
    debug('success', event, message, options);
};


/**
 * 打印警告日志
 * @param event {String} 事件名称
 * @param message {String} 事件内容
 * @param [options] {Object} 配置
 */
module.exports.warn = module.exports.warning = function (event, message, options) {
    debug('warn', event, message, options);
};


/**
 * 打印普通日志
 * @param event {String} 事件名称
 * @param message {String} 事件内容
 * @param [options] {Object} 配置
 */
module.exports.normal = module.exports.secondary = function (event, message, options) {
    debug('normal', event, message, options);
};


/**
 * 打印忽略日志
 * @param event {String} 事件名称
 * @param message {String} 事件内容
 * @param [options] {Object} 配置
 */
module.exports.ignore = function (event, message, options) {
    debug('ignore', event, message, options);
};





