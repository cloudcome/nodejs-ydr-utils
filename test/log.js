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

    it('table', function () {
        console.log(log.table([
            ['App name', 'id', 'mode', 'pid', 'status', 'restart', 'uptimes', 'memory', 'watching'],
            ['abc', 1, 'fork', 19312, 'online', 1, '14D', '19.123MB', 'disabled'],
            ['abc-def-ghy-ioo', 22, 'cluster', 19312, 'offline', 999, '91D', '983.123MB', 'enabled']
        ], {
            thead: true
        }));
        console.log(log.table([
            ['user', 'cloudcome'],
            ['age', '21'],
            ['love', 'front-end development']
        ], {
            thead: false,
            padding: 5,
            tdBorder: true
        }));
    });

    xit('placeholder', function () {
        log.config({
            whiteList: ['info', 'error', 'warn', 'success']
        });
        log.placeholder('node', process.versions.node);
        log.info('node version is ${node}');
        log.warn('node version is ${node}');
        log.success('node version is ${node}');
        log.error('node version is ${node}');
    });

    xit('info', function () {
        log.info('info1', process.env);
        log.info('info2', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔');
    });

    xit('success', function () {
        log.success('success', process.env);
        log.success('success', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔');
    });

    xit('warn', function () {
        log.warn('warn1', this);
        log.warn('warn2', {a: {b: {c: {d: {e: 'f'}}}}}, '后悔');
    });

    xit('error', function () {
        log.error('error1', process.versions);
        var err = new Error('xxx');
        err.x1312312 = 312312;
        log.error('error2', {a: {b: {c: {d: {e: 'f'}}}}}, err);
    });
});
