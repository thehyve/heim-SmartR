<mark>Step 1:</mark> Drop a high dimensional data node into this window.<br/>
<div id='mRNAData' class="queryGroupIncludeSmall"></div>
<input type="button" class='txt' onclick="clearVarSelection('mRNAData')" value="Clear Window"><br/>
<br/>

<script>
	activateDragAndDrop('mRNAData');

	function register() {
		registerConceptBox('mRNAData', [1, 2], 'hleaficon', 1, 1);
	}

	function getSettings() {
		return {};
	}

	function customSanityCheck() {
		return true;
	}
</script>