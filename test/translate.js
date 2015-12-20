/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-04-09 20:28
 */

'use strict';

var assert = require('assert');

var translate = require('../libs/translate.js');

describe('translate', function () {
    it('1', function (done) {
        translate('你好', function (err, word) {
            if(err){
                console.log(err.stack);
            }

            assert.equal(!err, true);
            console.log(word);
            assert.equal(word !== '', true);
            done();
        });
    });
});

