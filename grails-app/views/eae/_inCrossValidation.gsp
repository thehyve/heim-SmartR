<mark>Step:</mark> Drop a High dimensional variable into this window.<br/>

<div id='description' class="txt">
    This Workflow triggers a cross validation workflow coupled with a model builder algrorithm.
</div>

<div id='highDimDataBox' class="txt">
    <table id="inputeDataTable">
        <tr>
            <td style='padding-right: 2em; padding-bottom: 1em'>
                <form method="post" action="">
                    <div id='highDimDataCV' class="queryGroupIncludeSmall"></div>
                </form>
                <input type="button" class='txt' onclick="clearVarSelection('highDimDataCV')" value="Clear Window">
                <input
                        id="submitCV"
                        class='txt flatbutton'
                        type="button"
                        value="Run CV"
                        onclick="triggerCV()"/>
            </td>
            <td style='padding-right: 2em; padding-bottom: 1em'>
                <div class="peCheckBox"></div>
                <input type="checkbox" id="addPE" checked> Do a pathway enrichment<br>
            </td>
        </tr>
    </table>
</div>
<br/>

<hr class="myhr"/>
<div id="cacheTableDiv">
    <table id="mongocachetable" class ="cachetable"></table>
    <div id="emptyCache">The Cache is Empty</div>
    <button type="button"
            value="refreshCacheDiv"
            onclick="refreshCVCache()"
            class="flatbutton">Refresh</button>
</div>

<script>
    var currentWorkflow = "cv";
    populateCacheDIV(currentWorkflow);
    activateDragAndDropEAE('highDimDataCV');

    function register() {
        registerConceptBoxEAE('highDimDataCV', [1, 2], 'hleaficon', 1, 1);
    }

    function triggerCV() {
        registerWorkflowParams(currentWorkflow);
        runWorkflow();
    }

    function refreshCVCache(){
        populateCacheDIV(currentWorkflow)
    }

    function customSanityCheck() {
        return true;
    }

    function cacheDIVCustomName(name){
        var holder =  $('<td/>');
        holder.html(name);
        return holder;
    }

    function customWorkflowParameters(){
        var data = [];
        var doEnrichement = $('#addPE').is(":checked");
        data.push({name: 'doEnrichment', value: doEnrichement});
        return data;
    }

    /**
     *   Display the result retieved from the cache
     *   @param jsonRecord
     */
    function buildOutput(jsonRecord){
        var _o = $('#eaeoutputs');

        var startdate = new Date(jsonRecord.StartTime.$date);
        var endDate = new Date(jsonRecord.EndTime.$date);
        var duration = (endDate - startdate)/1000

        _o.append($('<table/>').attr("id","cvtable").attr("class", "cachetable")
                .append($('<tr/>')
                        .append($('<th/>').text("Algorithm used"))
                        .append($('<th/>').text("Iterations step"))
                        .append($('<th/>').text("Resampling"))
                        .append($('<th/>').text("Computation time"))
        ));
        $('#cvtable').append($('<tr/>')
                        .append($('<td/>').text(jsonRecord.AlgorithmUsed))
                        .append($('<td/>').text(jsonRecord.NumberOfFeaturesToRemove*100 + '%'))
                        .append($('<td/>').text(jsonRecord.Resampling))
                        .append($('<td/>').text(duration+ 's'))
        );

        _o.append($('<div/>').attr('id', "cvPerformanceGraph"));


        var chart = scatterPlot()
                .x(function(d) {
                    return +d.x;
                })
                .y(function(d) {
                    return +d.y;
                })
                .height(250);
        
        d3.select('#cvPerformanceGraph').datum(formatData(jsonRecord.PerformanceCurve)).call(chart);
    }

</script>