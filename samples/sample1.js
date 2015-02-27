'use strict';

var expressFactory = require('../lib/express-factory')
  , request = require('request')
  , expressInstance;

expressInstance = expressFactory();
expressInstance.start(function () {
  request.get('http://localhost:3000', function (err, res, body) {
    if (err) {
      console.error(err.stack);
    } else {
      console.log('body :', body); // by default the server returns 'It works!'
    }
    expressInstance.stop();
  });
});
