'use strict';

var request = require('../libs/request.js');

request.post({
    url: 'http://data.zz.baidu.com/urls?site=frontenddev.org&token=ho6ad7MEYcQ01jBY',
    body: 'http://frontenddev.org/\n',
    headers: {
        'content-type': 'text/plain'
    }
}, function (err, body, res) {
    console.log(err);
    console.log(body);
});
