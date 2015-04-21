var Favicon = require('../libs/favicon.js');
var path = require('path');
var configs = {
    defaultFaviconFilePath: path.join(__dirname, '../f/default.png'),
    configsFilePath: path.join(__dirname, '../f/default.json'),
    saveDirection: path.join(__dirname, '../f/')
};
Favicon.config(configs);
Favicon.buildDefaultConfigs();

var favicon = new Favicon('https://code.facebook.com/projects/');

favicon.get(function () {
    console.log('file:', this.faviconFile);
}).on('error', function (err) {
    console.log('err:', err);
});
