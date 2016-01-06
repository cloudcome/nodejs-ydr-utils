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
    xit('toc', function () {
        var file = path.join(__dirname, 'markdown-toc.md');
        var data = fs.readFileSync(file, 'utf8');
        var ret = markdown.toc(data);

        console.log('\n\n');
        console.log('------------ html ------------');
        console.log(ret);
        console.log('\n\n');
    });

    xit('summary', function () {
        var file = path.join(__dirname, 'markdown-summary.md');
        var data = fs.readFileSync(file, 'utf8');
        var ret = markdown.summary(data);

        console.log('\n\n');
        console.log('------------ summary ------------');
        console.log(ret);
        console.log('\n\n');
    });

    it('render', function () {
        var file = path.join(__dirname, 'markdown.md');
        var data = fs.readFileSync(file, 'utf8');
        var ret = markdown.render(data);

        console.log('\n\n');
        console.log('------------ html ------------');
        console.log(ret.html);
        console.log('\n\n');
        console.log('------------ safe ------------');
        console.log(ret.safe);
        console.log('\n\n');
        console.log('------------ atList ------------');
        console.log(ret.atList);
        console.log('\n\n');
    });
});


