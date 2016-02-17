%{--<!doctype html>--}%

%{--<html ng-app="smartRApp">--}%
    %{--<head>--}%
        %{--<asset:stylesheet href="smartR.css"/>--}%
        %{--<asset:javascript src="app.js"/>--}%
    %{--</head>--}%

    %{--<body>--}%
        %{--<h1 style="font-size: 20px; padding: 5px">SmartR - Dynamic Data Visualization and Interaction</h1>--}%
        %{--<div align="center">--}%
            %{--<div class="sr-landing-dropdown" align="center">--}%
                %{--<button class="sr-landing-dropBtn">SmartR Workflows</button>--}%
                %{--<div class="sr-landing-dropdown-content"></div>--}%
            %{--</div>--}%
        %{--</div>--}%
        %{--<hr/>--}%
        %{--<hr/>--}%
        %{--<div id="inputDIV"></div>--}%

        %{--<script>--}%
            %{--jQuery(document).ready(function() {--}%
                %{--${scriptList}.each(function (workflow) {--}%
                    %{--jQuery('.sr-landing-dropdown-content').append('<span onclick="changeInputDIV(\'' + workflow + '\')">' + workflow.capitalize() + '</span>')--}%
                %{--});--}%
            %{--});--}%
        %{--</script>--}%
    %{--</body>--}%
%{--</html>--}%



<asset:stylesheet href="smartR.css"/>
<asset:javascript src="app.js"/>
    </head>

<div id="index" style="padding: 10px;">

    <h1 class="txt"> SmartR - Dynamic Data Visualization and Interaction</h1>
    <br>
    <g:select name="scriptSelect" id="scriptSelect" class='txt' from="${scriptList}"
              noSelection="['':'Choose an algorithm']"
              onchange="changeInputDIV()" />
    %{--Input placeholder--}%
    <div id="inputDIV" style="margin-top: 20px;"></div>
    %{--<div id="index" style="text-align: center">--}%
    %{--<h1 class="txt"> SmartR - Dynamic data visualization and interaction.</h1>--}%
    %{--<span style='color:red' class='txt'>Please be aware that this software is currently in a TESTING phase and all results should be handled with care.</span><br/>--}%
    %{--<span style='color:red' class='txt'>You can help improving SmartR by reporting bugs or providing the developer with (highly appreciated!) feedback.</span><br/>--}%
    %{--<input id="contactButton" class='txt' type="button" value="Contact Developer" onclick="contact()"/>--}%
    %{--<span style='color:red' class='txt'></span><br/>--}%
    %{--<hr class="myhr"/>--}%

    %{--<div id="inputDIV" class='txt' style="text-align: left">Please select a script to execute.</div>--}%

    %{--<hr class="myhr"/>--}%
    %{--<g:select name="scriptSelect" class='txt' from="${scriptList}" noSelection="['':'Choose an algorithm']" onchange="changeInputDIV()"/>--}%
    %{--&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp--}%
    %{--<input id="submitButton" class='txt' type="button" value="(Re-)Run Analysis" onclick="computeResults()"/>--}%
    %{--<hr class="myhr"/>--}%
</div>

%{--Output placeholder--}%
<div id="outputDIV" style="margin-top: 20px;"></div>
