/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-06 17:57
 */


'use strict';

var marked = require('marked');
var showdown = require('showdown');
var xss = require('xss');

var allocation = require('./allocation.js');
var dato = require('./dato.js');

var xssDefaults = {
    // 通过 whiteList 来指定，格式为：{'标签名': ['属性1', '属性2']}。
    // 不在白名单上 的标签将被过滤，不在白名单上的属性也会被过滤。
    whiteList: {
        a: ['href', 'title', 'target'],
        img: ['src', 'title', 'alt'],
        b: [],
        i: [],
        s: [],
        big: [],
        strong: [],
        small: [],
        h1: [],
        h2: [],
        h3: [],
        h4: [],
        h5: [],
        h6: [],
        table: [],
        thead: [],
        tbody: [],
        tfoot: [],
        caption: [],
        hr: [],
        p: []
    },

    // 通过 stripIgnoreTag 来设置：
    // true：去掉不在白名单上的标签
    // false：（默认），使用配置的escape函数对该标签进行转义
    stripIgnoreTag: false,

    // 通过 stripIgnoreTagBody 来设置：
    // false|null|undefined：（默认），不特殊处理
    // '*'|true：去掉所有不在白名单上的标签
    // ['tag1', 'tag2']：仅去掉指定的不在白名单上的标签
    stripIgnoreTagBody: [
        'script',
        'link',
        'meta',
        'body',
        'head',
        'template'
    ]
};
// 空白
//var REG_SPACE = /[\x00-\x20\x7F-\xA0\u1680\u180E\u2000-\u200B\u2028\u2029\u202F\u205F\u3000\uFEFF\t\v]{1,}/g;
var REG_BREAK_LINE = /\r/g;
var REG_BREAK_LINE_SAFE = /\n+/g;
var REG_LONG_BREAK_LINE = /\n{3,}/g;
var REG_PRE1 = /^`{3,}.*$\n((^.*$\n)*?)^`{3,}.*$/mg;
var REG_PRE2 = /(^ {4}.*$)+\n/mg;
// ![]()
var REG_IMAGE = /!\[.*?][\[\(].*[\]\)]/g;
var REG_LINK1 = /<(http|ftp).*?>/ig;
// [][] []()
var REG_LINK2 = /\[(.*?)][\[\(].*?[\]\)]/g;
var REG_BLOCKQUOTE = /^( *>[^\n]*)+/mg;


/**
 * 配置
 * @returns {*}
 */
exports.config = function () {
    return allocation.getset({
        get: function (key) {
            return xssDefaults[key];
        },

        set: function (key, val) {
            var o = {};

            o[key] = val;
            dato.extend(true, xssDefaults, o);
        }
    }, arguments);
};


/**
 * 返回 markdown table of content
 * @param text
 * @param [options]
 * @param [options.toc]
 * @param [options.headingPrefix]
 * @param [options.render]
 * @returns {string}
 */
exports.toc = function (text, options) {
    var tokens = marked.lexer(text);
    var index = 0;
    var toc = '';
    var defaults = {
        toc: true,
        headingPrefix: 'heading',
        render: true
    };
    options = dato.extend({}, defaults, options);

    tokens.forEach(function (token) {
        if (token.type !== 'heading') {
            return;
        }

        var text = token.text;

        // remove image
        text = text.replace(REG_IMAGE, '')
            // clean link
            .replace(REG_LINK2, '$1');

        var depth = new Array((token.depth - 1) * 4 + 1).join(' ');
        //var id = encryption.md5(exports.mdRender(text).replace(REG_TAG_P, '').trim());

        toc += depth + '- [' + text + '](#' + options.headingPrefix + '-' + token.depth + '-' + (index++) + ')\n';
    });

    if (options.render) {
        toc = exports.render(toc);
    }

    return toc;
};


/**
 * 返回 markdown 摘要信息
 * @param source
 * @param [maxLength]
 * @returns {string}
 */
exports.summary = function (source, maxLength) {
    maxLength = maxLength || 140;

    var lines = source
        .replace(REG_PRE1, '')
        .replace(REG_PRE2, '')
        .replace(REG_IMAGE, '')
        .replace(REG_LINK1, '')
        .replace(REG_LINK2, '$1')
        .replace(REG_BLOCKQUOTE, ' ')
        .split(/\n{2,}/g);

    var length = 0;
    var ret = '';

    dato.each(lines, function (index, line) {
        var chunk = line.replace(REG_BREAK_LINE_SAFE, ' ');

        ret += chunk;
        length += chunk.length;

        if (length >= maxLength) {
            return false;
        }
    });

    return ret;
};


exports.render = function (text, options) {
    var converter = new showdown.Converter();
    var html = converter.makeHtml(text);
    var safe = xss(html, xssDefaults);
    var toc = '';
    var defaults = {
        toc: true,
        headingPrefix: 'heading'
    };
    options = dato.extend({}, defaults, options);

    if (options.toc) {
        var tokens = marked.lexer(text);
        var index = 0;

        tokens.forEach(function (token) {
            if (token.type !== 'heading') {
                return;
            }

            var text = token.text;

            // remove image
            text = text.replace(REG_IMAGE, '')
                // clean link
                .replace(REG_LINK2, '$1');

            var depth = new Array((token.depth - 1) * 4 + 1).join(' ');
            //var id = encryption.md5(exports.mdRender(text).replace(REG_TAG_P, '').trim());

            toc += depth + '- [' + text + '](#' + options.headingPrefix + '-' + token.depth + '-' + (index++) + ')\n';
        });
    }

    return {
        html: html,
        safe: safe,
        toc: toc
    };
};
