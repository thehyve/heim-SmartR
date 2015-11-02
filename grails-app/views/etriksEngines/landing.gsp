<style>
    .txt {
        font-family: 'Roboto', sans-serif;
    }
</style>

<head>
    <g:javascript library='jquery' />
    <g:javascript src='etriksEngines/engineSelection.js' />
    <link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>
    <r:layoutResources/>
</head>

<body>
    <div id="index" style="text-align: center">
        <h1 class="txt"> Welcome to eTRIKS Analytics!</h1>
        <span style='color:#0200ff' class='txt'>Please select which engine you want to use.</span><br/>
        <hr class="myhr"/>
        <g:select
            name="engineSelect"
            class='txt'
            from="${engineList}"
            noSelection="['':'Choose an engine']"
            onchange="gotToEngineDIV()"/>
        &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp
    </div>

    <div id="outputDIV" class='txt'></div>
</body>
