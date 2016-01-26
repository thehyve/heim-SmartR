//# sourceURL=correlationView.js

"use strict";

window.smartR.CorrelationView = function (controller, model) {

    var view = this, helper = HeimExtJSHelper;

    view.controller = controller;
    view.model = model;
    view.workflow = 'correlation';

    view.container = $('#heim-tabs');

    view.datapoints = {
        inputEl : $('#datapoints'),
        clearBtn : $('#sr-datapoints-btn')
    };

    view.annotations = {
        inputEl : $('#annotations'),
        clearBtn : $('#sr-annotations-btn')
    };

    view.fetchBoxplotBtn = $('#sr-btn-fetch-correlation');
    view.runBoxplotBtn = $('#sr-btn-run-correlation');

    view.init = function () {
        // init tabs
        view.container.tabs();
        bindUIActions();
    };

    var bindUIActions = function () {

        var _clearInputEl = function (event) {
            event.data.empty();
        };

        view.datapoints.clearBtn.on('click', view.datapoints.inputEl, _clearInputEl);
        view.annotations.clearBtn.on('click', view.annotations.inputEl, _clearInputEl);

        view.runBoxplotBtn.on('click', function () {
            view.controller.run();
        });

        view.fetchBoxplotBtn.on('click', function () {
            var strConcept1 = helper.readConceptVariables(view.datapoints.inputEl.attr('id'));
            // TODO get other concepts
            view.controller.fetch({
                conceptPaths: strConcept1,
                // CurrentSubsetIDs can contain undefined and null. Pass only nulls forward
                resultInstanceIds : GLOBAL.CurrentSubsetIDs.map(function (v) { return v || null; }),
                searchKeywordIds: ''
            }).done(function (d) {
                console.log(d);
            }).fail(function (jq, status, msg) {
                console.error(msg);
            });
        });

    };

    view.init();
};
