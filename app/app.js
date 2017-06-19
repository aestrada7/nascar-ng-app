(function() {
  'use strict';

  var app = angular.module('nascar-app', ['ngRoute']);
  window.app = app;

  app.config(['$locationProvider', '$routeProvider',
    function($locationProvider, $routeProvider) {
      $locationProvider.html5Mode(true);

      $routeProvider.when('/', {
        templateUrl: 'features/championship/championship.html'
      }).otherwise({
        redirectTo: '/'
      });
    }]
  );

  app.run(['$rootScope', 'staticDataService', 'confirmService', 'pointSystemService',
    function($rootScope, staticDataService, confirmService, pointSystemService) {
      $rootScope.season = '2017';
      $rootScope.pointSystems = ['2017', '2014', '2003'];
      $rootScope.pointSystem = '2017';
      $rootScope.showAt = 'ALL'; //ALL,5,10,15
    }
  ]);

}());