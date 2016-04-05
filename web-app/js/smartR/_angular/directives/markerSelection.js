//# sourceURL=markerSelection.js

'use strict';

window.smartRApp.directive('markerSelection', ['$rootScope', function($rootScope) {
  console.log('flag2');
  return {
    restrict: 'E',
    scope: {
      data: '='
    },
    templateUrl: $rootScope.smartRPath + '/js/smartR/_angular/templates/markerSelection.html',
    controller: function ($scope) {

      console.log($scope.data);
    }

  };
}]);
