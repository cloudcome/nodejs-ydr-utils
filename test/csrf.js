'use strict';

var csrf = require('../libs/csrf.js');


var csrfty1 = csrf.create();
var csrfty2 = csrf.create();

console.log(csrfty1);
console.log(csrfty2);

var b1 = csrf.validate(csrfty1, csrfty1.token);
var b2 = csrf.validate(csrfty2, csrfty2.token);
var b3 = csrf.validate(csrfty1, csrfty1.token + '0');

console.log(b1);
console.log(b2);
console.log(b3);