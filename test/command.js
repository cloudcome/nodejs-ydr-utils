/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-29 15:37
 */


'use strict';

var command = require('../libs/command.js');
var debug = require('../libs/debug.js');

command.alias('g', 'global');
command.alias({
    u: 'username',
    p: 'password'
});

command.if('install', function (arg) {
    debug.success('install', 'YES');

    if (arg.username) {
        debug.success('username', arg.username);
    }

    if (arg.password) {
        debug.success('password', arg.password);
    }

    if (arg.global) {
        debug.success('global', 'true');
    }
}).else(function () {
    debug.error('error', 'I don\'t know!');
});

command.parse(process.argv);

