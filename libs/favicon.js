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
var REG_ICON = /icon/i;
var REG_HTTP = /^https?:\/\//i;
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
    saveDirection: '',
    // 更新时间点
    updateHours: [0, 1, 2, 3, 4, 5, 6, 7]
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
    var date = new Date();
    var hour = date.getHours();

    if (configs.updateHours.indexOf(hour) === -1) {
        return;
    }

    try {
        fse.writeJSONFileSync(configs.configsFilePath, defaultConfigs, {
            encoding: 'utf8'
        });
    } catch (err) {
        // ignore
    }
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
            .task(the._getFaviconFromRootDirection.bind(the))
            .task(the._getFaviconFromPage.bind(the))
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

            if (the._url.hostname.indexOf('.') === -1) {
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
     * 从根目录获取 favicon
     * @param next
     * @private
     */
    _getFaviconFromRootDirection: function (next) {
        var the = this;

        if (the.faviconFile) {
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

            the.faviconURL = the._parseFaviconURLFromBody(body);
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

        dato.each(links, function () {
            var rel = the._getRel(body);
            var type = the._getType(body);
            var href = the._getHref(body);

            if (REG_ICON.test(rel) || REG_ICON.test(type)) {
                find = href;
            }
        });

        return find;
    },


    // 获得 rel 属性
    _getRel: function (html) {
        return (html.match(REG_REL) || ['', ''])[1];
    },

    // 获得 type 属性
    _getType: function (html) {
        return (html.match(REG_TYPE) || ['', ''])[1];
    },

    // 获得 href 属性
    _getHref: function (html) {
        return (html.match(REG_HREF) || ['', ''])[1];
    }
});


module.exports = Favicon;