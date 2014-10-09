var levelup = require('levelup');
var db = require('db-engine');

var context = require('./context');
var config = context.config;

var Transform = require('stream').Transform;
var streamer = require('./stream');

var connections = {};
var engines = {};

function getStore(store, callback) {
  if (connections[store] === undefined) {
    connections[store] = new levelup(config.dataDir + '/' + store);

    callback(null, connections[store]);
  } else {
    callback(null, connections[store]);
  }
}

function getEngine(store, callback) {
  if (engines[store] === undefined) {
    getStore(store, function engineCallback(err, connection) {
      var engine = new db(connection, function instanceCallback(err, eng) {
        engines[store] = engine;
        callback(null, engine);
      });
    });
  } else {
    callback(null, engines[store]);
  }
}

function get(store, key, callback) {
  getStore(store, function getCallback(err, db) {
    db.get(key, callback);
  });
}

function del(store, key, callback) {
  getStore(store, function delCallback(err, db) {
    db.del(key, callback);
  });
}

function put(store, key, value, callback) {
  getStore(store, function putCallback(err, db) {
    db.put(key, value, callback);
  });
}

function keys(store, callback) {
  getStore(store, function keysCallback(err, db) {
    var stream = db.createKeyStream();

    var results = [];

    stream.on('data', function dataCallback(data) {
      results.push(data);
    });

    stream.on('end', function endCallback() {
      callback(null, {
        keys: results
      });
    });
  });
}

function close(store, callback) {
  if (connections[store] === undefined) {
    callback();
  } else {
    var db = connections[store];
    delete connections[store];
    delete engines[store];
    db.close(callback);
  }
}

function find_in_obj(data, key) {
  var parts = key.split('.');

  var part = parts.shift();
  while (part && (data = data[part]) !== undefined) {
    part = parts.shift();
  }

  return data;
}

function filter(store, key, value, callback) {
  getStore(store, function filterCallback(err, db) {
    var stream = db.createReadStream();
    var keys = [];

    txf = new Transform({
      objectMode: true
    });
    txf._transform = function _transform(chunk, _, cb) {
      var data;
      try {
        data = JSON.parse(chunk.value);
      } catch (err) {
        return;
      }

      var t = find_in_obj(data, key);
      if (Array.isArray(t) && t.indexOf(value) !== -1) {
        txf.push(JSON.stringify(chunk) + "\n");
      } else if (t === value) {
        txf.push(JSON.stringify(chunk) + "\n");
      }

      cb();
    };

    callback(null, stream.pipe(txf));
  });
}

function all(store, callback) {
  getStore(store, function allCallback(err, db) {
    var stream = db.createReadStream();

    txf = new Transform({
      objectMode: true
    });
    txf._transform = function(chunk, _, cb) {
      txf.push(JSON.stringify(chunk) + "\n");
      cb();
    };

    callback(null, stream.pipe(txf));
  });
}

function query(store, search, callback) {
  getEngine(store, function engineCallback(err, engine) {
    var parsed = engine.parseQuery(search);

    engine.query(parsed, function queryCallback(err, keys) {
      var stream = new streamer({
        objectMode: true,
        keys: keys,
        store: connections[store]
      });

      callback(err, stream);
    });
  });
}

exports.get = get;
exports.del = del;
exports.put = put;
exports.keys = keys;
exports.all = all;
exports.close = close;
exports.filter = filter;
exports.config = config;
exports.query = query;