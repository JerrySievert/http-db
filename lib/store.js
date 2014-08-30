var levelup = require('levelup');
var db = require('db-engine');

var config = require('../config.json');

var Transform = require('stream').Transform;

var connections = { };
var engines = { };

function getStore (store, callback) {
  if (connections[store] === undefined) {
    connections[store] = new levelup(config.dataDir + '/' + store);
    var engine = new db(connections[store], function ( ) {
      engines[store] = engine;
      callback(null, connections[store]);
    });
  } else {
    callback(null, connections[store]);
  }
}

function get (store, key, callback) {
  getStore(store, function (err, db) {
    db.get(key, callback);
  });
}

function del (store, key, callback) {
  getStore(store, function (err, db) {
    db.del(key, callback);
  });
}

function put (store, key, value, callback) {
  getStore(store, function (err, db) {
    db.put(key, value, callback);
  });
}

function keys (store, callback) {
  getStore(store, function (err, db) {
    var stream = db.createKeyStream();

    var results = [ ];

    stream.on('data', function (data) {
      results.push(data);
    });

    stream.on('end', function () {
      callback(null, { keys: results });
    });
  });
}

function close (store, callback) {
  if (connections[store] === undefined) {
    callback();
  } else {
    var db = connections[store];
    delete connections[store];
    delete engines[store];
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
  getStore(store, function (err, db) {
    var stream = db.createReadStream();
    var keys = [ ];

    txf = new Transform({ objectMode: true });
    txf._transform = function(chunk, _, cb) {
      var data;
      try {
        data = JSON.parse(chunk.value);
      } catch (err) {
        return;
      }

      var t = find_in_obj(data, key);

      if (Array.isArray(t) && t.indexOf(value) !== -1) {
        txf.push(JSON.stringify(chunk) + "\n");
        cb();
      } else if (t === value) {
        txf.push(JSON.stringify(chunk) + "\n");
        cb();
      }
    };

    callback(null, stream.pipe(txf));
  });
}

function all (store, callback) {
  if (connections[store] === undefined) {
    connections[store] = new levelup(config.dataDir + '/' + store);
  }

  var db = connections[store];
  var stream = db.createReadStream();

  txf = new Transform({ objectMode: true });
  txf._transform = function(chunk, _, cb) {
    txf.push(JSON.stringify(chunk) + "\n");
    cb();
  };

  callback(null, stream.pipe(txf));
}


exports.get    = get;
exports.del    = del;
exports.put    = put;
exports.keys   = keys;
exports.all    = all;
exports.close  = close;
exports.filter = filter;
exports.config = config;
