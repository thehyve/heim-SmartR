Categorical variables go here<br/>
<div id='categoricalVars' class="queryGroupIncludeSmall"></div>
<input type="button" class='txt' onclick="clearVarSelection('categoricalVars')" value="Clear Window"><br/>
<br/>

<script>
	activateDragAndDrop('categoricalVars');

	function register() {
		registerConceptBox('categoricalVars', [1], 'alphaicon', 1, undefined);
	}

	function getSettings() {
		return {};
	}

	function customSanityCheck() {
		return true;
	}
</script>
