Numerical variables go here</br>
<div id='numericalVars' class="queryGroupIncludeSmall"></div>
<input type="button" class='txt' onclick="clearVarSelection('numericalVars')" value="Clear Window"><br/>
<br/>
Categorical variables go here<br/>
<div id='categoricalVars' class="queryGroupIncludeSmall"></div>
<input type="button" class='txt' onclick="clearVarSelection('categoricalVars')" value="Clear Window"><br/>
<br/>

<script>
	activateDragAndDrop('numericalVars');
	activateDragAndDrop('categoricalVars');

	function register() {
		registerConceptBox('numericalVars', [1], 'valueicon', 1, undefined);
		registerConceptBox('categoricalVars', [1], 'alphaicon', 0, undefined);
	}

	function getSettings() {
	    return {method: jQuery('#methodSelect').val()};
	}

	function customSanityCheck() {
		return true;
	}
</script>
