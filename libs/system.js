/**
 * 系统信息
 * @author ydr.me
 * @create 2015-11-28 11:03
 */


'use strict';

var os = require('os');

var dato = require('./dato.js');


/**
 * 获取本机局域网 IP 地址
 * @returns {*|string}
 */
exports.localIP = function () {
    var scopeIP = null;
    //console.log(os.networkInterfaces());
    dato.each(os.networkInterfaces(), function (networkType, networkList) {
        //{ address: 'fe80::1',
        //netmask: 'ffff:ffff:ffff:ffff::',
        //family: 'IPv6',
        //mac: '00:00:00:00:00:00',
        //scopeid: 1,
        //internal: true }
        dato.each(networkList, function (index, networkMeta) {
            if (networkMeta.family === 'IPv4' && networkMeta.internal === false) {
                scopeIP = networkMeta.address;
                return false;
            }
        });

        if (scopeIP) {
            return false;
        }
    });

    return scopeIP || 'localhost';
};


/**
 * 获取系统信息
 * @returns {{cpus: *, version: string, type: *, platform, hostname: *, release: *, arch, username: *, pid: number}}
 */
exports.info = function () {
    return {
        cpus: os.cpus().length,
        version: process.version,
        type: os.type(),
        platform: os.platform(),
        hostname: os.hostname(),
        release: os.release(),
        arch: os.arch(),
        username: process.env.LOGNAME || process.env.USER,
        pid: process.pid
    };
};



