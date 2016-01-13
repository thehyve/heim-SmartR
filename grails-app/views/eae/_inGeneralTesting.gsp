<mark>Make sure the project folder in the comparison tab is in the cohort selection.</mark> <br/>
<div id='clinicalData' class="txt">
    This Workflow triggers a generic analysis of the clinical variables.
</div>

<div id='selectedCohort' class="txt">
    %{--<script>--}%
        <td style='padding-right: 2em; padding-bottom: 1em'>
                <div id='studyToAnalyse' class="queryGroupInclude"></div>
                <input type="button" class='txt' onclick="clearVarSelection('studyToAnalyse')" value="Clear Window">
        </td>
        <input
            id="submitCV"
            class='txt'
            type="button"
            value="Run Genereal Testing"
            onclick="triggerGT()"/>
        %{--getClinicalMetaDataforEAE();--}%
    %{--</script>--}%
</div>
<br/>

<script>

    activateDragAndDropEAE('studyToAnalyse');

    registerConceptBoxEAE('studyToAnalyse', 1, 'studyicon', 0, undefined);

    function triggerGT() {
        jQuery("#outputs").html("AJAX CALL success!");
    }

    function cacheDIVCustomName(name){
        var holder =  $('<td/>');
        holder.html(name);
        return holder;
    }
</script>
