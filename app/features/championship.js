(function() {
  'use strict';

  function ChampionshipCtrl($scope, $rootScope, staticDataService) {
    $scope.driverList = {};

    var init = function() {
      staticDataService.call('./data/drivers.json').then(function(response) {
        $scope.driverList = response;
      });
    };

    init();
  }

  ChampionshipCtrl.$inject = ['$scope', '$rootScope', 'staticDataService'];

  angular.module('nascar-app').controller('ChampionshipCtrl', ChampionshipCtrl);
}());