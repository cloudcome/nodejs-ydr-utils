/*!
 * 定义常量
 * @author ydr.me
 * @create 2015-09-26 16:32
 */


'use strict';


module.exports = function (parent, key, val) {
    Object.defineProperty(parent, key, {
        // 是否可被修改、不能被删除
        configurable: false,
        // 是否可被数值运算符修改
        writable: false,
        // 是否可被枚举
        enumerable: true,
        // 值
        value: val
    });
};

