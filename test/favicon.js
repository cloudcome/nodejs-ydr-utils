'use strict';

var assert = require('assert');
var path = require('path');

var Favicon = require('../libs/favicon.js');


var delay = function(done){
    setTimeout(done, 1000);
};

describe('favicon', function () {
    it(1, function (done) {
        var configs = {
            defaultFaviconFilePath: path.join(__dirname, '../f/default.png'),
            configsFilePath: path.join(__dirname, '../f/default.json'),
            saveDirection: path.join(__dirname, '../f/')
        };
        Favicon.config(configs);
        Favicon.buildDefaultConfigs();

        var u = Favicon.joinURL('baidu.com', 'baidu.com');
        assert.equal(u, 'http://baidu.com');

        var url = 'malaclc.tmall.com';
        var favicon = new Favicon(url);

        favicon.get(function () {
            console.log('file:', this.faviconFile);
            console.log('url:', this.faviconURL);
            delay(done);
        }).on('error', function (err) {
            console.log(err.stack);
            delay(done);
        });
    });
});


