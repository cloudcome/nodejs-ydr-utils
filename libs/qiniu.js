/*!
 * 七牛上传服务
 * @author ydr.me
 * @create 2015-05-20 20:55
 */


'use strict';




var path = require('path');
var klass = require('./class.js');
var dato = require('./dato.js');
var typeis = require('./typeis.js');
var request = require('./request.js');
var random = require('./random.js');
var mime = require('./mime.js');
var Busboy = require('busboy');
var crypto = require('crypto');
var xmlParse = require('xml2js').parseString;
var howdo = require('howdo');
var imagesize = require('imagesize');
var REG_META = /^x-oss-meta-/i;
var REG_TITLE = /<title>([\s\S]*?)<\/title>/;
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
 * 根据上传生成上传 key 和上传凭证
 */
exports.generateKeyAndToken = function (config) {
    if (config.dirname.length > 1) {
        config.dirname = REG_END.test(config.dirname) ? config.dirname : config.dirname + '/';
    } else {
        config.dirname = '';
    }

    var key = config.dirname + (config.filename || random.guid());

    if (!config.scope) {
        // 文件名
        config.dirname = String(config.dirname).trim();


        //config.saveKey = config.dirname + random.guid();
        config.scope = config.bucket + ':' + key;
        //config.scope = config.bucket;
    }


    config.bucket = undefined;
    config.dirname = undefined;


    // 有效期
    config.deadline = config.expires + Math.floor(Date.now() / 1000);
    config.expires = undefined;

    //console.log(config);

    var encoded = urlsafeBase64Encode(JSON.stringify(config));
    var encoded_signed = base64ToUrlSafe(hmacSha1(encoded, sk));

    return {
        key: key,
        token: ak + ':' + encoded_signed + ':' + encoded
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
