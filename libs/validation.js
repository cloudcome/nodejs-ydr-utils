/**
 * 表单验证
 * @author ydr.me
 * @create 2015-07-01 16:57
 * @update 2015-10-19 11:44:25
 */


'use strict';

var howdo = require('howdo');

var klass = require('./class.js');
var dato = require('./dato.js');
var typeis = require('./typeis.js');
var allocation = require('./allocation.js');
var string = require('./string.js');
var Emitter = require('./emitter.js');
var random = require('./random.js');


/**
 * @type {{}}
 * @exmaple
 * {
     *     // val 值
     *     // param 参数值
     *     // done 验证结束回调
     *     minLength: function (val, done, param0, param1, ...) {
     *        // done(null); done(null)表示没有错误
     *        // done('${path}的长度不足xx字符')
     *     }
     * }
 */
var validationMap = {};
var namespace = 'donkey-libs-validation';
var alienIndex = 0;
var defaults = {
    // true: 返回单个错误对象
    // false: 返回错误对象组成的数组
    // 浏览器端，默认为 false
    // 服务器端，默认为 true
    breakOnInvalid: typeof window === 'undefined',
    defaultMsg: '${1}不合法'
};
var Validation = klass.extends(Emitter).create({
    constructor: function (options) {
        var the = this;

        the._options = dato.extend({}, defaults, options);
        the._validateList = [];
        the._validateIndexMap = {};
        the._aliasMap = {};
        the._msgMap = {};
        the._validationMap = {};
        the.className = 'validation';
    },


    /**
     * 为路径设置别名
     * @param path {String} 字段
     * @param [alias] {String} 别名
     * @returns {Validation}
     */
    setAlias: function (path, alias) {
        var the = this;

        if (typeis(path) === 'object') {
            dato.extend(the._aliasMap, path);
            return the;
        }

        the._aliasMap[path] = alias;
        return the;
    },


    /**
     * 获取字段别名
     * @param path
     * @returns {*}
     */
    getAlias: function (path) {
        return this._aliasMap[path];
    },


    /**
     * 重设验证消息
     * @param path
     * @param ruleName
     * @param msg
     * @returns {Validation}
     */
    setMsg: function (path, ruleName, msg) {
        var the = this;

        the._msgMap[path] = the._msgMap[path] || {};
        the._msgMap[path][ruleName] = msg;

        return the;
    },


    /**
     * 注册验证规则，按顺序执行验证
     * @param path {String} 字段
     * @param nameOrfn {String|Function} 验证规则，可以是静态规则，也可以添加规则
     * @returns {Validation}
     */
    addRule: function (path, nameOrfn/*arguments*/) {
        var the = this;
        var args = allocation.args(arguments);
        var params = args.slice(2);
        var index = the._validateIndexMap[path];

        if (typeis.Undefined(index)) {
            index = the._validateIndexMap[path] = the._validateList.length;
            the._validateList.push({
                path: path,
                rules: []
            });
        }

        if (typeis.String(nameOrfn)) {
            var name = nameOrfn;

            if (!validationMap[name]) {
                throw 'can not found `' + name + '` validation';
            }

            the._validateList[index].rules.push({
                name: name,
                params: params,
                fn: validationMap[name],
                id: random.guid()
            });
        } else if (typeis.Function(nameOrfn)) {
            the._validateList[index].rules.push({
                name: namespace + alienIndex++,
                params: params,
                fn: nameOrfn,
                id: random.guid()
            });
        }

        return the;
    },


    /**
     * 获取字段的规则
     * @param [path] {String} 字段
     * @returns {Array}
     */
    getRules: function (path) {
        var the = this;

        if (!path) {
            return the._validateList;
        }

        var rules = [];

        dato.each(the._validateList, function (i, validate) {
            if (path === validate.path) {
                rules = validate.rules;

                return false;
            }
        });

        return rules;
    },


    /**
     * 获取字段验证规则的参数
     * @param path {String} 字段
     * @param name {String} 规则名称
     * @returns {*|Array}}
     */
    getRuleParams: function (path, name) {
        var the = this;
        var rules = the.getRules(path);
        var rule;

        dato.each(rules, function (index, _rule) {
            if (_rule.name === name) {
                rule = _rule;
                return false;
            }
        });

        return rule && rule.params;
    },


    /**
     * 返回待验证的数据
     * @param [path] {String} 字段
     * @returns {*}
     */
    getData: function (path) {
        var the = this;

        if (typeis.Array(path)) {
            return dato.select(the.data, path);
        } else if (typeis.String(path)) {
            return the.data[path];
        }

        return the.data;
    },


    /**
     * 设置待验证的数据
     * @param path {String} 数据字段
     * @param val {*} 数据值
     * @returns {Validation}
     */
    setData: function (path, val) {
        var the = this;

        the.data[path] = val;

        return the;
    },


    /**
     * 执行单个验证
     * @param data {Object} 待验证的数据
     * @param [path] {String} 指定验证的字段
     * @param [callback] {Function} 验证回调
     * @returns {Validation}
     */
    validateOne: function (data, path, callback) {
        var args = allocation.args(arguments);

        if (!typeis.String(args[1])) {
            callback = args[1];
            path = Object.keys(data)[0];
        }

        return this.validateSome(data, path, callback);
    },


    /**
     * 执行部分验证
     * @param data {Object} 待验证的数据
     * @param [paths] {String} 指定验证的字段
     * @param [callback] {Function} 验证回调
     * @returns {Validation}
     */
    validateSome: function (data, paths, callback) {
        var the = this;
        var options = the._options;
        var path = '';
        var args = allocation.args(arguments);
        var pathMap = {};

        if (the._isValidating) {
            return the;
        }

        // validateSome(data, callback)
        if(!typeis.String(args[1]) && !typeis.Array(args[1])){
            paths = Object.keys(data);
            callback = args[1];
        }

        paths = typeis.String(paths) ? [paths] : paths;

        dato.each(paths, function (index, path) {
            pathMap[path] = 1;
        });

        the._isValidating = true;
        the.data = data;
        var errorLength = 0;
        var firstInvlidError = null;
        var firstInvlidPath = null;

        howdo
        // 遍历验证顺序
            .each(the._validateList, function (i, item, next) {
                if (!(item.path in pathMap)) {
                    return next();
                }

                the._validateOne(path = item.path, item.rules, function (err) {
                    if (err) {
                        if (!firstInvlidPath) {
                            firstInvlidError = err;
                            firstInvlidPath = item.path;
                        }

                        errorLength++;
                    }

                    // 有错误 && 失败不断开
                    if (err && !options.breakOnInvalid) {
                        err = null;
                    }

                    next(err);
                });
            })
            .follow(function () {
                the._isValidating = false;

                if (typeis.Function(callback)) {
                    callback.call(the, firstInvlidError, firstInvlidPath);
                }
            });

        return the;
    },


    /**
     * 执行全部验证
     * @param data {Object} 待验证的数据
     * @param [callback] {Function} 验证回调
     * @returns {Validation}
     */
    validateAll: function (data, callback) {
        var the = this;
        var paths = [];

        dato.each(the._validateList, function (index, item) {
            paths.push(item.path);
        });

        return the.validateSome(data, paths, callback);
    },

    /**
     * 表单验证
     * @param path {String} 字段
     * @param rules {Array} 验证规则
     * @param callback {Function} 验证回调
     * @private
     */
    _validateOne: function (path, rules, callback) {
        var the = this;
        var options = the._options;
        var data = the.data;

        /**
         * 验证之前
         * @event beforeValidate
         * @param path {String} 字段
         */
        the.emit('beforeValidate', path);
        var currentRule;
        howdo
        // 遍历验证规则
            .each(rules, function (j, rule, next) {
                var args = [data[path], next];

                currentRule = rule;
                the.emit('validate', path, rule.name);
                args = args.concat(rule.params);
                the.path = path;
                rule.fn.apply(the, args);
            })
            .follow()
            .try(function () {
                /**
                 * 验证成功
                 * @event valid
                 * @param path {String} 字段
                 */
                the.emit('valid', path);

                /**
                 * 验证之后
                 * @event validate
                 * @param path {String} 字段
                 */
                the.emit('validate', path);

                if (typeis.Function(callback)) {
                    callback.call(the, null);
                }
            })
            .catch(function (err) {
                var overrideMsg = the._msgMap[path] && the._msgMap[path][currentRule.name];
                var args = [overrideMsg || err || options.defaultMsg, the.getAlias(path) || path];

                args = args.concat(currentRule.params);
                err = new TypeError(string.assign.apply(string, args));
                err.id = currentRule.id;

                /**
                 * 验证失败
                 * @event invalid
                 * @param error {Object} 错误对象
                 * @param path {String} 字段
                 */
                the.emit('invalid', err, path);

                /**
                 * 验证之后
                 * @event validate
                 * @param path {String} 字段
                 */
                the.emit('validate', path);

                if (typeis.Function(callback)) {
                    callback.call(the, err);
                }
            });
    }
});

/**
 * 注册静态验证规则
 * @param name {String} 规则名称
 * @param fn {Function} 规则回调
 *
 * @example
 * Validation.addRule('number', function (val, done, param0, param1, ...) {
 *    done(/^\d+$/.test(val) ? null : '${path}必须是数字');
 * });
 */
Validation.addRule = function (name, fn/*arguments*/) {
    validationMap[name] = fn;
};


/**
 * 返回静态规则
 * @param [name] {String} 规则名
 * @returns {Object|Function}
 */
Validation.getRule = function (name) {
    return name ? validationMap[name] : validationMap;
};

require('./_validation-rules.js')(Validation);
Validation.defaults = defaults;
module.exports = Validation;
