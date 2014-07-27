var inherits = require('inherits');

function TokenError (message) {
  Error.call(this, message);

  this.isExpired = null;
  this.isInvalid = null;
}

inherits(TokenError, Error);

function AuthError (message) {
  Error.call(this, message);

  this.isValidUsername = null;
  this.isAuthenticated = null;
  this.hasAccess = null;
  this.isInvalid = null;
}

inherits(AuthError, Error);

exports.TokenError = TokenError;
exports.AuthError = AuthError;
