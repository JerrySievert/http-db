var test = require('tape');
var context = require('../lib/context');

context.config = {};
context.config.token = {
  expiration: 3600
};
var token = require('../lib/token');

test('if no token is passed it returns an error', function(t) {
  t.plan(1);

  token.validateToken(null, function(err) {
    t.ok(err, 'error is returned');
  });
});

test('if a token is expired it will be invalid', function(t) {
  t.plan(1);

  token.validateToken({
    expires: 0
  }, function(err) {
    t.ok(err, 'error is returned');
  });
});

test('if a token is not expired it will be valid', function(t) {
  t.plan(1);

  token.validateToken({
    expires: (+new Date() / 1000) + 1000
  }, function(err) {
    t.error(err, 'no error is returned');
  });
});

test('creating a token makes a valid token', function(t) {
  t.plan(1);

  token.validateToken(token.createToken('test'), function(err) {
    t.error(err, 'no error is returned');
  });
});

test('creating a token make a valid token and expiration', function(t) {
  t.plan(1);

  token.validateToken(token.createToken('test', 10000), function(err) {
    t.error(err, 'no error is returned');
  });
});