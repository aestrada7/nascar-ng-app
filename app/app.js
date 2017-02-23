(function() {
  'use strict';

  var app = angular.module('nascar-app', []);
  window.app = app;

  app.run(['$rootScope', 'staticDataService',
    function($rootScope, staticDataService) {
      $rootScope.season = '2017';
    }
  ]);

}());