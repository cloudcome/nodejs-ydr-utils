/**
 * 文件描述
 * @author ydr.me
 * @create 2015-12-08 11:08
 */


'use strict';

var dato = require('./dato.js');
var random = require('./random.js');
var number = require('./number.js');

var cache = {};
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
    cache: true
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





