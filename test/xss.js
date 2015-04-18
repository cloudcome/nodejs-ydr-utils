/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-04-18 23:41
 */

'use strict';


var dangerHTML = '```\nabc\n```</div> 1<2>3 abc';
var xss  = require('../libs/xss.js');

console.log(xss.mdSafe(dangerHTML));
