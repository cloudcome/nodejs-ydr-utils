/**
 * nodejs 日志系统
 * @author ydr.me
 * @create 2016-01-19 14:12
 */


'use strict';

var util = require('util');
var later = require('later');
var path = require('path');

var pkg = require('../package.json');
var allocation = require('../libs/allocation.js');
var date = require('../libs/date.js');
var dato = require('../libs/dato.js');
var string = require('../libs/string.js');
var typeis = require('../libs/typeis.js');
var system = require('../libs/system.js');


// ==========================================
// ================[ configs ]===============
// ==========================================

var configs = {
    whiteList: ['info', 'warn', 'success', 'error'],
    whiteMap: {},
    placeholders: {}
};

var buildWhiteMap = function () {
    configs.whiteMap = {};
    dato.each(configs.whiteList, function (index, key) {
        configs.whiteMap[key] = true;
    });
};


/**
 * 配置
 * @returns {*}
 */
exports.config = function () {
    return allocation.getset({
        get: function (key) {
            return configs[key];
        },
        set: function (key, val) {
            configs[key] = val;

            if (key === 'whiteList') {
                buildWhiteMap();
            }
        }
    }, arguments);
};
buildWhiteMap();


/**
 * 配置 placeholder
 * @returns {*}
 */
exports.placeholder = function () {
    return allocation.getset({
        get: function (key) {
            return configs.placeholders[key];
        },
        set: function (key, val) {
            configs.placeholders[key] = val;
        }
    }, arguments);
};


// ==========================================
// ================[ wrapper ]===============
// ==========================================
/**
 * 颜色包装器
 * @param color
 * @returns {Function}
 */
var makeColor = function (color) {
    return function () {
        var msg = util.format.apply(util, arguments);
        var args = [];

        args.push('\x1b[' + util.inspect.colors[color][0] + 'm%s\x1b[' + util.inspect.colors[color][1] + 'm');
        args.push(msg);

        return util.format.apply(util, args);
    };
};


// color
exports.red = makeColor('red');
exports.cyan = makeColor('cyan');
exports.green = makeColor('green');
exports.yellow = makeColor('yellow');
exports.magenta = makeColor('magenta');

// style
exports.bold = makeColor('bold');
exports.italic = makeColor('italic');
exports.underline = makeColor('underline');


// ==========================================
// ================[ output ]================
// ==========================================

/**
 * 美化对象输出
 * @param obj
 * @returns {*}
 */
var pretty = function (obj) {
    if (typeis.String(obj)) {
        return obj;
    }

    try {
        return util.inspect(obj, {
            depth: 3
        });
    } catch (err) {
        var o = {};
        dato.each(obj, function (key, val) {
            o[key] = val;
        });
        try {
            return util.inspect(o, {
                depth: 3
            });
        } catch (err) {
            return formatError(err);
        }
    }
};


/**
 * 格式错误对象
 * @param err
 * @returns {*}
 */
var formatError = function (err) {
    if (!err || !(err instanceof Error)) {
        return err;
    }

    var defaultErrorKey = {
        type: true,
        message: true,
        name: true,
        stack: true
    };

    var msg = err.stack || err.message || String(err);
    var name = err.name || 'Error';

    dato.each(err, function (key, val) {
        if (!defaultErrorKey[key]) {
            msg += '\n' + name + ' ' + key + ': ' + pretty(val);
        }
    });

    return msg;
};


/**
 * 日志出口
 * @param wrapper
 * @param prefix
 * @param args
 */
var log = function (wrapper, prefix, args) {
    try {
        args = allocation.args(args).map(pretty);
    } catch (err) {
        return exports.error(err);
    }

    args.unshift('%s');

    var str = exports.cyan(util.format('\n\n[%s] %s\n', date.format('YYYY-MM-DD HH:mm:ss.SSS'), prefix));

    try {
        str += wrapper(util.format.apply(util, args));
    } catch (err) {
        return exports.error(err);
    }

    str = string.assign(str, configs.placeholders);
    process.stdout.write(str + '\n');
};


/**
 * 普通日志
 */
exports.info = function () {
    if (!configs.whiteMap.info) {
        return;
    }

    log(function (str) {
        return str;
    }, '[INFO]', arguments);
};


/**
 * 成功日志
 */
exports.success = function () {
    if (!configs.whiteMap.success) {
        return;
    }

    log(exports.green, '[SUCCESS]', arguments);
};


/**
 * 警告日志
 */
exports.warn = function () {
    if (!configs.whiteMap.warn) {
        return;
    }

    log(exports.yellow, '[WARNING]', arguments);
};


/**
 * 错误日志
 */
exports.error = function () {
    if (!configs.whiteMap.error) {
        return;
    }

    var args = allocation.args(arguments).map(formatError);

    log(exports.red, '[ERROR]', args);
};


// ==========================================
// ===============[ express ]================
// ==========================================
var namespace = path.basename(__filename) + ' of ' + pkg.name + '@' + pkg.version;
/**
 * express 日志系统，尽可能的放在中间件的最开始
 * @returns {Function}
 * @private
 */
exports.__expressStart = function (options) {
    var ipKey = namespace + 'ip';
    options = dato.extend({
        exclude: /^\/(static\/|favicon\.ico)/
    }, options);

    return function (req, res, next) {
        req.$fullURL = req.protocol + '://' + req.headers.host + req.url;

        var log = function (ip) {
            if (!options.exclude.test(req.url)) {
                exports.info(req.method, ip, req.$fullURL);
            }
        };

        if (req.session[ipKey]) {
            log(req.session[ipKey]);
            next();
            return;
        }

        system.remoteIP(req, function (err, ip) {
            req.session[ipKey] = req.$ip = ip;
            log(ip);
            next();
        });
    };
};


/**
 * express 日志系统，尽可能的放在中间件的末尾
 * @returns {Function}
 * @private
 */
exports.__expressEnd = function () {
    return function (err, req, res, next) {
        if (err && err instanceof Error) {
            err['request url'] = req.$fullURL;
            err['request ip'] = req.$ip;
            err['request headers'] = req.headers;

            if (req.query) {
                err['request query'] = req.query;
            }

            if (req.body) {
                err['request body'] = req.body;
            }

            if (req.file) {
                err['request file'] = req.file;
            }

            if (req.files) {
                err['request files'] = req.files;
            }

            exports.error(err);
        }

        next(err);
    };
};


