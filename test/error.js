/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-09 15:11
 */


'use strict';

var error = require('../libs/error.js');

var err = error(401, 'hheh');

console.log(err.status);
console.log(err.type);
console.log(err.message);
console.log(err.stack);

