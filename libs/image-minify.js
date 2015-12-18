/**
 * 图片压缩
 * @author ydr.me
 * @create 2015-12-18 11:59
 */


'use strict';


var howdo = require('howdo');
var fse = require('fs-extra');

var request = require('./request.js');
var allocation = require('./allocation.js');
var typeis = require('./typeis.js');
var path = require('./path.js');
var dato = require('./dato.js');

var noop = function () {
    // ignore
};

/**
 * 腾讯智图压缩
 * @ref http://zhitu.isux.us
 * @param stream {Object|String} 输入流或文件路径
 * @param [options] {Object} 配置
 * @param [options.quality=0.7] {Number} 指定压缩后的质量
 * @param [options.filename="file.png"] {String} 指定数据流的文件名
 * @param [callback] {Function} 回调，如果处理失败则返回原始数据流
 */
exports.zhitu = function (stream, options, callback) {
    var url = 'http://zhitu.isux.us/index.php/preview/upload_file';
    var defaults = {
        // 图片质量：0.1 - 1
        quality: 0.7,
        filename: 'file.png'
    };
    var args = allocation.args(arguments);

    if (typeis.Function(args[1])) {
        callback = args[1];
        options = {};
    }

    if (!typeis.Function(callback)) {
        callback = noop;
    }

    options = dato.extend({}, defaults, options);

    if (typeis.String(stream)) {
        options.filename = path.basename(stream);
        stream = fse.createReadStream(stream);
    }

    var fd = new FormData();

    fd.append('mame', path.basename(options.filename));
    fd.append('compress', options.quality * 100);
    fd.append('type', path.extname(options.filename).slice(1));
    fd.append('fileSelect', stream);

    howdo
    // 上传
        .task(function (next) {
            request.post({
                url: url,
                form: fd
            }, next);
        })
        // 下载
        .task(function (next, body, res) {
            if (res.statusCode !== 200) {
                return next(new Error('upload zhitu response statusCode is ' + res.statusCode));
            }

            var json = {};

            try {
                //{ code: 3,
                //output: 'http://zhitu.isux.us/assets/img/imgTest/png_cut/1450407415693-ori.png',
                //output_jpg: 'http://zhitu.isux.us/assets/img/imgTest/png_cut/1450407415693.jpg',
                //size: 269.1,
                //output_webp: 'null' }
                json = JSON.parse(body);
            } catch (err) {
                return next(new Error('parse zhitu response body error'));
            }

            request.down(json.output, function (err, stream, res) {
                if (err) {
                    return next(err);
                }

                if (res.statusCode !== 200) {
                    return next(new Error('download zhitu response statusCode is ' + res.statusCode));
                }

                next(null, stream);
            });
        })
        .follow()
        .try(function (stream) {
            callback(null, stream);
        })
        .catch(function () {
            callback(null, stream);
        });
};


