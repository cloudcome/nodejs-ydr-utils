/**
 * marked image
 * @author ydr.me
 * @create 2016-01-06 19:06
 */


'use strict';

var typeis = require('./typeis.js');

var REG_SIZE = /(?:\s+?=(\d+)(?:[x*](\d+))?)?$/i;

module.exports = function () {
    // ![](1.png =200x100)
    return function (src, title, text) {
        src = src || '';

        var matches = src.match(REG_SIZE);
        var width = null;
        var height = null;

        if (matches) {
            width = matches[1];
            height = matches[2];
            src = src.replace(REG_SIZE, '');
        }

        return ''.concat(
            '<img',
            typeis.empty(title) ? '' : ' title="' + title + '"',
            typeis.empty(text) ? '' : ' alt="' + text + '"',
            typeis.empty(src) ? '' : ' src="' + src + '"',
            typeis.empty(width) ? '' : ' width="' + width + '"',
            typeis.empty(height) ? '' : ' height="' + height + '"',
            '>'
        );
    };
};


