/**
 * request
 * @author ydr.me
 * @create 2016-01-14 17:41
 */


'use strict';

var util = require('util');
var http = require('http');
var https = require('https');
var stream = require('stream');
var qs = require('querystring');
var ur = require('url');


var Emitter = require('./emitter.js');
var klass = require('./class.js');
var dato = require('./dato.js');
var typeis = require('./typeis.js');
var random = require('./random.js');
var allocation = require('./allocation.js');

// @link https://nodejs.org/api/stream.html#stream_class_stream_readable
var READABLE_STREAM_EVENTS = ['close', 'data', 'end', 'error', 'readable'];
var defaults = {
    headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'accept-encoding': 'gzip, deflate, sdch',
        'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'
    },
    // 请求方法
    method: 'get',
    // 响应编码
    encoding: 'utf8',
    // 是否跳转携带 cookie
    redirectWithCookie: true,
    // 最大 30x 跳转次数
    maxRedirectTimes: 10,
    // 超时时间：15 秒
    timeout: 15000,
    // 是否模拟浏览器
    simulateBrowser: true,
    // 是否调试模式
    debug: false
};
var Request = klass.extends(Emitter).create({
    constructor: function (options) {
        var the = this;

        if (typeis.String(options)) {
            options = {
                url: options
            };
        }

        the._options = dato.extend(true, defaults, options);
        the._url = ur.parse(the._options.url);
        the._request();
    },


    /**
     * 调试
     * @returns {Request}
     */
    debug: function () {
        var the = this;

        if (!the._options.debug) {
            return the;
        }

        console.log('[REQUEST DEBUG]\n%s', util.format.apply(util, arguments));

        return the;
    },


    /**
     * 构建请求参数
     * @returns {{}}
     * @private
     */
    _buildRequestOptions: function () {
        var the = this;
        var options = the._options;
        var ret = {};

        ret.protocol = the._url.protocol;
        ret.host = the._url.host;
        ret.hostname = the._url.hostname;
        ret.port = the._url.port || 80;
        ret.method = options.method.toUpperCase();
        ret.path = the._url.path;
        ret.headers = dato.extend({}, options.headers);

        return ret;
    },


    /**
     * 实际请求
     * @private
     */
    _request: function () {
        var the = this;
        var client = the._url.protocol === 'https:' ? https : http;
        var requestOptions = the._buildRequestOptions();
        the.debug('will request', requestOptions);
        var req = client.request(requestOptions, function (res) {
            the.debug('get response headers', res.headers);
            // pipe event to instance
            dato.each(READABLE_STREAM_EVENTS, function (index, eventType) {
                res.on(eventType, function () {
                    var args = allocation.args(arguments);

                    args.unshift(eventType);
                    the.emit.apply(the, args);
                });
            });

            the._receiveResponse(res);
        });

        req.end();
    },


    /**
     * 接收响应
     * @param res
     * @private
     */
    _receiveResponse: function (res) {
        var the = this;
        var bfList = [];

        res.on('data', function (chunk) {
            bfList.push(new Buffer(chunk, the._options.encoding));
        }).on('end', function () {
            the.emit('body', Buffer.concat(bfList).toString());
        }).on('close', function () {

        }).on('error', function () {

        });
    },

    pipe: function () {

    }
});

Request.defaults = defaults;

var request = function (options) {
    return new Request(options);
};

request.defaults = defaults;
request.Request = Request;
request.get = function (url) {
    return new Request({
        url: url,
        method: 'get'
    });
};

module.exports = request;
