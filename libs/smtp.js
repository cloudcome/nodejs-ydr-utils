/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-07 15:14
 */


'use strict';


var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var smtps = [];

/**
 * 添加发信源
 * @param config
 */
exports.push = function (config) {
    smtps.push(config);
};


//nodemailer.createTransport(smtpTransport(options))



