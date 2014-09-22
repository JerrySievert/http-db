var toke = require('../lib/token');


function token (request, reply) {
  return reply(JSON.stringify({
    "status": "ok",
    "token": toke.encodeToken(toke.createToken(request.auth.credentials.username))
  })).type('application/json');
}

exports = module.exports = token;