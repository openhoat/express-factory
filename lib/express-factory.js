'use strict';

var util = require('util')
  , _ = require('lodash')
  , Promise = require('bluebird')
  , instanceFactory = require('instance-factory')
  , logger = require('hw-logger')
  , log = logger.log
  , Express, express;

Express = instanceFactory.createClass('Express', {
  constructor: function (opt) {
    if (typeof opt !== 'undefined') {
      this.init(opt);
    }
  },
  config: {
    port: 3000,
    host: 'localhost',
    log: true,
    handlers: {
      notFound: function (req, res/*,next*/) {
        var formats = {
          text: function textPlain() {
            res.type('text').send('resource not found');
          },
          html: function () {
            res.send('<html><body><h3>resource not found</h3></body></html>');
          },
          json: function () {
            res.send({message: 'resource not found'});
          }
        };
        formats.default = formats.text;
        res.status(404).format(formats);
      },
      /*jshint -W098 */
      error: function (err, req, res, next) { // next is important (though useless) because express analyzes the function prototype to consider it as an error fallback handler
        /*jshint +W098 */
        var formats = {
          text: function textPlain() {
            res.send(err.toString());
          },
          html: function () {
            res.send(util.format('<html><body><h3>%s</h3></body></html>', err.toString()));
          },
          json: function () {
            res.send({error: err.toString()});
          }
        };
        formats.default = formats.text;
        log.error(err.stack);
        res.status(500).format(formats);
      }
    },
    routers: {
      routes: [{
        path: '/',
        middleware: function (req, res) {
          res.type('text').end('It works!');
        }
      }]
    }
  },
  methods: {
    applyToApp: function (method) {
      var that = this;
      if (typeof that.config[method] === 'object') {
        Object.keys(that.config[method]).forEach(function (key) {
          log.trace('applying express app.%s(%s)', method, key);
          that.app[method](key, that.config[method][key]);
        });
        return true;
      }
      return false;
    },
    init: function (opt) {
      var that = this;
      express = require('express');
      that.config = _.extend({}, Express.config, opt);
      log.trace('init with config :', that.config);
      that.app = express();
      that.applyToApp('set');
      that.applyToApp('engine');
      that.applyToApp('on');
      if (that.config.log) {
        that.app.use(logger.express());
      }
      if (typeof that.config.use !== 'undefined') {
        that.use = util.isArray(that.config.use) ? that.config.use : [that.config.use];
        that.use.forEach(function (use, index) {
          log.trace('registering middleware #%s', index + 1);
          that.app.use(use);
        });
      }
      if (typeof that.config.routers === 'object') {
        that.routers = util.isArray(that.config.routers) ? that.config.routers : [that.config.routers];
        that.routers.forEach(function (routerConf) {
          var router = express.Router(routerConf.opt)
            , routes = util.isArray(routerConf.routes) ? routerConf.routes : [routerConf.routes];
          routes.forEach(function (routeConf, index) {
            var method, routeArgs;
            method = routeConf.method ? routeConf.method.toLowerCase() : 'get';
            log.trace('registering route #%s : %s %s', index + 1, method, routeConf.path);
            routeArgs = [routeConf.path];
            routeArgs.push(routeConf.middleware);
            router[method].apply(router, routeArgs);
          });
          that.app.use(routerConf.path || '/', router);
        });
      }
      if (typeof that.config.handlers.notFound === 'function') {
        that.app.use(that.config.handlers.notFound);
      }
      if (typeof that.config.handlers.error === 'function') {
        that.app.use(that.config.handlers.error);
      }
      if (typeof that.config.ssl === 'object') {
        that.server = require('https').createServer(that.config.ssl, that.app);
      } else {
        that.server = require('http').createServer(that.app);
      }
      that.initialized = true;
      return that;
    },
    start: function (opt, cb) {
      var that = this;
      if (typeof cb === 'undefined' && typeof opt === 'function') {
        cb = opt;
        opt = null;
      }
      if (!that.initialized) {
        that.init(opt);
      }
      return new Promise(
        function (resolve/*, reject*/) {
          var listenArgs = that.config.handle ? [that.config.handle] : [that.config.port, that.config.host];
          listenArgs.push(function () {
            if (typeof that.config.handle === 'string') {
              log.info('server is listening on socket %s', that.config.handle);
            } else if (that.config.handle) {
              log.info('server is listening on specified handler');
            } else {
              log.info('server is listening on %s:%s', that.config.host, that.config.port);
            }
            resolve();
          });
          that.server.listen.apply(that.server, listenArgs);
        })
        .nodeify(cb);
    },
    stop: function (cb) {
      var that = this;
      return new Promise(
        function (resolve/*,reject*/) {
          if (that.server) {
            that.server.close(function () {
              log.info('server is closed');
              resolve();
            });
          }
        })
        .nodeify(cb);
    }
  }
});

exports = module.exports = function (opt) {
  return new Express(opt);
};
exports.Express = Express;