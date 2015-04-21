var Favicon = require('../libs/favicon.js');
var path = require('path');
var configs = {
    defaultFaviconFilePath: path.join(__dirname, '../f/default.png'),
    configsFilePath: path.join(__dirname, '../f/default.json'),
    saveDirection: path.join(__dirname, '../f/')
};
Favicon.config(configs);
Favicon.buildDefaultConfigs();

var favicon = new Favicon('http://www.species-in-pieces.com');

//var r = favicon._joinURL('http://www.species-in-pieces.com', 'favicon.ico');
//console.log(r);

favicon.get(function () {
    console.log('file:', this.faviconFile);
}).on('error', function (err) {
    console.log('err:', err);
});
