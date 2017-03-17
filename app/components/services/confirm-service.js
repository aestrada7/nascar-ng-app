(function() {
  'use strict';
  
  angular.module('nascar-app').provider('confirmService', function() {
    this.$get = ['$q', '$compile', '$http', '$rootScope', '$timeout', function($q, $compile, $http, $rootScope, $timeout) {
      var show = function(options) {
        var confirmModalTemplate = '';
        var scope = $rootScope.$new(true);
        var defer = $q.defer();
        
        scope.options = {
          title: options.title,
          content: options.content,
          cancelLabel: options.cancelLabel,
          confirmLabel: options.confirmLabel,
          addClass: options.addClass
        };
        
        if(!window.onTest) {
          $http.get('./components/services/confirm-service.html').success(function(data) {
            confirmModalTemplate = $compile(data)(scope);
            angular.element(document.body).append(confirmModalTemplate);
          });
          
          scope.confirmAction = function() {
            closeConfirmation();
            defer.resolve();
          };
          
          scope.dismiss = function() {
            closeConfirmation();
            defer.reject();
          };
          
          var closeConfirmation = function() {
            angular.element(document.querySelector('.confirm-modal')).remove();
          };
        } else {
          defer.resolve();
        }
        
        return defer.promise;
      };
      
      return {
        show: show
      };
    }];
  });
}());