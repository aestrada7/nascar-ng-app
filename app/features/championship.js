(function() {
  'use strict';

  function ChampionshipCtrl($scope, $rootScope, staticDataService) {
    $scope.driverList = {};
    $scope.fieldDefinition = [
      { 'property': 'id', 'kind': 'hidden' },
      { 'property': 'image', 'kind': 'image', 'caption': 'Number', 'season': $rootScope.season },
      { 'property': 'name', 'kind': 'no-edit', 'caption': 'Name' },
      { 'property': 'lastname', 'kind': 'no-edit', 'caption': 'Lastname' },
      { 'property': 'currentPoints', 'kind': 'no-edit', 'caption': 'Points' },
      { 'property': 'playoffPoints', 'kind': 'no-edit', 'caption': 'Playoff Points' },
      { 'property': 'wins', 'kind': 'no-edit', 'caption': 'Wins' },
      { 'property': 'top5s', 'kind': 'no-edit', 'caption': 'Top 5s' },
      { 'property': 'top10s', 'kind': 'no-edit', 'caption': 'Top 10s' },
      { 'property': 'lapsLed', 'kind': 'no-edit', 'caption': 'Laps Led' }
    ];

    var init = function() {
      staticDataService.call('./data/drivers.json').then(function(response) {
        $scope.driverList = response;

        staticDataService.call('./data/' + $rootScope.season + '/races.json').then(function(racesResponse) {
          raceData = racesResponse;

          angular.forEach($scope.driverList, function(item) {
            item.image = item.id;
            item.currentPoints = 0;
            item.playoffPoints = 0;
            item.wins = 0;
            item.top5s = 0;
            item.top10s = 0;
            item.lapsLed = 0;
          });
        });
      });
    };

    init();
  }

  ChampionshipCtrl.$inject = ['$scope', '$rootScope', 'staticDataService'];

  angular.module('nascar-app').controller('ChampionshipCtrl', ChampionshipCtrl);
}());