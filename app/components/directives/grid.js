(function () {
  'use strict';

  function grid($rootScope, $http, $q, orderBy, confirmService) {
    function gridCtrl($scope, $element, $attrs, $rootScope, $http, $q, orderBy, confirmService, $window) {
      var MOBILE_BREAKPOINT = 640;

      $scope.totalPages = 0;
      $scope.currentPage = 1;
      $scope.totalRows = 0;
      $scope.defaultRowsPerPage = 10;
      $scope.sortingBy = {};
      $scope.loading = false;
      $scope.cachedItem = {};
      $scope.idField = 'id';
      $scope.gridSummary = '';
      $scope.isMobile = false;
      $scope.columnWidth = 0;

      /**
       * Saves changes done on the form.
       **/
      $scope.saveEdit = function(item) {
        var endpoint = item.endpoint;
        $scope.loading = true;

        var saveErrorObj = {
          title: $scope.strings.errorTitle,
          content: $scope.strings.saveError,
          confirmLabel: $scope.strings.okButton,
          addClass: $scope.confirmClasses
        };

        if(endpoint && !window.mockData) {
          sendDataToURL(endpoint, item).then(function(response) {
            item.editing = false;
            $scope.loading = false;
            
            if(response.data.flag) {
              if(!item[$scope.idField]) {
                angular.forEach($scope.fieldDefinition, function(field) {
                  item[field.property] = response.item[field.property];
                });
              }
              $scope.cachedItem = {};
            } else {
              confirmService.show(saveErrorObj);
              $scope.cancelEdit(item);
            }
          }, function(reject) {
            item.editing = false;
            $scope.loading = false;
            confirmService.show(saveErrorObj);
            $scope.cancelEdit(item);
          });
        } else {
          item.editing = false;
          $scope.loading = false;
          $scope.cachedItem = {};
        }
      };

      /**
       * Cancel editing and return to display mode.
       **/
      $scope.cancelEdit = function(item) {
        angular.copy($scope.cachedItem, item);
        angular.forEach($scope.gridProvider, function(item, index) {
          if(item[$scope.idField] === '') {
            $scope.gridProvider.splice(0, 1);
          }
        });
        $scope.cachedItem = {};
      };

      /**
       * Enters edit mode for the provided id.
       **/
      $scope.editItem = function(id, endpoint) {
        angular.forEach($scope.gridProvider, function(item, index) {
          if(item[$scope.idField] === $scope.cachedItem[$scope.idField]) {
            $scope.cancelEdit(item);
          }
        });

        angular.forEach($scope.gridProvider, function(item, index) {
          if(item[$scope.idField] === id) {
            $scope.cachedItem = angular.copy(item);
            item.editing = true;
            item.endpoint = endpoint;
          }
        });
      };

      /**
       * Removes an item from the local list. Checks if current page and total page count are valid.
       **/
      $scope.removeItemFromList = function(id) {
        angular.forEach($scope.gridProvider, function(item, index) {
          if(item[$scope.idField] === id) {
            $scope.gridProvider.splice(index, 1);
            $scope.buildGridData();

            if($scope.currentPage > $scope.totalPages) {
              $scope.currentPage--;
            }
          }
        });
        $scope.loading = false;
      };

      /**
       * Attempts to delete an item from the list.
       **/
      $scope.deleteItem = function(id, endpoint) {
        var itemToDelete = {};
        $scope.loading = true;

        angular.forEach($scope.gridProvider, function(item) {
          if(item[$scope.idField] === id) {
            itemToDelete = item;
          }
        });

        var overlayObj = {
          title: $scope.strings.confirmDelete,
          content: $scope.strings.confirmDeleteBody.split('%%0').join(itemToDelete[$scope.nameField]),
          confirmLabel: $scope.strings.confirmButton,
          cancelLabel: $scope.strings.cancelButton,
          addClass: $scope.confirmClasses
        };

        var deleteErrorObj = {
          title: $scope.strings.errorTitle,
          content: $scope.strings.deleteError,
          confirmLabel: $scope.strings.okButton,
          addClass: $scope.confirmClasses
        };

        confirmService.show(overlayObj).then(function(response) {
          if(endpoint && !window.mockData) {
            endpoint = endpoint.split('{{id}}').join(id);

            getDataFromURL(endpoint, 'POST', itemToDelete).then(function(response) {
              if(response.data) {
                $scope.removeItemFromList(id);
              } else {
                confirmService.show(deleteErrorObj);
                $scope.loading = false;
              }
            });
          } else {
            $scope.removeItemFromList(id);
          }
        }, function(reject) {
          $scope.loading = false;
        });
      };

      /**
       * Attempts to execute a predefined action on a row. Requires an identifier.
       **/
      $scope.runAction = function(id, action, endpoint) {
        if(action === 'delete') {
          $scope.deleteItem(id, endpoint);
        } else if(action === 'edit') {
          $scope.editItem(id, endpoint);
        }
      };

      /**
       * Moves to the following available page.
       **/
      $scope.toNextPage = function() {
        if($scope.currentPage < $scope.totalPages) {
          $scope.currentPage++;
          $scope.updateGridSummary();
        }
      };

      /**
       * Moves to the previous available page.
       **/
      $scope.toPrevPage = function() {
        if($scope.currentPage > 1) {
          $scope.currentPage--;
          $scope.updateGridSummary();
        }
      };

      /**
       * Moves to a specific page.
       **/
      $scope.goToPage = function(page) {
        if(page > 0 && page <= $scope.totalPages) {
          $scope.currentPage = page;
          $scope.updateGridSummary();
        }
      };

      /**
       * Updates the item count on the footer of the page.
       **/
      $scope.updateGridSummary = function() {
        var summary = $scope.strings.itemCount || '';
        var fromItem = (($scope.currentPage - 1) * $scope.rowsPerPage) + 1;
        var toItem = fromItem + parseInt($scope.rowsPerPage) - 1;
        if(toItem > $scope.totalRows) {
          toItem = $scope.totalRows;
          
          if(toItem === 0) {
            fromItem = 0;
          }
        }

        if($scope.isMobile && fromItem !== 0) {
          fromItem = 1;
        }

        summary = summary.split('%%0').join(fromItem);
        summary = summary.split('%%1').join(toItem);
        summary = summary.split('%%2').join($scope.totalRows);
        $scope.gridSummary = summary;
        $scope.updateGridFooter();
      };

      /**
       * Updates the grid gooter with the links that must appear.
       **/
      $scope.updateGridFooter = function() {
        var linksToShow = 3;
        var firstLink = $scope.currentPage;
        
        while(firstLink % linksToShow !== 0) {
          firstLink--;
        }

        if(firstLink === $scope.totalRows) {
          firstLink = $scope.currentPage - linksToShow + 1;
        }

        if(firstLink <= 0) {
          firstLink = 1;
        }

        $scope.footerPages = [];
        for(var i = 0; i < linksToShow; i++) {
          if(firstLink + i <= $scope.totalPages) {
            $scope.footerPages.push(firstLink + i);
          }
        }

        if($scope.totalPages >= linksToShow) {
          while($scope.footerPages.length < linksToShow) {
            $scope.footerPages.splice(0, 0, firstLink - $scope.footerPages.length);
          }
        }
      };

      /**
       * Checks if a given page is currently visible on the footer.
       **/
      $scope.pageIsVisible = function(page) {
        for(var i = 0; i < $scope.footerPages.length; i++) {
          if($scope.footerPages[i] === page) {
            return true;
          }
        }
        return false;
      };

      /**
       * Checks if the field is disabled.
       **/
      $scope.isDisabled = function(field) {
        var fieldList = $scope.disabledFields.split(',');
        
        for(var fieldItem in fieldList) {
          if(fieldList[fieldItem] === field) {
            return true;
          }
        }
        
        return false;
      };

      /**
       * Prints any composite fields that are defined on the grid.
       **/
      $scope.printComposite = function(row, field) {
        var compositeString = field['string'];
        for(var i = 0; i < field.dropdowns.length; i++) {
          for(var j = 0; j < field.dropdowns[i].values.length; j++) {
            if(field.dropdowns[i].values[j] === row[field.dropdowns[i].property]) {
              compositeString = compositeString.split('%%' + field.dropdowns[i].order).join(field.dropdowns[i].captions[j]);
              break;
            }
          }
          
          if(!row[field.dropdowns[i].property]) {
            compositeString = '';
            break;
          }
        }
        return compositeString;
      };

      /**
       * Uses Angular's built in orderBy service to sort the contents of the grid.
       **/
      $scope.sortGrid = function(field, kind, direction) {
        if(kind === 'number') {
          angular.forEach($scope.gridProvider, function(item) {
            item[field] = parseFloat(item[field]);
          });
        }

        $scope.sortingBy = { "field": field, "direction": direction };
        $scope.gridProvider = orderBy($scope.gridProvider, field, direction === 'ASC');
      };

      /**
       * Builds auxiliar grid data, like total rows/pages.
       **/
      $scope.buildGridData = function() {
        angular.forEach($scope.fieldDefinition, function(item) {
          item.sortable = item.kind === 'string' || item.kind === 'number' || item.kind === 'no-edit';
          item.editing = false;
        });

        $scope.totalRows = $scope.gridProvider.length;
        $scope.totalPages = Math.floor(($scope.totalRows - 1) / $scope.rowsPerPage) + 1;

        $scope.updateGridSummary();
      };

      /**
       * Calculates the current start position for the grid, has different behavior if using the mobile view.
       **/
      $scope.currentStart = function() {
        if($scope.isMobile) {
          return 0;
        } else {
          return $scope.rowsPerPage * ($scope.currentPage - 1);
        }
      };
      
      /**
       * Max number of items that will be shown on the grid at the time. Has a different behavior if using mobile view.
       **/
      $scope.currentLimit = function() {
        if($scope.isMobile) {
          return $scope.rowsPerPage * $scope.currentPage;
        } else {
          return $scope.rowsPerPage;
        }
      };

      /**
       * Main function, sets up most variables. Detects breakpoint.
       **/
      $scope.init = function() {
        if(!$scope.rowsPerPage) {
          $scope.rowsPerPage = $scope.defaultRowsPerPage;
        }
        if(!$scope.linkId) {
          $scope.linkId = $scope.idField;
        }
        if($scope.gridUrl) {
          getDataFromURL($scope.gridUrl).then(function(response) {
            $scope.gridProvider = response;
          });
        }
        angular.forEach($scope.fieldDefinition, function(item) {
          $scope.columnWidth += item.kind !== 'hidden' ? 1 : 0;
        });
        $scope.detect();
      };

      /**
       * Detects the current breakpoint.
       **/
      $scope.detect = function(forceDigest) {
        if(!window.onTest) {
          $scope.isMobile = $window.innerWidth < MOBILE_BREAKPOINT;
        }
        
        if(forceDigest) {
          $scope.$apply();
          $scope.updateGridSummary();
        }
      };

      /**
       * Watcher to build/rebuild grid data if loaded from a third party endpoint.
       **/
      $scope.$watch('gridProvider', function() {
        $scope.buildGridData();
      });
      
      /**
       * Fires the breakpoint detection function whenever a resize is done on the window.
       **/
      angular.element($window).bind('resize', function() {
        $scope.detect(true);
      });

      /**
       * Catches Edit Item events, looks for the link id to match and enters edit mode for the matching item.
       * Expects the passed object to include the following:
       *   - A matching Link Identifier with the directive's $scope.linkId (obj['linkedId'])
       *   - The action identifier as a string ('edit', 'delete'). This must match the $scope.fieldDefinition
       *   - A sample object would be similar to this: { 'linkedId': 1, 'actionId': 'edit' }
       **/
      $scope.$on('edit-grid-item', function(event, obj) {
        angular.forEach($scope.gridProvider, function(item, index) {
          if(String(item[$scope.linkId]) === String(obj[$scope.linkId])) {
            var itemOnPage = Math.ceil((index + 1) / $scope.rowsPerPage);
            $scope.goToPage(itemOnPage);
            $scope.editItem(item[$scope.idField], retrieveEndpoint(obj.actionId));
          }
        });
      });

      /**
       * Catches Add Item events, creates a new dummy object with the basic structure.
       */
      $scope.$on('add-grid-item', function(event, obj) {
        angular.forEach($scope.fieldDefinition, function(item) {
          obj[item.property] = obj[item.property] || '';
        });
        $scope.gridProvider.splice(0, 0, obj);
        $scope.editItem('', retrieveEndpoint(obj.actionId));
      });
      
      /**
       * Retrieves the associated endpoint in the field definition to the provided actionId.
       **/
      var retrieveEndpoint = function(actionId) {
        var endpoint = '';
        angular.forEach($scope.fieldDefinition, function(item) {
          if(item.property === 'action') {
            angular.forEach(item.actions, function(action) {
              if(action.id === actionId) {
                endpoint = action.url;
              }
            });
          }
        });
        return endpoint;
      };

      /**
       * Grabs the information from a given URL, returns a promise with the retrieved data.
       **/
      var getDataFromURL = function(url, method, data) {
        var defer = $q.defer();
        var callMethod = method || 'GET';
        var dataToSend = data || {};

        $http({ method: callMethod, url: url, data: dataToSend }).then(function(response) {
          defer.resolve(response);
        }, function(reject) {
          defer.reject();
          console.log('Error accessing the provided URL.');
        });

        return defer.promise;
      };

      /**
       * Sends data to a given URL, returns a promise with the status.
       **/
      var sendDataToURL = function(url, data) {
        var defer = $q.defer();

        $http({method: 'POST', url: url, data: data}).then(function(response) {
          defer.resolve(response);
        }, function(reject) {
          defer.reject();
          console.log('Error accessing the provided URL.');
        });

        return defer.promise;
      };

      $scope.init();
    }

    gridCtrl.$inject = ['$scope', '$element', '$attrs', '$rootScope', '$http', '$q', 'orderByFilter', 'confirmService', '$window'];

    return {
      scope: {
        gridProvider: '=',
        gridUrl: '@',
        fieldDefinition: '=',
        rowsPerPage: '@',
        strings: '=',
        idField: '@',
        linkId: '@',
        nameField: '@',
        disabledFields: '@',
        confirmClasses: '@'
      },
      restrict: 'E',
      templateUrl: 'components/directives/grid.html',
      controller: gridCtrl
    };
  }

  grid.$inject = ['$rootScope', '$http', '$q', 'orderByFilter', 'confirmService'];

  angular.module('nascar-app').directive('grid', grid);
}());