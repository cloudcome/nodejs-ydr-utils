/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-07 15:14
 */


'use strict';

var random = require('./random.js');
var typeis = require('./typeis.js');
var log = require('./log.js');
var dato = require('./dato.js');
var allocation = require('./allocation.js');

var nodemailer = require('nodemailer');

// smtp 列表
var smtps = [];

// 发信配置
var configs = {
    from: '',
    to: '',
    subject: '',
    html: ''
};

/**
 * 添加发信源
 * @param config
 */
exports.push = function (config) {
    config.auth = {
        user: config.user,
        pass: config.pass
    };
    delete(config.user);
    delete(config.pass);
    var smtp = nodemailer.createTransport(config);
    smtps.push(smtp);
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
        }
    }, arguments);
};


/**
 * 发送邮件
 * @param options {Object} 配置
 * @param [options.from] {String} 配置
 * @param options.to {String} 配置
 * @param options.subject {String} 配置
 * @param options.html {String} 配置
 * @param callback
 */
exports.send = function (options, callback) {
    var max = smtps.length - 1;
    var index = random.number(0, max);
    var smtp = smtps[index];

    if (!typeis.Function(callback)) {
        callback = log.holdError;
    }

    options = dato.extend({}, configs, options);

    try {
        smtp.sendMail(options, callback);
    } catch (err) {
        callback(err);
    }
};



