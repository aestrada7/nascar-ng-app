(function() {
  'use static';

  function driverImage(staticDataService) {
    function driverImageCtrl($scope, $element, $attrs, staticDataService) {
      var path = '/static/images/';
      $scope.imagePath = '';

      /**
       * Builds the image path.
       **/
      $scope.buildImagePath = function() {
        if($scope.season && $scope.team) {
          $scope.imagePath = path + $scope.season + '-' + $scope.team + '-' + $scope.id + '.png';
        }
      };

      /**
       * Retrieves the team the driver has raced for the most, places it next to it.
       **/
      $scope.getUsualTeam = function(id, season) {
        var races = [];
        var teams = {};
        var appearances = 0;

        staticDataService.call('/data/' + season + '/races.json').then(function(response) {
          races = response;

          angular.forEach(races, function(item) {
            angular.forEach(item.results, function(res) {
              if(res.driver === $scope.id) {
                teams['team-' + res.team] = teams['team-' + res.team] + 1 || 1;
              }
            });
          });

          for(team in teams) {
            if(teams[team] > appearances) {
              $scope.team = team.split('team-').join('');
            }
          }

          $scope.buildImagePath();
        });
      };

      /**
       * If inferring the team, does the process, otherwise expects the team to be provided on the directive.
       **/
      $scope.init = function() {
        if($scope.infer) {
          $scope.getUsualTeam($scope.id, $scope.season);
        } else {
          if($scope.team) {
            $scope.buildImagePath();
          } else {
            console.log('No team provided. Driver image won\'t be retrieved.');
          }
        }
      };

      $scope.init();
    }

    driverImageCtrl.$inject = ['$scope', '$element', '$attrs', 'staticDataService'];

    return {
      scope: {
        id: '=',
        season: '=',
        team: '=',
        infer: '@'
      },
      restrict: 'E',
      template: '<img ng-if="imagePath" ng-src="{{imagePath}}" />',
      controller: driverImageCtrl
    };
  }

  driverImage.$inject = ['staticDataService'];

  angular.module('nascar-app').directive('driverImage', driverImage);
}());