
var Favicon = require('../libs/favicon.js');
var path = require('path');
var configs = {
    defaultFavicon: path.join(__dirname, '../data/default.png'),
    defaultConfig: path.join(__dirname, '../data/default.json'),
    saveDirection: path.join(__dirname, '../data/')
};
var favicon = new Favicon('http://www.aliued.cn/', configs);

favicon.get(function (err, url) {
    console.log('url: ' + url);
}).on('error', function (err) {
    console.log('err: ' + err);
});
