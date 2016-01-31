/**
 * npm 相关
 * @author ydr.me
 * @create 2015-10-29 17:44
 */


'use strict';

var request = require('./request.js');
var string = require('./string.js');
var typeis = require('./typeis.js');
var path = require('./path.js');

var MODULE_REGISTRY_MAP = {
    npm: 'https://registry.npmjs.com',
    taobao: 'https://registry.npm.taobao.org',
    cnpm: 'https://registry.cnpmjs.org'
};
var DEFAULT_REGISTRY = 'taobao';

/**
 * 获取模块的最新版本
 * @param moduleName {String|Object} 模块名称
 * @param callback {Function} 回调
 */
exports.getLatestVersion = function (moduleName, callback) {
    var moduleMeta = {};

    if (typeis.String(moduleName)) {
        moduleMeta = {
            name: moduleName,
            registry: DEFAULT_REGISTRY
        };
    } else {
        moduleMeta = moduleName;
    }

    var url = MODULE_REGISTRY_MAP[moduleMeta.registry || DEFAULT_REGISTRY];

    if (!url) {
        url = MODULE_REGISTRY_MAP[DEFAULT_REGISTRY];
    }

    url = path.joinURI(url, '${moduleName}/latest');
    url = string.assign(url, {
        moduleName: moduleMeta.name
    });

    request({
        url: url,
        timeout: -1
    }, function (err, body) {
        if (err) {
            return callback(err);
        }

        var ret = {};

        try {
            ret = JSON.parse(body);
        } catch (ex) {
            err = new Error('parse response body error');
        }

        if (err) {
            return callback(err);
        }

        if (ret.error) {
            err = new Error(ret.reason);
        }

        if (err) {
            return callback(err);
        }

        callback(null, ret.version, ret);
    });
};




