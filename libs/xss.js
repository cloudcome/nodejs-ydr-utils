/*!
 * xss 安全【非常重要】
 * @author ydr.me
 * @create 2014-11-22 23:11
 */

'use strict';

var marked = require('marked');
var typeis = require('./typeis.js');
var dato = require('./dato.js');
var encryption = require('./encryption.js');
var url = require('url');
var REG_DOUBLE = /^\/\//;
var REG_POINT = /\./g;
var REG_LT = /</g;
var REG_GT = />/g;
var REG_SHAP = /^#/;
var REG_NOT_WORD = /[^\w]/g;
var RGE_FIRST = /^-/;
var REG_TOC = /^#heading(-\d-\d+-.*)$/;
// 空白
//var REG_SPACE = /[\x00-\x20\x7F-\xA0\u1680\u180E\u2000-\u200B\u2028\u2029\u202F\u205F\u3000\uFEFF\t\v]{1,}/g;
var REG_LONG_BREAK_LINE = /[\n\r]{3,}/g;
// 自动关闭标签是安全的，如 br、hr、img 等
var REG_CLOSE_TAGNAME = /(?!```)<([a-z\d]+)\b[\s\S]*?>([\s\S]*?)<\/\1>(?!```)/ig;
var REG_PRE = /```[\s\S]*?```/g;
var REG_PATH = /^(\/|\.{0,2})(\/[^/]+)+$/;
// 影响页面的危险标签
var dangerTagNameList = 'script iframe frameset body head html link'.split(' ');
var filterDefaults = {
    /**
     * link 配置
     * 1、无域地址都在当前窗口打开
     * 2、符合 hosts 内的域名都在当前窗口打开
     * 3、其他都在新窗口打开
     * 4、不合法的URL直接返回空
     */
    link: {
        /**
         * 不需要新窗口打开的域名
         * @type Array
         */
        hosts: [],
        filter: function (href, title, text) {
            return _buildLink(href, title, text, true);
        }
    }
};


/**
 * markdown 语法安全过滤，虽然 markdown 支持兼容 HTML 标签，但为了安全考虑，
 * 这里必须去掉相当一部分的标签
 * @param source {String} 原始内容
 * @param [moreDangerTagNameList] {Array} 更多危险标签，危险标签是会被直接删除的
 * @returns {string} 过滤后的内容
 */
exports.mdSafe = function (source, moreDangerTagNameList) {
    var list = source.split(REG_PRE);
    var pres = source.match(REG_PRE) || [''];
    var ret = '';
    var i = 0;

    if (typeis(moreDangerTagNameList) !== 'array') {
        moreDangerTagNameList = [];
    }

    // 过滤不安全 HTML 标签
    list = list.map(function (item) {
        return item
            .replace(REG_CLOSE_TAGNAME, function ($0, $1) {
                $1 = $1.toLowerCase();

                if (dangerTagNameList.indexOf($1) > -1 || moreDangerTagNameList.indexOf($1) > -1) {
                    return '';
                } else {
                    return $0.replace(REG_LT, '&lt;').replace(REG_GT, '&gt;');
                }
            })
            .replace(REG_LONG_BREAK_LINE, '\n\n\n');
    });

    list.forEach(function (item, j) {
        if (j > 0) {
            ret += pres[i++];
        }

        ret += item;
    });

    return ret;

    //var tokens = marked.lexer(source);
    //var toc = '<!--toc start-->';
    //
    //tokens.forEach(function (token) {
    //    if (token.type !== 'heading') {
    //        return;
    //    }
    //
    //    var depth = new Array((token.depth - 1) * 4 + 1).join(' ');
    //
    //    toc += depth + '- [' + token.text + '](#heading-' + encryption.md5(token.text) + ')\n';
    //});
    //
    //return toc + '\n\n<!--toc end-->' + ret;
};


/**
 * table of content
 * @param source {String} 原始内容
 * @returns {string}
 */
exports.mdTOC = function (source) {
    var tokens = marked.lexer(source);
    var toc = '\n\n';
    var index = 0;

    tokens.forEach(function (token) {
        if (token.type !== 'heading') {
            return;
        }

        var depth = new Array((token.depth - 1) * 4 + 1).join(' ');

        toc += depth + '- [' + token.text + '](#heading-' + token.depth + '-' + (index++) + '-' + encryption.md5(token.text) + ')\n';
    });

    return toc + '\n\n';
};


/**
 * markdown 内容渲染成 HTML 内容
 * @param source {String} 原始 markdown 内容
 * @param [filterOptions] {Object} 配置
 */
exports.mdRender = function (source, filterOptions) {
    var markedRender = new marked.Renderer();

    filterOptions = dato.extend(true, {}, filterDefaults, filterOptions);

    // 定义 A 链接的 target
    markedRender.link = function (href, title, text) {
        if (REG_SHAP.test(href)) {
            return _buildLink(href, title, text, false);
        }

        var fixHref = REG_DOUBLE.test(href) ? 'http:' + href : href;
        var parse = url.parse(fixHref);
        var host = parse.host;
        var inHost = false;

        // 非 URL && 非 PATH
        if (!typeis.url(href) && !REG_PATH.test(href)) {
            return '';
        }

        if (!host) {
            return _buildLink(href, title, text, false);
        }

        dato.each(filterOptions.link.hosts, function (index, item) {
            if (_regExp(item).test(host)) {
                inHost = true;
                return false;
            }
        });

        // 指定域内的 NO _blank
        if (inHost) {
            return _buildLink(href, title, text, false);
        }

        // 其他的使用传入对象处理
        return filterOptions.link.filter(href, title, text);
    };


    var index = 0;

    markedRender.heading = function (text, level) {
        var href = encryption.md5(text);

        var html = '<h' + level + ' id="heading-' + level + '-' + index + '-' + href + '"><a class="heading-link" ' +
            'href="#toc-' + level + '-' + index + '-' + href + '">' +
            text + '</a></h' + level + '>';

        index++;

        return html;
    };


    marked.setOptions({renderer: markedRender});

    return marked(source);
};


/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////


/**
 * 生成链接
 * @param href
 * @param title
 * @param text
 * @param isBlank
 * @returns {string}
 * @private
 */
function _buildLink(href, title, text, isBlank) {
    text = text.trim();

    return '<a href="' + href + '"' +
        (REG_TOC.test(href) ? ' id="toc' + href.replace(REG_TOC, '$1') + '"' : '') +
        (isBlank ? ' target="_blank"' : '') +
        (title ? ' ' + title : '') +
        '>' + (text || href) + '</a>';
}


/**
 * 生成正则
 * @param regstr
 * @returns {RegExp}
 * @private
 */
function _regExp(regstr) {
    var arr = regstr.split('*.');
    var ret = '';

    arr = arr.map(function (item) {
        return item.replace(REG_POINT, '\\.');
    });

    arr.forEach(function (item, index) {
        if (index > 0) {
            ret += '([^.]+\\.)*';
        }

        ret += item;
    });

    return new RegExp('^' + ret + '$', 'i');
}


//var fs = require('fs');
//var path = require('path');
//var file1 = path.join(__dirname, '../test/test.md');
//var file2 = path.join(__dirname, '../test/test.html');
//var md1 = fs.readFileSync(file1, 'utf8');
//
//var toc = exports.mdRender(exports.mdTOC(md1));
//var content = exports.mdRender(md1);
//
//fs.writeFileSync(file2, toc + content, 'utf8');
