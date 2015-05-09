/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-09 15:03
 */


'use strict';

//var ServerError = function ServerError(msg) {
//    var self = new Error(msg != null ? msg : statuses[code])
//    Error.captureStackTrace(self, ServerError)
//    self.__proto__ = ServerError.prototype
//    Object.defineProperty(self, 'name', {
//        enumerable: false,
//        configurable: true,
//        value: className,
//        writable: true
//    })
//    return self
//}
//inherits(ServerError, Error);
//ServerError.prototype.status =
//    ServerError.prototype.statusCode = code;
//ServerError.prototype.expose = false;
//exports[code] =
//    exports[name] = ServerError


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
    err.status = _status;
    err.message = message || httpStatus.get(_status);
    err.type = _status < 500 ? 'clientError' : 'serverError';

    return err;
};
