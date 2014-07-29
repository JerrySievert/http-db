var test = require('tape');
var leveldown = require('leveldown');
var levelup = require('levelup');

var user = require('../lib/user');

user.config.userDir = __dirname + "/user";

test('creating a user works', function (t) {
  t.plan(1);

  user.createUser({ username: 'test', test: 'abc123' }, function (err, data) {
    t.error(err, 'no error is returned');
  });
});

test('creating a user fails when a user already exists', function (t) {
  t.plan(1);

  user.createUser({ username: 'test', test: 'abc123' }, function (err, data) {
    t.ok(err, 'an error is returned');
  });
});

test('retrieving a user works', function (t) {
  t.plan(3);

  user.retrieveUser('test', function (err, data) {
    t.error(err, 'no error is returned');
    t.ok(data, 'user data is returned');
    t.equal(data.username, 'test', 'the username is correct');
  });
});

test('retrieving a user fails when a user is invalid', function (t) {
  t.plan(3);

  user.database.userDB.put('test2', 'foo', function (err) {
    t.error(err, 'no error is returned');
    user.retrieveUser('test2', function (err, data) {
      t.ok(err, 'an error is thrown');
      t.ok(err.isInvalid, 'the user is invalid');
    });
  });
});


test('closing databases works', function (t) {
  t.plan(1);

  user.closeDatabase(function (err) {
    t.error(err, 'no error while closing databases');
  });
});


test('clean up database store', function (t) {
  t.plan(1);

  leveldown.destroy(user.config.userDir + "/users", function (err) {
    t.error(err, 'no error on user directory destroy');
  });
});
