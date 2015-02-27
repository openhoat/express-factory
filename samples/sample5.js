'use strict';

var expressFactory = require('../lib/express-factory')
  , Promise = require('bluebird')
  , get = Promise.promisify(require('request').get)
  , expressInstance;

expressInstance = expressFactory();

expressInstance
  .start()
  .then(function () {
    return get('http://localhost:3000');
  })
  .spread(function (res, body) {
    console.log('body :', body);
  })
  .then(function () {
    return expressInstance.stop();
  })
  .catch(function (err) {
    console.error(err.stack);
  });