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

function find_in_obj (data, key) {
  var parts = key.split('.');

  var part = parts.shift();
  while (part && (data = data[part]) !== undefined) {
    part = parts.shift();
  }

  return data;
}

function filter (store, key, value, callback) {
  if (connections[store] === undefined) {
    connections[store] = new levelup(config.dataDir + '/' + store);
  }

  var db = connections[store];

  var stream = db.createReadStream();
  var keys = [ ];

  stream.on('data', function (data) {
    try {
      data.value = JSON.parse(data.value);
    } catch (err) {
      return;
    }


    var t = find_in_obj(data.value, key);

    if (Array.isArray(t) && t.indexOf(value) !== -1) {
      keys.push(data.key);
    } else if (t === value) {
      keys.push(data.key);
    }
  });

  stream.on('end', function () {
    callback(null, { keys: keys });
  });
}

function all (store, callback) {
  if (connections[store] === undefined) {
    connections[store] = new levelup(config.dataDir + '/' + store);
  }

  var db = connections[store];

  var stream = db.createReadStream();

  callback(null, stream);
}

exports.get = get;
exports.del = del;
exports.put = put;
exports.keys = keys;
exports.close = close;
exports.filter = filter;
exports.config = config;
