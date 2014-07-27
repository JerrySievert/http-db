var levelup = require('levelup');
var errors = require('./errors');

var config = require('../config.json');

var userDB = new levelup(config.userDir + "/users");
var tokenDB = new levelup(config.userDir + "/tokens");

/*
{
  expires: milliseconds,
  username: who
}
*/
function retrieveToken (token, callback) {
  // retrieve the token
  tokenDB.get(token, function (err, tokenData) {
    var error;

    // if there is an error retrieving the token, return an invalid token error
    if (err) {
      error = new errors.TokenError('Unable to retrieve token');
      error.isInvalid = true;

      callback(error);
    } else {
      // if the token cannot be parsed, return an invalid token error
      try {
        tokenData = JSON.parse(tokenData);
      } catch (err1) {
        error = new errors.TokenError('Unable to parse token');
        error.isInvalid = true;

        callback(error);
        return;
      }

      // if the token is expired, return an expired token error
      if (tokenData.expires < +new Date()) {
        error = new errors.TokenError('Token is expired');
        error.isExpired = true;

        callback(error);
      } else {
        callback(null, tokenData);
      }
    }
  });
}

function retrieveUser (username, callback) {
  // retrieve the user
  userDB.get(token, function (err, userData) {
    var error;

    // if there is an error retrieving the user, return an invalid user error
    if (err) {
      error = new errors.AuthError('Unable to retrieve user');
      error.isInvalid = true;

      callback(error);
    } else {
      // if the token cannot be parsed, return an invalid user error
      try {
        userData = JSON.parse(userData);
      } catch (err1) {
        error = new errors.AuthError('Unable to parse user');
        error.isInvalid = true;

        callback(error);
        return;
      }

      // if the user is invalid, return an invalid user error
      if (userData.valid === false) {
        error = new errors.AuthError('User is invalid');
        error.isInvalid = true;

        callback(error);
      } else {
        callback(null, userData);
      }
    }
  });
}

function authStoreByToken (store, token, callback) {
  // retrieve the token, pass an error back if there is one
  retrieveToken(token, function (err, tokenData) {
    var error;

    if (err) {
      callback(err);
    } else {
      if (!token.username) {
        error = new errors.AuthError('Invalid username');
        error.isValidUsername = false;

        callback(error);
        return;
      }

      // fetch the user data
      retrieveUser(token.username, function (err, userData) {
        if (err) {
          callback(err);
        } else {
          if (userData.stores && userData.stores.indexOf(store) !== -1) {
            callback();
          } else {
            error = new errors.AuthError('Access denied');
            error.hasAccess = false;

            callback(error);
          }
        }
      });
    }
  });
}

exports.authStoreByToken = authStoreByToken;
