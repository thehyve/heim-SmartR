<r:require modules="smartR_correlation"/>
<r:layoutResources/>

<div id='datapoints' class="queryGroupIncludeSmall"></div>
<input type="button" class='txt'  value="Clear Window" id="sr-datapoints-btn">
<br/>

<div id='annotations' class="queryGroupIncludeSmall"></div>
<input type="button" class='txt'  value="Clear Window" id="sr-annotations-btn">
<br/>

<select id="methodSelect" class='txt'>
	<option value="pearson">Pearson (Default)</option>
	<option value="kendall">Kendall</option>
	<option value="spearman">Spearman</option>
</select><br/>
<br/>

<button id="sr-btn-fetch-correlation" class="sr-action-button">Fetch Data</button>
<button id="sr-btn-run-correlation" class="sr-action-button">Run Boxplot</button>

%{--result--}%
<div id="heim-run-output" class="sr-output-container"></div>

<script>
	activateDragAndDrop('datapoints');
	activateDragAndDrop('annotations');

	function register() {
		registerConceptBox('datapoints', [1], 'valueicon', 2, 2);
		registerConceptBox('annotations', [1], 'alphaicon', 0, undefined);
	}

	function getSettings() {
	    return {method: jQuery('#methodSelect').val()};
	}

	function customSanityCheck() {
		return true;
	}
</script>

<g:javascript>
	smartR.initAnalysis('correlation');
</g:javascript>

<r:layoutResources/>
