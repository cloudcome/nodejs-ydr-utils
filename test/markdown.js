/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-06 17:59
 */


'use strict';


var fs = require('fs');
var path = require('path');

var markdown = require('../libs/markdown.js');

describe('markdown.js', function () {
    it('render', function () {
        var file = path.join(__dirname, 'markdown.md');
        var data = fs.readFileSync(file, 'utf8');
        var ret = markdown.render(data);

        console.log(ret);
    });
});


