var levelup = require('levelup');
var errors = require('./errors');

var config = require('../config.json');

var database = { };

function openDatabase ( ) {
  if (database.userDB === undefined) {
    database.userDB = new levelup(config.userDir + "/users");
  }
}

function closeDatabase (callback) {
  if (database.userDB) {
    database.userDB.close(function (err) {
      delete database.userDB;
      callback(err);
    });
  }
}


function retrieveUser (username, callback) {
  openDatabase();

  // retrieve the user
  database.userDB.get(username, function (err, userData) {
    var error;

    // if there is an error retrieving the user, return an invalid user error
    if (err) {
      error = new errors.UserError('Unable to retrieve user');
      error.isInvalid = true;

      callback(error);
    } else {
      // if the token cannot be parsed, return an invalid user error
      try {
        userData = JSON.parse(userData);
      } catch (err1) {
        error = new errors.UserError('Unable to parse user');
        error.isInvalid = true;

        callback(error);
        return;
      }

      callback(null, userData);
    }
  });
}

function createUser (userData, callback) {
  openDatabase();

  retrieveUser(userData.username, function (err, user) {
    if (err && !err.isInvalid) {
      callback(new errors.UserError('Error creating user'));
    } else {
      if (user) {
        callback(new errors.UserError('User already exists'));
      } else {
        database.userDB.put(userData.username, JSON.stringify(userData), callback);
      }
    }
  });
}


function authStoreByUsername (store, username, callback) {
  openDatabase();

  // fetch the user data
  retrieveUser(username, function (err, userData) {
    if (err) {
      callback(err);
    } else {
      if (userData.stores && userData.stores.indexOf(store) !== -1 && userData.active) {
        callback();
      } else {
        error = new errors.AuthError('Access denied');
        error.hasAccess = false;

        callback(error);
      }
    }
  });
}

exports.authStoreByUsername = authStoreByUsername;
exports.createUser = createUser;
exports.retrieveUser = retrieveUser;
exports.openDatabase = openDatabase;
exports.closeDatabase = closeDatabase;
exports.database = database;
exports.config = config;
