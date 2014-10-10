var levelup = require('levelup');
var bcrypt = require('bcrypt');

var errors = require('./errors');

var context = require('./context');

var config = context.config;

var database = { };

function openDatabase ( ) {
  if (database.userDB === undefined) {
    database.userDB = new levelup(config.userDir);
  }
}

function closeDatabase (callback) {
  if (database.userDB) {
    database.userDB.close(function closeCallback(err) {
      delete database.userDB;
      callback(err);
    });
  }
}


function retrieve (username, callback) {
  openDatabase();

  // retrieve the user
  database.userDB.get(username, function retrieveCallback(err, userData) {
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

function create (userData, callback) {
  openDatabase();

  retrieve(userData.username, function createCallback(err, user) {
    if (err && !err.isInvalid) {
      callback(new errors.UserError('Error creating user'));
    } else {
      if (user) {
        callback(new errors.UserError('User already exists'));
      } else {
        var salt = bcrypt.genSaltSync(10);
        userData.password = bcrypt.hashSync(userData.password, salt);
        database.userDB.put(userData.username, JSON.stringify(userData),
          callback);
      }
    }
  });
}

function update (userData, callback) {
  openDatabase();

  retrieve(userData.username, function updateCallback(err, user) {
    if (err && !err.isInvalid) {
      callback(new errors.UserError('Error updating user'));
    } else {
      database.userDB.put(userData.username, JSON.stringify(userData),
        callback);
    }
  });
}

function authStoreByUsername (store, username, callback) {
  openDatabase();

  // fetch the user data
  retrieve(username, function authStoreByUsernameCallback(err, userData) {
    if (err) {
      callback(err);
    } else {
      if (userData.stores && userData.stores.indexOf(store) !== -1 &&
        userData.active) {
        callback();
      } else {
        error = new errors.AuthError('Access denied');
        error.hasAccess = false;

        callback(error);
      }
    }
  });
}

function login (username, password, callback) {
  var error;

  retrieve(username, function retrieveCallback(err, user) {
    if (err || user === undefined) {
      error = new errors.AuthError('Access Denied');
      error.isValidUsername = false;
      error.isAuthenticated = false;

      return callback(error);
    }

    if (bcrypt.compareSync(password, user.password)) {
      callback(null, user);
    } else {
      error = new errors.AuthError('Access Denied');
      error.isAuthenticated = false;

      callback(error);
    }
  });
}

function changePassword (username, oldPassword, newPassword, callback) {
  login(username, oldPassword, function changePasswordCallback(err, userData) {
    if (err) {
      return callback(err);
    }

    var salt = bcrypt.genSaltSync(10);
    userData.password = bcrypt.hashSync(newPassword, salt);

    update(userData, callback);
  });
}

exports.authStoreByUsername = authStoreByUsername;
exports.create = create;
exports.retrieve = retrieve;
exports.update = update;
exports.openDatabase = openDatabase;
exports.closeDatabase = closeDatabase;
exports.database = database;
exports.login = login;
exports.changePassword = changePassword;
exports.config = config;