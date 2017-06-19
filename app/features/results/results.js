(function() {
  'use strict';

  function ResultsCtrl($scope, $rootScope, staticDataService) {
    $scope.driverList = {};
    $scope.fieldDefinition = [
      { 'property': 'image', 'kind': 'image', 'caption': 'Number', 'season': $rootScope.season },
      { 'property': 'name', 'kind': 'no-edit', 'caption': 'Name' },
      { 'property': 'lastname', 'kind': 'no-edit', 'caption': 'Lastname' }
    ];

    var init = function() {
      staticDataService.call('./data/drivers.json').then(function(response) {
        $scope.driverList = response;

        staticDataService.call('./data/' + $rootScope.season + '/races.json').then(function(racesResponse) {
          console.log(racesResponse);

          angular.forEach(racesResponse, function(item, index) {
            $scope.fieldDefinition.push({ 'property': 'event-' + item['event-number'], 'kind': 'no-edit', 'caption': item['short-name'] })            
          });
          /*
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
          */
        });
      });
    };

    init();

    $scope.refresh = function() {
      init();
    };
  }

  ResultsCtrl.$inject = ['$scope', '$rootScope', 'staticDataService'];

  angular.module('nascar-app').controller('ResultsCtrl', ResultsCtrl);
}());