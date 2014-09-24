# http-db

An experimental http based database, running on top of LevelDB.

See also `http-db-client`.

This project is in production, but not quite ready for public consumption.

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
