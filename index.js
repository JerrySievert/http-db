var Hapi = require('hapi');
var store = require('./lib/store');
var token = require('./lib/token');
var user = require('./lib/user');

var config = require('./config.json');

// Create a server with a host and port
var server = new Hapi.Server(config.server.host, config.server.port, { payload: { maxBytes: 1048576 * 5 } });

server.pack.register(require('hapi-auth-jwt-request'), function (err) {
  server.auth.strategy('store', 'bearer-access-token', {
    validateFunc: function (decoded, request, callback) {
      token.validateToken(decoded, function (err) {
        if (err) {
          callback(null, false);
        } else {
          var store = encodeURIComponent(request.params.store);

          user.authStoreByUsername (store, decoded.username, function (err) {
            if (err) {
              callback(null, false);
            } else {
              callback(null, true, decoded);
            }
          });
        }
      });
    },
    secret: config.token.secret
  });

  server.route({
    method: 'GET',
    path: '/data/{store}/{id}',
    config: { auth: 'store' },
    handler: function (request, reply) {
      store.get(encodeURIComponent(request.params.store), encodeURIComponent(request.params.id), function (err, data) {
        if (err && err.notFound) {
          reply('').code(204);
        } else {
          reply(data).type('application/json');
        }
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/data/{store}',
    config: { auth: 'store' },
    handler: function (request, reply) {
      store.keys(encodeURIComponent(request.params.store), function (err, data) {
        if (err) {
          reply('').code(204);
        } else {
          reply(JSON.stringify(data)).type('application/json');
        }
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/filter/{store}',
    config: { auth: 'store' },
    handler: function (request, reply) {
      store.filter(encodeURIComponent(request.params.store), encodeURIComponent(request.query.key), encodeURIComponent(request.query.value), function (err, stream) {
        if (err) {
          reply('').code(204);
        } else {
          reply(stream).type('application/jsonstream');
        }
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/data/{store}/{id}',
    config: { auth: 'store' },
    handler: function (request, reply) {
      var data;

      try {
        data = JSON.stringify(request.payload);
      } catch (err) {
        reply('{ "status": "error", "error": "payload should be JSON" }').code(400).type('application/json');
        return;
      }

      store.put(encodeURIComponent(request.params.store), encodeURIComponent(request.params.id), data, function (err) {
        reply('{ "status": "ok" }').code(201).type('application/json');
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/query/{store}',
    config: { auth: 'store' },
    handler: function (request, reply) {
      store.query(encodeURIComponent(request.params.store), request.payload, function (err, data) {
        reply(data).code(201).type('application/json');
      });
    }
  });

  server.route({
    method: 'DELETE',
    path: '/data/{store}/{id}',
    config: { auth: 'store' },
    handler: function (request, reply) {
      store.del(encodeURIComponent(request.params.store), encodeURIComponent(request.params.id), function (err) {
        reply('{ "status": "ok" }').type('application/json');
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/all/{store}',
    config: { auth: 'store' },
    handler: function (request, reply) {
      store.all(encodeURIComponent(request.params.store), function (err, stream) {
        if (err) {
          reply('').code(204);
        } else {
          reply(stream).type('application/jsonstream');
        }
      });
    }
  });
});

server.pack.register(require('hapi-auth-cookie'), function (err) {
  server.auth.strategy('session', 'cookie', {
    password: 'secret',
    cookie: 'sid-example',
    redirectTo: '/login.html',
    isSecure: false
  });

  server.route({
    method: 'POST',
    path: '/api/v1/login',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      }
    },
    handler: require('./api/login')
  });

  server.route({
    method: 'GET',
    path: '/login.html',
    handler: function (request, reply) {
      reply.file('./public/login.html');
    }
  });

  // default file route
  server.route({
    method: 'GET',
    path: '/{param*}',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: '/login.html'
        }
      }
    },
    handler: {
      directory: {
        path: 'public'
      }
    }
  });

});

// Start the server
server.start(function () {
  console.log('Server running at:', server.info.uri);
});
