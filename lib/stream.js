var Readable = require('stream').Readable;
var util = require('util');

// implementation of a simple stream
util.inherits(Stream, Readable);

function SimpleStream (opt) {
  Readable.call(this, opt);
  this._store = opt.store;
  this._keys = opt.keys;
  this._current = 0;
}

Stream.prototype._read = function() {
  if (this._current === this._keys.length) {
    this.push(null);
  } else {
    var key = this._keys[this._current];
    this._current++;

    var self = this;

    var value = this._store.get(key, function getCallback (err, value) {
      self.push({ key: key, value: value });
    });
  }
};

exports.module = exports = Stream;
