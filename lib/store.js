var levelup = require('levelup');
var config = require('../config.json');

var connections = { };

function get (store, key, callback) {
  if (connections[store] === undefined) {
    connections[store] = new levelup(config.dataDir + '/' + store);
  }

  var db = connections[store];
  db.get(key, callback);
}

function del (store, key, callback) {
  if (connections[store] === undefined) {
    connections[store] = new levelup(config.dataDir + '/' + store);
  }

  var db = connections[store];
  db.del(key, callback);
}

function put (store, key, value, callback) {
  if (connections[store] === undefined) {
    connections[store] = new levelup(config.dataDir + '/' + store);
  }

  var db = connections[store];
  db.put(key, value, callback);
}

function keys (store, callback) {
  if (connections[store] === undefined) {
    connections[store] = new levelup(config.dataDir + '/' + store);
  }

  var db = connections[store];

  var stream = db.createKeyStream();

  var results = [ ];

  stream.on('data', function (data) {
    results.push(data);
  });

  stream.on('end', function () {
    callback(null, { keys: results });
  });
}

function close (store, callback) {
  if (connections[store] === undefined) {
    callback();
  } else {
    var db = connections[store];
    delete connections[store];
    db.close(callback);
  }
}

exports.get = get;
exports.del = del;
exports.put = put;
exports.keys = keys;
exports.close = close;
exports.config = config;
