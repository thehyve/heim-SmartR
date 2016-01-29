<r:require modules="smartR_correlation"/>
<r:layoutResources/>

<div id='sr-conceptBox-data' class="queryGroupIncludeSmall"></div>
<input type="button" class='txt' onclick="clearVarSelection('sr-conceptBox-data')" value="Clear Window"><br/>
<br/>

<div id='sr-conceptBox-annotations' class="queryGroupIncludeSmall"></div>
<input type="button" class='txt' onclick="clearVarSelection('sr-conceptBox-annotations')" value="Clear Window"><br/>
<br/>

<select id="methodSelect" class='txt'>
	<option value="pearson">Pearson (Default)</option>
	<option value="kendall">Kendall</option>
	<option value="spearman">Spearman</option>
</select><br/>

<button id="sr-btn-fetch-correlation" class="sr-action-button">Fetch Data</button>

<r:layoutResources/>
