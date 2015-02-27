'use strict';

var chai = require('chai')
  , expressFactory = require('../lib/express-factory')
  , logger = require('hw-logger')
  , Promise = require('bluebird')
  , request = require('request')
  , util = require('util')
  , requestAsync = Promise.promisify(request)
  , should = chai.should()
  , log = logger.log;

describe('express factory', function () {

  describe('express instance creation', function () {

    it('should create a default instance', function () {
      var expressInstance = expressFactory();
      expressInstance.should.be.an.instanceOf(expressFactory.Express);
      expressInstance.should.respondTo('init');
      expressInstance.should.respondTo('start');
      expressInstance.should.respondTo('stop');
      expressInstance.init();
      expressInstance.should.have.property('config').that.is.an('object');
      expressInstance.config.should.have.property('port', 3000);
      expressInstance.config.should.have.property('host', 'localhost');
    });

    it('should create a custom instance', function () {
      var expressInstance = expressFactory({port: 3001});
      expressInstance.should.be.an('object');
      expressInstance.should.have.property('config').that.is.an('object');
      expressInstance.config.should.have.property('port', 3001);
      expressInstance.config.should.have.property('host', 'localhost');
    });

  });

  describe('express instance lifecycle', function () {

    var expressInstance
      , port = 3001;

    before(function () {
      expressInstance = expressFactory({port: port});
    });

    it('should start', function () {
      return expressInstance.start();
    });

    it('should get welcome response', function () {
      return requestAsync(
        {
          method: 'GET',
          url: util.format('http://localhost:%s', port)
        })
        .spread(function (res, body) { // Use of spread to have 2 arguments instead of an array
          should.exist(res);
          res.should.have.property('statusCode', 200);
          res.headers.should.have.property('content-type', 'text/plain; charset=utf-8');
          should.exist(body);
          body.should.equal('It works!');
        });
    });

    it('should get not found response', function () {
      return requestAsync(
        {
          method: 'GET',
          url: util.format('http://localhost:%s/%s', port, 'notfound')
        })
        .spread(function (res, body) {
          should.exist(res);
          res.should.have.property('statusCode', 404);
          res.headers.should.have.property('content-type', 'text/plain; charset=utf-8');
          should.exist(body);
          body.should.equal('resource not found');
        });
    });

    it('should stop', function () {
      return expressInstance.stop();
    });

    it('should not respond after stopping server', function () {
      return requestAsync(
        {
          method: 'GET',
          url: util.format('http://localhost:%s', port)
        })
        .catch(function (err) {
          should.exist(err);
          err.should.have.property('code').that.equals('ECONNREFUSED');
        });
    });

  });

  describe('use express instance', function () {

    var expressInstance
      , port = 3001;

    before(function () {
      expressInstance = expressFactory({
        port: port,
        routers: {
          routes: [{
            path: '/hello',
            middleware: function (req, res) {
              res.type('text').end('Hello World!');
            }
          }, {
            path: '/ping',
            middleware: function (req, res) {
              res.type('text').end('pong');
            }
          }, {
            path: '/error',
            middleware: function (/*req, res*/) {
              throw new Error('test');
            }
          }]
        }
      });
      return expressInstance.start();
    });

    after(function () {
      return expressInstance.stop();
    });

    it('should get hello response', function () {
      return requestAsync(
        {
          method: 'GET',
          url: util.format('http://localhost:%s/%s', port, 'hello')
        })
        .spread(function (res, body) { // Use of spread to have 2 arguments instead of an array
          should.exist(res);
          res.should.have.property('statusCode', 200);
          res.headers.should.have.property('content-type', 'text/plain; charset=utf-8');
          should.exist(body);
          body.should.equal('Hello World!');
        });
    });

    it('should get ping response', function () {
      return requestAsync(
        {
          method: 'GET',
          url: util.format('http://localhost:%s/%s', port, 'ping')
        })
        .spread(function (res, body) {
          should.exist(res);
          res.should.have.property('statusCode', 200);
          res.headers.should.have.property('content-type', 'text/plain; charset=utf-8');
          should.exist(body);
          body.should.equal('pong');
        });
    });

    it('should get an error', function () {
      return requestAsync(
        {
          method: 'GET',
          url: util.format('http://localhost:%s/%s', port, 'error')
        })
        .spread(function (res, body) {
          should.exist(res);
          res.should.have.property('statusCode', 500);
          res.headers.should.have.property('content-type', 'text/plain; charset=utf-8');
          should.exist(body);
          body.should.equal('Error: test');
        });
    });

  });

  describe('use express instance with a unix socket', function () {

    var path = require('path')
      , mkdirp = Promise.promisify(require('mkdirp'))
      , expressInstance
      , tmpDir = path.join(__dirname, '..', '..', 'tmp')
      , socketPath = path.join(tmpDir, 'test.sock');

    before(function () {
      expressInstance = expressFactory({handle: socketPath});
      return mkdirp(tmpDir)
        .then(function () {
          return expressInstance.start();
        });
    });

    after(function () {
      return expressInstance.stop();
    });

    it('should get welcome response', function () {
      return requestAsync(
        {
          method: 'GET',
          url: util.format('http://unix:%s:/', socketPath)
        })
        .spread(function (res, body) { // Use of spread to have 2 arguments instead of an array
          should.exist(res);
          res.should.have.property('statusCode', 200);
          res.headers.should.have.property('content-type', 'text/plain; charset=utf-8');
          should.exist(body);
          body.should.equal('It works!');
        });
    });

  });

  describe('use express instance with a https server', function () {

    var fs = require('fs')
      , path = require('path')
      , expressInstance
      , assetsDir = path.join(__dirname, 'assets')
      , port = 3443;

    before(function () {
      expressInstance = expressFactory({
        port: port,
        ssl: {
          key: fs.readFileSync(path.join(assetsDir, 'key.pem')),
          cert: fs.readFileSync(path.join(assetsDir, 'cert.pem'))
        }
      });
      return expressInstance.start();
    });

    after(function () {
      return expressInstance.stop();
    });

    it('should get welcome response', function () {
      return requestAsync(
        {
          method: 'GET',
          url: util.format('https://localhost:%s', port),
          strictSSL: false
        })
        .spread(function (res, body) { // Use of spread to have 2 arguments instead of an array
          should.exist(res);
          res.should.have.property('statusCode', 200);
          res.headers.should.have.property('content-type', 'text/plain; charset=utf-8');
          should.exist(body);
          body.should.equal('It works!');
        });
    });

  });

  describe('use express instance with a timeout', function () {

    var expressInstance
      , port = 3001;

    setTimeout(5000);

    before(function () {
      expressInstance = expressFactory({port: port});
      expressInstance.server.timeout = 1000;
      return expressInstance.start();
    });

    after(function () {
      return expressInstance.stop();
    });

    it('should get welcome response and get a timeout error on a slower request', function (done) {
      var http = require('http')
        , req, doReq;
      doReq = function (wait, done) {
        req = http.request({
          hostname: 'localhost',
          port: port
        }, function (res) {
          res.should.have.property('statusCode', 200);
          res.on('data', function (data) {
            var body;
            should.exist(data);
            body = data.toString();
            body.should.equal('It works!');
          });
          done();
        });
        req.on('error', done);
        setTimeout(function () {
          req.end();
        }, wait);
      };
      doReq(500, function (err) { // First request is fast enough
        should.not.exist(err);
        doReq(1100, function (err) { // 2nd request is too slow, so the server should return a timeout error
          should.exist(err);
          err.should.have.property('code', 'ECONNRESET');
          done();
        });
      });
    });

  });

  describe('use two express instances', function () {

    var expressInstances = []
      , ports = [3001, 3002];

    before(function () {
      expressInstances = [
        expressFactory({
          port: ports[0],
          routers: {
            routes: [{
              path: '/hello',
              middleware: function (req, res) {
                res.type('text').end('Hello World!');
              }
            }]
          }
        }),
        expressFactory({
          port: ports[1],
          routers: {
            routes: [{
              path: '/ping',
              middleware: function (req, res) {
                res.type('text').end('pong');
              }
            }]
          }
        })
      ];
      return Promise.all(expressInstances.map(function (instance) {
        return instance.start();
      }));
    });

    after(function () {
      return Promise.all(expressInstances.map(function (instance) {
        return instance.stop();
      }));
    });

    it('should get hello response', function () {
      return requestAsync(
        {
          method: 'GET',
          url: util.format('http://localhost:%s/%s', ports[0], 'hello')
        })
        .spread(function (res, body) { // Use of spread to have 2 arguments instead of an array
          should.exist(res);
          res.should.have.property('statusCode', 200);
          res.headers.should.have.property('content-type', 'text/plain; charset=utf-8');
          should.exist(body);
          body.should.equal('Hello World!');
        });
    });

    it('should get ping response', function () {
      return requestAsync(
        {
          method: 'GET',
          url: util.format('http://localhost:%s/%s', ports[1], 'ping')
        })
        .spread(function (res, body) {
          should.exist(res);
          res.should.have.property('statusCode', 200);
          res.headers.should.have.property('content-type', 'text/plain; charset=utf-8');
          should.exist(body);
          body.should.equal('pong');
        });
    });

  });

  describe('use express instance and body parser middleware', function () {

    var expressInstance
      , port = 3001;

    before(function () {
      var bodyParser = require('body-parser')
        , contact;
      expressInstance = expressFactory({
        port: port,
        //use: bodyParser.json(),
        routers: {
          routes: [{
            method: 'GET',
            path: '/contact',
            middleware: function (req, res) {
              res.json(contact);
            }
          }, {
            method: 'POST',
            path: '/contact',
            middleware: [
              bodyParser.json(),
              function (req, res) {
                contact = req.body;
                res.status(201).end();
              }]
          }]
        }
      });
      return expressInstance.start();
    });

    after(function () {
      return expressInstance.stop();
    });

    it('should get contact resource', function () {
      var contact = {firstName: 'John', lastName: 'Doe', email: 'john@doe.com'};
      return requestAsync(
        {
          method: 'POST',
          url: util.format('http://localhost:%s/%s', port, 'contact'),
          json: true,
          body: contact
        })
        .spread(function (res/*, body*/) {
          should.exist(res);
          res.should.have.property('statusCode', 201);
        })
        .then(function () {
          return requestAsync({
            method: 'GET',
            url: util.format('http://localhost:%s/%s', port, 'contact'),
            json: true
          });
        })
        .spread(function (res, body) {
          should.exist(res);
          res.should.have.property('statusCode', 200);
          res.headers.should.have.property('content-type', 'application/json; charset=utf-8');
          should.exist(body);
          body.should.eql(contact);
        });
    });

  });

});