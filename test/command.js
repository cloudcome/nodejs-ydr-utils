/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-29 15:37
 */


'use strict';

var command = require('../libs/command.js');
var ret = command(process.argv);

console.log(JSON.stringify(ret, null, 4));

