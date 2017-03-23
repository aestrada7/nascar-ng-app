(function() {
  'use strict';

  var app = angular.module('nascar-app', []);
  window.app = app;

  app.run(['$rootScope', 'staticDataService', 'confirmService', 'pointSystemService',
    function($rootScope, staticDataService, confirmService, pointSystemService) {
      $rootScope.season = '2017';
      $rootScope.pointSystem = '2017'; //2003,2014,2017
      $rootScope.showAt = 'ALL'; //ALL,5,10,15
    }
  ]);

}());