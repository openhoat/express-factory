'use strict';

var expressFactory = require('../lib/express-factory')
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