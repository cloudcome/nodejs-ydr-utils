var Favicon = require('../libs/favicon.js');
var path = require('path');
var configs = {
    defaultFaviconFilePath: path.join(__dirname, '../f/default.png'),
    configsFilePath: path.join(__dirname, '../f/default.json'),
    saveDirection: path.join(__dirname, '../f/')
};
Favicon.config(configs);
Favicon.buildDefaultConfigs();

var favicon = new Favicon('https://cnodejs.org/');

var r = favicon._joinURL('https://cnodejs.org/', '//dn-cnodestatic.qbox.me/public/images/cnode_icon_32.png');
console.log(r);

//favicon.get(function () {
//    console.log('file:', this.faviconFile);
//}).on('error', function (err) {
//    console.log('err:', err);
//});
