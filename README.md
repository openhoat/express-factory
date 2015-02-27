[![NPM version](https://badge.fury.io/js/express-factory.svg)](http://badge.fury.io/js/express-factory)
[![Build Status](https://travis-ci.org/openhoat/express-factory.png?branch=master)](https://travis-ci.org/openhoat/express-factory)
[![Coverage Status](https://coveralls.io/repos/openhoat/express-factory/badge.svg)](https://coveralls.io/r/openhoat/express-factory)

## Express factory

Easy setup an Express instance

## Getting started

### Simple express server : [sample1.js](https://github.com/openhoat/express-factory/blob/master/samples/sample1.js)

```javascript
var expressFactory = require('express-factory')
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
```

Result :

```bash
$ node samples/sample1
INFO  - express-factory:125 - 214ms - server is listening on localhost:3000
HTTP  - logger:64 - 21ms - 127.0.0.1 - GET / - 200 - ?
body : It works!
INFO  - express-factory:139 - 5ms - server is closed
```

### Custom server : [sample2.js](https://github.com/openhoat/express-factory/blob/master/samples/sample2.js)

```javascript
var expressFactory = require('express-factory')
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
```

Result :

```bash
$ node samples/sample2
INFO  - express-factory:125 - 180ms - server is listening on localhost:3001
HTTP  - logger:64 - 20ms - 127.0.0.1 - GET /hello - 200 - ?
body : Hello World!
INFO  - express-factory:139 - 5ms - server is closed
```

Enjoy !