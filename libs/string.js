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


///**
// * 将特殊字符转成 unicode 编码
// * @param str {String}
// * @returns {string}
// */
//exports.toUnicode = function (str) {
//    return str.replace(REG_DOUBLE, function ($0) {
//        return '\\u' + $0.charCodeAt(0).toString(16);
//    });
//};
//
//
///**
// * @link https://github.com/twitter/twemoji/blob/gh-pages/twemoji.amd.js#L571
// * @param unicodeSurrogates
// * @param sep
// * @returns {string}
// */
//function toCodePoint(unicodeSurrogates, sep) {
//    var
//        r = [],
//        c = 0,
//        p = 0,
//        i = 0;
//    while (i < unicodeSurrogates.length) {
//        c = unicodeSurrogates.charCodeAt(i++);
//        if (p) {
//            r.push((0x10000 + ((p - 0xD800) << 10) + (c - 0xDC00)).toString(16));
//            p = 0;
//        } else if (0xD800 <= c && c <= 0xDBFF) {
//            p = c;
//        } else {
//            r.push(c.toString(16));
//        }
//    }
//    return r.join(sep || '-');
//}
//
//
///**
// * Used to both remove the possible variant
// * and to convert utf16 into code points
// * @link https://github.com/twitter/twemoji/blob/gh-pages/twemoji.amd.js#L322
// * @param  icon {string}    the emoji surrogate pair
// * @param  variant {string}    the optional variant char, if any
// */
//function grabTheRightIcon(icon, variant) {
//    // if variant is present as \uFE0F
//    return toCodePoint(
//        variant === '\uFE0F' ?
//            // the icon should not contain it
//            icon.slice(0, -1) :
//            // fix non standard OSX behavior
//            (icon.length === 3 && icon.charAt(1) === '\uFE0F' ?
//            icon.charAt(0) + icon.charAt(2) : icon)
//    );
//}
//
//// RegExp based on emoji's official Unicode standards
//// @link http://www.unicode.org/Public/UNIDATA/EmojiSources.txt
//// @link https://github.com/twitter/twemoji/blob/gh-pages/twemoji.amd.js#L237
//var REG_EMOJI = /((?:\ud83c\udde8\ud83c\uddf3|\ud83c\uddfa\ud83c\uddf8|\ud83c\uddf7\ud83c\uddfa|\ud83c\uddf0\ud83c\uddf7|\ud83c\uddef\ud83c\uddf5|\ud83c\uddee\ud83c\uddf9|\ud83c\uddec\ud83c\udde7|\ud83c\uddeb\ud83c\uddf7|\ud83c\uddea\ud83c\uddf8|\ud83c\udde9\ud83c\uddea|\u0039\ufe0f?\u20e3|\u0038\ufe0f?\u20e3|\u0037\ufe0f?\u20e3|\u0036\ufe0f?\u20e3|\u0035\ufe0f?\u20e3|\u0034\ufe0f?\u20e3|\u0033\ufe0f?\u20e3|\u0032\ufe0f?\u20e3|\u0031\ufe0f?\u20e3|\u0030\ufe0f?\u20e3|\u0023\ufe0f?\u20e3|\ud83d\udeb3|\ud83d\udeb1|\ud83d\udeb0|\ud83d\udeaf|\ud83d\udeae|\ud83d\udea6|\ud83d\udea3|\ud83d\udea1|\ud83d\udea0|\ud83d\ude9f|\ud83d\ude9e|\ud83d\ude9d|\ud83d\ude9c|\ud83d\ude9b|\ud83d\ude98|\ud83d\ude96|\ud83d\ude94|\ud83d\ude90|\ud83d\ude8e|\ud83d\ude8d|\ud83d\ude8b|\ud83d\ude8a|\ud83d\ude88|\ud83d\ude86|\ud83d\ude82|\ud83d\ude81|\ud83d\ude36|\ud83d\ude34|\ud83d\ude2f|\ud83d\ude2e|\ud83d\ude2c|\ud83d\ude27|\ud83d\ude26|\ud83d\ude1f|\ud83d\ude1b|\ud83d\ude19|\ud83d\ude17|\ud83d\ude15|\ud83d\ude11|\ud83d\ude10|\ud83d\ude0e|\ud83d\ude08|\ud83d\ude07|\ud83d\ude00|\ud83d\udd67|\ud83d\udd66|\ud83d\udd65|\ud83d\udd64|\ud83d\udd63|\ud83d\udd62|\ud83d\udd61|\ud83d\udd60|\ud83d\udd5f|\ud83d\udd5e|\ud83d\udd5d|\ud83d\udd5c|\ud83d\udd2d|\ud83d\udd2c|\ud83d\udd15|\ud83d\udd09|\ud83d\udd08|\ud83d\udd07|\ud83d\udd06|\ud83d\udd05|\ud83d\udd04|\ud83d\udd02|\ud83d\udd01|\ud83d\udd00|\ud83d\udcf5|\ud83d\udcef|\ud83d\udced|\ud83d\udcec|\ud83d\udcb7|\ud83d\udcb6|\ud83d\udcad|\ud83d\udc6d|\ud83d\udc6c|\ud83d\udc65|\ud83d\udc2a|\ud83d\udc16|\ud83d\udc15|\ud83d\udc13|\ud83d\udc10|\ud83d\udc0f|\ud83d\udc0b|\ud83d\udc0a|\ud83d\udc09|\ud83d\udc08|\ud83d\udc07|\ud83d\udc06|\ud83d\udc05|\ud83d\udc04|\ud83d\udc03|\ud83d\udc02|\ud83d\udc01|\ud83d\udc00|\ud83c\udfe4|\ud83c\udfc9|\ud83c\udfc7|\ud83c\udf7c|\ud83c\udf50|\ud83c\udf4b|\ud83c\udf33|\ud83c\udf32|\ud83c\udf1e|\ud83c\udf1d|\ud83c\udf1c|\ud83c\udf1a|\ud83c\udf18|\ud83c\udccf|\ud83c\udd8e|\ud83c\udd91|\ud83c\udd92|\ud83c\udd93|\ud83c\udd94|\ud83c\udd95|\ud83c\udd96|\ud83c\udd97|\ud83c\udd98|\ud83c\udd99|\ud83c\udd9a|\ud83d\udc77|\ud83d\udec5|\ud83d\udec4|\ud83d\udec3|\ud83d\udec2|\ud83d\udec1|\ud83d\udebf|\ud83d\udeb8|\ud83d\udeb7|\ud83d\udeb5|\ud83c\ude01|\ud83c\ude32|\ud83c\ude33|\ud83c\ude34|\ud83c\ude35|\ud83c\ude36|\ud83c\ude38|\ud83c\ude39|\ud83c\ude3a|\ud83c\ude50|\ud83c\ude51|\ud83c\udf00|\ud83c\udf01|\ud83c\udf02|\ud83c\udf03|\ud83c\udf04|\ud83c\udf05|\ud83c\udf06|\ud83c\udf07|\ud83c\udf08|\ud83c\udf09|\ud83c\udf0a|\ud83c\udf0b|\ud83c\udf0c|\ud83c\udf0f|\ud83c\udf11|\ud83c\udf13|\ud83c\udf14|\ud83c\udf15|\ud83c\udf19|\ud83c\udf1b|\ud83c\udf1f|\ud83c\udf20|\ud83c\udf30|\ud83c\udf31|\ud83c\udf34|\ud83c\udf35|\ud83c\udf37|\ud83c\udf38|\ud83c\udf39|\ud83c\udf3a|\ud83c\udf3b|\ud83c\udf3c|\ud83c\udf3d|\ud83c\udf3e|\ud83c\udf3f|\ud83c\udf40|\ud83c\udf41|\ud83c\udf42|\ud83c\udf43|\ud83c\udf44|\ud83c\udf45|\ud83c\udf46|\ud83c\udf47|\ud83c\udf48|\ud83c\udf49|\ud83c\udf4a|\ud83c\udf4c|\ud83c\udf4d|\ud83c\udf4e|\ud83c\udf4f|\ud83c\udf51|\ud83c\udf52|\ud83c\udf53|\ud83c\udf54|\ud83c\udf55|\ud83c\udf56|\ud83c\udf57|\ud83c\udf58|\ud83c\udf59|\ud83c\udf5a|\ud83c\udf5b|\ud83c\udf5c|\ud83c\udf5d|\ud83c\udf5e|\ud83c\udf5f|\ud83c\udf60|\ud83c\udf61|\ud83c\udf62|\ud83c\udf63|\ud83c\udf64|\ud83c\udf65|\ud83c\udf66|\ud83c\udf67|\ud83c\udf68|\ud83c\udf69|\ud83c\udf6a|\ud83c\udf6b|\ud83c\udf6c|\ud83c\udf6d|\ud83c\udf6e|\ud83c\udf6f|\ud83c\udf70|\ud83c\udf71|\ud83c\udf72|\ud83c\udf73|\ud83c\udf74|\ud83c\udf75|\ud83c\udf76|\ud83c\udf77|\ud83c\udf78|\ud83c\udf79|\ud83c\udf7a|\ud83c\udf7b|\ud83c\udf80|\ud83c\udf81|\ud83c\udf82|\ud83c\udf83|\ud83c\udf84|\ud83c\udf85|\ud83c\udf86|\ud83c\udf87|\ud83c\udf88|\ud83c\udf89|\ud83c\udf8a|\ud83c\udf8b|\ud83c\udf8c|\ud83c\udf8d|\ud83c\udf8e|\ud83c\udf8f|\ud83c\udf90|\ud83c\udf91|\ud83c\udf92|\ud83c\udf93|\ud83c\udfa0|\ud83c\udfa1|\ud83c\udfa2|\ud83c\udfa3|\ud83c\udfa4|\ud83c\udfa5|\ud83c\udfa6|\ud83c\udfa7|\ud83c\udfa8|\ud83c\udfa9|\ud83c\udfaa|\ud83c\udfab|\ud83c\udfac|\ud83c\udfad|\ud83c\udfae|\ud83c\udfaf|\ud83c\udfb0|\ud83c\udfb1|\ud83c\udfb2|\ud83c\udfb3|\ud83c\udfb4|\ud83c\udfb5|\ud83c\udfb6|\ud83c\udfb7|\ud83c\udfb8|\ud83c\udfb9|\ud83c\udfba|\ud83c\udfbb|\ud83c\udfbc|\ud83c\udfbd|\ud83c\udfbe|\ud83c\udfbf|\ud83c\udfc0|\ud83c\udfc1|\ud83c\udfc2|\ud83c\udfc3|\ud83c\udfc4|\ud83c\udfc6|\ud83c\udfc8|\ud83c\udfca|\ud83c\udfe0|\ud83c\udfe1|\ud83c\udfe2|\ud83c\udfe3|\ud83c\udfe5|\ud83c\udfe6|\ud83c\udfe7|\ud83c\udfe8|\ud83c\udfe9|\ud83c\udfea|\ud83c\udfeb|\ud83c\udfec|\ud83c\udfed|\ud83c\udfee|\ud83c\udfef|\ud83c\udff0|\ud83d\udc0c|\ud83d\udc0d|\ud83d\udc0e|\ud83d\udc11|\ud83d\udc12|\ud83d\udc14|\ud83d\udc17|\ud83d\udc18|\ud83d\udc19|\ud83d\udc1a|\ud83d\udc1b|\ud83d\udc1c|\ud83d\udc1d|\ud83d\udc1e|\ud83d\udc1f|\ud83d\udc20|\ud83d\udc21|\ud83d\udc22|\ud83d\udc23|\ud83d\udc24|\ud83d\udc25|\ud83d\udc26|\ud83d\udc27|\ud83d\udc28|\ud83d\udc29|\ud83d\udc2b|\ud83d\udc2c|\ud83d\udc2d|\ud83d\udc2e|\ud83d\udc2f|\ud83d\udc30|\ud83d\udc31|\ud83d\udc32|\ud83d\udc33|\ud83d\udc34|\ud83d\udc35|\ud83d\udc36|\ud83d\udc37|\ud83d\udc38|\ud83d\udc39|\ud83d\udc3a|\ud83d\udc3b|\ud83d\udc3c|\ud83d\udc3d|\ud83d\udc3e|\ud83d\udc40|\ud83d\udc42|\ud83d\udc43|\ud83d\udc44|\ud83d\udc45|\ud83d\udc46|\ud83d\udc47|\ud83d\udc48|\ud83d\udc49|\ud83d\udc4a|\ud83d\udc4b|\ud83d\udc4c|\ud83d\udc4d|\ud83d\udc4e|\ud83d\udc4f|\ud83d\udc50|\ud83d\udc51|\ud83d\udc52|\ud83d\udc53|\ud83d\udc54|\ud83d\udc55|\ud83d\udc56|\ud83d\udc57|\ud83d\udc58|\ud83d\udc59|\ud83d\udc5a|\ud83d\udc5b|\ud83d\udc5c|\ud83d\udc5d|\ud83d\udc5e|\ud83d\udc5f|\ud83d\udc60|\ud83d\udc61|\ud83d\udc62|\ud83d\udc63|\ud83d\udc64|\ud83d\udc66|\ud83d\udc67|\ud83d\udc68|\ud83d\udc69|\ud83d\udc6a|\ud83d\udc6b|\ud83d\udc6e|\ud83d\udc6f|\ud83d\udc70|\ud83d\udc71|\ud83d\udc72|\ud83d\udc73|\ud83d\udc74|\ud83d\udc75|\ud83d\udc76|\ud83d\udeb4|\ud83d\udc78|\ud83d\udc79|\ud83d\udc7a|\ud83d\udc7b|\ud83d\udc7c|\ud83d\udc7d|\ud83d\udc7e|\ud83d\udc7f|\ud83d\udc80|\ud83d\udc81|\ud83d\udc82|\ud83d\udc83|\ud83d\udc84|\ud83d\udc85|\ud83d\udc86|\ud83d\udc87|\ud83d\udc88|\ud83d\udc89|\ud83d\udc8a|\ud83d\udc8b|\ud83d\udc8c|\ud83d\udc8d|\ud83d\udc8e|\ud83d\udc8f|\ud83d\udc90|\ud83d\udc91|\ud83d\udc92|\ud83d\udc93|\ud83d\udc94|\ud83d\udc95|\ud83d\udc96|\ud83d\udc97|\ud83d\udc98|\ud83d\udc99|\ud83d\udc9a|\ud83d\udc9b|\ud83d\udc9c|\ud83d\udc9d|\ud83d\udc9e|\ud83d\udc9f|\ud83d\udca0|\ud83d\udca1|\ud83d\udca2|\ud83d\udca3|\ud83d\udca4|\ud83d\udca5|\ud83d\udca6|\ud83d\udca7|\ud83d\udca8|\ud83d\udca9|\ud83d\udcaa|\ud83d\udcab|\ud83d\udcac|\ud83d\udcae|\ud83d\udcaf|\ud83d\udcb0|\ud83d\udcb1|\ud83d\udcb2|\ud83d\udcb3|\ud83d\udcb4|\ud83d\udcb5|\ud83d\udcb8|\ud83d\udcb9|\ud83d\udcba|\ud83d\udcbb|\ud83d\udcbc|\ud83d\udcbd|\ud83d\udcbe|\ud83d\udcbf|\ud83d\udcc0|\ud83d\udcc1|\ud83d\udcc2|\ud83d\udcc3|\ud83d\udcc4|\ud83d\udcc5|\ud83d\udcc6|\ud83d\udcc7|\ud83d\udcc8|\ud83d\udcc9|\ud83d\udcca|\ud83d\udccb|\ud83d\udccc|\ud83d\udccd|\ud83d\udcce|\ud83d\udccf|\ud83d\udcd0|\ud83d\udcd1|\ud83d\udcd2|\ud83d\udcd3|\ud83d\udcd4|\ud83d\udcd5|\ud83d\udcd6|\ud83d\udcd7|\ud83d\udcd8|\ud83d\udcd9|\ud83d\udcda|\ud83d\udcdb|\ud83d\udcdc|\ud83d\udcdd|\ud83d\udcde|\ud83d\udcdf|\ud83d\udce0|\ud83d\udce1|\ud83d\udce2|\ud83d\udce3|\ud83d\udce4|\ud83d\udce5|\ud83d\udce6|\ud83d\udce7|\ud83d\udce8|\ud83d\udce9|\ud83d\udcea|\ud83d\udceb|\ud83d\udcee|\ud83d\udcf0|\ud83d\udcf1|\ud83d\udcf2|\ud83d\udcf3|\ud83d\udcf4|\ud83d\udcf6|\ud83d\udcf7|\ud83d\udcf9|\ud83d\udcfa|\ud83d\udcfb|\ud83d\udcfc|\ud83d\udd03|\ud83d\udd0a|\ud83d\udd0b|\ud83d\udd0c|\ud83d\udd0d|\ud83d\udd0e|\ud83d\udd0f|\ud83d\udd10|\ud83d\udd11|\ud83d\udd12|\ud83d\udd13|\ud83d\udd14|\ud83d\udd16|\ud83d\udd17|\ud83d\udd18|\ud83d\udd19|\ud83d\udd1a|\ud83d\udd1b|\ud83d\udd1c|\ud83d\udd1d|\ud83d\udd1e|\ud83d\udd1f|\ud83d\udd20|\ud83d\udd21|\ud83d\udd22|\ud83d\udd23|\ud83d\udd24|\ud83d\udd25|\ud83d\udd26|\ud83d\udd27|\ud83d\udd28|\ud83d\udd29|\ud83d\udd2a|\ud83d\udd2b|\ud83d\udd2e|\ud83d\udd2f|\ud83d\udd30|\ud83d\udd31|\ud83d\udd32|\ud83d\udd33|\ud83d\udd34|\ud83d\udd35|\ud83d\udd36|\ud83d\udd37|\ud83d\udd38|\ud83d\udd39|\ud83d\udd3a|\ud83d\udd3b|\ud83d\udd3c|\ud83d\udd3d|\ud83d\udd50|\ud83d\udd51|\ud83d\udd52|\ud83d\udd53|\ud83d\udd54|\ud83d\udd55|\ud83d\udd56|\ud83d\udd57|\ud83d\udd58|\ud83d\udd59|\ud83d\udd5a|\ud83d\udd5b|\ud83d\uddfb|\ud83d\uddfc|\ud83d\uddfd|\ud83d\uddfe|\ud83d\uddff|\ud83d\ude01|\ud83d\ude02|\ud83d\ude03|\ud83d\ude04|\ud83d\ude05|\ud83d\ude06|\ud83d\ude09|\ud83d\ude0a|\ud83d\ude0b|\ud83d\ude0c|\ud83d\ude0d|\ud83d\ude0f|\ud83d\ude12|\ud83d\ude13|\ud83d\ude14|\ud83d\ude16|\ud83d\ude18|\ud83d\ude1a|\ud83d\ude1c|\ud83d\ude1d|\ud83d\ude1e|\ud83d\ude20|\ud83d\ude21|\ud83d\ude22|\ud83d\ude23|\ud83d\ude24|\ud83d\ude25|\ud83d\ude28|\ud83d\ude29|\ud83d\ude2a|\ud83d\ude2b|\ud83d\ude2d|\ud83d\ude30|\ud83d\ude31|\ud83d\ude32|\ud83d\ude33|\ud83d\ude35|\ud83d\ude37|\ud83d\ude38|\ud83d\ude39|\ud83d\ude3a|\ud83d\ude3b|\ud83d\ude3c|\ud83d\ude3d|\ud83d\ude3e|\ud83d\ude3f|\ud83d\ude40|\ud83d\ude45|\ud83d\ude46|\ud83d\ude47|\ud83d\ude48|\ud83d\ude49|\ud83d\ude4a|\ud83d\ude4b|\ud83d\ude4c|\ud83d\ude4d|\ud83d\ude4e|\ud83d\ude4f|\ud83d\ude80|\ud83d\ude83|\ud83d\ude84|\ud83d\ude85|\ud83d\ude87|\ud83d\ude89|\ud83d\ude8c|\ud83d\ude8f|\ud83d\ude91|\ud83d\ude92|\ud83d\ude93|\ud83d\ude95|\ud83d\ude97|\ud83d\ude99|\ud83d\ude9a|\ud83d\udea2|\ud83d\udea4|\ud83d\udea5|\ud83d\udea7|\ud83d\udea8|\ud83d\udea9|\ud83d\udeaa|\ud83d\udeab|\ud83d\udeac|\ud83d\udead|\ud83d\udeb2|\ud83d\udeb6|\ud83d\udeb9|\ud83d\udeba|\ud83d\udebb|\ud83d\udebc|\ud83d\udebd|\ud83d\udebe|\ud83d\udec0|\ud83c\udde6|\ud83c\udde7|\ud83c\udde8|\ud83c\udde9|\ud83c\uddea|\ud83c\uddeb|\ud83c\uddec|\ud83c\udded|\ud83c\uddee|\ud83c\uddef|\ud83c\uddf0|\ud83c\uddf1|\ud83c\uddf2|\ud83c\uddf3|\ud83c\uddf4|\ud83c\uddf5|\ud83c\uddf6|\ud83c\uddf7|\ud83c\uddf8|\ud83c\uddf9|\ud83c\uddfa|\ud83c\uddfb|\ud83c\uddfc|\ud83c\uddfd|\ud83c\uddfe|\ud83c\uddff|\ud83c\udf0d|\ud83c\udf0e|\ud83c\udf10|\ud83c\udf12|\ud83c\udf16|\ud83c\udf17|\ue50a|\u27b0|\u2797|\u2796|\u2795|\u2755|\u2754|\u2753|\u274e|\u274c|\u2728|\u270b|\u270a|\u2705|\u26ce|\u23f3|\u23f0|\u23ec|\u23eb|\u23ea|\u23e9|\u27bf|\u00a9|\u00ae)|(?:(?:\ud83c\udc04|\ud83c\udd70|\ud83c\udd71|\ud83c\udd7e|\ud83c\udd7f|\ud83c\ude02|\ud83c\ude1a|\ud83c\ude2f|\ud83c\ude37|\u3299|\u303d|\u3030|\u2b55|\u2b50|\u2b1c|\u2b1b|\u2b07|\u2b06|\u2b05|\u2935|\u2934|\u27a1|\u2764|\u2757|\u2747|\u2744|\u2734|\u2733|\u2716|\u2714|\u2712|\u270f|\u270c|\u2709|\u2708|\u2702|\u26fd|\u26fa|\u26f5|\u26f3|\u26f2|\u26ea|\u26d4|\u26c5|\u26c4|\u26be|\u26bd|\u26ab|\u26aa|\u26a1|\u26a0|\u2693|\u267f|\u267b|\u3297|\u2666|\u2665|\u2663|\u2660|\u2653|\u2652|\u2651|\u2650|\u264f|\u264e|\u264d|\u264c|\u264b|\u264a|\u2649|\u2648|\u263a|\u261d|\u2615|\u2614|\u2611|\u260e|\u2601|\u2600|\u25fe|\u25fd|\u25fc|\u25fb|\u25c0|\u25b6|\u25ab|\u25aa|\u24c2|\u231b|\u231a|\u21aa|\u21a9|\u2199|\u2198|\u2197|\u2196|\u2195|\u2194|\u2139|\u2122|\u2049|\u203c|\u2668)([\uFE0E\uFE0F]?)))/g;
//
//
///**
// * 解析字符串为 emoji 表情 img
// * @param str {String} 字符串
// * @param [options] {Object} 配置
// * @returns {String}
// */
//exports.emoji = function (str, options) {
//    options = dato.extend(exports.emoji.defaults, options);
//
//    if (!typeis.Function(options.callback)) {
//        options.callback = function (icon, options, variant) {
//            return ''.concat(options.base, options.size, '/', icon, options.ext);
//        };
//    }
//
//    return str.replace(REG_EMOJI, function (match, icon, variant) {
//        var ret = match;
//        // verify the variant is not the FE0E one
//        // this variant means "emoji as text" and should not
//        // require any action/replacement
//        // http://unicode.org/Public/UNIDATA/StandardizedVariants.html
//        if (variant !== '\uFE0E') {
//            var src = options.callback(
//                grabTheRightIcon(icon, variant),
//                options,
//                variant
//            );
//            if (src) {
//                // recycle the match string replacing the emoji
//                // with its image counter part
//                ret = '<img '.concat(
//                    'class="', options.className, '" ',
//                    'draggable="false" ',
//                    // needs to preserve user original intent
//                    // when variants should be copied and pasted too
//                    'alt="',
//                    match,
//                    '"',
//                    ' src="',
//                    src,
//                    '"'
//                );
//
//                ret = ret.concat('>');
//            }
//        }
//
//        return ret;
//    });
//};
//exports.emoji.defaults = {
//    callback: null,
//    base: 'https://twemoji.maxcdn.com/',
//    ext: '.png',
//    size: '36x36',
//    className: 'emoji'
//};

