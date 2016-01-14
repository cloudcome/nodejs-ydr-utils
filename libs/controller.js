/**
 * controller
 * @author ydr.me
 * @create 2016-01-14 19:57
 */


'use strict';

var win = global;

/**
 * 至少间隔一段时间执行
 * @param fn {Function} 需要控制的方法
 * @param [wait=123] {Number} 反复执行控制的时间，单位毫秒
 * @param [isExecAtFirstTime=true] {Boolean} 是否第一次执行
 * @returns {Function}
 *
 * @example
 * window.onscroll = controller.throttle(function(){
     *    // 至少需要间隔 123ms 后执行
     * });
 */
exports.throttle = function (fn, wait, isExecAtFirstTime) {
    var time1 = 0;
    var hasExec = false;

    wait = wait || 123;

    return function () {
        if (isExecAtFirstTime !== false && !hasExec) {
            hasExec = true;
            fn.apply(this, arguments);
        }

        if (!time1) {
            time1 = Date.now();
        }

        if (Date.now() - time1 > wait) {
            fn.apply(this, arguments);
            time1 = Date.now();
        }
    };
};

/**
 * 至少在最后一次触发的一段时间后执行
 * @param fn {Function} 需要控制的方法
 * @param [wait=123] {Number} 反复执行控制的时间，单位毫秒
 * @param [isExecAtFirstTime=true] {Boolean} 是否第一次执行
 * @returns {Function}
 *
 * @example
 * window.onscroll = controller.debounce(function(){
     *    // 只在最后一次触发的 123ms 后执行
     * });
 */
exports.debounce = function (fn, wait, isExecAtFirstTime) {
    var timer = 0;
    var hasExec = false;

    wait = wait || 123;

    return function () {
        var the = this;
        var args = arguments;

        if (timer) {
            clearTimeout(timer);
        }

        if (isExecAtFirstTime !== false && !hasExec) {
            hasExec = true;
            fn.apply(this, arguments);
        }

        timer = setTimeout(function () {
            fn.apply(the, args);
            timer = 0;
        }, wait);
    };
};


/**
 * 只执行一次
 * @param fn {Function} 需要执行的方法
 * @returns {Function}
 *
 * @example
 * document.onclick = controller.once(function(){
     *     // 最多执行 1 次
     * });
 */
exports.once = function (fn) {
    var hasExec = false;

    return function () {
        if (!hasExec) {
            hasExec = true;
            fn.apply(this, arguments);
        }
    };
};


/**
 * 切换执行
 * @returns {Function}
 *
 * @example
 * document.onclick = controller.toggle(fn1, fn2, fn3);
 * // 第 1 次执行 fn1
 * // 第 2 次执行 fn2
 * // 第 3 次执行 fn3
 * // 第 4 次执行 fn1
 * // 第 5 次执行 fn2
 * // 第 6 次执行 fn3
 * // ...
 */
exports.toggle = function (/*fn*/) {
    var fns = Array.prototype.slice.call(arguments);
    var index = 0;
    var length = fns.length;

    return function () {
        fns[index++].apply(this, arguments);

        if (index >= length) {
            index = 0;
        }
    };
};


/**
 * 下一步
 * @param callback {Function} 回调
 * @param [context=window] {Object} 上下文
 */
exports.nextTick = function (callback, context/*arguments*/) {
    context = context || win;
    var args = [].slice.call(arguments, 2);

    var fn = exports.once(function () {
        callback.apply(context, args);
    });

    if (process.nextTick) {
        process.nextTick(fn);
    } else {
        setTimeout(fn, 0);
    }
};


