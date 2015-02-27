[![NPM version](https://badge.fury.io/js/express-factory.svg)](http://badge.fury.io/js/express-factory)
[![Build Status](https://travis-ci.org/openhoat/express-factory.png?branch=master)](https://travis-ci.org/openhoat/express-factory)
[![Coverage Status](https://coveralls.io/repos/openhoat/express-factory/badge.svg)](https://coveralls.io/r/openhoat/express-factory)

## Express factory

Easy setup an Express instance

## Getting started

```javascript
var expressFactory = require('express-factory')
  , config, expressInstance;

  config = {
    port: 3009 // default port : 3000
  };
  expressInstance = expressFactory(config);
  expressInstance.start(function () {
    ...
    expressInstance.stop(function () {
      ... // done
    });
  });
```

@TODO complete

Enjoy !
