'use strict';

var expressFactory = require('../lib/express-factory')
  , request = require('request')
  , expressInstance;

expressInstance = expressFactory({
  port: 3001, // custom port (default : 3000)
  routers: { // can be an array
    routes: { // can be an array
      path: '/hello', // uri path of a route
      middleware: function (req, res) { // middleware of the route
        res.type('text').end('Hello World!');
      }
    }
  }
});

expressInstance.start(function () {
  request.get('http://localhost:3001/hello', function (err, res, body) {
    if (err) {
      console.error(err.stack);
    } else {
      console.log('body :', body);
    }
    expressInstance.stop();
  });
});
