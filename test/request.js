'use strict';

var assert = require('assert');


var request = require('../libs/request.js');


describe('request', function () {
    it('get', function (done) {
        request.get('https://baidu.com', function (err, body) {
            assert.equal(!err, true);
            console.log(body);
            assert.equal(/baidu/.test(body), true);
            done();
        });
    });
});

