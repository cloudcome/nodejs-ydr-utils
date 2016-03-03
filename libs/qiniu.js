/**
 * 七牛上传服务
 * @author ydr.me
 * @create 2015-05-20 20:55
 */


'use strict';

var crypto = require('crypto');

var allocation = require('./allocation.js');
var dato = require('./dato.js');
var random = require('./random.js');
var path = require('./path.js');
var typeis = require('./typeis.js');

var defaults = {
    accessKey: '',
    secretKey: '',
    bucket: '',
    host: '/',
    dirname: '/',
    filename: null,
    expires: 10 * 60 * 1000,
    mimeLimit: 'image/*'
};
var REG_END = /\/$/;
var configs = {
    accessKey: '',
    secretKey: '',
    bucket: '',
    // 绑定域名
    host: '/',
    // 上传目录
    dirname: '/',
    // 有效期，10分钟，单位秒
    expires: 10 * 60 * 1000,
    mimeLimit: '*'
};


/**
 * 配置参数
 * @returns {*}
 */
exports.config = function () {
    return allocation.getset({
        get: function (key) {
            return configs[key]
        },
        set: function (key, val) {
            configs[key] = val;
        }
    }, arguments);
};


/**
 * 签名
 * @param options {String|Object}
 * @param [options.dirname] {String}
 * @param [options.bucket] {String}
 * @param [options.expires] {String}
 * @param [options.mimeLimit] {String}
 * @param [options.accessKey] {String}
 * @param [options.secretKey] {String}
 * @returns {{key: string, token: string, url: *}}
 */
exports.signature = function (options) {
    if (typeis.String(options)) {
        options = {
            filename: options
        };
    }

    options = dato.extend({}, configs, options);

    var dirname = '';

    if (options.dirname && options.dirname.length > 1) {
        dirname = REG_END.test(options.dirname) ? options.dirname : options.dirname + '/';
    }

    var key = path.join(dirname, options.filename || random.guid());
    var deadline = options.expires + Date.now();
    var encoded = urlsafeBase64Encode(JSON.stringify({
        scope: options.bucket + ':' + key,
        // 有效期
        deadline: Math.floor(deadline / 1000),
        mimeLimit: options.mimeLimit
    }));
    var encoded_signed = base64ToUrlSafe(hmacSha1(encoded, options.secretKey));

    return {
        key: key,
        token: options.accessKey + ':' + encoded_signed + ':' + encoded,
        url: path.joinURI(options.host, key),
        deadline: deadline
    };
};


/**
 * 生成上传 key 和上传凭证
 * @param [configs] {Object} 配置
 * @param [configs.host="/"] {String} 仓库
 * @param [configs.bucket=""] {String} 仓库
 * @param [configs.accessKey=""] {String} access_key
 * @param [configs.secretKey=""] {String} secret_key
 * @param [configs.dirname="/"] {String} 上传目录
 * @param [configs.filename] {String} 上传文件名，否则随机生成
 * @param [configs.expires] {Number} 凭证有效期，默认 10 分钟，单位毫秒
 * @param [configs.mimeLimit="image/*"] {String} 上传文件限制类型
 * @returns {{key: *, token: string}}
 */
exports.generateKeyAndToken = function (configs) {
    configs = dato.extend({}, defaults, configs);

    if (configs.dirname && configs.dirname.length > 1) {
        configs.dirname = REG_END.test(configs.dirname) ? configs.dirname : configs.dirname + '/';
    } else {
        configs.dirname = '';
    }

    if (configs.host.slice(-1) === '/') {
        configs.host = configs.host.slice(0, -1);
    }

    var key = configs.dirname + (configs.filename || random.guid());

    // 文件名
    configs.dirname = String(configs.dirname).trim();

    var encoded = urlsafeBase64Encode(JSON.stringify({
        scope: configs.bucket + ':' + key,
        // 有效期
        deadline: Math.floor((configs.expires + Date.now()) / 1000),
        mimeLimit: configs.mimeLimit
    }));
    var encoded_signed = base64ToUrlSafe(hmacSha1(encoded, configs.secretKey));

    return {
        key: key,
        token: configs.accessKey + ':' + encoded_signed + ':' + encoded,
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
