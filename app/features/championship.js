(function() {
  'use strict';

  function ChampionshipCtrl($scope, $rootScope, staticDataService, pointSystemService) {
    $scope.driverList = {};
    $scope.fieldDefinition = [
      { 'property': 'id', 'kind': 'hidden' },
      { 'property': 'position', 'kind': 'ordering', 'caption': '#' },
      { 'property': 'image', 'kind': 'image', 'caption': 'Number', 'season': $rootScope.season },
      { 'property': 'name', 'kind': 'no-edit', 'caption': 'Name' },
      { 'property': 'lastname', 'kind': 'no-edit', 'caption': 'Lastname' },
      { 'property': 'races', 'kind': 'no-edit', 'caption': 'Races' },
      { 'property': 'points', 'kind': 'no-edit', 'caption': 'Points', 'order': true },
      { 'property': 'pointsToLeader', 'kind': 'no-edit', 'caption': 'To Leader' },
      { 'property': 'playoffPoints', 'kind': 'no-edit', 'caption': 'Playoff Points' },
      { 'property': 'wins', 'kind': 'no-edit', 'caption': 'Wins' },
      { 'property': 'top5s', 'kind': 'no-edit', 'caption': 'Top 5s' },
      { 'property': 'top10s', 'kind': 'no-edit', 'caption': 'Top 10s' },
      { 'property': 'average', 'kind': 'no-edit', 'caption': 'Average' },
      { 'property': 'lapsLed', 'kind': 'no-edit', 'caption': 'Laps Led' },
    ];

    var init = function() {
      staticDataService.call('./data/drivers.json').then(function(response) {
        $scope.driverList = response;

        staticDataService.call('./data/' + $rootScope.season + '/races.json').then(function(racesResponse) {
          var raceData = racesResponse;
          var leaderPoints = 0;

          angular.forEach($scope.driverList, function(item, index) {
            item.image = item.id;
            pointSystemService.calculate(item.id, raceData, $rootScope.pointSystem, $rootScope.showAt).then(function(racePointsResponse) {
              for(var key in racePointsResponse) {
                item[key] = racePointsResponse[key];
              }

              if(index === $scope.driverList.length - 1) {
                angular.forEach($scope.driverList, function(tempItem) {
                  leaderPoints = tempItem.points > leaderPoints ? tempItem.points : leaderPoints;
                });
                angular.forEach($scope.driverList, function(tempItem) {
                  tempItem.pointsToLeader = leaderPoints - tempItem.points;
                });
              }
            }, function(reject) {});
          });
        });
      });
    };

    init();
  }

  ChampionshipCtrl.$inject = ['$scope', '$rootScope', 'staticDataService', 'pointSystemService'];

  angular.module('nascar-app').controller('ChampionshipCtrl', ChampionshipCtrl);
}());