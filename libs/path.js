/*!
 * path
 * @author ydr.me
 * @create 2015-09-01 19:36
 */


'use strict';

var path = require('path');
var dato = require('./dato.js');
var allocation = require('./allocation.js');
//path.__defineGetter__      path.__defineSetter__      path.__lookupGetter__      path.__lookupSetter__      path.__proto__             path.constructor
//path.hasOwnProperty        path.isPrototypeOf         path.propertyIsEnumerable  path.toLocaleString        path.toString              path.valueOf
//path._makeLong             path.basename              path.delimiter             path.dirname               path.extname               path.format
//path.isAbsolute            path.join                  path.normalize             path.parse                 path.posix                 path.relative
//path.resolve               path.sep                   path.win32
var extendList = [
    'basename',
    'delimiter',
    'dirname',
    'extname',
    'format',
    'isAbsolute',
    //'join',
    'normalize',
    'parse',
    'posix',
    //'relative',
    'resolve',
    'sep'
];

dato.each(extendList, function (index, pro) {
    /**
     * @name exports
     * @property basename {Function}
     * @property delimiter {Function}
     * @property dirname {Function}
     * @property extname {Function}
     * @property format {Function}
     * @property isAbsolute {Function}
     * @property normalize {Function}
     * @property parse {Function}
     * @property posix {Function}
     * @property sep {Function}
     */
    exports[pro] = path[pro];
});


var REG_PATH = path.sep === '/' ? /\\/g : /\//g;
var REG_WIN_PATH = /\\/g;

/**
 * 转换为系统路径
 * @param p {String} 路径
 * @returns {string}
 */
exports.toSystem = function (p) {
    return String(p).replace(REG_PATH, path.sep);
};


/**
 * 转换为 URI 路径
 * @param p {String} 路径
 * @returns {string}
 */
exports.toURI = function (p) {
    return String(p).replace(REG_WIN_PATH, '/');
};



/**
 * 路径合并
 * @param from {String} 路径
 * @param to {String} 路径
 * @returns {string}
 */
exports.join = function (from, to/*arguments*/) {
    var args = allocation.args(arguments);

    args = args.map(function (p) {
        return exports.toSystem(p);
    });

    return path.join.apply(path, args);
};


/**
 * 路径相对
 * @param from {String} 路径
 * @param to {String} 路径
 * @returns {string}
 */
exports.relative = function (from, to/*arguments*/) {
    var args = allocation.args(arguments);

    args = args.map(function (p) {
        return exports.toSystem(p);
    });

    return path.relative.apply(path, args);
};


