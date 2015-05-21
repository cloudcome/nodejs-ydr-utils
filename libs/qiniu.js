/*!
 * 七牛上传服务
 * @author ydr.me
 * @create 2015-05-20 20:55
 */


'use strict';


var dato = require('./dato.js');
var random = require('./random.js');
var crypto = require('crypto');
var configs = {
    access_key: '',
    secret_key: '',
    bucket: '',
    host: '',
    onbeforeput: function (streamOptions, next) {
        next();
    }
};
var REG_END = /\/$/;


/**
 * 配置
 * @param options
 */
exports.config = function (options) {
    dato.extend(configs, options);
};


/**
 * 生成上传 key 和上传凭证
 * @param [config] {Object} 配置
 * @param [config.dirname="/"] {String} 上传目录
 * @param [config.filename] {String} 上传文件名，否则随机生成
 * @param [config.expires] {Number} 凭证有效期，默认 10 分钟
 * @param [config.mimeLimit="image/*"] {String} 上传文件限制类型
 * @returns {{key: *, token: string}}
 */
exports.generateKeyAndToken = function (config) {
    config = config || {};

    if (config.dirname && config.dirname.length > 1) {
        config.dirname = REG_END.test(config.dirname) ? config.dirname : config.dirname + '/';
    } else {
        config.dirname = '';
    }

    if (configs.host.slice(-1) === '/') {
        configs.host = configs.host.slice(0, -1);
    }

    var key = config.dirname + (config.filename || random.guid());
    var tenMinutes = 10 * 60;

    // 文件名
    config.dirname = String(config.dirname).trim();

    var encoded = urlsafeBase64Encode(JSON.stringify({
        scope: configs.bucket + ':' + key,
        // 有效期
        deadline: (config.expires || tenMinutes) + Math.floor(Date.now() / 1000),
        mimeLimit: config.mimeLimit
    }));
    var encoded_signed = base64ToUrlSafe(hmacSha1(encoded, configs.secret_key));

    return {
        key: key,
        token: configs.access_key + ':' + encoded_signed + ':' + encoded,
        url: configs.host + key
    };
};


function urlsafeBase64Encode(jsonFlags) {
    var encoded = new Buffer(jsonFlags).toString('base64');
    return base64ToUrlSafe(encoded);
}

function base64ToUrlSafe(v) {
    return v.replace(/\//g, '_').replace(/\+/g, '-');
}

function hmacSha1(encodedFlags, secretKey) {
    var hmac = crypto.createHmac('sha1', secretKey);
    hmac.update(encodedFlags);
    return hmac.digest('base64');
}
