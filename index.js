var Hapi = require('hapi');
var store = require('./lib/store');

// Create a server with a host and port
var server = new Hapi.Server('localhost', 8000, { payload: { maxBytes: 1048576 * 5 } });

server.route({
  method: 'GET',
  path: '/data/{store}',
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
  path: '/data/{store}/{id}',
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
  method: 'POST',
  path: '/data/{store}/{id}',
  handler: function (request, reply) {
    var data;

    try {
      data = JSON.stringify(reply.payload);
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
  method: 'DELETE',
  path: '/data/{store}/{id}',
  handler: function (request, reply) {
    store.del(encodeURIComponent(request.params.store), encodeURIComponent(request.params.id), function (err) {
      reply('{ "status": "ok" }').type('application/json');
    });
  }
});

// Start the server
server.start(function () {
  console.log('Server running at:', server.info.uri);
});
