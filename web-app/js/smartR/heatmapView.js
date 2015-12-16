//# sourceURL=heatmapView.js

'use strict';

/**
 * Heatmap View
 */
var HeatmapView = (function(){
    var heatmapService, extJSHelper;

    var view = {
        container : jQuery('#heim-tabs'),
        fetchDataView : {
            conceptPathsInput : jQuery('#divIndependentVariable'),
            identifierInput   : jQuery('#heim-input-txt-identifier'),
            listIdentifiers   : jQuery('#heim-input-list-identifiers'),
            actionBtn         : jQuery('#heim-btn-fetch-data'),
            clearBtn          : jQuery('#heim-btn-clear'),
            checkStatusBtn    : jQuery('#heim-btn-check'),
            getResultBtn      : jQuery('#heim-btn-get-output'),
            outputArea        : jQuery('#heim-fetch-data-output')
        },
        preprocessView : {
            aggregateProbesChk : jQuery('#chkAggregateProbes'),
            preprocessBtn      : jQuery('#heim-btn-preprocess-heatmap')
        },
        runHeatmapView : {
            maxRowInput          : jQuery('#txtMaxRow'),
            clusteringOptionsDiv : jQuery('#clusteringOptionsDiv'),
            methodSelect         : jQuery('[name=rankCriteria]'),
            noClustersDiv        : jQuery('#noOfClustersDiv'),
            noMarkersDiv         : jQuery('#noOfMarkersDiv'),
            sortingSelect        : jQuery('[name=sortingSelect]'),
            runAnalysisBtn       : jQuery('#heim-btn-run-heatmap'),
            snapshotImageBtn     : jQuery('#heim-btn-snapshot-image'),
            downloadFileBtn      : jQuery('#heim-btn-download-file')
        }
    };

    var _renderBiomarkersList = (function() {
        var tpl = new Ext.XTemplate(
            '<tpl if="Object.getOwnPropertyNames(items).length &gt; 0">',
                '<ul>',
                    '<tpl for="items">',
                        '<li>',
                            '<div>',
                                '<span class="identifier-type">{type}</span> ',
                                '<span class="identifier-name">{name}</span> ',
                                '<span class="identifier-synonyms">{synonyms}</span>',
                            '</div>',
                            '<button class="identifier-delete" value="{id}">\u2716</button> ',
                        '</li>',
                    '</tpl>',
                '</ul>',
            '</tpl>'
        );

        return function _renderBiomarkersList() {
            tpl.overwrite(view.fetchDataView.listIdentifiers[0], {
                items: this.getBioMarkers()
            });
        };
    })();

    var bioMarkersModel = new BioMarkersModel();
    bioMarkersModel.on('biomarkers', _renderBiomarkersList);
    view.fetchDataView.listIdentifiers.on('click', 'button', function(ev) {
        bioMarkersModel.removeBioMarker(jQuery(this).val());
    });

    /**
     *
     * @param fetchDataView
     * @returns {{conceptPath: *, identifier: *, resultInstanceId: *}}
     * @private
     */
    var _getFetchDataViewValues = function (v) {
        var _conceptPath = extJSHelper.readConceptVariables(v.conceptPathsInput.attr('id'));
        return {
            conceptPaths: _conceptPath,
            // CurrentSubsetIDs can contain undefined and null. Pass only nulls forward
            resultInstanceIds : GLOBAL.CurrentSubsetIDs.map(function (v) { return v || null; }),
            searchKeywordIds: Object.getOwnPropertyNames(bioMarkersModel.selectedBioMarkers),
        };
    };

    var _getRunHeatmapViewValues = function (v) {
        // get max_rows
        var _maxRows = v.maxRowInput.val();
        var _sortingType = v.sortingSelect.filter(':checked').val();
        var _ranking = v.methodSelect.filter(':checked').val();
        return {
            max_rows : _maxRows,
            sorting: _sortingType,
            ranking: _ranking
        }
    };

    var _getPreprocessViewValues = function (v) {
        // get max_rows
        var _aggregate = v.aggregateProbesChk.is(":checked");
        return {
            aggregate : _aggregate
        }
    };

    /**
     * Fetch data
     * @param rid
     * @private
     */
    var _fetchDataAction = function () {
        var _fetchDataParams =  _getFetchDataViewValues(view.fetchDataView);
        heatmapService.fetchData(_fetchDataParams);
    };

    var _runHeatmapAction = function (eventObj) {
        var _runHeatmapInputArgs =  _getRunHeatmapViewValues(view.runHeatmapView);
        jQuery('#heatmap').empty();
        view.runHeatmapView.snapshotImageBtn.attr('disabled', 'disabled');
        view.runHeatmapView.downloadFileBtn.attr('disabled', 'disabled');
        console.log(_runHeatmapInputArgs);
        heatmapService.runAnalysis(_runHeatmapInputArgs)
            .then(function(data) {
                SmartRHeatmap.create(data.heatmapData);

                view.runHeatmapView.snapshotImageBtn.removeAttr('disabled');
                view.runHeatmapView.downloadFileBtn.removeAttr('disabled');

                if (data.markerSelectionData) {
                    view.appendSelectionTable({
                        entries: data.markerSelectionData
                    })
                }
            });
    };

    var _preprocessAction = function (eventObj) {
        var _preprocessInputArgs =  _getPreprocessViewValues(view.preprocessView);
        heatmapService.preprocess(_preprocessInputArgs);
    };

    /**
     * Register event handlers
     * @private
     */
    var _registerEventHandlers = function () {

        // init tabs
        view.container.tabs();

        // fetch data btn
        view.fetchDataView.actionBtn.click(
            view.fetchDataView,
            function () {
                for (var i = 1; i <= GLOBAL.NumOfSubsets; i++) {
                    if (!isSubsetEmpty(i) && !GLOBAL.CurrentSubsetIDs[i]) {
                        runAllQueries(_fetchDataAction);
                        return;
                    }
                }

                _fetchDataAction();
            }
        );

        // register preprocess btn action
        view.preprocessView.preprocessBtn.click(
            view.preprocessView,
            _preprocessAction
        );

        // on change handler
        view.runHeatmapView.methodSelect.on('change', function() {
            if( !(this.value === 'none') ){
                view.runHeatmapView.clusteringOptionsDiv.show();
                view.runHeatmapView.noMarkersDiv.hide();
                view.runHeatmapView.noClustersDiv.hide();
                if(this.value === 'marker-selection'){
                    view.runHeatmapView.noMarkersDiv.show();
                }
                else if(this.value === 'k-means-clustering'){
                    view.runHeatmapView.noClustersDiv.show();
                }
            } else {
                view.runHeatmapView.clusteringOptionsDiv.hide();
            }
        });

        // download data button
        view.runHeatmapView.downloadFileBtn.click(
            function() {
                view.runHeatmapView.downloadFileBtn.attr('disabled', 'disabled');
                heatmapService.downloadData();
            }
        );

        // download data button
        view.runHeatmapView.downloadFileBtn.click(
            function() {
                view.runHeatmapView.downloadFileBtn.attr('disabled', 'disabled');
                heatmapService.downloadData();
            }
        );


        // identifiers autocomplete
        var _identifierItemTemplate = new Ext.XTemplate(
            '<li class="ui-menu-item" role="presentation">',
                '<a class="ui-corner-all">',
                    '<span class="category-gene">{display}&gt;</span>&nbsp;',
                    '<b>{keyword}</b>&nbsp;{synonyms}',
                '</a>',
            '</li>'
        );
        view.fetchDataView.identifierInput.autocomplete({
            source: function(request, response) {
                var term = request.term;
                if (term.length < 2) {
                    return function() {
                        return response({rows: []});
                    };
                }
                return heatmapService.getIdentifierSuggestions(
                    bioMarkersModel,
                    term,
                    function(grailsResponse) {
                        // convert Grails response to what jqueryui expects
                        // grails response looks like this:
                        // { "id": 1842083, "source": "", "keyword": "TPO", "synonyms":
                        // "(TDH2A, MSA, TPX)", "category": "GENE", "display": "Gene" }
                        var r = grailsResponse.rows.map(function(v) {
                            return {
                                label: v.keyword,
                                value: v
                            }
                        });
                        return response(r);
                    });
            },

            minLength: 2
        });
        view.fetchDataView.identifierInput.data('autocomplete')._renderItem = function(ul, item) {
            return jQuery(_identifierItemTemplate.append(ul[0], item.value));
        };
        view.fetchDataView.identifierInput.on('autocompleteselect',
            function(event, ui) {
                var v = ui.item.value;
                bioMarkersModel.addBioMarker(v.id, v.display, v.keyword, v.synonyms);
                this.value = '';
                return false;
            });
        view.fetchDataView.identifierInput.on('autocompletefocus',
            function(event, ui) {
                var v = ui.item.value;
                this.value = v.display + ' ' + v.keyword;
                return false;
            });
        view.fetchDataView.identifierInput.on('autocompleteclose',
            function() { this.value = ''; });

        view.fetchDataView.clearBtn.click(view.clearConceptPathInput);

        // TODO Remove this, it's unused
        view.fetchDataView.checkStatusBtn.click(heatmapService.checkStatus);

        view.runHeatmapView.runAnalysisBtn.click (
            view.runHeatmapView,
            _runHeatmapAction
        );

        view.runHeatmapView.snapshotImageBtn.click(
            function() {
                return jQuery('#visualization svg')[0];
            },
            heatmapService.downloadSVG);
    };

    view.clearConceptPathInput = function (eventObj) {
        extJSHelper.clear(view.fetchDataView.conceptPathsInput);
    };

    view.appendSelectionTable = function(data) {
        var tmpl = jQuery.templates('#marker-selection-table-tmp');
        var table = tmpl.render(data);
        jQuery('#heatmap').append(table);
        jQuery('#markerSelectionTable').tablesorter();
    }

    /**
     * Initialize helper
     * @param service
     * @param helper
     */
    view.init = function (service, helper) {
        // instantiate tooltips
        jQuery( "[title]" ).tooltip({track: true, tooltipClass:"sr-ui-tooltip"});
        // injects dependencies
        heatmapService = service;
        extJSHelper = helper;
        // register dropzone
        extJSHelper.registerDropzone(view.fetchDataView.conceptPathsInput);
        // register event handles
        _registerEventHandlers();
        // init analysis
        heatmapService.initialize();
    };

    return view;
})();

HeatmapView.init(HeatmapService, HeimExtJSHelper);
