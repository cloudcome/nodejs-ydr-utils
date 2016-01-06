/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-06 17:57
 */


'use strict';

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

exports.render = function (text, options) {
    var converter = new showdown.Converter();
    var html = converter.makeHtml(text);
    var safe = xss(html, xssDefaults);

    return {
        html: html,
        safe: safe
    };
};
