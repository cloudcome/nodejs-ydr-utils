/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-04-18 23:41
 */

'use strict';

var fs = require('fs');
var path = require('path');
var dangerMarkdown = fs.readFileSync(path.join(__dirname, './markdown.md'), 'utf8');
var xss = require('../libs/xss.js');

var ret = xss.mdSafe(dangerMarkdown);

console.log(ret);

//console.log(xss.mdRender(xss.mdSafe(dangerMarkdown)));
//console.log('\n\n===================\n\n');
//console.log(xss.mdRender(xss.mdTOC(xss.mdSafe(dangerMarkdown))));
