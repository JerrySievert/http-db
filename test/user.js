var test = require('tape');
var leveldown = require('leveldown');

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

test('creating a token works', function (t) {
  t.plan(1);

  user.createToken({ token: 'test', username: 'abc123' }, function (err, data) {
    t.error(err, 'no error is returned');
  });
});

test('creating a token fails when a user already exists', function (t) {
  t.plan(1);

  user.createToken({ token: 'test', test: 'abc123' }, function (err, data) {
    t.ok(err, 'an error is returned');
  });
});

test('closing databases works', function (t) {
  t.plan(1);

  user.closeDatabases(function (err) {
    t.error(err, 'no error while closing databases');
  });
});

test('clean up database store', function (t) {
  t.plan(2);

  leveldown.destroy(user.config.userDir + "/users", function (err) {
    t.error(err, 'no error on user directory destroy');
    leveldown.destroy(user.config.userDir + "/tokens", function (err) {
      t.error(err, 'no error on token directory destroy');
    });
  });
});
