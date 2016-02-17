
<<<<<<< HEAD:web-app/js/smartR/_angular/controllers/correlation.js
=======
console.log('Loading CorrelationController...');
>>>>>>> AngularJSPort:grails-app/assets/javascripts/app/controllers/correlation.js
window.smartRApp.controller('CorrelationController',
    ['$scope', 'smartRUtils', 'rServeService', function($scope, smartRUtils, rServeService) {

        // initialize service
        rServeService.startSession('correlation');

        // model
        $scope.conceptBoxes = {
            datapoints: [],
            annotations: []
        };
        $scope.scriptResults = {};
        $scope.params = {
            method: 'pearson'
        };
    }]);
