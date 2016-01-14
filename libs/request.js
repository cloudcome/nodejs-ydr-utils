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
var zlib = require('zlib');


var klass = require('./class.js');
var dato = require('./dato.js');
var typeis = require('./typeis.js');
var random = require('./random.js');
var allocation = require('./allocation.js');
var controller = require('./controller.js');

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
    // 最大 30x 跳转次数
    maxRedirectTimes: 10,
    // 超时时间：15 秒
    timeout: 15000,
    // 是否模拟浏览器
    simulateBrowser: true,
    // 是否调试模式
    debug: false
};
var Request = klass.extends(stream.Stream).create({
    constructor: function (options) {
        var the = this;

        if (typeis.String(options)) {
            options = {
                url: options
            };
        }

        the._options = dato.extend(true, defaults, options);
        the._url = ur.parse(the._options.url);
        the._urlList = [the._options.url];
        the._urlMap = {};
        the._urlMap[the._options.url] = 1;
        the._requestTimes = 0;
        the._cookies = the._options.cookie || {};
        the._request();
    },


    _buildURL: function () {

    },


    /**
     * 修正 url
     * @param url
     * @returns {*}
     * @private
     */
    _fixURL: function (url) {
        var the = this;
        var ret = ur.parse(url);

        if (!ret.protocol) {
            ret.protocol = the._url.protocol;
        }

        if (!ret.host) {
            ret.host = the._url.host;
        }

        return ur.format(ret);
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

        console.log();
        console.log('[REQUEST DEBUG]\n%s', util.format.apply(util, arguments));

        return the;
    },


    /**
     * 构建请求参数
     * @returns {{object}}
     * @private
     */
    _buildRequestOptions: function () {
        var the = this;
        var options = the._options;
        var ret = {};

        ret.url = the._url.href;
        dato.extend(ret, the._url);
        ret.headers = dato.extend({}, options.headers);
        var cookieList = [];
        dato.each(the._cookies, function (key, val) {
            cookieList.push(key + '=' + val);
        });
        ret.headers.cookie = cookieList.join('; ');

        return ret;
    },


    /**
     * 实际请求
     * @private
     */
    _request: function () {
        var the = this;
        var options = the._options;
        var client = the._url.protocol === 'https:' ? https : http;
        var requestOptions = the._buildRequestOptions();

        the._requestTimes++;
        clearTimeout(the._requestTimer);
        the.debug('will request', requestOptions);

        var req = client.request(requestOptions, function (res) {
            the.debug('get response status code', res.statusCode);
            the.debug('get response headers', res.headers);
            the._buildCookies(res);

            if (res.statusCode === 301 || res.statusCode === 302) {
                var redirectURL = res.headers.location || the._url.href;
                redirectURL = the._fixURL(redirectURL);
                the._urlList.push(redirectURL);
                the._urlMap[redirectURL] = the._urlMap[redirectURL] || 0;
                the._urlMap[redirectURL]++;
                the._ignoreError = true;
                req.abort();
                the.debug('request redirect to', redirectURL);

                if (the._urlMap[redirectURL] > 2) {
                    var maxRedirectRepeatTimesError = 'make redirect loop';
                    the.debug(maxRedirectRepeatTimesError);
                    controller.nextTick(function () {
                        the.emit('error', new Error(maxRedirectRepeatTimesError));
                    });
                    return;
                }

                if (the._requestTimes > options.maxRedirectTimes) {
                    var maxRedirectTimesError = 'redirect times is over ' + options.maxRedirectTimes;
                    the.debug(maxRedirectTimesError);
                    controller.nextTick(function () {
                        the.emit('error', new Error(maxRedirectTimesError));
                    });
                    return;
                }

                the._url = ur.parse(redirectURL);
                the._request();
                return;
            }

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

        req.on('error', function (err) {
            the.emit('error', err);
        });

        req.end();

        if(options.timeout > 0){
            the._requestTimer = setTimeout(function () {
                the._ignoreError = true;
                the.abort();
                controller.nextTick(function () {

                });
            }, options.timeout);
        }
    },


    /**
     * 构建 cookie
     * @param res
     * @private
     */
    _buildCookies: function (res) {
        var the = this;
        var cookies = res.headers['set-cookie'];

        if (!cookies) {
            return;
        }

        dato.each(cookies, function (index, cookieString) {
            var mainCookieString = cookieString.split(';').shift();
            var mainCookieList = mainCookieString.split('=');
            var key = mainCookieList[0];
            var val = mainCookieList[1];

            if (key && val) {
                the._cookies[key] = val;
            }
        });
    },


    /**
     * 接收响应
     * @param res
     * @private
     */
    _receiveResponse: function (res) {
        var the = this;
        var bfList = [];

        var responseContent = res;
        var contentEncoding = res.headers['content-encoding'] || 'identity';
        contentEncoding = contentEncoding.trim().toLowerCase();

        if (contentEncoding === 'gzip') {
            responseContent = zlib.createGunzip();
            res.pipe(responseContent);
        }

        responseContent.on('data', function (chunk) {
            bfList.push(new Buffer(chunk, the._options.encoding));
        }).on('end', function () {
            the.emit('body', Buffer.concat(bfList).toString());
        }).on('close', function () {
            if (the._ignoreError) {
                the._ignoreError = false;
                return;
            }

            the.emit('error', new Error('response closed'));
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
