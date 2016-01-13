function createD3Button(args) {
    var button = args.location.append('g');

    var box = button.append("rect")
    .attr("x", args.x)
    .attr("y", args.y)
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("width", args.width)
    .attr("height", args.height)
    .style('stroke-width', '1px')
    .style('stroke', '#009ac9')
    .style('fill', '#009ac9')
    .style('cursor', 'pointer')
    .on('mouseover', function() {
        box
        .transition()
        .duration(300)
        .style('fill', '#ffffff');

        text
        .transition()
        .duration(300)
        .style('fill', '#009ac9');
    })
    .on('mouseout', function() {
        box
        .transition()
        .duration(300)
        .style('fill', '#009ac9');

        text
        .transition()
        .duration(300)
        .style('fill', '#ffffff');
    })
    .on('click', function() { args.callback(); });

    var text = button.append('text')
    .attr('x', args.x + args.width / 2)
    .attr('y', args.y + args.height / 2)
    .attr('dy', '0.35em')
    .style('pointer-events', 'none')
    .style("text-anchor", "middle")
    .style('fill', '#ffffff')
    .style('font-size', '14px')
    .text(args.label);

    return button;
}

function createD3Switch(args) {
    var switcher = args.location.append('g');

    var checked = args.checked;
    var color = checked ? 'green' : 'red';

    var box = switcher.append("rect")
    .attr("x", args.x)
    .attr("y", args.y)
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("width", args.width)
    .attr("height", args.height)
    .style('stroke-width', '1px')
    .style('stroke', color)
    .style('fill', color)
    .style('cursor', 'pointer')
    .on('click', function() {
        if (color === 'green') {
            box
            .transition()
            .duration(300)
            .style('stroke', 'red')
            .style('fill', 'red');
            color = 'red';
            checked = false;
        } else {
            box
            .transition()
            .duration(300)
            .style('stroke', 'green')
            .style('fill', 'green');
            color = 'green';
            checked = true;
        }
        text.text(checked ? args.onlabel : args.offlabel);
        args.callback(checked);
    });

    var text = switcher.append('text')
    .attr('x', args.x + args.width / 2)
    .attr('y', args.y + args.height / 2)
    .attr('dy', '0.35em')
    .style('pointer-events', 'none')
    .style("text-anchor", "middle")
    .style('fill', '#ffffff')
    .style('font-size', '14px')
    .text(checked ? args.onlabel : args.offlabel);

    return switcher;
}

function createD3Dropdown(args) {
    function shrink() {
        dropdown.selectAll('.itemBox')
        .attr('y', args.y + args.height)
        .style('visibility', 'hidden');
        dropdown.selectAll('.itemText')
        .attr('y', args.y + args.height + args.height / 2)
        .style('visibility', 'hidden');
        itemHovered = false;
        hovered = false;
        itemHovered = false;
    }
    var dropdown = args.location.append('g');

    var hovered = false;
    var itemHovered = false;

    var itemBox = dropdown.selectAll('.itemBox')
    .data(args.items, function(item) { return item.label; });

    itemBox
    .enter()
    .append('rect')
    .attr('class', 'itemBox')
    .attr("x", args.x)
    .attr("y", args.y + args.height)
    .attr("rx", 0)
    .attr("ry", 0)
    .attr("width", args.width)
    .attr("height", args.height)
    .style('cursor', 'pointer')
    .style('stroke-width', '2px')
    .style('stroke', '#ffffff')
    .style('fill', '#E3E3E3')
    .style('visibility', 'hidden')
    .on('mouseover', function() {
        itemHovered = true;
        d3.select(this)
        .style('fill', '#009ac9');
    })
    .on('mouseout', function() {
        itemHovered = false;
        d3.select(this)
        .style('fill', '#E3E3E3');
        setTimeout(function() {
            if (! hovered && ! itemHovered) {
                shrink();
            }
        }, 50);
    })
    .on('click', function(d) {
        d.callback();
    });

    var itemText = dropdown.selectAll('.itemText')
    .data(args.items, function(item) { return item.label; });

    itemText
    .enter()
    .append('text')
    .attr('class', 'itemText')
    .attr('x', args.x + args.width / 2)
    .attr('y', args.y + args.height + args.height / 2)
    .attr('dy', '0.35em')
    .style('pointer-events', 'none')
    .style("text-anchor", "middle")
    .style('fill', '#000000')
    .style('font-size', '14px')
    .style('visibility', 'hidden')
    .text(function(d) { return d.label; });

    var box = dropdown.append("rect")
    .attr("x", args.x)
    .attr("y", args.y)
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("width", args.width)
    .attr("height", args.height)
    .style('stroke-width', '1px')
    .style('stroke', '#009ac9')
    .style('fill', '#009ac9')
    .on('mouseover', function() {
        if (hovered) {
            return;
        }
        dropdown.selectAll('.itemBox')
        .transition()
        .duration(300)
        .style('visibility', 'visible')
        .attr('y', function(d) {
            var pos;
            for (var i = 0; i < args.items.length; i++) {
                if (d.label === args.items[i].label) {
                    pos = i;
                }
            }
            return 2 + args.y + (pos + 1) * args.height;
        });

        dropdown.selectAll('.itemText')
        .transition()
        .duration(300)
        .style('visibility', 'visible')
        .attr('y', function(d) {
            var pos;
            for (var i = 0; i < args.items.length; i++) {
                if (d.label === args.items[i].label) {
                    pos = i;
                }
            }
            return 2 + args.y + (pos + 1) * args.height + args.height / 2;
        });

        hovered = true;
    })
    .on('mouseout', function() {
        hovered = false;
        setTimeout(function() {
            if (! hovered && ! itemHovered) {
                shrink();
            }
        }, 50);
        setTimeout(function() { // first check is not enough if animation interrupts it
            if (! hovered && ! itemHovered) {
                shrink();
            }
        }, 350);
    });

    var text = dropdown.append('text')
    .attr('class', 'buttonText')
    .attr('x', args.x + args.width / 2)
    .attr('y', args.y + args.height / 2)
    .attr('dy', '0.35em')
    .style('pointer-events', 'none')
    .style("text-anchor", "middle")
    .style('fill', '#ffffff')
    .style('font-size', '14px')
    .text(args.label);

    return dropdown;
}

function createD3Slider(args) {
    var slider = args.location.append('g');

    var lineGen = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("linear");

    var lineData = [
        {x: args.x, y: args.y + args.height},
        {x: args.x, y: args.y + 0.75 * args.height},
        {x: args.x + args.width, y: args.y + 0.75 * args.height},
        {x: args.x + args.width, y: args.y + args.height}
    ];

    var sliderScale = d3.scale.linear()
    .domain([args.min, args.max])
    .range([args.x, args.x + args.width]);

    slider.append('path')
    .attr('d', lineGen(lineData))
    .style('pointer-events', 'none')
    .style('stroke', '#009ac9')
    .style('stroke-width', '2px')
    .style('shape-rendering', 'crispEdges')
    .style('fill', 'none');

    slider.append('text')
    .attr('x', args.x)
    .attr('y', args.y + args.height + 10)
    .attr('dy', '0.35em')
    .style('pointer-events', 'none')
    .style("text-anchor", "middle")
    .style('fill', '#000000')
    .style('font-size', '9px')
    .text(args.min);

    slider.append('text')
    .attr('x', args.x + args.width)
    .attr('y', args.y + args.height + 10)
    .attr('dy', '0.35em')
    .style('pointer-events', 'none')
    .style("text-anchor", "middle")
    .style('fill', '#000000')
    .style('font-size', '9px')
    .text(args.max);

    slider.append('text')
    .attr('x', args.x + args.width / 2)
    .attr('y', args.y + args.height)
    .attr('dy', '0.35em')
    .style('pointer-events', 'none')
    .style("text-anchor", "middle")
    .style('fill', '#000000')
    .style('font-size', '14px')
    .text(args.label);

    var currentValue = args.init;

    function move() {
        var xPos = d3.event.x;
        if (xPos < args.x) {
            xPos = args.x;
        } else if (xPos > args.x + args.width) {
            xPos = args.x + args.width;
        }

        currentValue = Number(sliderScale.invert(xPos)).toFixed(5);

        dragger
        .attr('x', xPos - 20);
        handle
        .attr('cx', xPos);
        pointer
        .attr('x1', xPos)
        .attr('x2', xPos);
        value
        .attr('x', xPos + 10)
        .text(currentValue);
    }

    var drag = d3.behavior.drag()
    .on("drag", move)
    .on(args.trigger, function() { args.callback(currentValue); });

    var dragger = slider.append('rect')
    .attr('x', sliderScale(args.init) - 20)
    .attr('y', args.y)
    .attr('width', 40)
    .attr('height', args.height)
    .style('opacity', 0)
    .style('cursor', 'pointer')
    .on('mouseover', function() {
        handle
        .style('fill', '#009ac9');
        pointer
        .style('stroke', '#009ac9');
    })
    .on('mouseout', function() {
        handle
        .style('fill', '#000000');
        pointer
        .style('stroke', '#000000');
    })
    .call(drag);

    var handle = slider.append('circle')
    .attr("cx", sliderScale(args.init))
    .attr("cy", args.y + 10)
    .attr("r", 6)
    .style('pointer-events', 'none')
    .style('fill', '#000000');

    var pointer = slider.append('line')
    .attr('x1', sliderScale(args.init))
    .attr('y1', args.y + 10)
    .attr('x2', sliderScale(args.init))
    .attr('y2', args.y + 0.75 * args.height)
    .style('pointer-events', 'none')
    .style('stroke', '#000000')
    .style('stroke-width', '1px');

    var value = slider.append('text')
    .attr('x', sliderScale(args.init) + 10)
    .attr('y', args.y + 10)
    .attr('dy', '0.35em')
    .style('pointer-events', 'none')
    .style("text-anchor", "start")
    .style('fill', '#000000')
    .style('font-size', '10px')
    .text(args.init);

    return slider;
}

/**
*   Gets the x position of the mouse on the screen
*
*   @return {int}: x coordinate of the mouse
*/
function mouseX() {
    var mouseXPos = typeof d3.event.sourceEvent !== 'undefined' ? d3.event.sourceEvent.pageX : d3.event.clientX;
    return mouseXPos - jQuery('#etrikspanel').offset().left + jQuery('#index').parent().scrollLeft();
}

/**
*   Gets the y position of the mouse on the screen
*
*   @return {int}: y coordinate of the mouse
*/
function mouseY() {
    var mouseYPos = typeof d3.event.sourceEvent !== 'undefined' ? d3.event.sourceEvent.pageY : d3.event.clientY;
    return mouseYPos + jQuery("#index").parent().scrollTop() - jQuery('#etrikspanel').offset().top;
}

function showCohortInfo(){
    var cohortsSummary = '';

    for(var i = 1; i <= GLOBAL.NumOfSubsets; i++) {
        var currentQuery = getQuerySummary(i);
        if(currentQuery !== '') {
            cohortsSummary += "<br/>Subset " + i + ": <br/>";
            cohortsSummary += currentQuery;
            cohortsSummary += "<br/>";
        }
    }
    if (cohortsSummary === '') {
        cohortsSummary = '<br/>WARNING: No subsets have been selected! Please go to the "Comparison" tab and select your subsets.';
    }
    jQuery('#cohortInfo').html(cohortsSummary);
}
showCohortInfo();

function updateInputView() {
    if (typeof updateOnView === "function") {
        updateOnView();
    }
}

jQuery('#resultsTabPanel__etrikspanel').click(showCohortInfo);
jQuery('#resultsTabPanel__etrikspanel').click(updateInputView);

/**
*   Finds the maximum width of several drawn text elements
*
*   @param {[]} elements: array of already drawn text elements
*   @return {int}: maximal width of given elements
*/
function getMaxWidth(elements) {
    var MIN_SAFE_INTEGER = -(Math.pow(2, 53) - 1);
    var currentMax = MIN_SAFE_INTEGER;
    elements.each(function() {
        var len = this.getBBox().width;
        if (len > currentMax) {
            currentMax = len;
        }
    });
    return currentMax;
}

/**
*   Compares two arrays with each other
*
*   @param {[]} arr1: first array
*   @param {[]} arr2: second array
*   @return {bool}: true if arrays are equal, false otherwise
*/
function arrEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (var i = 0, len1 = arr1.length; i < len1; i++) {
        var found = false;
        for (var j = 0, len2 = arr2.length; j < len2; j++) {
            if (arr2[j] === arr1[i]) {
                found = true;
            }
        }
        if (! found) {
            return false;
        }
    }
    return true;
}

/**
*   Creates a special object which can be used for updating the cohorts
*
*   @param {string} ...: I suggest to just use your browser to check all parameters of such an element and copy them
*   @return {{}}: object containing specified constrains for cohort selection update
*/
function createQueryCriteriaDIV(conceptid, normalunits, setvaluemode, setvalueoperator, setvaluelowvalue, setvaluehighvalue, setvalueunits, oktousevalues, setnodetype) {
    return {
        conceptid : conceptid,
        conceptname : shortenConcept(conceptid),
        concepttooltip : conceptid.substr(1, conceptid.length),
        conceptlevel : '',
        concepttablename : "CONCEPT_DIMENSION",
        conceptdimcode : conceptid,
        conceptcomment : "",
        normalunits : normalunits,
        setvaluemode : setvaluemode,
        setvalueoperator : setvalueoperator,
        setvaluelowvalue : setvaluelowvalue,
        setvaluehighvalue : setvaluehighvalue,
        setvaluehighlowselect : "N",
        setvalueunits : setvalueunits,
        oktousevalues : oktousevalues,
        setnodetype : setnodetype,
        visualattributes : "LEAF,ACTIVE",
        applied_path : "@",
        modifiedNodePath : "undefined",
        modifiedNodeId : "undefined",
        modifiedNodeLevel : "undefined"
    };
}

/**
*   Updates the cohort selection in the Comparison tab of tranSMART
*
*   @param {[]} constrains: contains objects created by createQueryCriteriaDIV()
*   @param {boolean} andConcat: should constrains be added via OR or AND?
*   @param {boolean} negate: should constraints be including or excluding?
*   @param {boolean} reCompute: should the current visualization be recomputed after updating the cohorts? (for large db queries it is faster to just handle the update within the visualization itself)
*/
function setCohorts(constrains, andConcat, negate, reCompute, subset) {
    if (typeof appendItemFromConceptInto !== "function") {
        alert('This functionality is not available in the tranSMART version you use.');
        return;
    }
    if (! confirm("Attention! This action will have the following impact:\n1. Your cohort selection in the 'Comparison' tab will be modified.\n2. Your current analysis will be recomputed based on this selection.\n")) {
        return;
    }

    subset = subset === undefined ? 1 : subset;
    var destination = jQuery(jQuery("#queryTable tr:last-of-type td")[subset - 1]).find('div[id^=panelBoxList]').last();
    for (var i = 0, len = constrains.length; i < len; i++) {
        if (andConcat) {
            destination = jQuery(jQuery("#queryTable tr:last-of-type td")[subset - 1]).find('div[id^=panelBoxList]').last();
        }
        appendItemFromConceptInto(destination, constrains[i], negate);
    }
    if (reCompute) {
        runAllQueries(runAnalysis);
    }
}

/**
*   Shorten any path /A/B/.../X/Y/Z/ to /Y/Z
*
*   @param {string} concept: concept/path to shorten
*   @return {string}: shortened concept/path
*/
function shortenConcept(concept) {
    var splits = concept.split('\\');
    return splits[splits.length - 3] + '/' + splits[splits.length - 2];
}

/**
*   I copied this and have no idea what this does but activating drag and drop for a given div
*
*   @param {string} divName: name of the div element to activate drag and drop for
*/
function activateDragAndDrop(divName) {
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
*   Expands the settings of the form data for a given setting
*
*   @param data: form data recieved by prepareFormData()
*   @param settings: json like string representation of the settings we want to add
*   @return: data with added settings
*/
function addSettingsToData(data, settings) {
    for (var i = 0; i < data.length; i++) {
        var element = data[i];
        if (element.name == "settings") {
            var json = JSON.parse(element.value);
            json = jQuery.extend(json, settings);
            element.value = JSON.stringify(json);
            break;
        }
    }
    return data;
}

var conceptBoxes = [];
var sanityCheckErrors = [];
function registerConceptBox(name, cohorts, type, min, max) {
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

/**
*   Prepares data for the AJAX call containing all neccesary information for computation
*
*   @return {[]}: array of objects containing the information for server side computations
*/
function prepareFormData() {
    var data = [];
    data.push({name: 'conceptBoxes', value: JSON.stringify(conceptBoxes)});
    data.push({name: 'result_instance_id1', value: GLOBAL.CurrentSubsetIDs[1]});
    data.push({name: 'result_instance_id2', value: GLOBAL.CurrentSubsetIDs[2]});
    data.push({name: 'script', value: jQuery('#scriptSelect').val()});
    data.push({name: 'settings', value: JSON.stringify(getSettings())});
    data.push({name: 'cookieID', value: setSmartRCookie()});
    return data;
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

/**
*   Checks for general sanity of all parameters and decided which script specific sanity check to call
*
*   @return {bool}: returns true if everything is fine, false otherwise
*/
function sane() { // FIXME: somehow check for subset2 to be non empty iff two cohorts are needed
    if (isSubsetEmpty(1) && isSubsetEmpty(2)) {
        alert('No cohorts have been selected. Please drag&drop cohorts to the fields within the "Comparison" tab');
        return false;
    }

    if (jQuery("#scriptSelect").val() === '') {
        alert('Please select the algorithm you want to use!');
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

function setSmartRCookie() {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var crumbs = cookie.split('=');
        if (crumbs[0] === 'SmartR') {
            return crumbs[1];
        }
    }

    var id = new Date().getTime() + Math.floor((Math.random() * 9999999999) + 1000000000);
    document.cookie = 'SmartR=' + id;
    return id;
}

function setImage(divName, image) {
    function _arrayBufferToBase64( buffer ) {
        var binary = '';
        var bytes = new Uint8Array( buffer );
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        return window.btoa( binary );
    }

    var img = document.createElement('img');
    img.setAttribute('src', "data:image/png;base64," + _arrayBufferToBase64(image));
    document.getElementById(divName).appendChild(img);
}

function goToEAE() {
    jQuery.ajax({
        url: pageInfo.basePath + '/SmartR/goToEAEngine' ,
        type: "POST",
        timeout: '600000'
    }).done(function(response) {
        jQuery("#index").html(response);
    }).fail(function() {
        jQuery("#index").html("AJAX CALL FAILED!");
    });
}

function renderResultsInTemplate(callback, data) {
    jQuery.ajax({
        url: pageInfo.basePath + '/SmartR/renderResultsInTemplate',
        type: "POST",
        timeout: 1.8e+6,
        data: data
    }).done(function(response) {
        if (response === 'RUNNING') {
            setTimeout(renderResultsInTemplate(callback, data), 5000);
        } else {
            jQuery('#submitButton').prop('disabled', false);
            callback();
            jQuery("#outputDIV").html(response);
        }
    }).fail(function() {
        jQuery('#submitButton').prop('disabled', false);
        callback();
        jQuery("#outputDIV").html("Could not render results. Please contact your administrator.");
    });
}

function renderResults(callback, data) {
    jQuery.ajax({
        url: pageInfo.basePath + '/SmartR/renderResults',
        type: "POST",
        timeout: 1.8e+6,
        data: data
    }).done(function(response) {
        response = JSON.parse(response);
        if (response.error === 'RUNNING') {
            setTimeout(renderResults(callback, data), 5000);
        } else if (response.error) {
            jQuery('#submitButton').prop('disabled', false);
            alert(response.error);
        } else {
            jQuery('#submitButton').prop('disabled', false);
            callback(response);
        }
    }).fail(function() {
        jQuery('#submitButton').prop('disabled', false);
        alert("Server does not respond. Network connection lost?");
    });
}

function computeResults(callback, data, init, redraw) {
    callback = callback === undefined ? function() {} : callback;
    data = data === undefined ? prepareFormData() : data;
    init = init === undefined ? true : init;
    redraw = redraw === undefined ? true : redraw;

    var retCodes = {
        1: 'An unexpected error occured while initializing environment.',
        2: 'An unexpected error occured while accessing the database.',
        3: 'An unexpected error occured while processing the data.'
    };

    jQuery('#submitButton').prop('disabled', true);
    jQuery.ajax({
        url: pageInfo.basePath + '/SmartR/' + (init ? 'computeResults' : 'reComputeResults'),
        type: "POST",
        timeout: 1.8e+6,
        data: data
    }).done(function(response) {
        if (response === '0') { // successful
            if (redraw) {
                renderResultsInTemplate(callback, data);
            } else {
                renderResults(callback, data);
            }
        } else {
            if (init) {
                jQuery("#outputDIV").html('');
            }
            jQuery('#submitButton').prop('disabled', false);
            alert(retCodes[response]);
        }
    }).fail(function(_, __, error){
        if (redraw) {
            renderResultsInTemplate(callback, data);
        } else {
            renderResults(callback, data);
        }
    });
}

function showLoadingScreen() {
    jQuery.ajax({
        url: pageInfo.basePath + '/SmartR/renderLoadingScreen',
        type: "POST",
        timeout: 1.8e+6
    }).done(function(response) {
        jQuery("#outputDIV").html(response);
    }).fail(function() {
        jQuery("#outputDIV").html("Loading screen could not be initialized. Probably you lost network connection.");
    });
}

function runAnalysis() {
    conceptBoxes = [];
    sanityCheckErrors = [];
    register(); // method MUST be implemented by _inFoobarAnalysis.gsp

    if (! sane()) {
        return;
    }

    // if no subset IDs exist compute them
    if(!(isSubsetEmpty(1) || GLOBAL.CurrentSubsetIDs[1]) || !( isSubsetEmpty(2) || GLOBAL.CurrentSubsetIDs[2])) {
        runAllQueries(runAnalysis);
        return false;
    }
    showLoadingScreen();
    computeResults();
}

/**
*   Renders the input form for entering the parameters for a visualization/script
*/
function changeInputDIV() {
    jQuery("#outputDIV").html("");
    jQuery.ajax({
        url: pageInfo.basePath + '/SmartR/renderInputDIV',
        type: "POST",
        timeout: 1.8e+6,
        data: {'script': jQuery('#scriptSelect').val()}
    }).done(function(response) {
        jQuery("#inputDIV").html(response);
        updateInputView();
    }).fail(function() {
        jQuery("#inputDIV").html("Coult not render input form. Probably you lost network connection.");
    });
}

/**
*   Renders the input form for entering the parameters for a visualization/script
*/
function changeInput() {
    jQuery("#outputDIV").html("");
    jQuery.ajax({
        url: pageInfo.basePath + '/SmartR/renderInput',
        type: "POST",
        timeout: 1.8e+6,
        data: {'script': jQuery('#scriptSelect').val()}
    }).done(function(serverAnswer) {
        jQuery("#inputDIV").html(serverAnswer);
    }).fail(function() {
        jQuery("#inputDIV").html("Coult not render input form. Probably you lost network connection.");
    });
}

function contact() {
    var version = 0.4;
    alert("Before reporting a bug...\n" +
        "... 1. Make sure you use the lastet SmartR version (installed version: " + version + ")\n" +
        "... 2. Make sure that all requirements for using SmartR are met\n" +
        "All relevant information can be found on https://github.com/sherzinger/SmartR\n\n" +
        "If you still want to report a bug you MUST include these information:\n\n>>>" + navigator.userAgent + " SmartR/" + version + "<<<\n\nBug reports -> http://usersupport.etriks.org/\nFeedback -> sascha.herzinger@uni.lu");
}
