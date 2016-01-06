/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-06 18:40
 */


'use strict';

var url = require('url');

var dato = require('./dato.js');
var string = require('./string.js');

var REG_SHAP = /^#/;
var REG_URL_SUFFIX = /[?#].*$/;
var REG_DOUBLE = /^\/\//;
var REG_PATH = /^((http|ftp)s?:|\/|\.{1,2})/i;
var REG_JSBIN = /^http:\/\/jsbin\.com\/[^/]+/i;
var REG_JSFIDDLE = /^https?:\/\/jsfiddle\.net\/[^/]+/i;
var REG_JSDM = /^http:\/\/jsdm\.com\/[^/]+\/[^/]+\/[^/]+/i;
var REG_CODEPEN = /^https?:\/\/codepen\.io\/([^/]+)\/[^/]+\/([^/]+)/i;
var REG_AT_LINK_TEXT = /^@[a-z\d_.-]+$/i;
var REG_URL_PROTOCOL = /^https?:/i;
// 信任的安全域名，其他域名都加上 nofollow
var SAFE_HOSTS = [
    '*.FrontEndDev.org',
    'FrontEndDev.org',
    '*.ydr.me',
    'ydr.me',
    '*.qianduanblog.com',
    'qianduanblog.com',
    '*.front-end.io',
    'front-end.io',
    '*.fed.cm',
    'fed.cm'
];
var configs = {
    atLink: '/developer/${at}/',
    atClass: 'at'
};


module.exports = function (options) {
    var defaults = {
        // 是否提取链接的 favicon
        favicon: true,
        // 是否解析 at
        at: true,
        // 是否 heading 加上链接
        headingLink: false,
        // heading 前缀
        headingClass: 'heading'
    };

    options = dato.extend(defaults, options);
    return function (href, title, text) {
        if (REG_SHAP.test(href)) {
            return _buildLink(href, title, text, false, !options.favicon);
        }

        var fixHref = REG_DOUBLE.test(href) ? 'http:' + href : href;
        var parse = url.parse(fixHref);
        var host = parse.host;
        var inHost = false;

        // 非 PATH
        if (!REG_PATH.test(href)) {
            return '';
        }

        if (!host) {
            return _buildLink(href, title, text, false, options.favicon);
        }

        dato.each(SAFE_HOSTS, function (index, item) {
            if (string.glob(host, item, true)) {
                inHost = true;
                return false;
            }
        });

        // 指定域内的 NO _blank
        if (inHost) {
            return _buildLink(href, title, text, false, options.favicon);
        }

        if (REG_JSBIN.test(href)) {
            return _buildJSBin(href);
        }

        if (REG_JSFIDDLE.test(href)) {
            return _buildJsfiddle(href);
        }

        if (REG_JSDM.test(href)) {
            return _buildJSDM(href);
        }

        if (REG_CODEPEN.test(href)) {
            return _buildCodePen(href);
        }

        // 其他的使用传入对象处理
        return _buildLink(href, title, text, true, options.favicon);
    };
};


/**
 * 生成链接
 * @param href
 * @param title
 * @param text
 * @param isBlank
 * @param isFavicon
 * @returns {string}
 * @private
 */
function _buildLink(href, title, text, isBlank, isFavicon) {
    text = text.trim();

    var isAt = false;

    if (REG_AT_LINK_TEXT.test(text)) {
        isFavicon = false;
        isAt = true;
    }

    return ''.concat(
        '<a href="' + href + '"',
        isAt ? ' class="' + configs.atClass + '"' : '',
        isBlank ? ' target="_blank" rel="nofollow"' : '',
        title ? ' ' + title : '',
        '>',
        isFavicon ? '<img src="https://f.ydr.me/' + href + '" class="favicon" width="16" height="16" alt="f">' : '',
        text || href,
        '</a>'
    );
}


/**
 * jsbin 在线代码演示平台
 * @param href
 * @private
 */
var REG_JSBIN_EDIT = /\/edit\/?$/i;
var REG_JSBIN_EMBED = /\/embed\/?$/i;
function _buildJSBin(href) {
    // href: http://jsbin.com/pufoxinejo/1/
    // <iframe src="http://jsbin.com/pufoxinejo/1/embed?html,css,js,output"
    // style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 38px;"></iframe>

    // http://jsbin.com/pufoxinejo/1/edit

    href = href
        .replace(REG_URL_SUFFIX, '')
        .replace(REG_JSBIN_EDIT, '/')
        .replace(REG_JSBIN_EMBED, '/');

    if (href.slice(-1) !== '/') {
        href += '/';
    }

    return '<iframe src="' + href + 'embed?output" class="codedemo-jsbin"></iframe>';
}


/**
 * jsfiddle 在线代码演示平台
 * @param href
 * @private
 */
var REG_JSFIDDLE_EMBED = /\/embedded\/?$/i;
var REG_JSFIDDLE_RESULT = /\/result$\/?$/i;
function _buildJsfiddle(href) {
    // https://jsfiddle.net/rwtud3nw/
    // <iframe width="100%" height="300" src="//jsfiddle.net/rwtud3nw/embedded/"
    // allowfullscreen="allowfullscreen" frameborder="0"></iframe>

    href = href
        .replace(REG_URL_SUFFIX, '')
        .replace(REG_JSFIDDLE_RESULT, '/')
        .replace(REG_JSFIDDLE_EMBED, '/');

    if (href.slice(-1) !== '/') {
        href += '/';
    }

    var hrefClean = href.replace(REG_URL_PROTOCOL, '');

    return '<iframe src="' + hrefClean + 'embedded/result,js,html,css/" allowfullscreen="allowfullscreen" class="codedemo-jsfiddle"></iframe>';
}


/**
 * jsdm 在线代码演示平台
 * @param href
 * @private
 */
var REG_JSDM_ID = /\/([^/]+)\/paint\/([^/]+)/i;
function _buildJSDM(href) {
    // http://jsdm.com/jsw/paint/9WfZX
    // http://jsdm.com/anon/embed/0bM5i?height=500&theme-id=0&slug-hash=0bM5i&default-tab=result
    var matches = (href.match(REG_JSDM_ID) || ['', '', '']);
    var user = matches[1];
    var id = matches[2];

    if (!user || !id) {
        return '';
    }

    return '<iframe src="http://jsdm.com/' + user + '/embed/' + id + '' +
        '?height=350&theme-id=0&default-tab=result&slug-hash=' + id + '" ' +
        'class="codedemo-jsdm"></iframe>';
}


/**
 * code pen 在线代码演示平台
 * @param href
 * @returns {string}
 * @private
 */
function _buildCodePen(href) {
    var matches = href.match(REG_CODEPEN) || ['', '', ''];
    var user = matches[1];
    var id = matches[2];

    if (!user || !id) {
        return '';
    }

    // http://codepen.io/ClearDesign/pen/oXeBOp
    // http://codepen.io/ClearDesign/full/oXeBOp
    // //codepen.io/ClearDesign/embed/oXeBOp?
    // height=350&theme-id=15483&slug-hash=oXeBOp
    // &default-tab=result&user=ClearDesign

    return '<iframe src="//codepen.io/' + user + '/embed/' + id +
        '?height=350&theme-id=0&slug-hash=' + id + '&default-tab=result&user=' + user + '" class="codedemo-codepen"></iframe>';
}

