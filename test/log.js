/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-19 14:17
 */


'use strict';

var log = require('../libs/log.js');


describe('log', function () {
    it('make color', function () {
        console.log(log.red('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔'));
        console.log(log.cyan('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔'));
        console.log(log.green('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔'));
        console.log(log.yellow('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔'));
        console.log(log.magenta('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔'));
    });

    it('warn', function () {
        log.warn('1111', this);
        log.warn('22222', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔');
    });
});
