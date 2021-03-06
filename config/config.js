var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'hello-nodeblog'
    },
    port: process.env.PORT || 8080,
    db: 'mongodb://localhost/nodeblog'
  },

  test: {
    root: rootPath,
    app: {
      name: 'maiziblog'
    },
    port: process.env.PORT || 8080,
    db: 'mongodb://localhost/maiziblog-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'maiziblog'
    },
    port: process.env.PORT || 8080,
    db: 'mongodb://localhost/maiziblog-production'
  }
};

module.exports = config[env];
