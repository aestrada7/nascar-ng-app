(function() {
  'use strict';

  var app = angular.module('nascar-app', []);
  window.app = app;

  app.run(['$rootScope', 'staticDataService', 'confirmService',
    function($rootScope, staticDataService, confirmService) {
      $rootScope.season = '2017';
    }
  ]);

}());