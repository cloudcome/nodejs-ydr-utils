'use strict';


var assert = require('assert');

var encryption = require('../').encryption;


describe('encryption', function () {
    it('md5', function () {

        assert.equal(encryption.md5('1'), 'c4ca4238a0b923820dcc509a6f75849b');
    });

    it('sha1', function () {
        console.log(encryption.sha1('123', 'abc'));
    });

    it('en/decode', function () {
        var r = encryption.encode('123', 'abc');

        console.log(r);
        assert.equal(encryption.decode(r, 'abc'), '123');
    });

    it('password', function () {
        var p1 = encryption.password('123');
        var p2 = encryption.password('123');

        console.log(p1);
        console.log(p2);
        assert.equal(p1 !== p2, true);
        assert.equal(encryption.password('123', p1), true);
        assert.equal(encryption.password('1234', p2), false);
    });
});



