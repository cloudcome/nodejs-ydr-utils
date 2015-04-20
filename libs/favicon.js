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
var fse = require('fs-extra');
var Emitter = require('events').EventEmitter;
var REG_LINK = /<link[^<>]*?>/ig;
var REG_REL = /\brel\s*?=\s*?['"]([^'"]*?)['"]/i;
var REG_TYPE = /\btype\s*?=\s*?['"]([^'"]*?)['"]/i;
var REG_HREF = /\bhref\s*?=\s*?['"]([^'"]*?)['"]/i;
var REG_ICON = /icon/i;
var noop = function () {
    //
};
var defaults = {
    // 默认的 favicon ico文件
    defaultFavicon: '',
    // 默认的 favicon 配置文件
    defaultConfig: '',
    // favicon 文件保存目录
    saveDirection: ''
};
var Favicon = klass.create(function (url, options) {
    var the = this;

    the._options = dato.extend({}, defaults, options);
    the.url = url;
    the._url = urlParser.parse(url);
    the.favicon = null;
}, Emitter);
var defaultsConfigs = {};


Favicon.extend({
    config: function (options) {
        dato.extend(defaults, options);
    },
    cache: {},

    /**
     * 构造缓存
     */
    buildDefaultConfigs: function () {
        try {
            defaultsConfigs = fse.readJSONFileSync(defaults.defaultConfig, 'utf8');
        } catch (err) {
            // ignore
        }
    },


    updateDefaultConfigs: function () {
        try {
            fse.writeJSONFileSync(defaults.defaultConfig, defaultsConfigs, {
                encoding: 'utf8'
            });
        } catch (err) {
            // ignore
        }
    }
});


Favicon.implement({
    get: function (callback) {
        var the = this;

        callback = typeis.function(callback) ? callback : noop;

        howdo
            .task(the._getFaviconFromDefaults.bind(the))
            .task(the._getFaviconFromLocal.bind(the))
            .task(the._getFaviconFromRootDirection.bind(the))
            .task(the._getFaviconFromPage.bind(the))
            .task(the._savFaviconFromURL.bind(the))
            .follow(function (err) {
                callback.call(the, err, the.favicon);
            });

        return the;
    },


    /**
     * 从默认配置中读取 favicon
     * @param next
     * @private
     */
    _getFaviconFromDefaults: function (next) {
        var the = this;

        next();
    },


    /**
     * 从本地读取 favicon
     * @param next
     * @private
     */
    _getFaviconFromLocal: function (next) {
        var the = this;

        next();
    },


    /**
     * 从根目录获取 favicon
     * @param next
     * @private
     */
    _getFaviconFromRootDirection: function (next) {
        var the = this;

        if(the.favicon){
            return next();
        }

        var rootDirection = the._url.protocol + '//' + the._url.host;
        var url = rootDirection + '/favicon.ico';

        request.head(url, function (err, headers, res) {
            if (err) {
                the.emit('error', err);
                return next();
            }

            var href = this.options.href;
            var contentLength = dato.parseInt(headers['content-length'], 0);

            if (res.statusCode === 200 && contentLength >= 20) {
                the.favicon = href;
                return next();
            }

            if (res.statusCode !== 200) {
                the.emit('error', new Error(href + ' status code is ' + res.statusCode));
            }

            if (contentLength < 20) {
                the.emit('error', new Error(href + ' content-length is ' + contentLength));
            }

            return next();
        });
    },


    /**
     * 从页面中获取 favicon
     * @param next
     * @private
     */
    _getFaviconFromPage: function (next) {
        var the = this;

        if (the.favicon) {
            return next();
        }

        request.get(the.url, function (err, body) {
            if (err) {
                return next();
            }

            the.favicon = the._parseFaviconURLFromBody(body);
            next();
        });
    },


    /**
     * 保存 favicon url
     * @param next
     * @private
     */
    _savFaviconFromURL: function (next) {

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