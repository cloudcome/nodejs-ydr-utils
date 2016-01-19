/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-19 14:17
 */


'use strict';

var log = require('../libs/log.js');


describe('log', function () {
    it('log', function () {
        log.red('呵呵');
    });

    it('warn', function () {
        log.warn('1111', this);
        log.warn('22222', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔');
    });
});
