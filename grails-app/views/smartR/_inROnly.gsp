<div id='datapoints' class="queryGroupIncludeSmall"></div>
<input type="button" class='txt' onclick="clearVarSelection('datapoints')" value="Clear Window"><br/>
<br/>

<script>
	activateDragAndDrop('datapoints');

	function register() {
		registerConceptBox('datapoints', [1], 'valueicon', 2, 2);
	}

	function getSettings() {
		return {};
	}

	function customSanityCheck() {
		return true;
	}
</script>
