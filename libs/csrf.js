/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-04-20 21:11
 */


'use strict';

var dato = require('./dato.js');
var random = require('./random.js');
var encryption = require('./encryption.js');
var configs = {
    // 模长
    length: 12,
    // 有效期：1小时
    expires: 3600000
};


/**
 * 配置
 * @param options
 */
exports.config = function (options) {
    dato.extend(configs, options);
};



/**
 * 生成 csrf 令牌
 * @returns {{key: Object, token: String}}
 */
exports.create = function () {
    // 13 + N
    var sla = '~!@#$%^&*()_+-={}[]:;,.<>?/';
    var now = Date.now();
    var length = now % configs.length;
    var key = Date.now() + random.string(length, sla);
    var entry = encryption.encode(String(key), String(key));

    return {
        key: key,
        length: length,
        token: entry.substr(0, length) + random.string(length, sla) + entry.substr(length)
    };
};


/**
 * csrf 验证
 * @param csrfty
 * @param entry
 * @returns {boolean}
 */
exports.validate = function (csrfty, entry) {
    var key = encryption.decode(entry.substr(0, csrfty.length) + entry.substr(csrfty.length * 2), csrfty.key);

    if (!key) {
        return false;
    }

    var time = key.slice(0, 13);

    time = dato.parseInt(time, 0);

    return time + configs.expires >= Date.now();
};