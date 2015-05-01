/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-01 20:42
 */


'use strict';

var dato = require('./dato.js');
var typeis = require('./typeis.js');
var cache = Object.create(null);
var length = 0;
var configs = {
    debug: true
};
var noop = function () {
    //
};


/**
 * 配置
 * @param options
 */
exports.config = function (options) {
    dato.extend(configs, options);
};


/**
 * 设置缓存
 * @param key {String} 缓存键
 * @param val {*} 缓存值
 * @param [expires=0] {Number} 有效期，单位毫秒，默认永久有效
 * @param [isOverride=true] 是否重写，默认是
 * @param [callback=null] 过期回调
 */
exports.set = function (key, val, expires, isOverride, callback) {
    var args = [].slice.call(arguments, 2);
    var _expires = 0;
    var _isOverride = true;
    var _callback = noop;

    dato.each(args, function (index, arg) {
        switch (typeis(arg)) {
            case 'number':
                _expires = arg;
                break;

            case 'boolean':
                _isOverride = arg;
                break;

            case 'function':
                _callback = arg;
                break;
        }
    });


    var cached = cache[key];

    if (cached) {
        if (_isOverride) {
            cached.val = val;
            cached.ot++;

            if (configs.debug) {
                console.warn('override', 'set', key, 'as', val, 'in', cached.ot, 'times');
            }
        } else {
            return exports;
        }
    } else {
        cached = cache[key] = {
            // 值
            val: val,
            // 过期回调
            cbs: [],
            // override times
            ot: 0
        };

        if (configs.debug) {
            console.log('first', 'set', key, 'as', val);
        }

        length++;
    }

    if (_callback !== noop) {
        cached.cbs.push(_callback);
    }

    if (_expires) {
        clearTimeout(cache[key].timeid);
        cache[key].timeid = setTimeout(function () {
            cache[key].cbs.forEach(function (fn) {
                fn(cache[key].val);
            });
            cache[key] = null;
        }, _expires);
    }

    return cached;
};


/**
 * 添加属性值
 * @param key {String} 缓存键
 * @param propKey {String} 属性键
 * @param propVal {*} 属性值
 * @returns {*}
 */
exports.addProp = function (key, propKey, propVal) {
    var cached = exports.get('key');

    if (!cached) {
        cached = {};
    }

    cached[propKey] = propVal;
    exports.set('key', cached);
    return cached;
};


/**
 * 移除属性值
 * @param key {String} 缓存键
 * @param propKey {String} 属性键
 * @returns {*}
 */
exports.removeProp = function (key, propKey) {
    var cached = exports.get('key');

    if (!cached) {
        return;
    }

    delete(cached[propKey]);

    return cached;
};


/**
 * 读取缓存
 * @param key {String} 缓存键
 * @param [dftVal] {*} 默认值
 * @returns {*|undefined} 返回值
 */
exports.get = function (key, dftVal) {
    return cache[key] && cache[key].val || dftVal;
};


/**
 * 删除缓存
 * @param key
 */
exports.remove = function (key) {
    var cached = cache[key];

    if (cached) {
        length--;
    }

    clearTimeout(cached.timeid);
    delete(cache[key]);
};


/**
 * 清空缓存
 */
exports.clear = function () {
    dato.each(cache, function (key) {
        exports.remove(key);
    });
};


/**
 * 缓存缓存键
 * @returns {Array}
 */
exports.keys = function () {
    return Object.keys(cache);
};


/**
 * 缓存缓存键
 * @returns {Number}
 */
exports.length = length;


/**
 * 递增值
 * @param key {String} 缓存键
 * @param number {Number} 数值
 */
exports.increase = function (key, number) {
    var cached = exports.get(key);

    number = dato.parseFloat(number, 0);

    if (typeis.undefined(cached)) {
        cached = number;
    } else {
        cached = dato.parseFloat(cached, 0) + number;
    }

    exports.set(key, cached);

    return cached;
};


/**
 * push 缓存值
 * @param key
 * @returns {*}
 */
exports.push = function (key/*arguments*/) {
    var cached = exports.get(key);
    var list = [].slice.call(arguments, 1);

    if (!typeis.array(cached)) {
        cached = [];
    }

    cached.push.apply(cached, list);
    exports.set(key, cached);

    return cached;
};


/**
 * unshift 缓存值
 * @param key
 * @returns {*}
 */
exports.unshift = function (key/*arguments*/) {
    var cached = exports.get(key);
    var list = [].slice.call(arguments, 1);

    if (!typeis.array(cached)) {
        cached = [];
    }

    cached.unshift.apply(cached, list);
    exports.set(key, cached);

    return cached;
};


/**
 * splice 缓存值
 * @param key
 * @returns {*}
 */
exports.splice = function (key/*arguments*/) {
    var cached = exports.get(key);
    var list = [].slice.call(arguments, 1);

    if (!typeis.array(cached)) {
        cached = [];
    }

    cached.splice.apply(cached, list);
    exports.set(key, cached);

    return cached;
};


/**
 * concat 缓存值
 * @param key
 * @returns {*}
 */
exports.concat = function (key/*arguments*/) {
    var cached = exports.get(key);
    var list = [].slice.call(arguments, 1);

    if (!typeis.array(cached)) {
        cached = [];
    }

    cached = cached.concat.apply(cached, list);
    exports.set(key, cached);

    return cached;
};


/**
 * pop 缓存值
 * @param key
 * @returns {*}
 */
exports.pop = function (key) {
    var cached = exports.get(key);

    if (!typeis.array(cached)) {
        return;
    }

    cached.pop();

    return cached;
};


/**
 * shift 缓存值
 * @param key
 * @returns {*}
 */
exports.shift = function (key) {
    var cached = exports.get(key);

    if (!typeis.array(cached)) {
        return;
    }

    cached.shift();

    return cached;
};


/**
 * shift 缓存值
 * @param key
 * @returns {*}
 */
exports.slice = function (key) {
    var args = [].slice.call(arguments, 1);
    var cached = exports.get(key);

    if (!typeis.array(cached)) {
        return;
    }

    return cached.slice.apply(cached, args);
};
