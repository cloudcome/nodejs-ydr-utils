/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-09 15:03
 */


'use strict';


var httpStatus = require('./http-status.js');
var allocation = require('./allocation.js');
var typeis = require('./typeis.js');


/**
 * 自定义错误
 * @param [status=500] {Number} HTTP 错误码
 * @param [message=500] {String} 错误消息
 * @returns {Error}
 */
module.exports = function (status, message) {
    var args = allocation.args(arguments);
    var _status = 500;

    args.forEach(function (arg) {
        switch (typeis(arg)) {
            case 'number':
                _status = arg;
                break;

            case 'string':
                message = arg;
                break;
        }
    });

    var err = new Error(message);

    try {
        Error.captureStackTrace(err, module.exports)
    } catch (err) {
        // ignore
    }

    err.status = err.code = _status;
    err.message = message || httpStatus.get(_status);
    err.type = err.name = _status < 500 ? 'clientError' : 'serverError';
    err.timestamp = Date.now();

    return err;
};
