/**
 * 中间件
 * @author ydr.me
 * @create 2015-10-30 14:57
 */


'use strict';

var klass = require('./class.js');
var typeis = require('./typeis.js');
var dato = require('./dato.js');
var allocation = require('./allocation.js');
var Emitter = require('./emitter.js');
var howdo = require('howdo');

/*====================================
 var md = new Middleware();

 md.use(fn1);
 md.use(fn2);

 md.exec(args,..., callback);
 ====================================*/

var defaults = {
    // 是否为异步模式
    async: true,
    // 上下文
    context: null
};
var Middleware = klass.extends(Emitter).create({
    constructor: function (options) {
        var the = this;
        the._options = dato.extend({}, defaults, options);
        the._options.context = this._options.context || the;
        the._middlewareStack = [];
        the._catchError = function (err) {
            return err;
        };
    },

    /**
     * 注入中间件
     * @param callback {function} 回调
     * @returns {Middleware}
     */
    use: function (callback) {
        var the = this;

        if (typeis.function(callback)) {
            the._middlewareStack.push(callback);
        }

        return the;
    },

    /**
     * 绑定中间件上下文
     * @param context
     * @returns {Middleware}
     */
    bindContext: function (context) {
        var the = this;

        the._options.context = context;

        return the;
    },

    /**
     * 执行中间件
     * @returns {*}
     */
    exec: function (/*arguments*/) {
        var the = this;

        if (the._options.async) {
            return the._execAsync.apply(this, arguments);
        } else {
            return the._execSync(arguments[0]);
        }
    },

    /**
     * 异步执行中间件
     * @example
     * md.exec(a, b, fn);
     * // 其中 a、b 为参数
     * // fn 为回调
     */
    _execAsync: function (/*arguments*/) {
        var the = this;
        var args = allocation.args(arguments);
        var callback = args.pop();

        howdo.each(the._middlewareStack, function (index, middleware, next) {
            if (index) {
                args.shift();
            }

            args.push(function () {
                args.pop();
                args.unshift(null);
                next.apply(global, args);
            });

            try {
                middleware.apply(the._options.context, args);
            } catch (err) {
                the.emit('error', err);
            }
        }).follow(function (err) {
            var err2 = the._catchError(err);
            var args = allocation.args(arguments);
            
            args[0] = err2;
            args.shift();
            callback.apply(the._options.context, args);
        });

        return the;
    },

    /**
     * 同步执行中间件
     * @param arg
     * @returns {*}
     * @private
     */
    _execSync: function (arg) {
        var the = this;

        dato.each(the._middlewareStack, function (index, middleware) {
            try {
                arg = middleware.call(the._options.context, arg);
            } catch (err) {
                var err2 = the._catchError(err);

                if (err2) {
                    the.emit('error', err2);
                }
            }
        });

        return arg;
    },


    /**
     * 捕获错误，用于重写 error 对象
     * @param callback
     * @returns {Middleware}
     */
    catchError: function (callback) {
        var the = this;

        the._catchError = callback;

        return the;
    }
});

Middleware.defaults = defaults;
module.exports = Middleware;
