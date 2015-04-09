/*!
 * util for ydr.me
 * @author ydr.me
 * @create 2014-11-16 16:10
 */

'use strict';

module.exports = {
    // 阿里云 OSS 上传
    aliOSS: require('./libs/ali-oss.js'),
    // 类
    class: require('./libs/class.js'),
    // 日期
    date: require('./libs/date.js'),
    // 数据出口
    dato: require('./libs/dato.js'),
    // HTTP status
    httpStatus: require('./libs/http-status.js'),
    // log
    log: require('./libs/log.js'),
    // MIME
    mime: require('./libs/mime.js'),
    // 随机数
    random: require('./libs/random.js'),
    // 数据类型
    request: require('./libs/request.js'),
    // 加密
    secret: require('./libs/secret.js'),
    // 模板引擎
    Template: require('./libs/template.js'),
    // 翻译
    translate: require('./libs/translate.js'),
    // 数据类型
    typeis: require('./libs/typeis.js'),
    // 数据验证
    Validator: require('./libs/validator.js'),
    // 数据类型
    xss: require('./libs/xss.js')
};