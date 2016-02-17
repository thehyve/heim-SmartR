
<<<<<<< HEAD:web-app/js/smartR/_angular/directives/ngTranscludeReplace.js
=======
console.log('Loading ngTranscludeReplace...');
>>>>>>> AngularJSPort:grails-app/assets/javascripts/app/directives/ngTranscludeReplace.js
window.smartRApp.directive('ngTranscludeReplace', ['$log', function ($log) {
    return {
        terminal: true,
        restrict: 'EA',

        link: function ($scope, $element, $attr, ctrl, transclude) {
            if (!transclude) {
                $log.error('orphan',
                    'Illegal use of ngTranscludeReplace directive in the template! ' +
                    'No parent directive that requires a transclusion found. ');
                return;
            }
            transclude(function (clone) {
                if (clone.length) {
                    $element.replaceWith(clone);
                }
                else {
                    $element.remove();
                }
            });
        }
    };
}]);
