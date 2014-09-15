var test = require('tape');
var leveldown = require('leveldown');

var store = require('../lib/store');

store.config.dataDir = __dirname + "/store";

test('store errors on an empty value', function (t) {
  t.plan(1);

  store.get('test', 'item', function (err, data) {
    t.ok(err, 'error is returned for empty value');
  });
});

test('store correctly puts an item', function (t) {
  t.plan(1);

  store.put('test', 'item', 'value', function (err) {
    t.error(err, 'no error is returned for a put');
  });
});

test('store correctly gets an item', function (t) {
  t.plan(2);

  store.get('test', 'item', function (err, data) {
    t.error(err, 'no error is returned for a valid get');
    t.equal(data, 'value', 'the correct value is returned');
  });
});

test('store correctly returns keys', function (t) {
  t.plan(2);

  store.keys('test', function (err, data) {
    t.error(err, 'no error is returned for keys');
    t.deepEqual(data, { keys: [ 'item' ] }, 'keys are correct');
  });
});

test('store can delete an item', function (t) {
  t.plan(1);

  store.del('test', 'item', function (err) {
    t.error(err, 'no error is thrown');
  });
});

test('store can be closed', function (t) {
  t.plan(1);

  store.close('test', function (err) {
    t.error(err, 'no error is thrown for the close');
  });
});

test('store correctly puts an item when closed', function (t) {
  t.plan(1);

  store.put('test', 'item', 'value', function (err) {
    store.close('test', function () {
      t.error(err, 'no error is returned for a put');
    });
  });
});

test('store correctly returns keys when the store is closed', function (t) {
  t.plan(3);

  store.keys('test', function (err, data) {
    t.error(err, 'no error is returned for keys');
    t.deepEqual(data, { keys: [ 'item' ] }, 'keys are correct');

    store.close('test', function (err) {
      t.error(err, 'no error is returned for close');
    });
  });
});

test('store correctly deletes an item when closed', function (t) {
  t.plan(1);

  store.del('test', 'item', function (err) {
    store.close('test', function () {
      t.error(err, 'no error is returned for a delete');
    });
  });
});

test('store returns the correct results when filter is applied', function (t) {
  t.plan(3);

  store.put('test', '1', '{ "foo": "bar" }', function () {
    store.put('test', '2', '{ "foo": "baz" }', function () {
      store.filter('test', 'foo', 'bar', function (err, stream) {
        t.error(err, 'no error is returned');

        var count = 0;
        stream.on('data', function (data) {
          data = JSON.parse(data);
          count++;
          t.equal(data.key, '1', 'the correct key is returned');
          store.del('test', '1', function () {
            store.del('test', '2', function () {
              t.equal(count, 1, 'the correct number of results are returned');
            });
          });

        });
      });
    });
  });
});

test('store returns the correct results when filter is applied as an array', function (t) {
  t.plan(3);

  store.put('test', '1', '{ "foo": [1, 2] }', function () {
    store.put('test', '2', '{ "foo": "baz" }', function () {
      store.filter('test', 'foo', 1, function (err, stream) {
        t.error(err, 'no error is returned');

        var count = 0;
        stream.on('data', function (data) {
          data = JSON.parse(data);
          count++;
          t.equal(data.key, '1', 'the correct key is returned');
          store.del('test', '1', function () {
            store.del('test', '2', function () {
              t.equal(count, 1, 'the correct number of results are returned');
            });
          });

        });
      });
    });
  });
});

test('store returns the correct results all is called', function (t) {
  t.plan(2);

  store.put('test', '1', '{ "foo": "bar" }', function () {
    store.all('test', function (err, stream) {
      t.error(err, 'no error is returned');

      stream.on('data', function (data) {
        data = JSON.parse(data);
        t.equal(data.key, '1', 'the correct key is returned');
        store.del('test', '1', function () {
        });
      });
    });
  });
});

test('store returns the correct results when query is called', function (t) {
  t.plan(3);

  store.put('test', '1', '{ "foo": "bar" }', function () {
    store.put('test', '2', '{ "foo": "baz" }', function () {
      store.query('test', { foo: "bar" }, function (err, stream) {
        t.error(err, 'no error is returned');

        var count = 0;
        stream.on('data', function (data) {
          count++;
          t.equal(data.key, '1', 'the correct key is returned');
          store.del('test', '1', function () {
            store.del('test', '2', function () {
              t.equal(count, 1, 'the correct number of results are returned');
            });
          });

        });
      });
    });
  });
});

test('store correctly does not error when closed and not open', function (t) {
  t.plan(1);

  store.close('test', function (err) {
    t.error(err, 'no error is returned for a close');
  });
});

test('clean up database store', function (t) {
  t.plan(1);

  leveldown.destroy(store.config.dataDir + "/test", function (err) {
    t.error(err);
  });
});
