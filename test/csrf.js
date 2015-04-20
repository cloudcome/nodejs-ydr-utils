'use strict';

var csrf = require('../libs/csrf.js');


var csrfty = csrf.create();

console.log(csrfty);

var b1 = csrf.validate(csrfty, csrfty.token);
var b2 = csrf.validate(csrfty, csrfty.token + '0');

console.log(b1);
console.log(b2);