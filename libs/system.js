/**
 * 系统信息
 * @author ydr.me
 * @create 2015-11-28 11:03
 */


'use strict';

var os = require('os');
var childProcess = require('child_process');
var howdo = require('howdo');

var dato = require('./dato.js');
var request = require('./request.js');
var path = require('./path.js');
var allocation = require('./allocation.js');
var typeis = require('./typeis.js');
var osReleaseMap = require('../data/os-release.json');
var winReleaseMap = require('../data/win-release.json');

var IP_138 = 'http://1111.ip138.com/ic.asp';
var IP_QQ = 'http://ip.qq.com/';
var IP_LOOKUP = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php';


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
 * 获取本机的广域网 IP 地址
 * @param [req] {Object} 请求对象
 * @param callback {Function} 回调
 */
exports.remoteIP = function (req, callback) {
    var args = allocation.args(arguments);

    if (args.length === 1) {
        callback = args[0];
        req = {};
    }

    req.headers = req.headers || {};
    var ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip;

    if (ip && !typeis.localIP(ip)) {
        return callback(null, ip);
    }

    howdo
    // 从 ip138.com 处获取
        .task(function (done) {
            request({
                url: IP_138
            }, function (err, body) {
                if (err) {
                    return done(err);
                }

                var REG_HTML = /<center>.*?\[([^>]*?)].*?<\/center>/i;
                var matches = body.match(REG_HTML);

                if (!matches) {
                    return done(new Error('empty'));
                }

                done(null, matches[1].trim());
            });
        })
        //.abort(function () {
        //    this.req.abort();
        //})

        // 从 ip.qq.com 处获取
        .task(function (done) {
            request({
                url: IP_QQ
            }, function (err, body) {
                if (err) {
                    return done(err);
                }

                var REG_HTML = /<span class="red">([^<]*?)<\/span><\/p>/i;
                var matches = body.match(REG_HTML);

                if (!matches) {
                    return done(new Error('empty'));
                }

                done(null, matches[1].trim());
            });
        })
        //.abort(function () {
        //    this.req.abort();
        //})

        // 任务结束条件
        //.until(function (ip) {
        //    return ip && ip !== '';
        //})
        .together(function (err, ip) {
            callback(null, ip || '127.0.0.1');
        });
};


/**
 * 获取系统信息
 * @returns {{}}
 */
exports.info = function (callback) {
    getGlobalNodeModules(function (modules) {
        callback({
            cpus: os.cpus().length,
            platform: os.platform(),
            hostname: os.hostname(),
            release: os.release(),
            os: parseOS(),
            arch: os.arch(),
            username: process.env.LOGNAME || process.env.USER || 'unkown',
            pid: process.pid,
            language: getOSlanguage(),
            node: process.version.replace(/^v/i, '').trim(),
            npm: getNPMVersion(),
            modules: modules
        });
    });
};


/**
 * 解析 IP 信息
 * @param ip
 * @param callback
 */
exports.parseIP = function (ip, callback) {
    var args = allocation.args(arguments);

    if (args.length === 1) {
        callback = args[0];
        ip = null;
    }

    howdo
        .task(function (next) {
            var req = typeis.Object(ip) ? ip : {
                ip: ip
            };

            exports.remoteIP(req, next);
        })
        .task(function (next, ip) {
            request({
                url: IP_LOOKUP,
                query: {
                    ip: ip,
                    format: 'json'
                }
            }, function (err, body) {
                var ret = {};

                try {
                    ret = JSON.parse(body);
                } catch (err) {
                    // ignore
                }

                if (!typeis.Object(ret)) {
                    ret = {};
                }

                next(null, {
                    country: ret.country || '',
                    province: ret.province || '',
                    city: ret.city || '',
                    ip: ip
                });
            });
        })
        .follow(callback);
};


/**
 * 解析系统名称
 */
function parseOS() {
    var release = os.release();
    switch (os.platform()) {
        case 'darwin':
            return parseDarwinRelease(release);

        case 'win32':
        case 'win64':
        case 'win':
            return parseWin32Release(release);

        case 'linux':
            return 'Linux ' + release.match(/^(\d+\.\d+).*/)[1];
    }

    return 'unknow';
}


/**
 * 解析达尔文
 * @param release
 * @ref https://github.com/sindresorhus/osx-release
 * @returns {*}
 */
function parseDarwinRelease(release) {
    release = release.split('.')[0];

    if (osReleaseMap[release]) {
        return 'OS X ' + osReleaseMap[release];
    }

    return 'unknow';
}


/**
 * 解析 win32
 * @param release
 * @ref https://github.com/sindresorhus/win-release
 * @returns {*}
 */
function parseWin32Release(release) {
    release = release.split('.')[0];

    if (winReleaseMap[release]) {
        return 'Windows ' + osReleaseMap[release];
    }

    return 'unknow';
}


/**
 * 获取系统语言
 * @ref https://github.com/sindresorhus/os-locale
 * @returns {*}
 */
function getOSlanguage() {
    var env = process.env;
    var locale = env.LANG || env.LANGUAGE || env.LC_ALL || env.LC_MESSAGES || env.LC_CTYPE;

    return locale || 'EN:UTF-8';
}


/**
 * 同步获取 NPM 版本
 * @returns {string}
 */
function getNPMVersion() {
    try {
        return childProcess.execSync('npm --version').toString().trim();
    } catch (err) {
        return '0.0.0';
    }
}


/**
 * 同步获取全局安装的 node 模块
 * @param callback
 */
function getGlobalNodeModules(callback) {
    childProcess.exec('npm list --global --depth 0', function (err, stdout, stderr) {
        var listArr = stdout.split('\n');
        var REG = /\s([a-z\d][a-z\d_\.\-]*)@(.*)$/;
        var ret = {};

        listArr.forEach(function (item) {
            var mathes = item.match(REG);

            if (mathes) {
                ret[mathes[1].trim()] = mathes[2].trim();
            }
        });

        callback(ret);
    });
}
