'use strict';

var req = require('../libs/request.js');

req.get({
    url: 'http://qianduanblog.com/post/sublime-text-3-plugin-html-css-js-prettify.html'
}, function (err, body, res) {
    console.log(body);
});
