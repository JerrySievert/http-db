var context = require('./context');

var fs = require('fs');

var logFile = (context.config.log && context.config.log.filename) ? fs.createWriteStream(context.config.log.filename, { flags: 'a', encoding: null, mode: 0644 }) : process.stderr;

var severity = [
  'ERROR',
  'WARNING',
  'INFO',
  'DEBUG'
];

var _severity = (context.config.log && context.config.log.severity) ? severity.indexOf(context.config.log.severity) : -1;

function _log ( ) {
  var args = Array.prototype.slice.call(arguments);
  logFile.write("[" + new Date().toString() + "]: " +args.join(" ") + "\n");
}

function info ( ) {
  var args = Array.prototype.slice.call(arguments);

  if (_severity !== -1 && _severity >= severity.indexOf('INFO')) {
    args.unshift("INFO:");

    _log.apply(null, args);
  }
}

function debug ( ) {
  var args = Array.prototype.slice.call(arguments);

  if (_severity !== -1 && _severity >= severity.indexOf('DEBUG')) {
    args.unshift("DEBUG:");

    _log.apply(null, args);
  }
}

function warning ( ) {
  var args = Array.prototype.slice.call(arguments);

  if (_severity !== -1 && _severity >= severity.indexOf('WARNING')) {
    args.unshift("WARNING:");

    _log.apply(null, args);
  }
}

function error ( ) {
  var args = Array.prototype.slice.call(arguments);

  if (_severity !== -1 && _severity >= severity.indexOf('ERROR')) {
    args.unshift("ERROR:");

    _log.apply(null, args);
  }
}

exports.info = info;
exports.warning = warning;
exports.debug = debug;
exports.error = error;