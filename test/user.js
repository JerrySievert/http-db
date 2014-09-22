var test = require('tape');
var leveldown = require('leveldown');
var levelup = require('levelup');
var bcrypt = require('bcrypt');

var user = require('../lib/user');

user.config.userDir = __dirname + "/user";

test('creating a user works', function (t) {
  t.plan(1);

  user.create({ username: 'test', test: 'abc123', password: 'mypass' }, function (err, data) {
    t.error(err, 'no error is returned');
  });
});

test('creating a user fails when a user already exists', function (t) {
  t.plan(1);

  user.create({ username: 'test', test: 'abc123', password: 'mypass' }, function (err, data) {
    t.ok(err, 'an error is returned');
  });
});

test('retrieving a user works', function (t) {
  t.plan(3);

  user.retrieve('test', function (err, data) {
    t.error(err, 'no error is returned');
    t.ok(data, 'user data is returned');
    t.equal(data.username, 'test', 'the username is correct');
  });
});

test('retrieving a user fails when a user is invalid', function (t) {
  t.plan(3);

  user.database.userDB.put('test2', 'foo', function (err) {
    t.error(err, 'no error is returned');
    user.retrieve('test2', function (err, data) {
      t.ok(err, 'an error is thrown');
      t.ok(err.isInvalid, 'the user is invalid');
    });
  });
});

test('changing a password works', function (t) {
  t.plan(2);

  user.create({ username: 'test2', test: 'abc123', password: 'mypass' }, function (err, data) {
    user.changePassword('test2', 'mypass', '123abc', function (err) {
      t.error(err, 'no error is returned');
      user.retrieve('test2', function (e, u) {
        t.ok(bcrypt.compareSync('123abc', u.password), 'passwords match');
      });
    });
  });
});

test('changing a password with a bad old password fails', function (t) {
  t.plan(1);

  user.create({ username: 'test2', test: 'abc123', password: 'mypass' }, function (err, data) {
    user.changePassword('test2', 'notmypass', '123abc', function (err) {
      t.ok(err, 'an error is returned');
    });
  });
});

test('changing a password with a bad username fails', function (t) {
  t.plan(1);

  user.changePassword('badguy', 'notmypass', '123abc', function (err) {
      t.ok(err, 'an error is returned');
  });
});

test('authorizing against a store works', function (t) {
  t.plan(1);

  user.create({ username: 'storetest', stores: [ 'test' ], password: 'mypass', active: true }, function (err, data) {
    user.authStoreByUsername('test', 'storetest', function (err) {
      t.error(err, 'no error is returned');
    });
  });
});

test('authorizing against a store fails when not allowed', function (t) {
  t.plan(1);

  user.create({ username: 'storetest2', stores: [ 'test' ], password: 'mypass', active: true }, function (err, data) {
    user.authStoreByUsername('test2', 'storetest2', function (err) {
      t.ok(err, 'an error is returned');
    });
  });
});

test('authorizing against a store fails when a user does not exist', function (t) {
  t.plan(1);

  user.authStoreByUsername('doesnotexist', 'storetest2', function (err) {
    t.ok(err, 'an error is returned');
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

