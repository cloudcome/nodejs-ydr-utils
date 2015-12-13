/**
 * ali oss
 * @author ydr.me
 * @create 2014-11-27 21:47
 */

'use strict';

var crypto = require('crypto');

var allocation = require('./allocation.js');
var path = require('./path.js');
var dato = require('./dato.js');
var mime = require('./mime.js');


var configs = {
    accessKeyId: '',
    accessKeySecret: '',
    bucket: '',
    host: 'oss-cn-hangzhou.aliyuncs.com',
    cacheControl: 'public',
    // 1年，单位 秒
    expires: 31536000,
    domain: '',
    https: true
};


/**
 * 设置配置
 * @param key
 * @param val
 * @returns {*}
 */
exports.config = function (key, val) {
    return allocation.getset({
        get: function () {
            return configs[key];
        },
        set: function (key, val) {
            configs[key] = val;
        }
    }, arguments);
};


/**
 * 操作签名
 * @param method {String} 请求方式
 * @param object {String} 资源路径
 * @param [contentType] {String} 资源类型
 * @returns {{url: *, headers: *}}
 */
exports.signature = function (method, object, contentType) {
    var auth = 'OSS ' + configs.accessKeyId + ':';
    var date = new Date().toUTCString();
    contentType = contentType || mime.get(path.extname(object));
    var params = [
        method.toUpperCase(),
        '', // md5 留空
        contentType,
        date
    ];
    var resource = path.join('/' + configs.bucket, object);
    var signature;

    //var ossHeaders = {};
    //
    //dato.each(headers, function (key, val) {
    //    var lkey = key.toLowerCase().trim();
    //
    //    if (lkey.indexOf('x-oss-') === 0) {
    //        ossHeaders[lkey] = ossHeaders[lkey] || [];
    //        ossHeaders[lkey].push(val.trim());
    //    }
    //});
    //
    //Object.keys(ossHeaders).sort().forEach(function (key) {
    //    params.push(key + ':' + ossHeaders[key].join(','));
    //});

    params.push(resource);
    signature = crypto.createHmac('sha1', configs.accessKeySecret);
    signature = signature.update(params.join('\n')).digest('base64');

    var protocol = configs.https ? 'https://' : 'http://';
    var domain = configs.domain || configs.bucket + '.' + configs.host;
    var objectURL = path.joinURI(protocol, domain, object || '');

    return {
        url: objectURL,
        headers: {
            'content-type': contentType,
            authorization: auth + signature,
            date: date,
            'cache-control': configs.cacheControl,
            expires: new Date(Date.now() + configs.expires * 1000).toUTCString()
        }
    };
};