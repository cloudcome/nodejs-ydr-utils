/**
 * weixin
 * @author ydr.me
 * @create 2015-12-08 11:08
 */


'use strict';

var howdo = require('howdo');

var dato = require('./dato.js');
var random = require('./random.js');
var number = require('./number.js');
var encryption = require('./encryption.js');
var request = require('./request.js');
var cache = require('./cache.js');
var pkg = require('../package.json');

var REG_HASH = /#.*$/;
var PREFIX = 'ydr-utils@' + pkg.version + '/weixin.';
var ACCESS_TOKEN = 'accessToken';
var API_TICKET = 'apiTicket';
var WEIXIN_TOKEN_URL = 'https://api.weixin.qq.com/cgi-bin/token';
var WEIXIN_TICKET_URL = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket';


/**
 * 解析微信返回内容
 * @param body
 * @returns {*[]}
 */
var parseWeixinBody = function (body) {
    var json = {};

    try {
        json = JSON.parse(body);
        json.errcode = json.errcode || 0;
    } catch (err) {
        json.errcode = -1;
        json.errmsg = '数据解析失败';
    }

    return [json.errcode !== 0 ? new TypeError(json.errmsg || '未知错误') : null, json];
};

var configs = {
    cache: true,
    appid: '',
    secret: '',
    // 指定 access_token
    accessToken: '',
    // 指定 令牌
    jsApiTicket: ''
};

exports.config = function (options) {
    dato.extend(configs, options);
};


// 获取微信 access_token
var getAccessToken = function (callback) {
    if (configs.accessToken) {
        return callback(null, configs.accessToken);
    }

    var accessToken = cache.get(PREFIX + ACCESS_TOKEN);

    if (accessToken) {
        return callback(null, accessToken);
    }

    request({
        url: WEIXIN_TOKEN_URL,
        query: {
            grant_type: 'client_credential',
            appid: configs.appid || configs.appId || configs.appID,
            secret: configs.secret
        }
    }, function (err, body) {
        if (err) {
            return callback(err);
        }

        var args = parseWeixinBody(body);
        var json = args[1];

        err = args[0];

        if (err) {
            return callback(err);
        }

        if (configs.cache) {
            cache.set(PREFIX + ACCESS_TOKEN, json.access_token, json.expires_in * 900);
        }

        callback(err, json.access_token);
    });
};


// 获取微信 jsapi_ticket
var getJSApiTicket = function (callback) {
    if (configs.jsApiTicket) {
        return callback(null, configs.jsApiTicket);
    }

    var jsApiTicket = cache.get(PREFIX + API_TICKET);

    if (jsApiTicket) {
        return callback(null, jsApiTicket);
    }

    howdo
        .task(getAccessToken)
        .task(function (next, accessToken) {
            request({
                url: WEIXIN_TICKET_URL,
                query: {
                    access_token: accessToken,
                    type: 'jsapi'
                }
            }, function (err, body) {
                if (err) {
                    return next(err);
                }

                var args = parseWeixinBody(body);
                var json = args[1];

                err = args[0];

                if (err) {
                    return next(err);
                }

                if (configs.cache) {
                    cache.set(PREFIX + API_TICKET, json.ticket, json.expires_in * 900);
                }

                next(err, json.ticket);
            });
        })
        .follow(callback);
};



/**
 * @synopsis 签名算法
 *
 * @param accessToken {String} 用于签名的 jsapi_ticket
 * @param jsApiTicket {String} 用于签名的 jsapi_ticket
 * @param url {String} 用于签名的 url ，注意必须动态获取，不能 hardcode
 *
 * @returns {Object}
 */
var signature = function (jsApiTicket, url) {
    var ret = {
        jsapi_ticket: jsApiTicket,
        nonceStr: random.string(10),
        timestamp: number.parseInt(Date.now() / 1000),
        url: url.replace(REG_HASH, '')
    };
    var keys = Object.keys(ret);

    keys = keys.sort();

    var list = [];

    keys.forEach(function (key) {
        list.push(key.toLowerCase() + '=' + ret[key]);
    });

    var str = list.join('&');
    var signature = encryption.sha1(str);

    return {
        jsApiTicket: jsApiTicket,
        signature: signature,
        nonceStr: ret.nonceStr,
        timestamp: ret.timestamp
    };
};


/**
 * URL 微信 JSSDK 签名
 * @param url
 * @param callback
 */
exports.getJSSDKSignature = function (url, callback) {
    getJSApiTicket(function (err, jsAPITicket) {
        if (err) {
            return callback(err);
        }

        callback(null, signature(jsAPITicket, url));
    });
};




