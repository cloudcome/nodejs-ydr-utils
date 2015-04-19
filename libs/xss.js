/*!
 * xss 安全【非常重要】
 * @author ydr.me
 * @create 2014-11-22 23:11
 */

'use strict';

var marked = require('marked');
var random = require('./random.js');
var typeis = require('./typeis.js');
var dato = require('./dato.js');
var encryption = require('./encryption.js');
var url = require('url');
var REG_DOUBLE = /^\/\//;
var REG_POINT = /\./g;
var REG_LT = /</g;
var REG_GT = />/g;
var REG_SHAP = /^#/;
//var REG_NOT_WORD = /[^\w]/g;
//var RGE_FIRST = /^-/;
var REG_TOC = /^#heading(-\d-\d+-.*)$/;
// 空白
//var REG_SPACE = /[\x00-\x20\x7F-\xA0\u1680\u180E\u2000-\u200B\u2028\u2029\u202F\u205F\u3000\uFEFF\t\v]{1,}/g;
var REG_LONG_BREAK_LINE = /[\n\r]{3,}/g;
// 自动关闭标签是安全的，如 br、hr、img 等
var REG_CLOSE_TAGNAME = /(?!```)<([a-z\d]+)\b[\s\S]*?>([\s\S]*?)<\/\1>(?!```)/ig;
var REG_PRE = /```[\s\S]*?```/g;
var REG_PRE2 = /^( {4}[^\n]+\n*)+/g;
var REG_CODE = /(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/g;
var REG_BLOKQUOTE = /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/g;
var REG_LINK = /<https?:\/\/>/gi;
var REG_PATH = /^(\/|\.{0,2})(\/[^/]+)+$/;
var REG_SIZE = /(?:\s+?=\s*?(\d+)(?:[x*×](\d+))?)?$/i;
// 影响页面的危险标签
var dangerTagNameList = 'script iframe frameset body head html link base style'.split(' ');
var tableClassName = 'table table-radius table-bordered table-hover';
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
var sanitizeHtml = require('sanitize-html');
var sanitizeOptions = {
    allowedTags: [
        // inline
        'b', 'i', 'em', 'strong', 'a', 'img', 'code', 'del',
        // block
        'p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr',
        // list
        'ol', 'ul', 'li',
        // table
        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption'
    ],
    allowedAttributes: {
        a: ['href', 'target', 'class', 'id'],
        img: ['src', 'title', 'alt'],
        h1: ['id', 'class'],
        h2: ['id', 'class'],
        h3: ['id', 'class'],
        h4: ['id', 'class'],
        h5: ['id', 'class'],
        h6: ['id', 'class'],
        table: ['class']
    }
};


/**
 * markdown 语法安全过滤，虽然 markdown 支持兼容 HTML 标签，但为了安全考虑，
 * 这里必须去掉相当一部分的标签
 * @param source {String} 原始内容
 * @returns {string} 过滤后的内容
 */
exports.mdSafe = function (source) {
    source = source.replace(REG_LONG_BREAK_LINE, '\n\n\n');

    return source;
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


    // heading
    markedRender.heading = function (text, level) {
        var href = encryption.md5(text);

        var html = '<h' + level + ' id="heading-' + level + '-' + index + '-' + href + '"><a class="heading-link" ' +
            'href="#toc-' + level + '-' + index + '-' + href + '">' +
            text + '</a></h' + level + '>';

        index++;

        return html;
    };


    // ![](1.png =200x100)
    markedRender.image = function (src, title, text) {
        src = src || '';

        var matches = src.match(REG_SIZE);
        var width = null;
        var height = null;

        if (matches) {
            width = matches[1];
            height = matches[2];
            src = src.replace(REG_SIZE, '');
        }

        return '<img' +
            (typeis.null(title) || typeis.undefined(title) ? '' : ' title="' + title + '"') +
            (typeis.null(text) || typeis.undefined(text) ? '' : ' alt="' + text + '"') +
            (typeis.null(src) || typeis.undefined(src) ? '' : ' src="' + src + '"' ) +
            (typeis.null(width) || typeis.undefined(width) ? '' : ' width="' + width + '"') +
            (typeis.null(height) || typeis.undefined(height) ? '' : ' height="' + height + '"' ) +
            '>';
    };


    // 表格
    markedRender.table = function (thead, tbody) {
        return '<table class="' + tableClassName + '"><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table>';
    };


    marked.setOptions({renderer: markedRender});
    source = marked(source);
    source = sanitizeHtml(source, sanitizeOptions);

    return source;
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


/**
 * 生成唯一随机字符串
 * @returns {string}
 * @private
 */
function _generatorKey() {
    return 'œ' + random.string(10, 'aA0') + random.guid() + Date.now() + 'œ';
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
