
<<<<<<< HEAD:web-app/js/smartR/_angular/directives/workflowTab.js
=======
console.log('Loading workflowTab...');
>>>>>>> AngularJSPort:grails-app/assets/javascripts/app/directives/workflowTab.js
window.smartRApp.directive('workflowTab', ['smartRUtils', function(smartRUtils) {
    return {
        restrict: 'E',
        scope: {
            name: '@tabName'
        },
        require: '^tabContainer',
        transclude: true,
        template: '<ng-transclude-replace></ng-transclude-replace>',
        link: function(scope, element, attrs, tabContainerCtrl) {
            var id = 'fragment-' + smartRUtils.makeSafeForCSS(scope.name);
            scope.id = id;
            element[0].id = id;
            tabContainerCtrl.addTab(scope);
        }
    };
}]);
