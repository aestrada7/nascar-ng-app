(function() {
  'use strict';

  angular.module('nascar-app').provider('staticDataService', function() {
    this.$get = ['$q', '$http', function($q, $http) {
      var call = function(service) {
        var defer = $q.defer();
        var staticData = {};

        $http({ method: 'GET', url: service }).then(function(response) {
          staticData = response.data;
          defer.resolve(staticData);
        }, function(reject) {
          defer.reject();
          console.log('Error accessing the endpoint ' + service);
        });

        return defer.promise;
      };

      return {
        call: call
      };
    }];
  });

}());