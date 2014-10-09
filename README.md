# http-db

An experimental http based database, running on top of LevelDB and (db-engine)[https://github.com/JerrySievert/db-engine].

See also (http-db-client)[https://github.com/JerrySievert/http-db-client].

This project is in production, but not quite ready for public consumption.

## Setting Up

### Installation

`http-db` should be installed globally, as it includes scripts to help get the database up and going, as well as configured.

```
$ npm install -g http-db
```

### Configuration

`http-db` relies on a `JSON` based configuration file and directories for storage and user databases.  First configuration is as simple as running `rdb_init` from the command line.

#### Configuration Variables

_dataDir_ - location of where `stores` will be written.

_userDir_ - location of where the user database will be written.

_token.secret_ - secret for JWT token

_token.expiration_ - default expiration

_cookie.password_ - cookie password

_cookie.name_ - name of the cookie

_server.host_ - host to listen on

_server.port_ - port to listen on

_public_ - whether a public website should be available

_user_ - user to drop priviledges to if run by root
 


## RESTful Interface

The RESTful interface requires a valid Bearer token delivered as part of the request in order to access.

This Bearer token is delivered as part of the request headers:

```
Authorization: Bearer YOUR-TOKEN
```

### GET /database

Returns basic information about the database.

_Returns:_

```
{
  "status": "ok",
  "name": "http-db",
  "version": "0.5.0",
  "port": 8765,
  "host": "localhost",
  "hostname":"localhost"
}
```

### GET /database/stores

Returns a list of `stores` that you have access to.

_Returns:_

```
{
  "status": "ok",
  "stores": [
    "store1",
    "store2"
  ]
}
```

### GET /database/value/{store}/{id}

For a given a `store` and `id, returns the value associated with it.

_Returns:_

```
{
  "foo": "bar"
}
```

### POST /database/value/{store}/{id}

Sets the `JSON` value passed as part of the body in the `store` and assigns it to the `key`.  This operation overwrites any existing value.

This requires a `Content-type` header to be set on the request:

```
Content-type: application/json
```

_Returns:_

`400` on Error, with `JSON` error message:

```
{
  "status": "error", 
  "error": "payload should be JSON"
}
```

`201` on Success

### DELETE /database/value/{store}/{id}

### GET /database/keys/{store}

### GET /database/all/{store}

### GET /database/filter/{store}?key={key}&value={value}

### POST /database/query/{store}
