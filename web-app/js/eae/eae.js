/**
 *   Renders the input form for entering the parameters for a visualization/script
 */
function goToSmartRScript() {
    jQuery.ajax({
        url: pageInfo.basePath + '/eae/goToSmartR' ,
        type: "POST",
        timeout: '600000'
    }).done(function(serverAnswer) {
        jQuery("#index").html(serverAnswer);
    }).fail(function() {
        jQuery("#index").html("AJAX CALL FAILED!");
    });

    showCohortInfo();
}

/**
 *   Activating drag and drop for a given div
 *
 *   @param {string} divName: name of the div element to activate drag and drop for
 */
function activateDragAndDropEAE(divName) {
    var div = Ext.get(divName);
    var dtgI = new Ext.dd.DropTarget(div, {ddGroup: 'makeQuery'});
    dtgI.notifyDrop = dropOntoCategorySelection;
}

/**
 *   Clears drag & drop selections from the given div
 *
 *   @param {string} divName: name of the div element to clear
 */
function clearVarSelection(divName) {
    var div = Ext.get(divName).dom;
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
}

/**
 *   Returns the concepts defined via drag & drop from the given div
 *
 *   @param {string} divName: name of the div to get the selected concepts from
 *   @return {string[]}: array of found concepts
 */
function getConcepts(divName) {
    var div = Ext.get(divName);
    div = div.dom;
    var variables = [];
    for (var i = 0, len = div.childNodes.length; i < len; i++) {
        variables.push(div.childNodes[i].getAttribute('conceptid'));
    }
    return variables;
}

/**
 *   Checks whether the given div only contains the specified icon/leaf
 *
 *   @param {string} divName: name of the div to check
 *   @param {string} icon: icon type to look for (i.e. valueicon or hleaficon)
 *   @return {bool}: true if div only contains the specified icon type
 */
function containsOnly(divName, icon) {
    var div = Ext.get(divName).dom;
    for (var i = 0, len = div.childNodes.length; i < len; i++) {
        if (div.childNodes[i].getAttribute('setnodetype') !== icon &&
            icon !== 'alphaicon') { // FIXME: this is just here so SmartR works on the current master branch
            return false;
        }
    }
    return true;
}

var conceptBoxes = [];
var sanityCheckErrors = [];
function registerConceptBoxEAE(name, cohorts, type, min, max) {
    var concepts = getConcepts(name);
    var check1 = type === undefined || containsOnly(name, type);
    var check2 = min === undefined || concepts.length >= min;
    var check3 = max === undefined || concepts.length <= max;
    sanityCheckErrors.push(
        !check1 ? 'Concept box (' + name + ') contains concepts with invalid type! Valid type: ' + type :
            !check2 ? 'Concept box (' + name + ') contains too few concepts! Valid range: ' + min + ' - ' + max :
                !check3 ? 'Concept box (' + name + ') contains too many concepts! Valid range: ' + min + ' - ' + max : '');
    conceptBoxes.push({name: name, cohorts: cohorts, type: type, concepts: concepts});
}

var workflowSelected = "";
function registerWorkflowParams(workflow){
    workflowSelected = workflow.toUpperCase();
}

/**
 *   Prepares data for the AJAX call containing all neccesary information for computation
 *
 *   @return {[]}: array of objects containing the information for server side computations
 */
function prepareFormDataEAE(workflowSelected) {
    var data = customWorkflowParameters(); //method MUST be implemented by _inFoobarAnalysis.gsp
    data.push({name: 'workflow', value: workflowSelected});
    data.push({name: 'conceptBoxes', value: JSON.stringify(conceptBoxes)});
    data.push({name: 'result_instance_id1', value: GLOBAL.CurrentSubsetIDs[1]});
    data.push({name: 'result_instance_id2', value: GLOBAL.CurrentSubsetIDs[2]});
    return data;
}

/**
 *   Checks for general sanity of all parameters and decided which script specific sanity check to call
 *
 *   @return {bool}: returns true if everything is fine, false otherwise
 */
function saneEAE() { // FIXME: somehow check for subset2 to be non empty iff two cohorts are needed
    if (isSubsetEmpty(1) && isSubsetEmpty(2)) {
        alert('No cohorts have been selected. Please drag&drop cohorts to the fields within the "Comparison" tab');
        return false;
    }

    for (var i = 0; i < sanityCheckErrors.length; i++) {
        var sanityCheckError = sanityCheckErrors[i];
        if (sanityCheckError !== '') {
            alert(sanityCheckError);
            return false;
        }
    }
    return customSanityCheck(); // method MUST be implemented by _inFoobarAnalysis.gsp
}

/**
 *
 * @param eae
 * @returns {Array}
 */

function formatData(eae) {
    var data = [];
    for (var i = 0; i < eae.length; i++)
        data.push({
            x: eae[i][0],
            y: eae[i][1]
        })
    return data
}

/**
 *   Renders the input form for entering the parameters for a visualization/script
 */
function changeEAEInput(){
    jQuery("#eaeoutputs").html("");

    jQuery.ajax({
        url: pageInfo.basePath + '/eae/renderInputs',
        type: "POST",
        timeout: '600000',
        data: {'script': jQuery('#hpcscriptSelect').val()}
    }).done(function(serverAnswer) {
        jQuery("#eaeinputs").html(serverAnswer);
    }).fail(function() {
        jQuery("#eaeinputs").html("AJAX CALL FAILED!");
    });

}

/**
 * This function pulls all the available cache records for the user for the select workflow
 * @param currentworkflow - from the available eae workflows
 */
function populateCacheDIV(currentworkflow){
    var _t = $('#mongocachetable');
    _t.empty();
    _t.append($('<tr/>').attr("id", "headersRow"));

    var cacheTableHeaders = ["Query", "Date", "Status", "Cached Results"];
    var _h = $('#headersRow');
    $.each(cacheTableHeaders, function(i, e){
        _h.append($('<th/>').text(e))
    });

    jQuery.ajax({
        url: pageInfo.basePath + '/mongoCache/retrieveCachedJobs',
        type: "POST",
        data:{workflow: currentworkflow}
        }).done(function(cachedJobs) {
        var jsonCache= $.parseJSON(cachedJobs);

        if(jsonCache.totalCount == 0){
            jQuery("#mongocachetable").hide();
            jQuery("#emptyCache").show();
        }else {
            var date;
            jQuery("#mongocachetable").show();
            jQuery("#emptyCache").hide();
            $.each(jsonCache.jobs, function (i, e) {
                date = new Date(e.start.$date);
                var holder = cacheDIVCustomName(e.name); //method MUST be implemented by _inFoobarAnalysis.gsp
                _t.append($('<tr/>').append(holder).append(
                    $('<td/>').text(e.status)
                ).append(
                    $('<td/>').text(date)
                ).append(
                     $('<td/>').append($('<button/>').addClass('flatbutton').attr('data-button', e.name).on('click',function(){
                        var cacheQuery= $(this).attr('data-button');
                         showWorkflowOutput(currentworkflow,cacheQuery);
                     }).text("Result"))
                ))
            })
        }
    }).fail(function() {
        jQuery("#cacheTableDiv").html("AJAX CALL FAILED!");
    });
}

/**
 *
 * @param currentworkflow
 * @param cacheQuery
 */
function showWorkflowOutput(currentworkflow, cacheQuery){
    jQuery("#eaeoutputs").html("");

    jQuery.ajax({
        url: pageInfo.basePath + '/mongoCache/retrieveSingleCachedJob',
        type: "POST",
        data: prepareDataForMongoRetrievale(currentworkflow, cacheQuery)
    }).done(function(cachedJob) {
        var jsonRecord= $.parseJSON(cachedJob);
        buildOutput(jsonRecord);
        }
    )
}

function prepareDataForMongoRetrievale(currentworkflow, cacheQuery){
    var data ;
    switch (currentworkflow){
        case "pe":
            data = {workflow: currentworkflow, ListOfGenes:cacheQuery};
            return data;
        default :
            var tmpData = [];
            var splitTerms = cacheQuery.split('<br />');
            $.each(splitTerms, function(i, e){
                var chunk = e.split(':');
                tmpData.push(chunk[1].trim());
            });
            data = {workflow: currentworkflow, WorkflowData: tmpData[0], result_instance_id1: tmpData[1], result_instance_id2: tmpData[2]};
            return data;
    }
}

/**
 *   Run a pathway enrichment from the eae. I haven't integrated into the general workflow system as it runs slightly
 *   differently than the others. ( no cohort selection, used by the marker selection etc...)
 */
function runPE(list, selectedCorrection){
    jQuery.ajax({
        url: pageInfo.basePath + '/eae/runPEForSelectedGenes',
        type: "POST",
        data: {'genesList': list, 'selectedCorrection': selectedCorrection}
    }).done(function(serverAnswer) {
        var jsonAnswer= $.parseJSON(serverAnswer);
        if(jsonAnswer.iscached === "NotCached"){
            jQuery("#eaeoutputs").html(jsonAnswer.result);
        }else{
            buildOutput(jsonAnswer.result);
        }
    }).fail(function() {
        jQuery("#eaeoutputs").html("AJAX CALL FAILED!");
    });
}

/**
 * Generic workflow trigger
 * @returns {boolean}
 */

function runWorkflow(){
    conceptBoxes = [];
    sanityCheckErrors = [];
    workflowSelected = "";
    register();

    if(!saneEAE()){
     return false;
    }

    // if no subset IDs exist compute them
    if((!(isSubsetEmpty(1) || GLOBAL.CurrentSubsetIDs[1]) || !(isSubsetEmpty(2) || GLOBAL.CurrentSubsetIDs[2])) ) {
        runAllQueries(runWorkflow);
        return false;
    }
    console.log(workflowSelected)
    jQuery.ajax({
        url: pageInfo.basePath + '/eae/runWorkflow', //runCV
        type: "POST",
        data: prepareFormDataEAE(workflowSelected)
    }).done(function(serverAnswer) {
        var jsonAnswer= $.parseJSON(serverAnswer);
        if(jsonAnswer.iscached === "NotCached"){
            jQuery("#eaeoutputs").html(jsonAnswer.result);
        }else{
            buildOutput(jsonAnswer.result);
        }
    }).fail(function() {
        jQuery("#eaeoutputs").html("AJAX CALL FAILED!");
    });
}

/*****************************************************
 *
 *     D3 Section
 *
 ****************************************************/

function scatterPlot(){
    var margin = {
            top: 10,
            right: 25,
            bottom: 25,
            left: 40
        },
        width = 600,
        height = 400,
        raduis = 4,
        xValue = function(d) {
            return d[0];
        },
        yValue = function(d) {
            return d[1];
        },
        xScale = d3.scale.linear(),
        yScale = d3.scale.linear(),
        xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(6, 1);
    yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(6, 1);

    function chart(selection) {
        selection.each(function(data) {
            data = data.map(function(d, i) {
                return [xValue.call(data, d, i),
                    yValue.call(data, d, i)
                ];
            });

            xScale
                .domain(d3.extent(data, function(d) {
                    return d[0];
                }))
                .range([0, width - margin.left - margin.right]);

            yScale
                .domain([0, d3.max(data, function(d) {
                    return d[1];
                })])
                .range([height - margin.top - margin.bottom, 0]);

            var svg = d3.select(this).selectAll("svg").data([data]);

            var gEnter = svg.enter().append("svg").append("g");
            gEnter.append("g").attr("class", "points");
            gEnter.append("g").attr("class", "x axis");
            gEnter.append("g").attr("class", "y axis");

            // Update the outer dimensions.
            svg.attr("width", width)
                .attr("height", height);

            var g = svg.select("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            g.select("g.points")
                .selectAll("circles.point")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", "point")
                .attr("r", raduis)
                .attr("transform", function(d) {
                    return "translate(" + xScale(d[0]) + "," + yScale(d[1]) + ")";
                });

            g.select(".x.axis")
                .attr("transform", "translate(0," + yScale.range()[0] + ")")
                .call(xAxis);

            g.select(".y.axis")
                .attr("transform", "translate(0," + xScale.range()[0] + ")")
                .call(yAxis);
        });
    }

    function X(d) {
        return xScale(d[0]);
    }

    function Y(d) {
        return yScale(d[1]);
    }

    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    chart.x = function(_) {
        if (!arguments.length) return xValue;
        xValue = _;
        return chart;
    };

    chart.y = function(_) {
        if (!arguments.length) return yValue;
        yValue = _;
        return chart;
    };

    return chart;
}







