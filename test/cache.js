/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-01 21:15
 */


'use strict';

var cache = require('../libs/cache.js');
cache.set('a', 1, 1000, function(){
    console.log('timeout');
});

console.log(cache.get('a'));

cache.increase('a', 2);
console.log(cache.get('a'));

cache.push('a', 3, 4, 5);
console.log(cache.get('a'));

cache.unshift('a', 6, 7, 8);
console.log(cache.get('a'));

console.log(cache.slice('a', 4));
console.log(cache.get('a'));

cache.concat('a', [9, 10], [11, 12]);
console.log(cache.get('a'));

cache.pop('a');
console.log(cache.get('a'));

cache.shift('a');
console.log(cache.get('a'));

cache.splice('a', 1, 2);
console.log(cache.get('a'));

cache.remove('a');
console.log(cache.get('a'));

cache.clear('a');
console.log(cache.get('a'));

setTimeout(function () {
    console.log(cache.get('a'));
}, 1000);
