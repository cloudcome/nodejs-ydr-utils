'use strict';

var req = require('../libs/request.js');
var zlib = require('zlib');
var gunzipStream = zlib.createGunzip();

req.post({
    url: 'http://localhost:8080/services/banner/list.do',
    query: {},
    body: {
        bannerType: 1,
        state: 'U'
    },
    headers: {
        'content-type':'application/json; charset=UTF-8'
    }
}, function (err, body, res) {
    //console.log(err);
    console.log(body);
    //console.log(res.headers);
});
