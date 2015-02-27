[![NPM version](https://badge.fury.io/js/express-factory.svg)](http://badge.fury.io/js/express-factory)
[![Build Status](https://travis-ci.org/openhoat/express-factory.png?branch=master)](https://travis-ci.org/openhoat/express-factory)
[![Coverage Status](https://coveralls.io/repos/openhoat/express-factory/badge.svg)](https://coveralls.io/r/openhoat/express-factory)

## Express factory

Easy setup an Express instance

## Installation

```bash
$ npm install express-factory --save
```

## Prerequisite

Due to lack of dependency with express in this project, you have to install yourself express module in your project, this let you choose the version you want :

```bash
$ npm install express --save
```

## Getting started

Run an express server with one line :

```javascript
require('express-factory')().start();

require('open')('http://localhost:3000/');
```

Result :

![Screen shot](https://raw.githubusercontent.com/openhoat/express-factory/master/assets/screenshot.png)

## How it works

express-factory creates instances of express servers (Express class), with following features :

- init method : initialize express configuration and components like middlewares, routers, routes
    - arguments : optional config
    - result : return this for chaining
- custom configuration passed through constructor, init or start method
- start method : initialize if needed and start the server
    - arguments : optional config, and callback
    - result : callback is called or returns a promise
- stop method : stop the server
    - result : callback is called or returns a promise

## Use cases

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

### Unix socket : [sample3.js](https://github.com/openhoat/express-factory/blob/master/samples/sample3.js)

```javascript
var expressFactory = require('express-factory')
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
```

Result :

```bash
$ node samples/sample3
INFO  - express-factory:122 - 183ms - server is listening on socket /home/openhoat/dev/nodejs/express-factory/tmp/test.sock
HTTP  - logger:64 - 19ms - undefined - GET / - 200 - ?
body : It works!
INFO  - express-factory:140 - 5ms - server is closed
```

### HTTPS : [sample4.js](https://github.com/openhoat/express-factory/blob/master/samples/sample4.js)

```javascript
var expressFactory = require('express-factory')
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
```

Result :

```bash
$ node samples/sample3
INFO  - express-factory:122 - 183ms - server is listening on socket /home/openhoat/dev/nodejs/express-factory/tmp/test.sock
HTTP  - logger:64 - 19ms - undefined - GET / - 200 - ?
body : It works!
INFO  - express-factory:140 - 5ms - server is closed
```

### Promises : [sample5.js](https://github.com/openhoat/express-factory/blob/master/samples/sample5.js)

```javascript
var expressFactory = require('express-factory')
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
```

Result :

```bash
$ node samples/sample5
INFO  - express-factory:126 - 188ms - server is listening on localhost:3000
HTTP  - logger:64 - 20ms - 127.0.0.1 - GET / - 200 - ?
body : It works!
INFO  - express-factory:140 - 6ms - server is closed
```

### EJS : [sample6.js](https://github.com/openhoat/express-factory/blob/master/samples/sample6.js)

```javascript
var expressFactory = require('express-factory')
  , path = require('path')
  , ejs = require('ejs')
  , expressInstance;

expressInstance = expressFactory({
  set: { // express app set
    'view engine': 'html',
    'views': path.join(__dirname, '..', 'templates')
  },
  engine: { // express app engine
    'html': ejs.renderFile
  },
  routers: {
    routes: {
      path: '/',
      middleware: function (req, res) {
        res.render('home', {content: 'Hello!'});
      }
    }
  }
});
expressInstance.start();
```

Result :

![Screen shot hello](https://raw.githubusercontent.com/openhoat/express-factory/master/assets/screenshot-hello.png)

Enjoy !