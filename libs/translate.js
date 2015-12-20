/**
 * translate
 * @author ydr.me
 * @create 2014-12-16 21:46
 * @modify 2015年04月09日20:30:21
 */

'use strict';

// http://fanyi.youdao.com/openapi?path=data-mode
// 有道翻译API申请成功
// API key：537362269
// keyfrom：FrontEndDev
// 创建时间：2015-04-09
// 网站名称：FrontEndDev
// 网站地址：http://FrontEndDev.org

//API key：735045026
//keyfrom：ydr-me
//创建时间：2015-12-20
//网站名称：ydr-me
//网站地址：http://ydr.me

//API key：892359432
//keyfrom：s-ydr-me
//创建时间：2015-12-20
//网站名称：s-ydr-me
//网站地址：http://s.ydr.me

var qs = require('querystring');
var dato = require('./dato.js');
var typeis = require('./typeis.js');
var request = require('./request.js');
var random = require('./random.js');

var keyFroms = [
    'FrontEndDev',
    'ydr-me',
    's-ydr-me'
];
var keys = [
    '537362269',
    '735045026',
    '892359432'
];
// 只允许：英文、数字、下划线、短横线
var REG_RP = /[^\w-]/g;
var REG_LP = /-+/g;
var REG_LR = /^-+|-+$/g;
var url = 'http://fanyi.youdao.com/openapi.do?';
var configs = {
    keyfrom: function () {
        var index = random.number(0, keyFroms.length - 1);
        return keyFroms[index];
    },
    key: function () {
        var index = random.number(0, keys.length - 1);
        return keys[index];
    },
    type: 'data',
    doctype: 'json',
    version: '1.1',
    q: ''
};
var errMap = {
    '-1': '无翻译结果',
    20: '要翻译的文本过长',
    30: '无法进行有效的翻译',
    40: '不支持的语言类型',
    50: '无效的key',
    60: '无词典结果，仅在获取词典结果生效'
};


/**
 * 翻译
 * @param word {String} 翻译词
 * @param callback {Function} 翻译回调
 */
var translate = function (word, callback) {
    var query = dato.extend({}, configs);

    if (typeis.Function(configs.keyfrom)) {
        query.keyfrom = configs.keyfrom();
    }

    if (typeis.Function(configs.key)) {
        query.key = configs.key();
    }

    query.q = String(word);
    request.get({
        url: url + qs.stringify(query)
    }, function (err, body) {
        if (err) {
            return callback(err);
        }

        var json = null;

        try {
            json = JSON.parse(body);
        } catch (err) {
            json = {errorCode: -1};
        }

        if (json.errorCode === undefined) {
            json.errorCode = -1;
        }

        if (!json.translation || !json.translation.length) {
            json.errorCode = -1;
        }

        if (errMap[json.errorCode]) {
            err = new Error(errMap[json.errorCode]);
            return callback(err);
        }

        json.translation = typeis(json.translation) === 'array' ? json.translation : [json.translation];
        json.translation = json.translation[0];

        var word2 = String(json.translation);

        word2 = module.exports.filter(word2);
        callback(err, word2);
    });

};


/**
 * 设置参数
 * @param options
 */
translate.config = function (options) {
    dato.extend(configs, options);
};


/**
 * 翻译后的结果过滤
 * @param word
 * @returns {string}
 */
translate.filter = function (word) {
    return word
        .toLowerCase()
        .trim()
        .replace(REG_RP, '-')
        .replace(REG_LP, '-')
        .replace(REG_LR, '');
};


module.exports = translate;
