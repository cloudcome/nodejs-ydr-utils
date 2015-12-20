'use strict';

var assert = require('assert');

var csrf = require('../libs/csrf.js');

describe('csrf', function () {
    it('1', function () {
        var token1 = csrf.create();
        var token2 = csrf.create();

        var b1 = csrf.validate(token1);
        var b2 = csrf.validate(token2);
        var b3 = csrf.validate(token1 + token2);

        assert.equal(b1, true);
        assert.equal(b2, true);
        assert.equal(b3, false);
    });
});

