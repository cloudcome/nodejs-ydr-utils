/**
 * marked heading
 * @author ydr.me
 * @create 2016-01-06 19:03
 */


'use strict';

var dato = require('./dato.js');

module.exports = function (options) {
    var index = 0;
    var defaults = {
        // 是否 heading 加上链接
        headingLink: false,
        // heading 前缀
        headingClass: 'heading'
    };

    options = dato.extend(defaults, options);

    return function (text, level) {
        //var href = encryption.md5(text.trim());

        var id = options.headingClass + '-' + level + '-' + index;
        var html = '<h' + level + ' id="' + id + '" class="' + options.headingClass + '">';

        html += options.headingLink ? '<a href="#' + id + '">' : '';
        html += text;
        html += options.headingLink ? '</a>' : '';
        html += '</h' + level + '>';

        index++;

        return html;
    };
};

