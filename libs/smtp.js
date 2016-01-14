/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-07 15:14
 */


'use strict';

var nodemailer = require('nodemailer');

var random = require('./random.js');
var typeis = require('./typeis.js');
var log = require('./log.js');
var dato = require('./dato.js');
var allocation = require('./allocation.js');
var Queue = require('./queue.js');

var queue = new Queue({
    auto: true
});
// smtp 列表
var smtps = [];
var froms = [];
// 发信配置
var configs = {
    to: '',
    subject: '',
    html: '',
    // 超时区间 123ms <=> 12345ms
    timeout: [123, 12345]
};

/**
 * 添加发信源
 * @param config
 * @param config.user {String} QQ号，阿里云发信地址
 * @param config.pass {String} QQ邮箱密码，阿里云发信 smtp 密码
 * @param config.secureConnection {Boolean} 阿里云邮箱设置为 true
 * @param config.secure {Boolean} QQ 邮箱设置为 true
 * @param config.host {String} QQ：smtp.qq.com，阿里云：smtp.dm.aliyun.com
 * @param config.port {String} QQ：465，阿里云：25
 * @param config.from {String} 发信地址，不同的 smtp，发信地址应该不一样
 */
exports.push = function (config) {
    var options = {
        auth: {
            user: config.user,
            pass: config.pass
        },
        secureConnection: config.secureConnection,
        secure: config.secure,
        host: config.host,
        port: config.port
    };
    var smtp = nodemailer.createTransport(options);
    smtps.push(smtp);
    froms.push(config.from);
};


/**
 * 配置
 * @param options
 * @returns {*}
 */
exports.config = function (options) {
    return allocation.getset({
        get: function (key) {
            return configs[key];
        },
        set: function (key, val) {
            configs[key] = val;

            if (!typeis.Array(configs.timeout)) {
                configs.timeout = [configs.timeout, configs.timeout];
            }
        }
    }, arguments);
};


/**
 * 发送邮件
 * @param options {Object} 配置
 * @param [options.from] {String} 发信人
 * @param options.to {String} 收信人
 * @param options.subject {String} 邮件主题
 * @param options.html {String} 邮件内容
 * @param callback {Function} 发送完成回调
 */
var send = function (options, callback) {
    var max = smtps.length - 1;
    var index = random.number(0, max);
    var smtp = smtps[index];
    var from = froms[index];

    if (!typeis.Function(callback)) {
        callback = log.holdError;
    }

    options = dato.extend({}, configs, {
        from: from
    }, options);

    try {
        smtp.sendMail(options, callback);
    } catch (err) {
        callback(err);
    }
};


/**
 * 队列模式发送邮件
 * @param options {Object} 配置
 * @param [options.from] {String} 发信人
 * @param options.to {String} 收信人
 * @param options.subject {String} 邮件主题
 * @param options.html {String} 邮件内容
 * @param callback {Function} 发送完成回调
 */
exports.send = function (options, callback) {
    if (!typeis.Function(callback)) {
        callback = log.holdError;
    }

    queue.push(function (next) {
        send(options, function () {
            callback.apply(this, arguments);
            var timeout = random.number(configs.timeout[0], configs.timeout[1]);
            setTimeout(next, timeout);
        });
    });
};


