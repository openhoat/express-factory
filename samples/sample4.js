'use strict';

var expressFactory = require('../lib/express-factory')
  , request = require('request')
  , path = require('path')
  , fs = require('fs')
  , assetsDir = path.join(__dirname, '..', 'spec', 'assets')
  , expressInstance;

expressInstance = expressFactory({
  port: 3443,
  ssl: {
    key: fs.readFileSync(path.join(assetsDir, 'key.pem')),
    cert: fs.readFileSync(path.join(assetsDir, 'cert.pem'))
  }
});

expressInstance.start(function () {
  request.get({
    url: 'https://localhost:3443/',
    strictSSL: false
  }, function (err, res, body) {
    if (err) {
      console.error(err.stack);
    } else {
      console.log('body :', body);
    }
    expressInstance.stop();
  });
});