/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-03 00:14
 */


'use strict';

var assert = require('assert');
var Template = require('../libs/template.js');

describe('template', function () {
    it('base', function () {
        var template = '{{user}}';
        var tpl = new Template(template);
        var data = {
            user: '丑陋大葱么'
        };
        var html = tpl.render(data);

        assert.equal(html, data.user);
    });
});


