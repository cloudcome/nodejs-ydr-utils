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

    it('placeholder', function () {
        log.config({
            whiteList: ['error', 'warn']
        });
        log.placeholder('node', process.versions.node);
        log.info('node version is ${node}');
        log.warn('node version is ${node}');
        log.success('node version is ${node}');
        log.error('node version is ${node}');
    });

    it('info', function () {
        log.info('info1', process.env);
        log.info('info2', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔');
    });

    it('warn', function () {
        log.warn('warn1', this);
        log.warn('warn2', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔');
    });

    it('error', function () {
        log.error('error1', process.versions);
        var err = new Error('xxx');
        err.x1312312 = 312312;
        log.error('error2', {a: {b: {c: {d: {e: 'f'}}}}}, err);
    });
});
