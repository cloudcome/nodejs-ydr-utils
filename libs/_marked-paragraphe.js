/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-06 19:30
 */


'use strict';

var random = require('./random.js');
var dato = require('./dato.js');
var string = require('./string.js');

var REG_TAG = /<[a-z\d][^>]*?>*/;
var REG_AT_TEXT = /@([a-z\d_.-]+)\b/ig;
var REG_AT_LINK = /\[@[^]]+]\([^)]+\)/;
var REG_AT_LINK_TEXT = /^@[a-z\d_.-]+$/i;


module.exports = function (options, atList) {
    var defaults = {
        atClass: 'at',
        atLink: '/~/${username}/'
    };
    var map = {};

    options = dato.extend(defaults, options);

    return function (text) {
        // 移除标签
        var oM = {};
        text = (text || '').replace(REG_TAG, function (source) {
            var key = _generatorKey();
            oM[key] = source;
            return key;
        });

        text = text.replace(REG_AT_TEXT, function (source, username) {
            var link = string.assign(options.atLink, {
                username: username
            });

            if (!map[username]) {
                map[username] = true;
                atList.push(username);
            }

            return '<a class="at" href="' + link + '" data-at="' + username + '">@' + username + '</a>';
        });

        dato.each(oM, function (key, val) {
            text = text.replace(key, val);
        });

        return '\n<p>' + text + '</p>\n';
    };
};


/**
 * 生成唯一随机字符串
 * @returns {string}
 * @private
 */
function _generatorKey() {
    return 'œ' + random.string(10, 'aA0') + random.guid() + Date.now() + 'œ';
}
