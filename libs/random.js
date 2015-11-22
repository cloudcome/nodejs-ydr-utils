/**
 * 随机数
 * @author ydr.me
 * @create 2014-10-30 19:03
 */

'use strict';

var dato = require('./dato.js');
var number = require('./number.js');
var string = require('./string.js');
var regExist = /[aA0]/g;
var dictionaryMap = {
    a: 'abcdefghijklmnopqrstuvwxyz',
    A: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    0: '0123456789'
};

/**
 * 随机数字
 * @param [min=0] {Number} 最小值，默认0
 * @param [max=0] {Number} 最大值，默认0
 * @returns {Number}
 *
 * @example
 * random.number(1, 3);
 * // => 1 or 2 or 3
 */
exports.number = function (min, max) {
    var temp;

    min = number.parseInt(min, 0);
    max = number.parseInt(max, 0);

    if (min === max) {
        return min;
    }

    if (min > max) {
        temp = min;
        min = max;
        max = temp;
    }

    return Math.floor(Math.random() * (max - min + 1) + min);
};


/**
 * 随机字符串
 * @param [length=6] {Number} 随机字符串长度
 * @param [dictionary='aA0'] {String} 字典
 *
 * @example
 * // 字典对应关系
 * // a => a-z
 * // A => A-Z
 * // 0 => 0-9
 * // 其他字符
 * random.string(6, 'a');
 * // => abcdef
 * random.string(6, '!@#$%^&*()_+');
 * // => @*)&(^
 */
exports.string = function (length, dictionary) {
    var ret = '';
    var pool = '';
    var max;

    length = Math.abs(number.parseInt(length, 6));
    dictionary = String(dictionary || 'a');

    if (dictionary.indexOf('a') > -1) {
        pool += dictionaryMap.a;
    }

    if (dictionary.indexOf('A') > -1) {
        pool += dictionaryMap.A;
    }

    if (dictionary.indexOf('0') > -1) {
        pool += dictionaryMap[0];
    }

    pool += dictionary.replace(regExist, '');
    max = pool.length - 1;

    while (length--) {
        ret += pool[exports.number(0, max)];
    }

    return ret;
};


/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
//////////////////////////////[ ONLY NODEJS ]////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////


/**
 * 根据当前时间戳生成指定长度不重复的26位纯数字字符串
 * 数字之间有大小之分，因此可以用来排序
 * 精确正整数在 -2^53 - 2^53 之间，即 −9007199254740992 - 9007199254740992（长度16）
 * 因此为了精确比较，需要控制数据在16位以内，即长度小于16
 * 所以，此处的比较，需要将字符串分成2部分，分别是13位 + 13位
 * 比较两个字符串数值大小使用 dato.than(long1, long2, '>');
 * @param [isTimeStamp=false] 是否时间戳形式
 * @param [isSafe=false] 是否安全格式
 * @returns {String}
 */
var guidIndex = 0;
var lastGuidTime = 0;
exports.guid = function (isTimeStamp, isSafe) {
    var a = [];
    var d = new Date();
    var ret = '';
    var safeLength = 16;
    var allLength = 26;

    var timeStamp = d.getTime();

    if (isTimeStamp) {
        if (timeStamp !== lastGuidTime) {
            lastGuidTime = timeStamp;
            guidIndex = 0;
        }

        timeStamp = String(timeStamp);
        var timeStampLength = timeStamp.length;
        var suffix = '';

        if (isSafe) {
            suffix = string.padLeft(guidIndex++, safeLength - timeStampLength, '0');
            ret = timeStamp + suffix;
        } else {
            suffix = process.hrtime()[1];
            suffix = string.padLeft(suffix, allLength - timeStampLength, '0');
            ret = timeStamp + suffix;
        }
    } else {
        // 4
        var Y = string.padLeft(d.getFullYear(), 4, '0');
        // 2
        var M = string.padLeft(d.getMonth() + 1, 2, '0');
        // 2
        var D = string.padLeft(d.getDate(), 2, '0');
        // 2
        var H = string.padLeft(d.getHours(), 2, '0');
        // 2
        var I = string.padLeft(d.getMinutes(), 2, '0');
        // 2
        var S = string.padLeft(d.getSeconds(), 2, '0');
        // 3
        var C = string.padLeft(d.getMilliseconds(), 3, '0');
        // 9
        var N = string.padLeft(process.hrtime()[1], 9, '0');

        a.push(Y);
        a.push(M);
        a.push(D);
        a.push(H);
        a.push(I);
        a.push(S);

        if (isSafe) {
            var dateTime = a.join('');

            if (dateTime !== lastGuidTime) {
                lastGuidTime = dateTime;
                guidIndex = 0;
            }

            a.push(string.padLeft(guidIndex++, safeLength - 14, '0'));
        } else {
            a.push(C);
            a.push(N);
            // 4+2+2+2+2+2+3+9 = 26
        }

        ret = a.join('');
    }

    return ret;
};

