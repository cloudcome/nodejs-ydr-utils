/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-04-20 21:11
 */


'use strict';

var dato = require('./dato.js');
var random = require('./random.js');
var encryption = require('./encryption.js');
var REG_DATE = /^\d{13}$/;
var configs = {
    length: 12,
    // 加密 key
    key: '123456',
    // 有效期
    expires: 3600000
};


/**
 * 配置
 * @param options
 */
exports.config = function(options){
    dato.extend(configs, options);
};



/**
 * 生成 csrf 令牌
 * @returns {{key: Object, token: String}}
 */
exports.create = function () {
    var key = random.string(configs.length, 'aA0');

    return {
        key: key,
        token: encryption.encode(key, configs.key) + encryption.encode(String(Date.now()), key)
    };
};


/**
 * csrf 验证
 * @param csrfty
 * @param entry
 * @returns {boolean}
 */
exports.validate = function (csrfty, entry) {
    var key = entry.slice(0, 32);
    var val = entry.slice(32);

    key = encryption.decode(key, configs.key);

    if(!key){
        return false;
    }

    var token = encryption.decode(val, key);

    if(!REG_DATE.test(token)){
        return false;
    }

    var now = Date.now();

    token = dato.parseInt(token, 0);

    return token + configs.expires >= now;
};