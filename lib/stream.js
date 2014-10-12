var Readable = require('stream').Readable;
var util = require('util');

// implementation of a simple stream
util.inherits(SimpleStream, Readable);

function SimpleStream (opt) {
  Readable.call(this, opt);
  this._store = opt.store;
  this._keys = opt.keys;
  this._current = 0;
}

SimpleStream.prototype._read = function ( ) {
  if (this._current === this._keys.length) {
    this.push(null);
  } else {
    var key = this._keys[this._current];
    this._current++;

    var self = this;

    var cb = function (currentKey) {
      return function (err, value) {
        self.push({ key: currentKey, value: value });
      };
    };
    this._store.get(key, cb(key));
  }
};

module.exports = exports = SimpleStream;
