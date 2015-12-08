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

var cache = {
    accessToken: '',
    jsApiTicket: ''
};
var REG_HASH = /#.*$/;
var parseWeixinBody = function (body) {
    var json = {};

    try {
        json = JSON.parse(body);
        json.errcode = 0;
    } catch (err) {
        json.errcode = -1;
        json.errmsg = '数据解析失败';
    }

    return [json.errcode ? new TypeError(json.errmsg || '未知错误') : null, json];
};

var configs = {
    cache: true,
    appId: '',
    secret: '',
    // 指定令牌
    jsApiTicket: ''
};

exports.config = function (options) {
    dato.extend(configs, options);
};


/**
 * @synopsis 签名算法
 *
 * @param jsapi_ticket 用于签名的 jsapi_ticket
 * @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
 *
 * @returns
 */
var signature = function (jsapi_ticket, url) {
    var ret = {
        jsapi_ticket: jsapi_ticket,
        nonceStr: random.string(10),
        timestamp: number.parseInt(Date.now() / 1000),
        url: url.replace(REG_HASH, '')
    };
    var keys = Object.keys(ret);


    //ret.noncestr = 'Wm3WZYTPz0wzccnW';
    //ret.jsapi_ticket = 'sM4AOVdWfPE4DxkXGEs8VMCPGGVi4C3VM0P37wVUCFvkVAy_90u5h9nbSlYy3-Sl-HhTdfl2fzFy1AOcHKP7qg';
    //ret.timestamp = '1414587457';
    //ret.url = 'http://mp.weixin.qq.com?params=value';

    keys = keys.sort();

    var list = [];

    keys.forEach(function (key) {
        list.push(key.toLowerCase() + '=' + ret[key]);
    });

    var str = list.join('&');
    var signature = encryption.sha1(str);

    return {
        signature: signature,
        nonceStr: ret.nonceStr,
        timestamp: ret.timestamp
    };
};





// 获取微信 access_token
exports.getAccessToken = function (callback) {
    var accessToken = cache.accessToken;

    if (accessToken) {
        return callback(null, accessToken);
    }

    request.get({
        url: 'https://api.weixin.qq.com/cgi-bin/token',
        query: {
            grant_type: 'client_credential',
            appid: configs.appId,
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

        cache.set('weixin.accessToken', json.access_token, json.expires_in * 900);
        callback(err, json.access_token);
    });
};


// 获取微信 jsapi_ticket
exports.getJSApiTicket = function (callback) {
    var jsApiTicket = cache.get('weixin.jsApiTicket');

    var configs = cache.get('app.configs');

    if(configs.env === 'local'){
        jsApiTicket = 'sM4AOVdWfPE4DxkXGEs8VFN5g9nCXG41dRCk_StGfznKOi876HxW3qppwPHPdshTECtUo-El9HW1aFWXcw1C9w';
    }

    if (jsApiTicket) {
        return callback(null, jsApiTicket);
    }

    howdo
        .task(exports.getAccessToken)
        .task(function (next, accessToken) {
            var configs = cache.get('app.configs');

            request.get({
                url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
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

                cache.set('weixin.jsApiTicket', json.ticket, json.expires_in * 900);
                next(err, json.ticket);
            });
        })
        .follow(callback);
};


// 获取签名
exports.getSignature = function (url, callback) {
    exports.getJSApiTicket(function (err, jsAPITicket) {
        if (err) {
            return callback(err);
        }

        callback(null, signature(jsAPITicket, url));
    });
};




