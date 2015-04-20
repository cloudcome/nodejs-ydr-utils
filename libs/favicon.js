/*!
 * favicon 的解析与下载
 * @author ydr.me
 * @create 2015-04-20 23:03:36
 */

'use strict';

var request = require('./request.js');
var dato = require('./dato.js');
var klass = require('./class.js');
var url = require('url');
var Emitter = require('event').EventEmitter;
var REG_LINK = /<link[^<>]*?>/ig;
var REG_REL = /\brel\s*?=\s*?['"]([^'"]*?)['"]/i;
var REG_TYPE = /\btype\s*?=\s*?['"]([^'"]*?)['"]/i;
var REG_HREF = /\bhref\s*?=\s*?['"]([^'"]*?)['"]/i;
var REG_ICON = /icon/i;
var Favicon = klass.create(function (url) {
    this.url = url;
    this.favicon = '';
}, Emitter);


Favicon.implement({
    _getPageHTML: function () {
        var the = this;

        request.get(the.url, function (err, body) {
            if (err) {
                return the.emit('error', err);
            }

            the.favicon = the._parseFaviconURLFromBody(body);
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

        if(!links){
            return null;
        }

        var find = null;

        dato.each(links, function () {
            var rel = the._getRel(body);
            var type = the._getType(body);
            var href = the._getHref(body);

            if(REG_ICON.test(rel) || REG_ICON.test(type)){
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

