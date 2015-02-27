'use strict';

var expressFactory = require('../lib/express-factory')
  , request = require('request')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , util = require('util')
  , tmpDir = path.join(__dirname, '..', 'tmp')
  , socketPath = path.join(tmpDir, 'test.sock')
  , expressInstance;

expressInstance = expressFactory({handle: socketPath});

mkdirp.sync(tmpDir);

expressInstance.start(function () {
  request.get(util.format('http://unix:%s:/', socketPath), function (err, res, body) {
    if (err) {
      console.error(err.stack);
    } else {
      console.log('body :', body);
    }
    expressInstance.stop();
  });
});