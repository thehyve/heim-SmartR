<r:require modules="smartR_correlation"/>
<r:layoutResources/>

%{--TODO: Implement with new framework--}%
%{--<select id="methodSelect" class='txt'>--}%
	%{--<option value="pearson">Pearson (Default)</option>--}%
	%{--<option value="kendall">Kendall</option>--}%
	%{--<option value="spearman">Spearman</option>--}%
%{--</select><br/>--}%
%{--<br/>--}%


<div class="heim-analysis-container">

    <div id="heim-tabs" style="margin-top: 25px;">

        <ul>
            <li class="heim-tab"><a href="#fragment-load"><span>Fetch</span></a></li>
            <li class="heim-tab"><a href="#fragment-preprocess"><span>Preprocess</span></a></li>
            <li class="heim-tab"><a href="#fragment-run"><span>Run</span></a></li>
        </ul>

        %{--========================================================================================================--}%
        %{--Load Data--}%
        %{--========================================================================================================--}%
        <div id="fragment-load">
            <table>
                <tr>
                    <td style='padding-right: 2em; padding-bottom: 1em'>
                        <div id='datapoints' class="queryGroupIncludeSmall"></div>
                        <input type="button" value="Clear Window" id="sr-datapoints-btn">
                    </td>
                    <td style='padding-right: 2em; padding-bottom: 1em'>
                        <div id='annotations' class="queryGroupIncludeSmall"></div>
                        <input type="button" value="Clear Window" id="sr-annotations-btn">
                    </td>
                </tr>
            </table>

            <button id="sr-btn-fetch-correlation" class="sr-action-button">Fetch Data</button>

            <hr class="sr-divider">

            %{--result--}%
            <div id="heim-run-output" class="sr-output-container"></div>
        </div>


        %{--========================================================================================================--}%
        %{--Preprocess--}%
        %{--========================================================================================================--}%
        <div id="fragment-preprocess">

        </div>

        %{--========================================================================================================--}%
        %{--Run Analysis--}%
        %{--========================================================================================================--}%
        <div id="fragment-run">
            <button id="sr-btn-run-correlation" class="sr-action-button">Create Correlation Plot</button>
        </div>

    </div>
</div>

<script>
	activateDragAndDrop('datapoints');
	activateDragAndDrop('annotations');

	function getSettings() {
	    return {method: jQuery('#methodSelect').val()};
	}
</script>

<g:javascript>
	smartR.initAnalysis('correlation');
</g:javascript>

<r:layoutResources/>
