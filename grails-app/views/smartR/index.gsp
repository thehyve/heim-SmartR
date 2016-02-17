<!doctype html>

<html ng-app="smartRApp">
    <head>
        <asset:stylesheet href="smartR.css"/>
        <asset:javascript src="app.js"/>
    </head>

    <body>
        <h1 style="font-size: 20px; padding: 5px">SmartR - Dynamic Data Visualization and Interaction</h1>
        <div align="center">
            <div class="sr-landing-dropdown" align="center">
                <button class="sr-landing-dropBtn">SmartR Workflows</button>
                <div class="sr-landing-dropdown-content"></div>
            </div>
        </div>
        <hr/>
        <hr/>
        <div id="inputDIV"></div>

        <script>
            jQuery(document).ready(function() {
                ${scriptList}.each(function (workflow) {
                    jQuery('.sr-landing-dropdown-content').append('<span onclick="changeInputDIV(\'' + workflow + '\')">' + workflow.capitalize() + '</span>')
                });
            });
        </script>
    </body>
</html>



