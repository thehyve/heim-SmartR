//# sourceURL=heatmap.js

<<<<<<< HEAD:web-app/js/smartR/_angular/controllers/heatmap.js
'use strict';

=======
console.log('Loading HeatmapController...');
>>>>>>> AngularJSPort:grails-app/assets/javascripts/app/controllers/heatmap.js
window.smartRApp.controller('HeatmapController',
    ['$scope', 'smartRUtils', 'rServeService', function($scope, smartRUtils, rServeService) {

        // initialize service
        rServeService.startSession('heatmap');

        // model
        $scope.conceptBoxes = {
            highDimensional : [],
            numerical : [],
            categorical : []
        };

        $scope.fetchSummary = {
            img : {},
            json : {}
        };

        $scope.scriptResults = {};
        $scope.params = {};

    }]);
