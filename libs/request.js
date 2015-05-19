/*!
 * 远程请求
 * @author ydr.me
 * @create 2014-11-22 23:11
 */

'use strict';

var fs = require('fs');
var url = require('url');
var http = require('http');
var https = require('https');
var qs = require('querystring');
var typeis = require('./typeis.js');
var dato = require('./dato.js');
var number = require('./number.js');
var zlib = require('zlib');
var browserHeaders = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'accept-encoding': 'gzip, deflate, sdch',
    'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'
};
var defaults = {
    // 请求方法
    method: 'GET',
    // 响应编码
    encoding: 'utf8',
    // 是否在接收到 30x 后自动跳转
    isRedirectOnHeadWhen30x: true,
    // 是否回调 stream
    isCallbackStream: false,
    // 最大 30x 跳转次数
    max30xRedirectTimes: 10,
    // 头信息
    headers: {},
    // form 表单，优先级1，form-data 模块的实例
    form: null,
    // 请求文件，优先级2
    file: null,
    // 请求体，优先级2
    body: null,
    // 超时时间：15 秒
    timeout: 15000,
    // 是否自动解压 gzip 压缩
    autoGunzip: true,
    // 是否模拟浏览器
    simulateBrowser: true
};
var methods = 'head get post put delete options'.split(' ');
var noop = function () {
    //
};
var REG_HTTP = /^https?:\/\//i;


/**
 * HEAD/GET/POST/PUT/DELETE/OPTIONS 请求
 */
methods.forEach(function (method) {
    /**
     * @name exports
     * @property head {Function}
     * @property get {Function}
     * @property post {Function}
     * @property put {Function}
     * @property delete {Function}
     * @property options {Function}
     */
    exports[method] = function (options, callback) {
        if (typeis(options) === 'string') {
            options = {
                url: options
            };
        }

        options.method = method;
        _remote(options, callback);
    };
});


/**
 * 下载资源
 * @param options {String|Object}
 * @param [options.method="get"] {String}
 * @param [options.isCallbackStream=true] {Boolean}
 * @param callback {Function}
 */
exports.down = function (options, callback) {
    if (typeis(options) === 'string') {
        options = {
            url: options
        };
    }

    options.method = 'get';
    options.isCallbackStream = true;
    _remote(options, callback);
};


/**
 * 设置模拟浏览器请求的 headers
 * @param options {Object}
 */
exports.setBrowserHeaders = function (options) {
    dato.extend(browserHeaders, options);
};


/**
 * 远程请求
 * @param options
 * @param options.url {String} 请求地址
 * @param [options.isRedirectOnHeadWhen30x=true] {Boolean} head 请求时出现 30x 是否跳转
 * @param [options.isCallbackStream=false] {Boolean} 是否回调 stream
 * @param [options.max30xRedirectTimes=10] {Number} 30x 最大跳转次数
 * @param [options.method="GET"] {String} 请求方法
 * @param [options.headers=null] {Object} 请求头
 * @param [options.encoding="utf8"] {String} 响应处理编码，可选 utf8/binary
 * @param [options.form=null] {String|Stream|Object} POST/PUT 写入数据
 * @param [options.file=null] {String|Stream|Object} POST/PUT 写入数据
 * @param [options.body=null] {String|Stream|Object} POST/PUT 写入数据
 * @param [options.timeout=15000] {Number} 超时时间
 * @param [options.query=null] {Object} querystring
 * @param callback
 * @private
 */
function _remote(options, callback) {
    var int30x = 0;
    var req;

    // ！！！这里千万不要深度复制！！！
    options = dato.extend(false, {}, defaults, options);
    options.max30xRedirectTimes = number.parseInt(options.max30xRedirectTimes, 10);
    callback = typeis.function(callback) ? callback : noop;

    var querystring = '';

    if (typeis.object(options.query)) {
        try {
            querystring = qs.stringify(options.query);
        } catch (err) {
            return callback(err);
        }
    }

    if (querystring) {
        querystring = (options.url.indexOf('?') > -1 ? '&' : '?') + querystring;
    }

    options.url += querystring;
    options.query = null;

    var request = function () {
        req = _request(options, function (err, bodyORheadersORstream, res) {
            var context = this;

            if (!options.isRedirectOnHeadWhen30x && options.method === 'head' || err) {
                clearTimeout(timeid);
                return callback.call(context, err, bodyORheadersORstream, res);
            }

            var is30x = res.statusCode === 301 || res.statusCode === 302;

            if (is30x) {
                int30x++;
            }

            if (is30x && int30x > options.max30xRedirectTimes) {
                clearTimeout(timeid);
                return callback.call(context, new Error('30x redirect times over ' + options.max30xRedirectTimes));
            }

            if (is30x) {
                var domain = this.options.protocol + '//' + this.options.hostname;
                var urlto = res.headers.location;

                urlto = (REG_HTTP.test(urlto) ? '' : domain) + urlto;
                options.url = urlto;
                request();
            } else {
                clearTimeout(timeid);
                callback.call(context, err, bodyORheadersORstream, res);
            }
        });
    };

    request();

    var timeid = setTimeout(function () {
        if (req) {
            req.abort();
        }

        options.href = options.url;
        callback.call({
            options: options
        }, new Error('request timeout'));
        callback = noop;
    }, options.timeout);
}


/**
 * 远程请求
 * @param options
 * @param options.url {String} 请求地址
 * @param [options.method="GET"] {String} 请求方法
 * @param [options.headers=null] {Object} 请求头
 * @param [options.encoding="utf8"] {String} 响应处理编码，可选 utf8/binary
 * @param [options.isCallbackStream=false] {Boolean} 是否回调 stream
 * @param [options.form=null] {String|Stream|Object} POST/PUT 写入数据
 * @param [options.file=null] {String|Stream|Object} POST/PUT 写入数据
 * @param [options.body=null] {String|Stream|Object} POST/PUT 写入数据
 * @param callback
 * @private
 */
function _request(options, callback) {
    if (typeis(options.url) !== 'string') {
        return callback(new Error('request url must be a string'));
    }

    var requestOptions = url.parse(options.url);
    var _http = requestOptions.protocol === 'https:' ? https : http;
    var form = options.form;
    var file = options.file;
    var body = options.body;

    options.headers = _lowerCaseHeaders(options.headers);

    var bodyLength = options.headers['content-length'];

    if (typeis.plainObject(body)) {
        try {
            body = JSON.stringify(body);
        } catch (err) {
            return callback(err);
        }
    }

    requestOptions.method = options.method.toUpperCase();

    var canSend = requestOptions.method !== 'GET' &&
        requestOptions.method !== 'OPTIONS' &&
        requestOptions.method !== 'HEAD';
    var stat;

    if (form && typeis.function(form.getHeaders)) {
        options.headers = form.getHeaders(options.headers);
    } else if (canSend && bodyLength === undefined) {
        if (file) {
            form = null;
            try {
                stat = fs.statSync(file);
            } catch (err) {
                return callback(err);
            }

            bodyLength = stat.size;
            body = fs.createReadStream(file);
        } else if (body instanceof Buffer) {
            form = null;
            file = null;
            bodyLength = body.length;
        } else if (typeis.string(body)) {
            form = null;
            file = null;
            bodyLength = Buffer.byteLength(body);
        }
    } else if (!canSend) {
        form = null;
        file = null;
        body = null;
        bodyLength = 0;
    }

    if (bodyLength !== undefined) {
        // 当上传流文件时，length 长度可以不指定
        options.headers['content-length'] = bodyLength;
    }

    requestOptions.headers = {
        host: requestOptions.host,
        origin: requestOptions.protocol + '//' + requestOptions.host,
        referer: options.url,
        referrer: options.url
    };
    dato.extend(requestOptions.headers, browserHeaders, options.headers);

    var context = {
        options: requestOptions
    };
    var req = _http.request(requestOptions, function (res) {
        var bufferList = [];
        var binarys = '';
        var isUtf8 = options.encoding === 'utf8';

        if (requestOptions.method === 'HEAD') {
            req.abort();
            return callback.call(context, null, res.headers, res);
        }

        var isGzip = res.headers['content-encoding'] === 'gzip';
        var onreceive = function (stream) {
            if (options.isCallbackStream) {
                callback.call(context, null, stream, res);
            } else {
                stream.setEncoding(options.encoding);
                stream.on('data', function (chunk) {
                    if (isUtf8) {
                        bufferList.push(new Buffer(chunk, 'utf8'));
                    } else {
                        binarys += chunk;
                    }
                }).on('end', function () {
                    var data;

                    if (isUtf8) {
                        data = Buffer.concat(bufferList).toString();
                    } else {
                        data = binarys;
                    }

                    callback.call(context, null, data, res);
                }).on('error', callback.bind(context));
            }
        };

        if (isGzip) {
            var gunzip = zlib.createGunzip();

            res.pipe(gunzip);
            onreceive(gunzip);
        } else {
            onreceive(res);
        }
    });

    req.on('error', callback.bind(context));

    if (canSend) {
        if (form && typeis.function(form.pipe)) {
            form.pipe(req);
        } else if (body && typeis.function(body.pipe)) {
            body.pipe(req);
        } else {
            req.end(body);
        }
    } else {
        req.end();
    }

    return req;
}


/**
 * 小写化 headers
 * @param headers
 * @returns {{}}
 * @private
 */
function _lowerCaseHeaders(headers) {
    var headers2 = {};

    dato.each(headers, function (key, val) {
        headers2[String(key).trim().toLowerCase()] = String(val).trim();
    });

    return headers2;
}
