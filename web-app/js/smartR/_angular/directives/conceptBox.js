//# sourceURL=conceptBox.js

'use strict';

window.smartRApp.directive('conceptBox', ['$rootScope', function($rootScope) {

    return {
        restrict: 'E',
        scope: {
            conceptGroup: '=',
            label: '@',
            tooltip: '@',
            min: '@',
            max: '@',
            type: '@'
        },
        templateUrl: $rootScope.smartRPath +  '/js/smartR/_angular/templates/conceptBox.html',
        link: function(scope, element) {
            var template_box = element[0].querySelector('.sr-drop-input'),
                template_btn = element[0].querySelector('.sr-drop-btn'),
                template_tooltip = element[0].querySelector('.sr-tooltip-dialog');

            // instantiate tooltips
            $(template_tooltip).tooltip({track: true, tooltipClass:"sr-ui-tooltip"});

            var _clearWindow = function() {
                $(template_box).children().remove()
            };

            var _getConcepts = function() {
                return $(template_box).children().toArray().map(function(childNode) {
                    return childNode.getAttribute('conceptid');
                });
            };

            var _activateDragAndDrop = function() {
                var extObj = Ext.get(template_box);
                var dtgI = new Ext.dd.DropTarget(extObj, {ddGroup: 'makeQuery'});
                dtgI.notifyDrop = dropOntoCategorySelection;
            };

            var typeMap = {
                hleaficon: 'HD',
                null: 'LD-categoric', // FIXME: alphaicon does not exist yet in transmartApp master branch
                valueicon: 'LD-numeric'
            };
            scope.containsOnly = function() {
                return $(template_box).children().toArray().every(function(childNode) {
                    return typeMap[childNode.getAttribute('setnodetype')] === scope.type;
                });
            };

            // activate drag & drop for our conceptBox and color it once it is rendered
            scope.$evalAsync(function() {
                _activateDragAndDrop();
            });

            // bind the button to its clearing functionality
            template_btn.addEventListener('click', function() {
                _clearWindow();
            });

            // this watches the childNodes of the conceptBox and updates the model on change
            new MutationObserver(function() {
                scope.conceptGroup = _getConcepts(); // update the model
                scope.$apply();
            }).observe(template_box, { childList: true });
        }
    };
}]);
