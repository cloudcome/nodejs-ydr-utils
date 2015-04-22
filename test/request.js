'use strict';

var req = require('../libs/request.js');

req.get({
    url: 'http://hidoos.me/',
    timeout: 3000
}, function (err, body, res) {
    console.log(err);
});
