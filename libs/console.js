/**
 * 修正 global.console，以便可以在不同的环境打印不同级别的日志
 * @author ydr.me
 * @create 2015-12-10 21:35
 */


'use strict';

var util = require('util');


var allocation = require('./allocation.js');
var dato = require('./dato.js');
var typeis = require('./typeis.js');
var date = require('./date.js');
var string = require('./string.js');
var console = global.console;
var oldLog = console.log;

var configs = {
    // 是否颜色输出
    // PM2 环境不建议输出颜色，否则日志文件内有很多颜色代码
    color: true
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
        }
    }, arguments);
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
 * 美化对象输出
 * @param obj
 * @returns {*}
 */
var pretty = function (obj) {
    if (typeis.String(obj)) {
        return obj;
    }

    if (obj && obj instanceof Error) {
        return formatError(obj);
    }

    try {
        return util.inspect(obj, {
            depth: 3
        });
    } catch (err) {
        return formatError(err);
    }
};


/**
 * 颜色包装器
 * @param color
 * @returns {Function}
 */
var makeColor = function (color) {
    return function () {
        var msgs = allocation.args(arguments).map(pretty);
        var msg = msgs.join(' ');

        if (!configs.color || !color) {
            return msg;
        }

        var args = [];

        args.push('\x1b[' + util.inspect.colors[color][0] + 'm%s\x1b[' + util.inspect.colors[color][1] + 'm');
        args.push(msg);

        return util.format.apply(util, args);
    };
};


/**
 * 打印日志
 * @param msg
 */
var printOut = function (msg) {
    process.stdout.write(msg + '\n');
};


/**
 * 普通日志
 */
console.log = function () {
    printOut(makeColor().apply(global, arguments));
};


/**
 * 消息日志
 */
console.info = function () {
    printOut(makeColor('green').apply(global, arguments));
};


/**
 * 警告日志
 */
console.warn = function () {
    printOut(makeColor('yellow').apply(global, arguments));
};


/**
 * 错误日志
 */
console.error = function () {
    printOut(makeColor('red').apply(global, arguments));
};


console.table = function (trs, options) {
    options = dato.extend({
        padding: 1,
        thead: false,
        tdBorder: false
    }, options);
    var maxTrLength = 0;
    var maxTdsLength = [];
    var ret = [];
    var padding = new Array(options.padding + 1).join(' ');

    dato.each(trs, function (i, tds) {
        dato.each(tds, function (j, td) {
            tds[j] = td = pretty(td);
            var tdLength = td.length + options.padding * 2;
            maxTdsLength[j] = maxTdsLength[j] || 0;
            maxTdsLength[j] = Math.max(maxTdsLength[j], tdLength);
        });
    });

    var trTopCenters = [];
    var trMiddleCenters = [];
    var trBottomCenters = [];
    dato.each(maxTdsLength, function (k, max) {
        maxTrLength += max;
        var border = new Array(max + 1).join('─');

        if (k) {
            trTopCenters.push('┬' + border);
            trMiddleCenters.push('┼' + border);
            trBottomCenters.push('┴' + border);
        } else {
            trTopCenters.push(border);
            trMiddleCenters.push(border);
            trBottomCenters.push(border);
        }
    });

    maxTrLength += maxTdsLength.length - 2;
    ret.push('┌' + trTopCenters.join('') + '┐');

    dato.each(trs, function (i, tds) {
        var tr = [];

        if (options.tdBorder && i > 0) {
            ret.push('├' + trMiddleCenters.join('') + '┤');
        }

        dato.each(tds, function (j, td) {
            td = padding + td;
            td = string.padRight(td, maxTdsLength[j] - options.padding, ' ');
            tr.push(td + padding);
        });

        ret.push('│' + tr.join('│') + '│');

        if (options.thead && !options.tdBorder && i === 0) {
            ret.push('├' + trMiddleCenters.join('') + '┤');
        }
    });

    ret.push('└' + trBottomCenters.join('') + '┘');

    return ret.join('\n');
};


/**
 * 打点
 * @param str
 */
console.point = function (str) {
    str = String(str) || '.';
    try {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
    } catch (err) {
        // ignore
    }
    process.stdout.write(str);
};
console.pointEnd = function () {
    try {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
    } catch (err) {
        // ignore
    }
};


var lineCursor = 0;
console.lineStart = function () {
    lineCursor = 0;
};
/**
 * 打线
 * @param str
 */
console.line = function (str) {
    str = String(str) || '=';
    try {
        process.stdout.cursorTo(lineCursor);
    } catch (err) {
        // ignore
    }
    process.stdout.write(str);
    lineCursor += str.length;
};
console.lineEnd = function (clear) {
    lineCursor = 0;

    if (clear) {
        global.console.pointEnd();
    } else {
        process.stdout.write('\n');
    }
};

var dictionaries = ['-', '\\', '|', '/', '-', '\\', '|', '/'];
var timer = 0;
console.loading = function (interval, _dictionaries) {
    if (timer) {
        global.console.loadingEnd();
    }

    var args = allocation.args(arguments);
    var times = 0;

    if (args.length === 1 && typeis.Array(args[0])) {
        _dictionaries = args[0];
        interval = null;
    }

    interval = interval || 80;
    _dictionaries = _dictionaries || dictionaries;
    var length = _dictionaries.length - 1;
    timer = setInterval(function () {
        var index = times % length;
        global.console.point(_dictionaries[index]);
        times++;
    }, interval);
};
console.loadingEnd = function () {
    clearInterval(timer);
    timer = 0;
    global.console.pointEnd();
};
