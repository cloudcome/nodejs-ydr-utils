/**
 * 字符串相关
 * @author ydr.me
 * @create 2015-05-11 10:28
 */


/**
 * @module utils/string
 * @requires utils/dato
 * @requires utils/typeis
 */

'use strict';

var dato = require('./dato.js');
var typeis = require('./typeis.js');

var win = typeof global !== 'undefined' ? global : window;
var escapeHTMLMap = {
    '&amp;': /&/g,
    '&lt;': /</g,
    '&gt;': />/g,
    '&quot;': /"/g,
    '&apos;': /'/g,
    '&#x2f;': /\//g
};
var REG_HTML_CODE = /&#(x)?([\w\d]{0,5});/i;
var unescapeHTMLMap = {
    '&': /&amp;/g,
    '<': /&lt;/g,
    '>': /&gt;/g,
    '"': /&quot;/g,
    '\'': /&apos;/g,
    '/': /&#x2f;/g
};
var REG_REGESP = /[.*+?^=!:${}()|[\]\/\\-]/g;
var REG_ASSIGN_VARIBLE = /\$\{([^{}]*?)}/g;
var REG_SEPARATOR = /[-_ ]([a-z])/g;
var REG_HUMP = /[A-Z]/g;
var REG_STAR = /\\\*/g;
var REG_NOT_UTF16_SINGLE = /[^\x00-\xff]{2}/g;
var REG_DOUBLE = /[^\x00-\xff]/g;


/**
 * 转换 HTML 字符串为实体符
 * @param str {String} html 字符串
 * @returns {String}
 */
exports.escapeHTML = function (str) {
    dato.each(escapeHTMLMap, function (src, reg) {
        str = String(str).replace(reg, src);
    });

    return str;
};


/**
 * 转换实体符为 HTML 字符串
 * @param str {String} entry 实体符
 * @returns {String}
 */
exports.unescapeHTML = function (str) {
    // 转换实体数字为实体字母
    str = String(str).replace(REG_HTML_CODE, function (full, hex, code) {
        return String.fromCharCode(parseInt(code, hex ? 16 : 10));
    });

    dato.each(unescapeHTMLMap, function (src, reg) {
        str = str.replace(reg, src);
    });

    return str;
};


/**
 * 转换正则字符串为合法正则
 * @param str {String} 正则字符串
 * @returns {string}
 */
exports.escapeRegExp = function (str) {
    return str.replace(REG_REGESP, '\\$&');
};


/**
 * 分配字符串，参考 es6
 * @param str {String} 字符串模板
 * @returns {String}
 * @example
 * string.assign('Hello ${name}, how are you ${time}?', {
     *     name: 'Bob',
     *     time: 'today'
     * });
 * // => "Hello Bob, how are you today?"
 *
 * string.assign('Hello ${1}, how are you ${2}?', 'Bob', 'today');
 * // => "Hello Bob, how are you today?"
 */
exports.assign = function (str/*arguments*/) {
    var args = arguments;
    var data = {};

    // {}
    if (typeis.object(args[1])) {
        data = args[1];
    }
    // 1, 2...
    else {
        dato.each([].slice.call(args, 1), function (index, val) {
            data[index + 1] = val;
        });
    }

    return str.replace(REG_ASSIGN_VARIBLE, function ($0, $1) {
        return String(data[$1]);
    });
};


/**
 * 转换分隔符字符串为驼峰形式
 * @param str {String} 分隔符字符串
 * @param [upperCaseFirstChar=false] {Boolean} 是否大写第一个字母
 * @returns {String}
 *
 * @example
 * string.humprize('moz-border-radius');
 * // => "mozBorderRadius"
 */
exports.humprize = function (str, upperCaseFirstChar) {
    if (!str.length) {
        return str;
    }

    if (upperCaseFirstChar) {
        str = str[0].toUpperCase() + str.substr(1);
    }

    return str.replace(REG_SEPARATOR, function ($0, $1) {
        return $1.toUpperCase();
    });
};


/**
 * 转换驼峰字符串为分隔符字符串
 * @param str {String} 驼峰字符串
 * @param [separator="-"] {String} 分隔符
 * @returns {string}
 * @example
 * string.separatorize('mozBorderRadius');
 * // => "moz-border-radius"
 */
exports.separatorize = function (str, separator) {
    if (!str.length) {
        return str;
    }

    separator = separator || '-';
    str = str[0].toLowerCase() + str.substr(1);

    return str.replace(REG_HUMP, function ($0) {
        return separator + $0.toLowerCase();
    });
};


/**
 * base64 编码
 * @param str {String} 字符串
 * @returns {string}
 */
exports.base64 = function (str) {
    if (typeis.undefined(win.Buffer)) {
        return btoa(encodeURIComponent(str));
    } else {
        return new win.Buffer(str, 'utf8').toString('base64');
    }
};


/**
 * base64 解码
 * @param str {String} 字符串
 * @returns {string}
 */
exports.debase64 = function (str) {
    if (typeis.undefined(win.Buffer)) {
        return decodeURIComponent(atob(str));
    } else {
        return new win.Buffer(str, 'base64').toString('utf8');
    }
};


/**
 * 填充字符串
 * @param isLeft {Boolean} 是否左边
 * @param str {String} 字符串
 * @param [maxLength] {Number} 最大长度，默认为字符串长度
 * @param [padding=" "] {String} 填充字符串
 * @returns {String}
 */
var pad = function (isLeft, str, maxLength, padding) {
    var length = str.length;

    padding = padding || ' ';
    maxLength = maxLength || length;

    if (maxLength <= length) {
        return str;
    }

    while ((++length) <= maxLength) {
        str = isLeft ? padding + str : str + padding;
    }

    return str;
};


/**
 * 左填充
 * @param str {*} 字符串
 * @param [maxLength] {Number} 最大长度，默认为字符串长度
 * @param [padding=" "] {String} 填充字符串
 * @returns {String}
 */
exports.padLeft = function (str, maxLength, padding) {
    return pad(true, String(str), maxLength, padding);
};


/**
 * 右填充
 * @param str {*} 字符串
 * @param [maxLength] {Number} 最大长度，默认为字符串长度
 * @param [padding=" "] {String} 填充字符串
 * @returns {String}
 */
exports.padRight = function (str, maxLength, padding) {
    return pad(false, String(str), maxLength, padding);
};


/**
 * 非点匹配
 * @param str {String} 被匹配字符
 * @param glob {String} 匹配字符
 * @param [ignoreCase=false] {Boolean} 是否忽略大小写
 * @returns {Boolean}
 * @example
 * string.glob('abc.def.com', 'abc.*.com');
 * // => true
 */
exports.glob = function (str, glob, ignoreCase) {
    var reg = new RegExp(exports.escapeRegExp(glob).replace(REG_STAR, '[^.]+?'), ignoreCase ? 'i' : '');

    return reg.test(str);
};


/**
 * 计算字节长度
 * @param string {String} 原始字符串
 * @param [doubleLength=2] {Number} 双字节长度，默认为2
 * @returns {number}
 *
 * @example
 * data.bytes('我123');
 * // => 5
 */
exports.bytes = function (string, doubleLength) {
    string += '';
    doubleLength = doubleLength || 2;

    var i = 0,
        j = string.length,
        k = 0,
        c;

    for (; i < j; i++) {
        c = string.charCodeAt(i);
        k += (c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f) ? 1 : doubleLength;
    }

    return k;
};


/**
 * 计算字符串长度
 * 双字节的字符使用 length 属性计算不准确
 * @ref http://es6.ruanyifeng.com/#docs/string
 * @param str {String} 原始字符串
 * @returns {Number}
 *
 * @example
 * var s = "𠮷";
 * s.length = 2;
 * string.length(s);
 * // => 3
 */
exports.length = function (str) {
    return String(str).replace(REG_NOT_UTF16_SINGLE, '*').length;
};


/**
 * 将特殊字符转成 unicode 编码
 * @param str {String}
 * @returns {string}
 */
exports.toUnicode = function (str) {
    return str.replace(REG_DOUBLE, function ($0) {
        return '\\u' + $0.charCodeAt(0).toString(16);
    });
};

