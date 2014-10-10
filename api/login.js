var user = require('../lib/user');


function login (request, reply) {
  if (request.auth.isAuthenticated) {
    return reply(JSON.stringify({
      "status": "ok"
    }));
  }

  if (request.payload.username === undefined) {
    return reply(JSON.stringify({
      "status": "error",
      "error": "Username required"
    }));
  }

  if (request.payload.password === undefined) {
    return reply(JSON.stringify({
      "status": "error",
      "error": "Password required"
    }));
  }

  user.login(request.payload.username, request.payload.password, function(err,
    account) {
    if (err) {
      return reply(JSON.stringify({
        "status": "error",
        "error": "Bad Username or Password"
      }));
    }

    request.auth.session.set(account);
    return reply({
      "status": "ok"
    });
  });
}

exports = module.exports = login;