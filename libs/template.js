/**
 * html 字符串模板引擎
 * @author ydr.me
 * @create 2014-10-09 18:35
 * @update 2015年05月03日00:07:41
 * @update 2015年11月24日16:17:46
 */


'use strict';


var dato = require('./dato.js');
var string = require('./string.js');
var typeis = require('./typeis.js');
var klass = require('./class.js');
var allocation = require('./allocation.js');

var REG_STRING_WRAP = /([\\"])/g;
var REG_LINES = /[\n\r\t]/g;
var REG_SPACES = /\s{2,}/g;
var REG_PRES = /<pre\b.*?>[\s\S]*?<\/pre>/ig;
var REG_VAR = /^(=)?\s*([^|]+?)(\|.*)?$/;
var REG_FILTER = /^(.*?)(\s*:\s*(.+)\s*)?$/;
var REG_IF = /^((else\s+)?if)\s+(.*)$/;
//var REH_LIST = /^list\s+\b([^,]*)\b\s+as\s+\b([^,]*)\b(\s*,\s*\b([^,]*))?$/;
var REH_LIST = /^list\s+([^,]*)\s+as\s+([^,]*)(\s*,\s*([^,]*))?$/;
var REG_ELSE_IF = /^else\s+if\s/;
var REG_HASH = /^#/;
var REG_F = /;$/;
var REG_IGNORE = /\{\{ignore}}([\s\S]*?)\{\{\/ignore}}/ig;
var regLines = [{
    'n': /\n/g,
    'r': /\r/g,
    't': /\t/g
}];
var namespace = '_alien_libs_template_';
var openTag = '{{';
var closeTag = '}}';
var configs = {
    /**
     * 是否压缩输出内容
     * @type Boolean
     */
    compress: true,
    /**
     * 是否 debug 模式
     * @type Boolean
     */
    debug: false
};
var increase = 0;
var filters = {};

var generatorVar = function () {
    return '__' + (increase++) + '__';
};

var Template = klass.create({
    constructor: function (template, options) {
        var the = this;

        the.className = 'template';
        the._options = dato.extend(true, {}, configs, options);
        the._init(String(template));
    },


    /**
     * 表达式安全包装
     * @param exp
     * @returns {string}
     * @private
     */
    _wrapSafe: function (exp) {
        var the = this;

        exp = exp.replace(REG_F, '');
        return '(function(){try{' +
            'if(' + the._selfVarible + '.typeis.empty(' + exp + ') && ' + the._selfVarible + '.options.debug){return String(' + exp + ');}' +
            'return ' + exp + '}catch(e){return ' + the._selfVarible + '.options.debug?e.message:""}}())';
    },


    /**
     * 初始化一个模板引擎
     * @param {String} template 模板字符串
     * @returns {Template}
     * @private
     */
    _init: function (template) {
        var the = this;
        var options = the._options;
        var _var = generatorVar();
        var selfVarible = generatorVar();
        var _forKey = generatorVar();
        var _evalKey = generatorVar();
        var dataVarible = generatorVar();
        var fnStr = 'var ' + _var + '="";\n';
        var output = [];
        var parseTimes = 0;
        // 是否进入忽略状态，true=进入，false=退出
        var inIgnore = false;
        // 是否进入表达式
        var inExp = false;

        fnStr += 'var ' + selfVarible + '=this;\n';
        fnStr += 'var ' + _evalKey + '="";\n' +
            'for(var ' + _forKey + ' in ' + dataVarible + '){\n' +
                /**/'\tif(/^[a-z$_]/i.test(' + _forKey + ')){\n' +
                /**//**/'\t\t' + _evalKey + '+="var "+' + _forKey + '+"=' + dataVarible + '[\'"+' + _forKey + '+"\'];";\n' +
                /**/'\t}\n' +
            '}\n' +
            'eval(' + _evalKey + ');\n\n';
        the._template = {
            escape: string.escapeHTML,
            filters: {}
        };
        the._selfVarible = selfVarible;
        the._useFilters = {};
        the._placeholders = {};

        template.replace(REG_IGNORE, function ($0, $1) {
            var key = _generateKey();

            the._placeholders[key] = $1;

            return key;
        }).split(openTag).forEach(function (value, times) {
            var array = value.split(closeTag);
            var $0 = array[0];
            var $1 = array[1];
            var parseVar;
            var isEndIgnore;

            parseTimes++;

            // 1个开始符
            if (array.length === 1) {
                // 多个连续开始符号
                if (!$0 || $0 === '{') {
                    if (inIgnore) {
                        output.push(_var + '+=' + the._cleanPice(openTag) + ';');
                    }
                }
                // 忽略开始
                else if ($0.slice(-1) === '\\') {
                    output.push(_var + '+=' + the._cleanPice($0.slice(0, -1) + openTag) + ';');
                    inIgnore = true;
                    parseTimes--;
                }
                else {
                    if ((parseTimes % 2) === 0) {
                        throw new TypeError('find unclose tag ' + openTag);
                    }

                    inIgnore = false;
                    inExp = true;
                    output.push(_var + '+=' + the._cleanPice($0) + ';');
                }
            }
            // 1个结束符
            else if (array.length === 2) {
                $0 = $0.trim();
                inExp = false;
                isEndIgnore = $1.slice(-1) === '\\';

                // 忽略结束
                if (inIgnore) {
                    output.push(
                        _var +
                        '+=' + the._cleanPice((times > 1 ? openTag : '') +
                            $0 + closeTag +
                            (isEndIgnore ? $1.slice(0, -1) : $1)
                        ) +
                        ';\n');
                    inIgnore = false;

                    // 下一次忽略
                    if (isEndIgnore) {
                        inIgnore = true;
                        parseTimes--;
                    }

                    return;
                }

                // 下一次忽略
                if (isEndIgnore) {
                    inIgnore = true;
                    parseTimes--;
                    $1 = $1.slice(0, -1);
                }

                $1 = the._cleanPice($1);

                // if abc
                if (the._hasPrefix($0, 'if')) {
                    output.push(the._parseIfAndElseIf($0) + _var + '+=' + $1 + ';');
                }
                // else if abc
                else if (REG_ELSE_IF.test($0)) {
                    output.push('}' + the._parseIfAndElseIf($0) + _var + '+=' + $1 + ';');
                }
                // else
                else if ($0 === 'else') {
                    output.push('\n}else{\n' + _var + '+=' + $1 + ';');
                }
                // /if
                else if ($0 === '/if') {
                    output.push('\n}' + _var + '+=' + $1 + ';');
                }
                // list list as key,val
                // list list as val
                else if (the._hasPrefix($0, 'list')) {
                    output.push(the._parseList($0) + _var + '+=' + $1 + ';');
                }
                // /list
                else if ($0 === '/list') {
                    output.push('});\n' + _var + '+=' + $1 + ';');
                }
                // var
                else if (the._hasPrefix($0, 'var')) {
                    parseVar = the._parseVar($0);

                    if (parseVar) {
                        output.push(parseVar);
                    }

                    output.push(_var + '+=' + $1 + ';');
                }
                // #
                else if (REG_HASH.test($0)) {
                    parseVar = the._parseVar($0.replace(REG_HASH, ''));
                    output.push(_var + '+=' + $1 + ';');

                    if (parseVar) {
                        output.push(parseVar);
                    }
                }
                // exp
                else {
                    parseVar = the._parseExp($0);

                    if (parseVar) {
                        output.push(_var + '+=' + the._parseExp($0) + '+' + $1 + ';');
                    }
                }

            }
            // 多个结束符
            else {
                output.push(_var + '+=' + the._cleanPice(value) + ';');
                inExp = false;
                inIgnore = false;
            }
        });

        fnStr += output.join(';\n') + '\nreturn ' + _var + ';\n';

        var fn;

        try {
            /* jshint evil: true */
            fn = new Function(dataVarible, 'try{\n\n' +
                fnStr +
                '\n\n}catch(err){\n' +
                'return '+the._selfVarible+'.options.debug?err.message:"";\n' +
                '}\n');
        } catch (err) {
            fn = function () {
                return options.debug ? err.message : '';
            };
        }

        //fn.toString = function () {
        //    return fnStr;
        //};
        fn.context = the;
        the.compiler = fn;

        return the;
    },


    /**
     * 判断是否包含该前缀
     * @param str
     * @param pre
     * @returns {boolean}
     * @private
     */
    _hasPrefix: function (str, pre) {
        return str.indexOf(pre + ' ') === 0;
    },


    /**
     * 渲染数据
     * @param {Object} [data={}] 数据
     * @returns {String} 返回渲染后的数据
     *
     * @example
     * tp.render(data);
     */
    render: function (data) {
        var the = this;
        var options = the._options;
        var existFilters = dato.extend(true, {}, filters, the._template.filters);
        var self = dato.extend(true, {}, {
            each: function (obj) {
                var args = allocation.args(arguments);

                if (typeis.String(obj)) {
                    args[0] = [];
                }

                return dato.each.apply(dato, args);
            },
            escape: string.escapeHTML,
            filters: existFilters,
            options: options,
            typeis: typeis
        });
        var ret;

        data = data || {};

        dato.each(the._useFilters, function (filter) {
            if (!existFilters[filter]) {
                throw new Error('can not found filter ' + filter);
            }
        });

        try {
            ret = the.compiler.call(self, data);
        } catch (err) {
            ret = options.debug ? err.message : '';
        }

        ret = String(ret);
        ret = options.compress ? _cleanHTML(ret) : ret;

        // 恢复占位
        dato.each(the._placeholders, function (key, val) {
            ret = ret.replace(key, val);
        });

        return ret;
    },


    /**
     * 添加过滤函数，默认无任何过滤函数
     * @param {String} name 过滤函数名称
     * @param {Function} callback 过滤方法
     * @param {Boolean} [isOverride=false] 覆盖实例的过滤方法，默认为false
     *
     * @example
     * tp.filter('test', function(val, arg1, arg2){
         *     // code
         *     // 规范定义，第1个参数为上一步的值
         *     // 后续参数自定义个数
         * });
     */
    filter: function (name, callback, isOverride) {
        var instanceFilters = this._template.filters;

        if (!typeis.String(name)) {
            throw new Error('filter name must be a string');
        }

        // 未设置覆盖 && 已经覆盖
        if (!isOverride && instanceFilters[name]) {
            throw new Error('override a exist instance filter');
        }

        if (!typeis.Function(name)) {
            throw new Error('filter callback must be a function');
        }

        instanceFilters[name] = callback;
    },


    /**
     * 获取过滤函数
     * @param {String} [name] 过滤函数名称，name为空时返回所有过滤方法
     * @returns {Function|Object}
     *
     * @example
     * tp.getFilter();
     * // => return all filters Object
     *
     * tp.getFilter('test');
     * // => return test filter function
     */
    getFilter: function (name) {
        return typeis.String(name) ?
            this._template.filters[name] :
            this._template.filters;
    },


    /**
     * 解析变量赋值
     * @param str
     * @returns {string}
     * @private
     */
    _parseVar: function (str) {
        return this._parseExp(str, 'var') + ';';
    },


    /**
     * 解析表达式
     * @param str
     * @param [varible]
     * @returns {string}
     * @private
     */
    _parseExp: function (str, varible) {
        var the = this;

        str = str.trim();

        var unEscape = str[0] === '=';
        str = unEscape ? str.substr(1) : str;
        var matches = str.match(REG_VAR);
        var filters;

        if (!matches) {
            return '';
        }

        var exp = matches[2];

        // name || "123"
        if (matches[3] && matches[3].slice(0, 2) === '||') {
            //return ret + '?' + matches[2] + ':' + matches[3].slice(2) + ')';
            //exp = '(typeof(' + exp + ')!=="undefined"&&!!' + exp + ')?' + exp + ':' + matches[3].slice(2);
            exp = matches[2] + matches[3];
        } else if (matches[3] && matches[3].slice(0, 1) === '|') {
            filters = matches[3].split('|');
            filters.shift();
            filters.forEach(function (filter) {
                var matches = filter.match(REG_FILTER);
                var args;
                var name;

                if (!matches) {
                    throw new Error('parse error ' + filter);
                }

                name = matches[1].trim();
                the._useFilters[name] = 1;
                args = exp + (matches[3] ? ',' + matches[3] : '');
                exp = the._selfVarible + '.filters.' + name + '(' + args + ')';
            });
        }


        if (varible) {
            return exp;
        }

        exp = this._wrapSafe(exp);
        return (unEscape ? '(' : the._selfVarible + '.escape(') + exp + ')';
    },


    /**
     * 解析条件判断
     * @param str
     * @returns {string}
     * @private
     */
    _parseIfAndElseIf: function (str) {
        var matches = str.trim().match(REG_IF);

        if (!matches) {
            throw new Error('parse error ' + str);
        }

        return matches[1] + '(' + matches[3] + '){';
    },


    /**
     * 解析列表
     * @param str
     * @returns {string}
     * @private
     */
    _parseList: function (str) {
        var the = this;
        var matches = str.trim().match(REH_LIST);
        var parse;
        var randomKey1 = generatorVar();
        var randomKey2 = generatorVar();
        var randomVal = generatorVar();

        if (!matches) {
            throw new Error('parse error ' + str);
        }

        parse = {
            list: matches[1] || '',
            key: matches[4] ? matches[2] : randomKey2,
            val: matches[4] ? matches[4] : matches[2]
        };

        return the._selfVarible +'.each(' + the._wrapSafe(parse.list) + ', function(' + randomKey1 + ', ' + randomVal + '){' +
            'var ' + parse.key + ' = ' + randomKey1 + ';\n' +
            'var ' + parse.val + '=' + randomVal + ';\n';
    },

    /**
     * 片段处理
     * @param str
     * @returns {string}
     * @private
     */
    _cleanPice: function (str) {
        str = str.replace(REG_STRING_WRAP, '\\$1');

        dato.each(regLines, function (index, map) {
            var key = Object.keys(map)[0];
            var val = map[key];

            str = str.replace(val, '\\' + key);
        });

        if (this._options.compress) {
            str = _cleanHTML(str);
        }

        return '"' + str + '"';
    }
});


/**
 * 生成随机 42 位的 KEY
 * @returns {string}
 * @private
 */
function _generateKey() {
    return 'œ' + namespace + (increase++) + 'œ';
}


/**
 * 清理 HTML
 * @param code
 * @private
 */
function _cleanHTML(code) {
    // 保存 <pre>
    var preMap = {};

    code = code.replace(REG_PRES, function ($0) {
        var key = _generateKey();

        preMap[key] = $0;

        return key;
    });


    code = code
        .replace(REG_LINES, '')
        .replace(REG_SPACES, ' ');


    dato.each(preMap, function (key, val) {
        code = code.replace(key, val);
    });

    return code;
}


/**
 * 默认配置
 * @type {Object}
 * @static
 */
Template.configs = configs;


/**
 * 静态过滤方法
 * @type {Object}
 * @static
 */
Template.filters = filters;

/**
 * 设置默认配置
 * @param options
 */
Template.config = function (options) {
    dato.extend(configs, options);
};


/**
 * 添加过滤方法
 * @param {String} name 过滤方法名称
 * @param {Function} callback 方法
 * @param {Boolean} [isOverride=false] 是否强制覆盖，默认 false
 * @static
 */
Template.filter = function (name, callback, isOverride) {
    if (typeis(name) !== 'string') {
        throw new Error('filter name must be a string');
    }

    // 未设置覆盖 && 已经覆盖
    if (!isOverride && filters[name]) {
        throw new Error('override a exist filter');
    }

    if (typeis(callback) !== 'function') {
        throw new Error('filter callback must be a function');
    }

    filters[name] = callback;
};


/**
 * 模板引擎
 *
 * @param {Object} [options] 配置
 * @param {Boolean} [options.cache=true] 是否缓存上次结果
 * @param {Boolean} [options.compress=true] 是否输出压缩内容
 * @param {Boolean} [options.debug=false] 是否输出调试新
 * @constructor
 *
 * @example
 * var tpl = new Template('{{name}}');
 * tpl.render({name: 'yundanran'});
 * // => 'yundanran'
 */
module.exports = Template;





/*===========================================================================================*/
/*======================================【NODEJS】============================================*/
/*===========================================================================================*/
var fs = require('fs');
var path = require('path');
var promiseify = require('promiseify');

var REG_INCLUDE = /\{\{\s*?include (.*?)\s*?}}/g;
var REG_ABSLOUTE = /^\//;
var REG_QUOTE = /^["']|["']$/g;
var templateMap = {};
var includeMap = {};
/**
 * 编译之前做的事情
 * @param expressConfigs {Object} express 配置
 * @param file {String} 当前模板所在的路径
 * @param template {String} 当前模板内容
 * @private
 */
function _preCompile(expressConfigs, file, template) {
    var relativeDir = path.dirname(file);

    return template.replace(REG_INCLUDE, function ($0, includeName) {
        includeName = includeName.trim().replace(REG_QUOTE, '');

        var includeFile = REG_ABSLOUTE.test(includeName) ?
            path.join(expressConfigs.root, includeName) :
            path.join(relativeDir, includeName);

        if (configs.cache && includeMap[includeFile]) {
            return includeMap[includeFile];
        }

        try {
            includeMap[includeFile] = fs.readFileSync(includeFile, 'utf8');
            return includeMap[includeFile];
        } catch (err) {
            return '';
        }
    });
}


/**
 * empty function
 */
function noop() {
}


/**
 * 适配 express
 * @param file {String} 模板的绝对路径
 * @param data {Object} 模板的数据
 * @param [data.cache=false] {Boolean} 是否缓存模板
 * @param [data.locals=null] {Object} 动态助手
 * @param [data.settings=null] {Object} app 配置
 * @param callback {Function} 回调
 */
Template.__express = function (file, data, callback) {
    var template;
    var tpl;
    var args = arguments;

    // this:
    //{
    //    defaultEngine: 'html',
    //    ext: '.html',
    //    name: 'front/index.html',
    //    root: '~/.views/',
    //    engine: [Function],
    //    path: '~/.views/front/index.html'
    // }

    if (typeis.function(args[1])) {
        callback = args[1];
        data = {};
    }

    callback = callback || noop;

    if (configs.cache && templateMap[file]) {
        tpl = templateMap[file];
    } else {
        try {
            template = fs.readFileSync(file, 'utf8');
            template = _preCompile(this, file, template);
        } catch (err) {
            return callback(err);
        }

        tpl = new Template(template);

        if (configs.cache) {
            templateMap[file] = tpl;
        }
    }

    callback(null, tpl.render(data));
};


/**
 * 适配 koa
 * @param app {Object} koa app
 * @param viewsRoot {String} views 根路径
 */
Template.__koa = function (app, viewsRoot) {
    app.context.render = promiseify(function (file, data, callback) {
        Template.__express(path.join(viewsRoot, file), data, callback);
    }, global);
};

