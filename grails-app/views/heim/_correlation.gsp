<r:require module="smartR_correlation"/>
<r:layoutResources disposition="head"/>

<div ng-controller="CorrelationController">

    <tab-container>

        <workflow-tab tab-name="Fetch Data">
            <concept-box concept-group="conceptBoxes.datapoints"></concept-box>
            <concept-box concept-group="conceptBoxes.annotations"></concept-box>
            <br/>
            <br/>
            <fetch-button concept-map="conceptBoxes"></fetch-button>
        </workflow-tab>

        <workflow-tab tab-name="Run Analysis">
            <select ng-model="params.method">
                <option value="pearson">Pearson (Default)</option>
                <option value="kendall">Kendall</option>
                <option value="spearman">Spearman</option>
            </select>

            <br/>
            <br/>
            <run-button button-name="Create Plot"
                        store-results-in="scriptResults"
                        script-to-run="run"
                        arguments-to-use="params"></run-button>
            <br/>
            <br/>
            <correlation-plot data="scriptResults" width="1200" height="1200"></correlation-plot>
        </workflow-tab>

    </tab-container>

</div>

<r:layoutResources disposition="defer"/>