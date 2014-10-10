var Hapi = require('hapi');
var store = require('./store');
var token = require('./token');
var user = require('./user');


var pack = require('../package.json');

function startServer(config) {
  // Create a server with a host and port
  var server = new Hapi.Server(config.server.host, config.server.port, {
    payload: {
      maxBytes: 1048576 * 5
    }
  });

  server.pack.register(require('hapi-auth-jwt-request'), function(err) {
    server.auth.strategy('token', 'bearer-access-token', {
      validateFunc: function(decoded, request, callback) {
        token.validateToken(decoded, function(err) {
          if (err) {
            callback(null, false);
          } else {
            callback(null, true, decoded);
          }
        });
      },
      secret: config.token.secret
    });

    server.route({
      method: 'GET',
      path: '/database',
      config: {
        auth: "token"
      },
      handler: function(request, reply) {
        var data = {
          status: "ok",
          name: pack.name,
          version: pack.version,
          port: config.server.port,
          host: config.server.host,
          hostname: config.server.hostname,
          server: {
            name: pack.database.server.name,
            repo: pack.database.server.repo,
            version: pack.dependencies[pack.database.server.name]
          },
          engine: {
            name: pack.database.engine.name,
            repo: pack.database.engine.repo,
            version: pack.dependencies[pack.database.engine.name]
          }
        };

        reply(data).type('application/json');
      }
    });

    server.route({
      method: 'GET',
      path: '/database/stores',
      config: {
        auth: "token"
      },
      handler: function(request, reply) {
        user.retrieve(request.auth.credentials.username, function(
          err, user) {
          if (err) {
            reply({
              "status": "error",
              "error": err
            });
          } else {
            var data = {
              status: "ok",
              stores: user.stores
            };

            reply(data).type('application/json');
          }
        });
      }
    });

    server.auth.strategy('store', 'bearer-access-token', {
      validateFunc: function(decoded, request, callback) {
        token.validateToken(decoded, function(err) {
          if (err) {
            callback(null, false);
          } else {
            var store = encodeURIComponent(request.params.store);

            user.authStoreByUsername(store, decoded.username,
              function(
                err) {
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
      path: '/database/value/{store}/{id}',
      config: {
        auth: 'store'
      },
      handler: function(request, reply) {
        store.get(encodeURIComponent(request.params.store),
          encodeURIComponent(request.params.id),
          function(err, data) {
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
      path: '/database/keys/{store}',
      config: {
        auth: 'store'
      },
      handler: function(request, reply) {
        store.keys(encodeURIComponent(request.params.store),
          function(err,
            data) {
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
      path: '/database/filter/{store}',
      config: {
        auth: 'store'
      },
      handler: function(request, reply) {
        store.filter(encodeURIComponent(request.params.store),
          encodeURIComponent(request.query.key),
          encodeURIComponent(request
            .query
            .value),
          function(err, stream) {
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
      path: '/database/value/{store}/{id}',
      config: {
        auth: 'store'
      },
      handler: function(request, reply) {
        var data;

        try {
          data = JSON.stringify(request.payload);
        } catch (err) {
          reply(
              '{ "status": "error", "error": "payload should be JSON" }'
            )
            .code(
              400).type('application/json');
          return;
        }

        store.put(encodeURIComponent(request.params.store),
          encodeURIComponent(request.params.id), data,
          function(err) {
            reply('{ "status": "ok" }').code(201).type(
              'application/json');
          });
      }
    });

    server.route({
      method: 'POST',
      path: '/database/query/{store}',
      config: {
        auth: 'store'
      },
      handler: function(request, reply) {
        store.query(encodeURIComponent(request.params.store),
          request.payload,
          function(err, data) {
            reply(data).code(201).type('application/json');
          });
      }
    });

    server.route({
      method: 'DELETE',
      path: '/database/value/{store}/{id}',
      config: {
        auth: 'store'
      },
      handler: function(request, reply) {
        store.del(encodeURIComponent(request.params.store),
          encodeURIComponent(request.params.id),
          function(err) {
            reply('{ "status": "ok" }').type('application/json');
          });
      }
    });

    server.route({
      method: 'GET',
      path: '/database/all/{store}',
      config: {
        auth: 'store'
      },
      handler: function(request, reply) {
        store.all(encodeURIComponent(request.params.store),
          function(err,
            stream) {
            if (err) {
              reply('').code(204);
            } else {
              reply(stream).type('application/jsonstream');
            }
          });
      }
    });
  });

  if (config.public) {
    server.pack.register(require('hapi-auth-cookie'), function(err) {
      server.auth.strategy('session', 'cookie', {
        password: config.cookie.password,
        cookie: config.cookie.name,
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
        handler: require('../api/login')
      });

      server.route({
        method: 'GET',
        path: '/api/v1/token',
        handler: require('../api/token'),
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
        }
      });

      server.route({
        method: 'GET',
        path: '/login.html',
        handler: function(request, reply) {
          reply.file(__dirname + '/../public/login.html');
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
            path: __dirname + '/../public'
          }
        }
      });

    });
  }

  // Start the server
  server.start(function() {
    console.log('Server running at:', server.info.uri);

    if (config.user) {
      process.setuid(config.user);
    }
  });

  return server;
}

exports.startServer = startServer;
