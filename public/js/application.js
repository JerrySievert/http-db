var app = angular.module('Application', [ ]);
app.controller('applicationController', function ($scope, $http, $window) {
  $http.get('/api/v1/token').success(function (data) {
    $http.defaults.headers.common.Authorization = "Bearer " + data.token;

    $http.get('/database').success(function (data) {
      $scope.database = data;
    });

    $http.get('/database/stores').success(function (data) {
      $scope.stores = data.stores;
    });
  }).error(function (error) {
  });

  $scope.storeClick = function (event) {
    $scope.store = event.srcElement.firstChild.data;
    $http.get('/database/all/' + $scope.store, { transformResponse: function (h, d) { return h; }}).success(function (data) {
      $scope.displayValue = false;
      $scope.displayCreate = false;
      $scope.displayEdit = false;
      $scope.displayKeys = true;

      var parts = data.split("\n");

      $scope.values = [ ];
      for (var i = 0; i < parts.length; i++) {
        try {
          var part = JSON.parse(parts[i]);
          $scope.values.push(part);
        } catch (err) {

        }
      }
    });
  };

  $scope.keyClick = function (event) {
    $scope.key = event.srcElement.firstChild.data;
    $http.get('/database/value/' + $scope.store + '/' + $scope.key).success(function (data) {
      $scope.value = render(null, data);
      $scope.displayKeys = false;
      $scope.displayCreate = false;
      $scope.displayValue = true;
    });
  };

  $scope.editValue = function ( ) {
    $scope.valueError = null;
    $scope.oldValue = $scope.value;
    $scope.displayValue = false;
    $scope.displayCreate = false;
    $scope.displayEdit = true;
  };

  $scope.cancelValue = function ( ) {
    $scope.value = $scope.oldValue;
    $scope.displayEdit = false;
    $scope.displayCreate = false;
    $scope.displayValue = true;
  };

  $scope.saveValue = function ( ) {
    var toSave;
    $scope.valueError = false;

    if ($scope.key === "" || $scope.key === null || $scope.key === undefined) {
      $scope.valueError = "Invalid Key";
      return;
    }

    try {
      $scope.valueError = false;
      toSave = JSON.parse($scope.value);
    } catch (err) {
      //$scope.value = $scope.oldValue;
      $scope.valueError = "Invalid JSON, Unable to Save";
      return;
    }

    $http.post('/database/value/' + $scope.store + '/' + $scope.key, $scope.value).success(function ( ){
      $scope.displayEdit = false;

      $http.get('/database/value/' + $scope.store + '/' + $scope.key).success(function (data) {
        $scope.value = render(null, data);
        $scope.displayKeys = false;
        $scope.displayCreate = false;
        $scope.displayValue = true;
      });
    });
  };

  $scope.deleteValue = function ( ) {
    $http.delete('/database/value/' + $scope.store + '/' + $scope.key).success(function () {
      $scope.displayEdit = false;
      $scope.displayValue = false;

      $scope.values = $scope.values.filter(function (data) {
        if (data.key === $scope.key) {
          return false;
        } else {
          return true;
        }
      });

      $scope.key = undefined;

      $scope.displayKeys = true;
    });
  };

  $scope.createEntry = function ( ) {
    $scope.valueError = null;
    $scope.key = "";
    $scope.value = "";
    $scope.displayKeys = false;
    $scope.displayValue = false;
    $scope.displayEdit = false;
    $scope.displayCreate = true;
  };

});


function render (key, value, indent) {
  var text = '', i;

  indent = indent || 0;

  if (Array.isArray(value)) {
    for (i = 0; i < indent; i++) {
      text += " ";
    }

    if (key !== null) {
      text += "\"" + key + "\": ";
    }

    text += "[\n";

    for (var i = 0; i < value.length; i++) {
      text += render(null, value[i], indent + 2);
      if (i < value.length - 1) {
        text += ",";
      }
      text += "\n";
    }

    for (i = 0; i < indent; i++) {
      text += " ";
    }
    text += "]";
  } else if (value !== null && typeof value === 'object' && value.toString() === '[object Object]') {
    for (i = 0; i < indent; i++) {
      text += " ";
    }

    if (key !== null) {
      text += "\"" + key + "\": ";
    }

    text += "{\n";

    var keys = Object.keys(value);
    for (var i = 0; i < keys.length; i++) {
      text += render(keys[i], value[keys[i]], indent + 2);
      if (i < keys.length - 1) {
        text += ",";
      }
      text += "\n";
    }

    for (i = 0; i < indent; i++) {
      text += " ";
    }
    text += "}";
  } else if (typeof value === 'number' || typeof value === 'boolean') {
    for (i = 0; i < indent; i++) {
      text += " ";
    }
    if (key !== null) {
      text += "\"" + key + "\": ";
    }

    text += Number(value);
    text += "";
  } else {
    for (i = 0; i < indent; i++) {
      text += " ";
    }
    if (key !== null) {
      key = key.replace(/\"/g, "\\\"");
      text += "\"" + key + "\": ";
    }

    if (value === null) {
      text += "null";
    } else if (value === undefined) {
      text += "undefined";
    } else {
      value = value.replace(/\"/g, "\\\"");
      text += '"' + value + '"';
    }

    text += "";
  }

  return text;
}
