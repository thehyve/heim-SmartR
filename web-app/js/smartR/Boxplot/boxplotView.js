//# sourceURL=boxplotView.js

"use strict";

window.smartR.boxplotView = function(controller,
                                     model,
                                     components) {
    var view = {};

    view.container = $('#heim-tabs');

    /* initialization of view components */
    components.box1.init('concept1', 'sr-concept1-btn');
    components.box2.init('concept2', 'sr-concept2-btn');
    components.groups1.init('subsets1', 'sr-subset1-btn');
    components.groups2.init('subsets2', 'sr-subset2-btn');

    components.summaryStats.init('heim-fetch-output');

    components.downloadSvg.init('heim-run-output', 'heim-btn-snapshot-image', '#boxplot1 svg');
    /* END component instantiation */

    view.fetchBoxplotBtn = $('#sr-btn-fetch-boxplot');
    view.runBoxplotBtn = $('#sr-btn-run-boxplot');
    view.runOutputContainer = $('#heim-run-output');

    view.init = function() {

        controller.init(); // will create new r session

        //init tab
        view.container.tabs();  //jquery UI call to init tabs

        // bind ui
        bindUIActions();

        // watch model
        watchModel();
    };

    function bindUIActions() {
        view.fetchBoxplotBtn.on('click', function() {
            controller.fetch(model.getAllConcepts());
        });

        view.runBoxplotBtn.on('click', function() {
            controller.run();
        });
    }

    function watchModel() {
        model.on('runData', function() {
            view.runOutputContainer
                .empty()
                .append($('<div id="controls">'))
                .append($('<div id="boxplot1">'))
                .append($('<div id="boxplot2">'));
            window.SmartRBoxplot.create(model.getRunOutput());
        });

        /* activate run button only when we have variables loaded */
        model.on('loadedVariables', function() {
            view.runBoxplotBtn.prop('disabled',
                model.loadedVariables.length === 0);
        });
    }

    return view;
};
