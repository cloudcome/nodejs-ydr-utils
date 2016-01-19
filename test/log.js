/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-19 14:17
 */


'use strict';

var log = require('../libs/log.js');


describe('log', function () {
    xit('make color', function () {
        console.log(log.red('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔'));
        console.log(log.cyan('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔'));
        console.log(log.green('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔'));
        console.log(log.yellow('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔'));
        console.log(log.magenta('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔'));
        console.log(log.bold('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔'));
        console.log(log.italic('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔'));
        console.log(log.underline('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔'));
        console.log(log.red(log.underline('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔')));
        console.log(log.red(log.bold('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔')));
        console.log(log.cyan(log.bold('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔')));
        console.log(log.green(log.bold('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔')));
        console.log(log.yellow(log.bold('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔')));
        console.log(log.magenta(log.bold('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔')));
        console.log(log.bold(log.red('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔')));
        console.log(log.bold(log.cyan('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔')));
        console.log(log.bold(log.green('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔')));
        console.log(log.bold(log.yellow('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔')));
        console.log(log.bold(log.magenta('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔')));
        console.log(log.underline(log.bold(log.red('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔'))));
        console.log(log.underline(log.bold(log.cyan('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔'))));
        console.log(log.underline(log.bold(log.green('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔'))));
        console.log(log.underline(log.bold(log.yellow('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔'))));
        console.log(log.underline(log.bold(log.magenta('呵呵', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔'))));
    });

    it('warn', function () {
        log.warn('1111', this);
        log.warn('22222', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔');
    });

    it('error', function () {
        log.error('1111', process);
        log.error('22222', {a: {b: {c: {d: {e: 'f'}}}}}, new Error('xxx'));
    });
});
