
function TokenError (message) {
  var err = Error.call(this, message);

  err.name = 'TokenError';
  err.isExpired = null;
  err.isInvalid = null;

  return err;
}


function AuthError (message) {
  var err = Error.call(this, message);

  err.name = 'AuthError';
  err.isValidUsername = null;
  err.isAuthenticated = null;
  err.hasAccess = null;
  err.isInvalid = null;

  return err;
}


function UserError (message) {
  var err = Error.call(this, message);

  err.name = 'UserError';
  err.isInvalid = null;

  return err;
}


exports.TokenError = TokenError;
exports.AuthError = AuthError;
exports.UserError = UserError;
