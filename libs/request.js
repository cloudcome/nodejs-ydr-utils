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
var path = require('path');


var pkg = require('../package.json');
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
    headers: {},
    // 请求方法
    method: 'get',
    // 响应编码
    encoding: 'utf8',
    // 最大 30x 跳转次数
    maxRedirects: 10,
    // 超时时间：15 秒
    timeout: 15000,
    // 是否模拟浏览器
    browser: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'accept-encoding': 'gzip',
        'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6',
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) ' +
        'AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53 ' +
        pkg.name + '/' + path.basename(__filename) + '/' + pkg.version,
        'cache-control': 'no-cache',
        connection: 'keep-alive',
        host: true,
        origin: true,
        referrer: true,
        cookie: true
    },
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

        the.id = random.guid();
        options = the._options = dato.extend(true, {}, defaults, options);
        options.method = options.method.trim().toUpperCase();
        options.url = the._buildURL();
        the._url = ur.parse(options.url);
        the._urlList = [options.url];
        the._urlMap = {};
        the._urlMap[options.url] = 1;
        the._requestTimes = 0;
        the._cookies = the._options.cookie || {};
        the._pipeTo = null;
        the._pipeFrom = null;
        // 是否正在读数据流
        the._reading = false;
        // 是否正在写数据流
        the._writing = false;
        // 是否正在重定向
        the._redirecting = false;
        // 是否开始请求
        the._started = false;
        // 是否已停止请求
        the._stoped = false;
        // 是否暂停数据流出
        the._paused = false;
        the._onData = false;
        the._initEvent();
    },


    /**
     * 初始化事件
     * @private
     */
    _initEvent: function () {
        var the = this;

        the.on('newListener', function (et) {
            if (et === 'data') {
                the._onData = true;
            }
        });
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
        var ret = {
            headers: {}
        };

        ret.method = options.method;
        ret.url = the._url.href;
        dato.extend(ret, the._url);

        if (!typeis.empty(options.browser)) {
            var browserHeaders = options.browser;

            if (browserHeaders === true) {
                browserHeaders = defaults.browser;
            }

            dato.each(browserHeaders, function (key, val) {
                if (typeis.String(val)) {
                    ret.headers[key] = val;
                } else if (val === true) {
                    switch (key) {
                        case 'host':
                            ret.headers[key] = the._url.host;
                            break;

                        case 'origin':
                            ret.headers[key] = the._url.host;
                            break;

                        case 'referrer':
                            ret.headers[key] = ret.url;
                            break;

                        case 'cookie':
                            var cookieList = [];
                            dato.each(the._cookies, function (key, val) {
                                cookieList.push(key + '=' + val);
                            });
                            ret.headers.cookie = cookieList.join('; ');
                            break;
                    }
                }
            });
        }

        dato.extend(ret.headers, options.headers);

        return ret;
    },


    /**
     * 构建请求长度
     * @private
     */
    _buildRequestContentLength: function (requestOptions) {
        var the = this;
        var options = the._options;

        if (the._pipeFrom) {
            return;
        }

        if (NO_BODY_REQUEST[options.method]) {
            requestOptions.headers['content-length'] = 0;
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

        the._requestBody = requestBody;
        requestOptions.headers['content-length'] = Buffer.byteLength(requestBody);
        the.debug('request body', '\n', requestBody);
    },


    /**
     * 发送请求
     * @private
     */
    _buildRequestSend: function () {
        var the = this;
        var options = the._options;

        the.req.requestId = random.guid();

        console.log('----------------------------- _buildRequestSend', the._pipeFrom, the._redirecting);
        if (the._pipeFrom) {
            return;
        }

        if (NO_BODY_REQUEST[options.method]) {
            the.req.end();
            return;
        }

        the.req.end(the._requestBody);
    },

    /**
     * 实际请求
     * @private
     */
    _request: function () {
        console.log('_request_request_request_request_request');
        var the = this;
        var options = the._options;
        var client = the._url.protocol === 'https:' ? https : http;
        var requestOptions = the._buildRequestOptions();

        the._buildRequestContentLength(requestOptions);
        the._started = true;
        the._requestTimes++;
        the.debug(options.method, requestOptions.url, '\n', requestOptions);

        var req = the.req = client.request(requestOptions);

        the._buildRequestSend();

        the.emit('request', req);

        req.on('response', function (res) {
            the.res = res;
            the.debug('response', res.statusCode, '\n', res.headers);

            // 30x redirect
            if (res.statusCode >= 300 && res.statusCode < 400) {
                var redirectURL = res.headers.location || the._url.href;
                redirectURL = ur.resolve(the._url.href, redirectURL)
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

                if (the._requestTimes > options.maxRedirects) {
                    var maxRedirectsError = 'redirect times is over ' + options.maxRedirects;
                    the.debug(maxRedirectsError);
                    controller.nextTick(function () {
                        the.emit('error', new Error(maxRedirectsError));
                    });
                    return;
                }

                the._url = ur.parse(redirectURL);
                the._redirecting = true;
                the._buildCookies();


                the._request();

                return;
            }

            // pipe event to instance
            //dato.each(READABLE_STREAM_EVENTS, function (index, eventType) {
            //    res.on(eventType, function () {
            //        if (the._ignoreError && eventType === 'error') {
            //            the._ignoreError = false;
            //            return;
            //        }
            //
            //        if (eventType === 'abort' || eventType === 'end' || eventType === 'close') {
            //            the._stoped = true;
            //        }
            //
            //        var args = allocation.args(arguments);
            //        args.unshift(eventType);
            //        the.emit.apply(the, args);
            //    });
            //});

            the._receiveResponse();
        });

        req.on('error', function (err) {
            if (the._ignoreError) {
                the._ignoreError = false;
                return;
            }

            the.emit('error', err);
        });

        req.on('drain', function () {
            console.log('ddddddddddddddddddddddddddddddddddddd');
            the.emit('drain');
        });

        if (options.timeout > 0) {
            req.setTimeout(options.timeout, function () {
                the._ignoreError = true;
                req.abort();
                controller.nextTick(function () {
                    var requestTimeoutError = ' request timeout ' + options.timeout + 'ms';
                    the.debug(requestTimeoutError);
                    the.emit('error', new Error(requestTimeoutError));
                });
            });
        }
    },


    /**
     * 构建 cookie
     * @private
     */
    _buildCookies: function () {
        var the = this;
        var cookies = the.res.headers['set-cookie'];

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
     * @private
     */
    _receiveResponse: function () {
        var the = this;
        var options = the._options;
        var req = the.req;
        var res = the.res;

        //the._redirecting = false;

        if (options.method === 'HEAD') {
            the._ignoreError = true;
            the.emit('response', res);
            return;
        }

        var bfList = [];
        var resContent = res;
        var contentEncoding = res.headers['content-encoding'] || 'identity';
        contentEncoding = contentEncoding.trim().toLowerCase();

        if (contentEncoding === 'gzip') {
            resContent = zlib.createGunzip();
            resContent = res.pipe(resContent);
        }

        if (the._pipeTo) {
            resContent.pipe(the._pipeTo);
            return;
        }

        var isUTF8 = options.encoding === 'utf8';

        if (the._paused) {
            resContent.pause();
        }

        the.resContent = resContent;
        resContent.setEncoding(options.encoding);
        the.emit('response', resContent);
        resContent.on('data', function (chunk) {
            the._reading = true;
            bfList.push(new Buffer(chunk, options.encoding));
            the.emit('data', chunk);
        }).on('end', function () {
            the.emit('end');
            var bfCollection = Buffer.concat(bfList);

            if (isUTF8) {
                the.emit('body', bfCollection.toString());
            } else {
                the.emit('body', new Buffer(bfCollection));
            }
        }).on('close', function () {
            the.emit('close');
            var responseCloseError = 'response is closed';
            the.debug(responseCloseError);
            the.emit('error', new Error(responseCloseError));
            bfList = null;
        });
    },


    /**
     * 流导向
     * @param writeStream
     * @returns {Request}
     */
    pipe: function (writeStream) {
        var the = this;

        if (the._reading) {
            throw new Error('You cannot pipe after data has been emitted from the response.');
        }

        if (the._pipeTo) {
            throw new Error('You can not specify multiple targets');
        }

        if (writeStream && writeStream.writable && writeStream instanceof stream.Stream) {
            the._pipeTo = writeStream;
        }

        return writeStream;
    },


    /**
     * 中断请求
     * @returns {Request}
     */
    abort: function () {
        var the = this;

        try {
            the.req.abort();
        } catch (err) {
            // ignore
        }

        return the;
    },


    /**
     * 写，接收流
     * @returns {*}
     */
    write: function () {
        console.log('wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww');
        var the = this;

        the._pipeFrom = true;

        if (the._stoped) {
            return;
        }

        if (the._reading) {
            throw new Error('You cannot write after data has been emitted from the response.');
        }

        if (the._pipeTo) {
            throw new Error('You can not write after pipe to target.');
        }

        the._writing = true;

        if (!the._started) {
            the._request();
        }

        return the.req.write.apply(the.req, arguments);
    },


    /**
     * 写，接收流
     * @param chunk
     */
    end: function (chunk) {
        var the = this;
        console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', the._redirecting);

        if (the._stoped) {
            return;
        }

        if (the._redirecting) {
            the._request();
            return;
        }

        if (!the._started) {
            the._pipeFrom = true;
            the._request();
        }

        if (chunk) {
            the.write(chunk);
        }

        the.req.end.apply(the.req, arguments);
    },
    //
    //
    ///**
    // * pause
    // */
    //pause: function () {
    //    var the = this;
    //
    //    if (!the.resContent) {
    //        the._paused = true;
    //    } else {
    //        the.resContent.pause.apply(the.resContent, arguments);
    //    }
    //},
    //
    //
    ///**
    // * resume
    // */
    //resume: function () {
    //    var the = this;
    //
    //    if (!the.resContent) {
    //        the._paused = false;
    //    } else {
    //        the.resContent.resume.apply(the.resContent, arguments);
    //    }
    //}
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
request.post = function (url) {
    return new Request({
        url: url,
        method: 'post'
    });
};
request.down = request.download = function (url) {
    return new Request({
        url: url,
        method: 'get',
        encoding: 'binary'
    });
};

module.exports = request;
