'use strict';

var expressFactory = require('../lib/express-factory')
  , open = require('open');

expressFactory().start();
open('http://localhost:3000/');
