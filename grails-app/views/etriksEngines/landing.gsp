<style>
    .txt {
        font-family: 'Roboto', sans-serif;
    }

    #wrapper {
        width: 0%;
        margin: 0 auto;
        overflow: hidden;
    }

    #smartRDIV {
        float: left;
        background-color: #123456;
        color: #FFFFFF;
        width: 100px;
        height: 50px;
        text-align: center;
        font-size: 20px;
        vertical-align: middle;
    }

    #eAEDIV {
        float: left;
        background-color: #654321;
        color: #FFFFFF;
        width: 100px;
        height: 50px;
        text-align: center;
        vertical-align: middle;
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
    <!-- <div id="wrapper">
        <div id="smartRDIV">SmartR</div> <div id="eAEDIV">eAE</div>
    </div> -->

    <div id="outputDIV" class='txt'></div>
</body>
