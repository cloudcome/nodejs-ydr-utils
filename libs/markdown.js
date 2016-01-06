/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-06 17:57
 */


'use strict';

var showdown = require('showdown');


exports.render = function (text, options) {
    var converter = new showdown.Converter();

    return converter.makeHtml(text);
};
