/*!
 * favicon 的解析与下载
 * @author ydr.me
 * @create 2015-04-20 23:03:36
 */

'use strict';

var request = require('./request.js');
var dato = require('./dato.js');
var klass = require('./class.js');
var typeis = require('./typeis.js');
var urlParser = require('url');
var howdo = require('howdo');
var path = require('path');
var fse = require('fs-extra');
var Emitter = require('events').EventEmitter;
var REG_LINK = /<link[^<>]*?>/ig;
var REG_REL = /\brel\s*?=\s*?['"]([^'"]*?)['"]/i;
var REG_TYPE = /\btype\s*?=\s*?['"]([^'"]*?)['"]/i;
var REG_HREF = /\bhref\s*?=\s*?['"]([^'"]*?)['"]/i;
var REG_REL_ICON = /\s\bicon\b/i;
var REG_TYPE_ICON = /\s-icon\b/i;
var REG_HTTP = /^https?:\/\//i;
var REG_URL_SUFFIX = /\/[^/]*$/;
var REG_HOSTNAME = /^((xn--)?[a-z\d]+\.)+([a-z]{2,}|xn--[a-z\d]+)$/i;
/**
 * 判断是否为绝对路径
 * @type {RegExp}
 */
var REG_PATH_ABSOLUTE = /^\//;


var REG_THIS_PROTOCOL = /^\/\//;


/**
 * 判断是否相对路径
 * @type {RegExp}
 */
var REG_PATH_RELATIVE = /^(\.{1,2})\//;


/**
 * 路径结尾
 * @type {RegExp}
 */
var REG_PATH_END = /\/[^/]+?\/$/;
var noop = function () {
    //
};
var configs = {
    // favicon 文件后缀
    extname: '.ico',
    // 默认的 favicon ico文件
    defaultFaviconFilePath: '',
    // 默认的 favicon 配置文件
    configsFilePath: '',
    // favicon 文件保存目录
    saveDirection: ''
};
var Favicon = klass.create(function (url, isUpdate) {
    var the = this;

    the._oURL = url;
    the.url = url;
    the._isUpdate = Boolean(isUpdate);
    the.faviconURL = null;
    the.faviconFile = null;
}, Emitter);
var defaultConfigs = {};


Favicon.REG_MAP = {};

Favicon.config = function (options) {
    dato.extend(configs, options);
};


/**
 * 构造配置
 */
Favicon.buildDefaultConfigs = function () {
    try {
        defaultConfigs = fse.readJSONFileSync(configs.configsFilePath, 'utf8') || {};
    } catch (err) {
        // ignore
    }
};


/**
 * 更新配置
 */
Favicon.updateDefaultConfigs = function () {
    try {
        fse.writeJSONFileSync(configs.configsFilePath, defaultConfigs, {
            encoding: 'utf8'
        });
    } catch (err) {
        // ignore
    }
};


/**
 * url 合并
 * @param from
 * @param to
 * @returns {*}
 * @private
 */
Favicon.joinURL = function (from, to) {
    var parseTo = urlParser.parse(to);

    if (parseTo.protocol && parseTo.hostname) {
        return to;
    }

    var parse = urlParser.parse(from);
    var domain = (parse.protocol || 'http:') + '//' + (parse.hostname || '0');

    if (REG_THIS_PROTOCOL.test(to)) {
        return parse.protocol + to;
    }

    from = domain + (parse.pathname || '/').replace(REG_URL_SUFFIX, '/');

    if (!to || REG_PATH_ABSOLUTE.test(to)) {
        return domain + to;
    }

    var mathes;

    to = './' + to;

    while ((mathes = to.match(REG_PATH_RELATIVE))) {
        to = to.replace(REG_PATH_RELATIVE, '');

        if (mathes[1].length === 2) {
            from = from.replace(REG_PATH_END, '/');
        }
    }

    return from + to;
};


Favicon.implement({
    get: function (callback) {
        var the = this;

        callback = typeis.function(callback) ? callback : noop;

        the._safeURL();

        if (!the.url) {
            setTimeout(function () {
                the.faviconFile = configs.defaultFaviconFilePath;
                the.emit('error', new Error(the._oURL + ' is error'));
                callback.call(the);
            });
            return the;
        }

        howdo
            .task(the._getFaviconFromDefaults.bind(the))
            .task(the._getFaviconFromLocal.bind(the))
            .task(the._getFaviconFromPage.bind(the))
            .task(the._getFaviconFromRootDirection.bind(the))
            .task(the._saveFaviconFromURL.bind(the))
            .task(the._updateCache.bind(the))
            .follow(function () {
                callback.call(the);
            });

        return the;
    },


    /**
     * 安全 URL
     * @private
     */
    _safeURL: function () {
        var the = this;

        the.url = the.url.toLowerCase();
        the.url = (REG_HTTP.test(the.url) ? '' : 'http://') + the.url;

        if (the.url.length < 256 && typeis.url(this.url)) {
            the._url = urlParser.parse(the.url);

            if (!REG_HOSTNAME.test(the._url.hostname)) {
                the.url = null;
            }
        } else {
            the.url = null;
        }
    },


    /**
     * 从默认配置中读取 favicon
     * @param next
     * @private
     */
    _getFaviconFromDefaults: function (next) {
        var the = this;

        if (the._isUpdate) {
            delete(defaultConfigs[the._url.hostname]);
            Favicon.updateDefaultConfigs();
            return next();
        }

        if (defaultConfigs[the._url.hostname]) {
            the.faviconFile = configs.defaultFaviconFilePath;

            return next();
        }

        next();
    },


    /**
     * 从本地读取 favicon
     * @param next
     * @private
     */
    _getFaviconFromLocal: function (next) {
        var the = this;
        var filePath = path.join(configs.saveDirection, the._url.hostname + configs.extname);

        if (typeis.file(filePath)) {
            if (the._isUpdate) {
                try {
                    fse.unlink(filePath);
                } catch (err) {
                    // ignore
                }
            } else {
                the.faviconFile = filePath;
            }

            return next();
        }

        next();
    },


    /**
     * 从页面中获取 favicon
     * @param next
     * @private
     */
    _getFaviconFromPage: function (next) {
        var the = this;

        if (the.faviconFile || the.faviconURL) {
            return next();
        }

        request.get(the.url, function (err, body) {
            if (err) {
                return next();
            }

            var href = this.options.href;

            the.faviconURL = the._parseFaviconURLFromBody(body);
            the.faviconURL = REG_HTTP.test(the.faviconURL) ? the.faviconURL : Favicon.joinURL(href, the.faviconURL);

            console.log(the.faviconURL);
            next();
        });
    },


    /**
     * 从根目录获取 favicon
     * @param next
     * @private
     */
    _getFaviconFromRootDirection: function (next) {
        var the = this;

        if (the.faviconFile || the.faviconURL) {
            return next();
        }

        var rootDirection = the._url.protocol + '//' + the._url.host;
        var url = rootDirection + '/favicon.ico';

        the._parseFaviconURLByHead(url, function (url) {
            the.faviconURL = url;
            next();
        });
    },


    /**
     * 保存 url
     * @param next
     * @returns {*}
     * @private
     */
    _saveFaviconFromURL: function (next) {
        var the = this;

        if (the.faviconFile) {
            return next();
        }

        if (!the.faviconURL) {
            return next();
        }

        the._parseFaviconURLByHead(the.faviconURL, function (url) {
            if (!url) {
                return next();
            }

            request.down(url, function (err, binary, res) {
                if (err) {
                    the.emit('error', 'download error: ' + this.options.href);
                    return next();
                }

                var filePath = path.join(configs.saveDirection, the._url.hostname + configs.extname);

                try {
                    fse.writeFileSync(filePath, binary, 'binary');
                    the.faviconURL = this.options.href;
                    the.faviconFile = filePath;
                } catch (err) {
                    the.emit('erorr', err);
                    // ignore
                }

                next();
            });
        });
    },


    /**
     * 更新缓存
     * @param next
     * @private
     */
    _updateCache: function (next) {
        var the = this;

        if (the.faviconFile) {
            return next();
        }

        defaultConfigs[the._url.hostname] = 1;
        the.faviconFile = configs.defaultFaviconFilePath;
        Favicon.updateDefaultConfigs();
        next();
    },


    /**
     * 通过 head 请求判断资源
     * @param url
     * @param callback
     * @private
     */
    _parseFaviconURLByHead: function (url, callback) {
        var the = this;

        request.head(url, function (err, headers, res) {
            var href = this.options.href;

            if (err) {
                the.emit('error', err);
                return callback(null);
            }

            var contentLength = dato.parseInt(headers['content-length'], 0);

            if (res.statusCode === 200 && contentLength >= 20) {
                the.faviconURL = href;
                return callback(href);
            }

            if (res.statusCode !== 200) {
                the.emit('error', new Error(href + ' status code is ' + res.statusCode));
            }

            if (contentLength < 20) {
                the.emit('error', new Error(href + ' content-length is ' + contentLength));
            }

            return callback(null);
        });
    },


    /**
     * 获取资源里的 link 标签
     * @param body
     * @returns {null|String}
     * @private
     */
    _parseFaviconURLFromBody: function (body) {
        var the = this;
        var links = body.match(REG_LINK);

        if (!links) {
            return null;
        }

        var find = null;

        // 倒序查找
        dato.each(links.reverse(), function (index, link) {
            var rel = the._getAttr(link, 'rel');
            var type = the._getAttr(link, 'type');
            var href = the._getAttr(link, 'href');
            //var size = the._getAttr(link, 'size');
            //var sizes = the._getAttr(link, 'sizes');

            // <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
            if (REG_REL_ICON.test(rel) || rel === 'icon' || REG_TYPE_ICON.test(type)) {
                find = href;
                return false;
            }
        });

        return find;
    },


    /**
     * 获取 attr 属性值
     * @param html
     * @param attrName
     * @returns {*|string}
     * @private
     */
    _getAttr: function (html, attrName) {
        var reg = Favicon.REG_MAP[attrName] || new RegExp('\\b' + attrName + '\\s*?=\\s*?["\']([^"\']*?)["\']', 'i');

        Favicon.REG_MAP[attrName] = reg;

        return (html.match(reg) || ['', ''])[1].toLowerCase();
    }
});


module.exports = Favicon;