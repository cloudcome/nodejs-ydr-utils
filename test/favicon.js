var Favicon = require('../libs/favicon.js');
var path = require('path');
var configs = {
    defaultFaviconFilePath: path.join(__dirname, '../f/default.png'),
    configsFilePath: path.join(__dirname, '../f/default.json'),
    saveDirection: path.join(__dirname, '../f/')
};
Favicon.config(configs);
Favicon.buildDefaultConfigs();

var favicon = new Favicon('http://evanyou.me');

//var u = Favicon.joinURL('http://gruntjs.com/getting-started','../img/favicon.ico');
//console.log(u);


favicon.get(function () {
    console.log('file:', this.faviconFile);
}).on('error', function (err) {
    console.log('err:', err);
});
