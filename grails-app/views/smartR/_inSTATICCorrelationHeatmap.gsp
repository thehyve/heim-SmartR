Numerical variables go here.<br/>
<div id='numericVars' class="queryGroupIncludeSmall"></div>
<input type="button" class='txt' onclick="clearVarSelection('numericVars')" value="Clear Window"><br/>
<br/>
Choose a method for the correlation analysis.<br/>
<select id="methodSelect" class='txt'>
	<option value="pearson">Pearson (Default)</option>
	<option value="kendall">Kendall</option>
	<option value="spearman">Spearman</option>
</select><br/>

<script>
	activateDragAndDrop('numericVars');

	function register() {
		registerConceptBox('numericVars', [1], 'valueicon', 2, undefined);
	}

	function getSettings() {
		return {method: jQuery('#methodSelect').val()};
	}

	function customSanityCheck() {
		return true;
	}
</script>
