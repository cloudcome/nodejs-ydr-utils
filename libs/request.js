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
var FormData = require('form-data');


var pkg = require('../package.json');
var klass = require('./class.js');
var dato = require('./dato.js');
var typeis = require('./typeis.js');
var random = require('./random.js');
var allocation = require('./allocation.js');
var controller = require('./controller.js');
var mime = require('./mime.js');

// @link https://nodejs.org/api/stream.html#stream_class_stream_readable
var READABLE_STREAM_EVENTS = ['close', 'data', 'end', 'error', 'readable'];
var NO_BODY_REQUEST = {
    GET: true,
    HEAD: true,
    OPTIONS: true
};
var autoStartEventTypes = {
    response: true,
    body: true
};
var defaults = {
    query: {},
    body: {},
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
    constructor: function (options, callback) {
        var the = this;

        if (typeis.String(options)) {
            options = {
                url: options
            };
        }

        if (typeis.Function(callback)) {
            the._callback = callback;
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
        the._forms = [];
        the._initEvent();
    },


    /**
     * 初始化事件
     * @private
     */
    _initEvent: function () {
        var the = this;

        the.on('newListener', function (et) {
            if (autoStartEventTypes[et]) {
                controller.nextTick(function () {
                    the._request();
                });
            }
        });

        if (the._callback) {
            controller.nextTick(function () {
                the.on('error', function (err) {
                    the._callback.call(the, err);
                });
                the.on('body', function (body) {
                    the._callback.call(the, null, body, the.res);
                });
            });
        }
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
     * 构建 form-data 表单
     * @returns {FormData|exports|module.exports|*}
     * @private
     */
    _buildForms: function () {
        var the = this;

        var fd = new FormData();
        dato.each(the._forms, function (index, item) {
            if (typeis.String(item[2])) {
                item[2] = {
                    contentType: mime.get(path.basename(item[2])),
                    filename: item[2]
                };
            }

            fd.append.apply(fd, item);
        });

        return fd;
    },


    /**
     * 构建请求头
     * @private
     */
    _buildRequestHeaders: function (requestOptions) {
        var the = this;
        var options = the._options;

        if (the._pipeFrom) {
            return;
        }

        if (NO_BODY_REQUEST[options.method]) {
            requestOptions.headers['content-length'] = 0;
            return;
        }

        if (the._forms.length) {
            the._stream = the._buildForms();
            var streamHeaders = the._stream.getHeaders({});
            the.debug('request stream', '\n', the._stream);
            dato.extend(requestOptions.headers, streamHeaders);
        } else {
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
        }
    },


    /**
     * 发送请求
     * @private
     */
    _buildRequestSend: function () {
        var the = this;
        var options = the._options;

        the.req.requestId = random.guid();

        if (the._pipeFrom) {
            if (the._redirecting) {
                throw new Error('do not support redirect stream, please us `#stream` method instead');
            }
            return;
        }

        if (NO_BODY_REQUEST[options.method]) {
            the.req.end();
            return;
        }

        if (the._stream) {
            the._stream.pipe(the.req);
        } else {
            the.req.end(the._requestBody);
        }
    },


    /**
     * 实际请求
     * @private
     */
    _request: function () {
        var the = this;

        if (the._started) {
            return;
        }

        the._started = true;
        var options = the._options;
        var client = the._url.protocol === 'https:' ? https : http;
        var requestOptions = the._buildRequestOptions();

        the._buildRequestHeaders(requestOptions);
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
                the._started = false;
                the._request();

                return;
            }

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

        var callbackResponse = controller.once(function () {
            var bfCollection = Buffer.concat(bfList);

            if (isUTF8) {
                the.emit('body', bfCollection.toString());
            } else {
                the.emit('body', new Buffer(bfCollection));
            }
        });

        resContent.on('data', function (chunk) {
            the._reading = true;
            bfList.push(new Buffer(chunk, options.encoding));
            the.emit('data', chunk);
        }).on('end', function () {
            the.emit('end');
            callbackResponse();
        }).on('close', function () {
            the.emit('close');
            callbackResponse();
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

        if (writeStream && writeStream instanceof stream.Stream) {
            the._pipeTo = writeStream;

            if (!the._started) {
                the._request();
            }
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
     * pause
     */
    pause: function () {
        var the = this;

        if (!the.resContent) {
            the._paused = true;
        } else {
            the.resContent.pause.apply(the.resContent, arguments);
        }
    },


    /**
     * resume
     */
    resume: function () {
        var the = this;

        if (!the.resContent) {
            the._paused = false;
        } else {
            the.resContent.resume.apply(the.resContent, arguments);
        }
    },


    /**
     * 添加 form-data
     * @param key
     * @param val
     * @param [options]
     * @returns {Request}
     */
    form: function (key, val, options) {
        var the = this;

        the._forms.push([key, val, options]);

        return the;
    },


    /**
     * 写，接收流
     * @returns {*}
     */
    write: function () {
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

        if (the._stoped) {
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
    }
});

Request.defaults = defaults;
Request.FormData = FormData;


var request = function (options) {
    return new Request(options);
};

request.defaults = defaults;
request.Request = Request;
request.FormData = FormData;
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
