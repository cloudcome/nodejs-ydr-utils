/**
 * 文件描述
 * @author ydr.me
 * @create 2015-11-14 12:00
 */


'use strict';

var assert = require('assert');

var Validation = require('../libs/validation.js');

describe('libs/validation.js', function () {
    var data = {
        name: '',
        age: 1
    };
    it('e', function (done) {
        var v = new Validation();

        v.setAlias({
            name: '名字',
            age: '年龄'
        });
        v.addRule('name', 'minLength', 4);
        v.addRule('age', 'min', 18);
        v.validateAll(data, function (err, path) {
            assert.equal(!!err, 'name');
            done();
        });
    });
});


