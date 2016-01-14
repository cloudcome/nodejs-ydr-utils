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
var NO_BODY_REQUEST = {
    GET: true,
    HEAD: true,
    OPTIONS: true
};
var defaults = {
    headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'accept-encoding': 'gzip',
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

        options = the._options = dato.extend(true, defaults, options);
        options.method = options.method.trim().toUpperCase();
        options.url = the._buildURL();
        the._url = ur.parse(options.url);
        the._urlList = [options.url];
        the._urlMap = {};
        the._urlMap[options.url] = 1;
        the._requestTimes = 0;
        the._cookies = the._options.cookie || {};
        the._request();
    },


    /**
     * 构建 url
     * @returns {*|String|{method?, callbackStream?}}
     * @private
     */
    _buildURL: function () {
        var the = this;
        var options = the._options;
        var query = '';

        if (options.query) {
            query = qs.stringify(options.query);
        }

        if (!query) {
            return options.url;
        }

        options.url += options.url.indexOf('?') > -1 ? '&' : '?';
        options.url += query;

        return options.url;
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

        ret.method = options.method;
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
     * 构建请求 body
     * @param req
     * @private
     */
    _buildRequestEnd: function (req) {
        var the = this;
        var options = the._options;

        if (NO_BODY_REQUEST[options.method]) {
            req.end();
            return;
        }

        var requestBody = options.body;

        if (typeis.plainObject(options.body)) {
            try {
                requestBody = JSON.stringify(options.body);
            } catch (err) {
                requestBody = '';
            }
        }

        the.debug('request body', requestBody);
        req.end(requestBody);
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
        the.debug('will request', options.method, requestOptions);

        var req = client.request(requestOptions, function (res) {
            the.debug('response status code', res.statusCode);
            the.debug('response headers', res.headers);
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
                    if (the._ignoreError && eventType === 'error') {
                        the._ignoreError = false;
                        return;
                    }

                    var args = allocation.args(arguments);
                    args.unshift(eventType);
                    the.emit.apply(the, args);
                });
            });

            the._receiveResponse(req, res);
        });

        req.on('error', function (err) {
            if (the._ignoreError) {
                the._ignoreError = false;
                return;
            }

            the.emit('error', err);
        });

        the._buildRequestEnd(req);

        if (options.timeout > 0) {
            req.setTimeout(options.timeout, function () {
                the._ignoreError = true;
                req.abort();
                controller.nextTick(function () {
                    var requestTimeoutError = 'request timeout ' + options.timeout + 'ms';
                    the.debug(requestTimeoutError);
                    the.emit('error', new Error(requestTimeoutError));
                });
            });
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
     * @param req
     * @param res
     * @private
     */
    _receiveResponse: function (req, res) {
        var the = this;
        var options = the._options;

        if (options.method === 'HEAD') {
            the._ignoreError = true;
            req.abort();
            controller.nextTick(function () {
                the.emit('response', res);
            });
            return;
        }

        var bfList = [];
        var responseContent = res;
        var contentEncoding = res.headers['content-encoding'] || 'identity';
        contentEncoding = contentEncoding.trim().toLowerCase();

        if (contentEncoding === 'gzip') {
            responseContent = zlib.createGunzip();
            res.pipe(responseContent);
        }

        var isUTF8 = options.encoding === 'utf8';

        res.setEncoding(options.encoding);
        responseContent.on('data', function (chunk) {
            bfList.push(new Buffer(chunk, options.encoding));
        }).on('end', function () {
            if (isUTF8) {
                the.emit('body', Buffer.concat(bfList).toString());
            } else {
                the.emit('body', new Buffer(bfList));
            }
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
