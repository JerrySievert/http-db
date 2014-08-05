var jwt = require('jwt-simple');
var errors = require('./errors');

var config = require('../config.json');

function validateToken (token, callback) {
  var error;

  if (token) {
    if (token.expires < (+new Date())) {
      callback(null, token);
    } else {
      error = new errors.TokenError('Expired token');
      error.isExpired = true;

      callback(error);
    }
  } else {
    error = new errors.TokenError('Invalid token');
    error.isInvalid = true;

    callback(error);
  }
}

function createToken (username, optionalExpiration) {
  var expires = (+new Date()) + (optionalExpiration || config.token.expires);

  var token = {
    username: username,
    expires: expires
  };

  return token;
}

exports.validateToken = validateToken;
