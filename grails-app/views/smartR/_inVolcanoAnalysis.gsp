<mark>Step 1:</mark> Drop a high dimensional data node into this window.<br/>
<div id='mRNAData' class="queryGroupIncludeSmall"></div>
<input type="button" class='txt' onclick="clearVarSelection('mRNAData')" value="Clear Window"><br/>
<br/>
<br/>
<input type="checkbox" id="discardNullGenes" checked> Discard features/genes with no identifier/name<br/>
<br/>

<script>
	activateDragAndDrop('mRNAData');

	function register() {
		registerConceptBox('mRNAData', [1, 2], 'hleaficon', 1, 1);
	}

	function getSettings() {
		var settings = {discardNullGenes: jQuery('#discardNullGenes').is(':checked') ? 1 : 0};
		return settings;
	}

	function customSanityCheck() {
		if (isSubsetEmpty(1) || isSubsetEmpty(2)) {
			alert('You need to specify two subsets in the "Comparison" tab to execute this workflow.');
			return false;
		}
		return true;
	}
</script>