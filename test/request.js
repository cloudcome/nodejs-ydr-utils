'use strict';

var req = require('../libs/request.js');

req.head({
    url: 'http://service.dangkr.com/rest/0.9/activity/detail',
    query: {
        activityId: 7477508,
        clubId: 1442506
    },
    headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, sdch',
        'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6',
        'Host': 'service.dangkr.com',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.101 Safari/537.36'
    }
}, function (err, headers, res) {
    console.log(headers);
});
