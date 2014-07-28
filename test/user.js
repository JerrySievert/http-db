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

  user.databases.userDB.put('test2', 'foo', function (err) {
    t.error(err, 'no error is returned');
    user.retrieveUser('test2', function (err, data) {
      t.ok(err, 'an error is thrown');
      t.ok(err.isInvalid, 'the user is invalid');
    });
  });
});

test('creating a token works', function (t) {
  t.plan(1);

  user.createToken({ token: 'test', username: 'abc123' }, function (err, data) {
    t.error(err, 'no error is returned');
  });
});

test('retrieving a token fails when a token is invalid', function (t) {
  t.plan(3);

  user.databases.tokenDB.put('test2', 'foo', function (err) {
    t.error(err, 'no error is returned');
    user.retrieveToken('test2', function (err, data) {
      t.ok(err, 'an error is thrown');
      t.ok(err.isInvalid, 'the token is invalid');
    });
  });
});

test('retrieving a token fails when a token is expired', function (t) {
  t.plan(3);

  user.createToken({ token: 'test3', expires: (+new Date()) - 1000 }, function (err) {
    t.error(err, 'no error is returned');
    user.retrieveToken('test3', function (err, data) {
      t.ok(err, 'an error is thrown');
      t.ok(err.isExpired, 'the token is expired');
    });
  });
});


test('creating a token fails when a user already exists', function (t) {
  t.plan(1);

  user.createToken({ token: 'test', test: 'abc123' }, function (err, data) {
    t.ok(err, 'an error is returned');
  });
});

test('auth against a token without a username fails', function (t) {
  t.plan(2);

  user.authStoreByToken('foo', 'test', function (err) {
    console.log(err);
    t.ok(err, 'an error is returned');
    t.ok(err.isValidUsername, 'username is invalid');
  });
});

test('closing databases works', function (t) {
  t.plan(1);

  user.closeDatabases(function (err) {
    t.error(err, 'no error while closing databases');
  });
});

test('closing databases works when only the token database is open', function (t) {
  t.plan(2);
  user.openDatabases();

  user.databases.userDB.close(function (err) {
    user.databases.userDB = undefined;
    t.error(err, 'no error closing the user database');
    user.closeDatabases(function (err) {
      t.error(err, 'no error while closing databases');
    });
  });
});

test('closing databases works when only the user database is open', function (t) {
  t.plan(2);
  user.openDatabases();

  user.databases.tokenDB.close(function (err) {
    user.databases.tokenDB = undefined;
    t.error(err, 'no error closing the user database');
    user.closeDatabases(function (err) {
      t.error(err, 'no error while closing databases');
    });
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
