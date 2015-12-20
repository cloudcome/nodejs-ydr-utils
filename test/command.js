/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-29 15:37
 */


'use strict';

var assert = require('assert');

var command = require('../libs/command.js');
var debug = require('../libs/debug.js');


describe('command', function () {
    it('parse', function () {
        var argv = ['node', 'cwd', 'install', 'abc', 'def', '-u', 'uuu', '-p', 'ppp'];


        command.alias('g', 'global');
        command.alias('s', 'save');
        command.alias({
            u: 'username',
            p: 'password',
            h: 'help'
        });

        command.type({
            global: Boolean,
            save: Boolean
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
        }).if('help', function () {
            debug.warn('help', '呵呵呵');
        }).else(function (cmd, args) {
            if (args.help) {
                return command.exec('help');
            }

            debug.error('error', 'I don\'t know!');
        });

        var ret = command.parse(argv);

        assert.equal(ret.input, 'install abc def -u uuu -p ppp');
        assert.equal(ret.command, 'install');
        assert.equal(ret.args.username, 'uuu');
        assert.equal(ret.args.password, 'ppp');
        assert.equal(ret.names[0], 'abc');
        assert.equal(ret.names[1], 'def');
    });
});

