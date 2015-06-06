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

var safeMarkdown = xss.mdSafe(dangerMarkdown);
fs.writeFileSync(path.join(__dirname, './markdown2.md'), safeMarkdown.markdown, 'utf8');
var ret2 = xss.mdRender(xss.mdTOC(safeMarkdown.markdown), true);
var ret3 = xss.mdRender(safeMarkdown.markdown);
var html = '<!DOCTYPE html><meta charset="utf-8"/><style>body{margin-top: 600px;}h1,h2,h3,h4,h5,h6{margin-top: 500px;}</style>';

fs.writeFileSync(path.join(__dirname, './markdown.html'), html + ret2 + ret3, 'utf8');

//console.log(ret2);

//console.log(xss.mdRender(xss.mdSafe(dangerMarkdown)));
//console.log('\n\n===================\n\n');
//console.log(xss.mdRender(xss.mdTOC(xss.mdSafe(dangerMarkdown))));


//console.log(xss.mdIntroduction(dangerMarkdown));
