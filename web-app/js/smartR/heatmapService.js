//# sourceURL=heatmapService.js
'use strict';

/**
 * Heatmap Service
 */

window.HeatmapService = (function(){
    var CHECK_DELAY = 1000;
    var PROJECTION = 'log_intensity';

    var HEATMAP_DATA_FILE = 'heatmap.json';
    var MARKER_SELECTION_TABLE_FILE = 'markerSelectionTable.json';

    var NOOP_ABORT = function() {};

    var service = {
        currentRequestAbort: NOOP_ABORT,
        lastFetchedLabels: []
    };

    var _setStatusRequestTimeout = function() {
        var timeout = setTimeout.apply(undefined, arguments)
        service.currentRequestAbort = function() {
            clearTimeout(timeout);
            service.currentRequestAbort = NOOP_ABORT;
        }
    };

    /* generate unique labels for the concept paths. It recursively resolves
     * clashes. */
    var _generateLabels = (function() {
        function throwIfDuplicates(arr) {
            var repeated =  arr.filter(function(el, index) {
                return arr.indexOf(el) !== index;
            });
            if (repeated.length > 0) {
                var error = new Error(
                    "Duplicate concept keys: " + repeated, 'dups');
                throw error;
            }
        }

        return function _generateLabels(arr) {
            throwIfDuplicates(arr);

            var n = 0;
            return arr.reduce(function(result, currentItem) {
                result['n' + n++] = currentItem;
                return result;
            }, {});
        };
    })();

    var _createAnalysisConstraints = function (params) {
        console.log(params);
        // params.conceptPaths are actually keys...
        var _retval = {
            conceptKeys : _generateLabels(params.conceptPaths.split(/\|/)),
            resultInstanceIds: params.resultInstanceIds,
            projection: PROJECTION
        };
        if (params['searchKeywordIds'].length > 0) {
            _retval.dataConstraints = {
                search_keyword_ids: {
                    keyword_ids: params['searchKeywordIds']
                }
            }
        }
        return  _retval;
    };

    /**
     * Create r-session id
     * @returns {*}
     */
    service.initialize = function () {
        // ajax call to session creation
        jQuery.ajax({
            url: pageInfo.basePath + '/RSession/create',
            type: 'POST',
            timeout: '30000',
            contentType: 'application/json',
            data : JSON.stringify( {
                workflow : 'heatmap'
            })
        }).done(function(response) {
            GLOBAL.HeimAnalyses = {
                type : 'heatmap',
                sessionId :response.sessionId
            };
            return GLOBAL.HeimAnalyses;
        }).fail(function() {
            // TODO: error displayed in a placeholder somewhere in main heim-analysis page
            console.error('Cannot create r-session');
            return null;
        });
    };

    /* TaskData
     * {
     *   taskType: (string),
     *   arguments: (object)
     *   executionId: (uuid),
     *   onUltimateSuccess: function (data) {},
     *   phase: (string) allows finding div id,
     *   progressMessage: (string),
     *   successMessage: (string)
     * }
     */

    var _divForPhase = function(phase) {
        return jQuery('#heim-' + phase + '-output');
    };

    var startScriptExecution = function(taskData) {
        service.currentRequestAbort();

        var runRequest = jQuery.ajax({
            url: pageInfo.basePath + '/ScriptExecution/run',
            type: 'POST',
            timeout: '30000',
            contentType: 'application/json',
            data: JSON.stringify({
                sessionId: GLOBAL.HeimAnalyses.sessionId,
                arguments: taskData.arguments,
                taskType : taskData.taskType,
                workflow : 'heatmap'
            })
        }).fail(function (jqXHR, textStatus, errorThrown) {
            var _err = JSON.parse(jqXHR.responseText);
            console.error(jqXHR);
            console.error(textStatus);
            console.error(errorThrown);
            // FIXME: should not write to this place
            _divForPhase(taskData.phase)
                .html('<p style="color: red";><b>Error:'+ errorThrown +'</b> <br> ' + _err.message + '</p>')
                .show();
        }).done(function(d) {
            taskData.executionId = d.executionId;
            service.checkStatus(taskData, CHECK_DELAY);
        });

        service.currentRequestAbort = function() { runRequest.abort(); };

        return runRequest;
    };

    var urlForFile = function(executionId, filename) {
        return pageInfo.basePath +
            '/ScriptExecution/downloadFile?sessionId=' +
            GLOBAL.HeimAnalyses.sessionId +
            '&executionId=' +
            executionId +
            '&filename=' +
            filename;
    };

    var downloadJsonFile = function(executionId, filename) {
        return jQuery.ajax({
            url: urlForFile(executionId, filename),
            dataType: 'json'
        });
    };

    /**
     * Fetch dat
     * @param eventObj
     */
    service.fetchData = function (params) {
        var _args = _createAnalysisConstraints(params);
        service.lastFetchedLabels = Object.keys(_args.conceptKeys);

        console.log('Analysis Constraints', _args);

        startScriptExecution({
            taskType: 'fetchData',
            arguments: _args,
            onUltimateSuccess: function (data) { service.getSummary('fetch'); },
            phase: 'fetch',
            progressMessage: 'Fetching data',
            successMessage: 'Data is successfully fetched in . Proceed with Run Heatmap'
        });
    };

    service.getSummary = function (phase) {
        console.log('About to get load data summary');

        var fileSuffixes;

        if (phase === 'preprocess') {
            fileSuffixes = ['all'];
        } else {
            fileSuffixes = service.lastFetchedLabels;
        }

        function getSummary_onUltimateSuccess(data) {
            var div = _divForPhase(this.phase);
            div.empty();
            fileSuffixes.forEach(function(label) {
                var filename = urlForFile(this.executionId,
                    this.phase + '_box_plot_node_' + label + '.png');
                var plot = jQuery('<img>').attr('src', filename);
                div.append(plot);
            }.bind(this));

            jQuery.when.apply(jQuery,
                fileSuffixes.map(function (label) {
                    return downloadJsonFile(
                        this.executionId,
                        this.phase + '_summary_stats_node_' + label + '.json');
                }.bind(this))
            ).done(function() {
                var _args = arguments;
                // if there is only one request, each element of arguments will be
                // not a 3-element array (where the data is the 1st), but each
                // of the items of the (single) 3-element array.
                if (_args[1] === 'success') {
                    _args = [_args];
                }
                Array.prototype.forEach.call(_args, function(ajaxCbArgs) {
                    var data = ajaxCbArgs[0];
                    var _summaryObj = service.generateSummaryTable(data);
                    div.append(_summaryObj);
                });
                div.show();
            });
        }

        var args = {
            phase: phase,
            projection: PROJECTION
        };

        startScriptExecution({
            taskType: 'summary',
            arguments: args,
            onUltimateSuccess: getSummary_onUltimateSuccess,
            phase: phase,
            progressMessage: 'Getting summary',
            successMessage: undefined,
        });
    };

    /**
     * Preprocess service
     * @param params
     */
    service.preprocess = function (params) {
        console.log('service.preprocess', params);

        startScriptExecution({
            taskType: 'preprocess',
            arguments: params,
            onUltimateSuccess: function (data, taskData) { service.getSummary('preprocess'); },
            phase: 'preprocess',
            progressMessage: 'Preprocessing'
        });
    };

    service.runAnalysis = function (params) {
        console.log('service.runAnalysis', params);
        var defer = jQuery.Deferred();

        function runAnalysisSuccess(data) {
            var ajaxCalls = [];
            ajaxCalls.push(downloadJsonFile(this.executionId, HEATMAP_DATA_FILE));
            if (data.result.artifacts.files.indexOf(MARKER_SELECTION_TABLE_FILE) != -1) {
                ajaxCalls.push(
                    downloadJsonFile(this.executionId, MARKER_SELECTION_TABLE_FILE));
            }

            jQuery.when.apply(jQuery, ajaxCalls)
                .done(function() {
                    var _args = arguments;
                    // see comment in the other .when call
                    if (_args[1] === 'success') {
                        _args = [_args];
                    }
                    defer.resolve({
                        heatmapData: _args[0][0], // ajax resolves with 3 args, 1st is data
                        markerSelectionData: _args[1] ? _args[1][0] : null
                    });
                })
                .fail(function() { defer.reject.apply(defer, arguments); });
        }

        startScriptExecution({
            taskType: 'run',
            arguments: params,
            onUltimateSuccess: runAnalysisSuccess,
            phase: 'run',
            progressMessage: 'Calculating',
            successMessage: undefined,
        });

        // having a "ultimateSuccess" event on the return of
        // startScriptExecution would be better
        return defer.promise();
    };

    service.generateSummaryTable = function (data) {
        // get template
        var rowTemplate = jQuery.templates('#summary-row-tmp');

        // initiate summary obj
        var _summaryObj = {summaryStat : []};

        // return null when there's no data from both subsets defined
        if (typeof data[0] === 'undefined' && typeof data[0] === 'undefined')
            return null;
        // use any available data
        var _data = typeof data[0] === 'undefined' ? data[1] : data[0];

        for (var key in _data) {
            if (_data.hasOwnProperty(key)) {
                _summaryObj.summaryStat.push({
                    key: key,
                    val1: (typeof data[0] === 'undefined') ? '-' : data[0][key],
                    val2: (typeof data[1] === 'undefined') ? '-' : data[1][key]
                });
            }
        }
        // return and render
        return rowTemplate.render(_summaryObj);
    };

    /**
     *
     * @param request
     * @param response
     */
    service.getIdentifierSuggestions = (function() {
        var curXHR = null;

        return function(model, term, response) {
            if (curXHR && curXHR.state() === 'pending') {
                console.log('Cancelling pending request')
                curXHR.abort();
            }

            curXHR = jQuery.get("/transmart/search/loadSearchPathways", {
                query: term
            })

            curXHR.always(function() { curXHR = null; })
            return curXHR.then(
                function(data) {
                    data = data.substring(5, data.length - 1);  // loadSearchPathways returns String with null (JSON).
                                                                // This strips it off
                    response(JSON.parse(data));
                },
                function() {
                    response({rows: []}); // response must be called even on failure
                }
            );
        };
    })();

    /**
     * Check status of a task
     * @param task
     */
    service.checkStatus = function(taskData, delay) {

        var div = _divForPhase(taskData.phase);

        div.show();
        div.html('<p class="sr-log-text"><span class="blink_me">_</span>' +
            taskData.progressMessage + ', please wait\u2026</p>');

        service.currentRequestAbort();

        var ajax = jQuery.ajax({
            type: 'GET',
            url : pageInfo.basePath + '/ScriptExecution/status',
            data: {
                sessionId  : GLOBAL.HeimAnalyses.sessionId,
                executionId: taskData.executionId
            }
        });

        service.currentRequestAbort = function() { ajax.abort(); };

        ajax.done(function (d) {
            console.log('Done checking', d);

            if (d.state === 'FINISHED') {
                if (taskData.successMessage) {
                    var _html = '<p class="heim-fetch-success" style="color: green";> ' +
                        taskData.successMessage + '</p>';
                    div.html(_html);
                } else {
                    div.hide();
                }

                taskData.onUltimateSuccess(d);
            } else if (d.state === 'FAILED') {
                var _errHTML = '<span style="color: red";>' + d.result.exception +'</span>';
                div.html(_errHTML);
                console.error('FAILED', d.result);
            } else {
                _setStatusRequestTimeout(service.checkStatus, delay, taskData, delay);
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            var _html = '<span style="color: red";>'+errorThrown+'</span>';
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
            div.html(_html);
        });
    };

    service.downloadSVG = function(event) {
        var serializer = new XMLSerializer();
        var xmlString = serializer.serializeToString(event.data());
        var blob = new Blob([xmlString], { type: 'image/svg+xml' });
        var svgBlobUrl = URL.createObjectURL(blob);
        var link = jQuery('<a/>')
            .attr('href', svgBlobUrl)
            .attr('download', 'heatmap.svg')
            .css('display', 'none');
        jQuery('body').append(link);
        link[0].click();
        link.remove();
        URL.revokeObjectURL(svgBlobUrl);
    };

    service.downloadData = function() {
        function downloadFile(data) {
            var link = jQuery('<a/>')
                .attr('href', urlForFile(this.executionId, 'analysis_data.zip'))
                .attr('download', 'heatmap_data.zip')
                .css('display', 'none');
            jQuery('body').append(link);
            link[0].click();
            link.remove();
        }

        startScriptExecution({
            taskType: 'downloadData',
            arguments: {},
            onUltimateSuccess: downloadFile,
            phase: 'run',
            progressMessage: 'Creating zip',
            successMessage: undefined,
        });
    }

    return service;
})();
