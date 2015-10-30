

// Panel item for the SmartR plugin
var etriksPanel = new Ext.Panel({
    id: 'etrikspanel',
    title: 'eTRIKS',
    region: 'center',
    split: true,
    height: 90,
    layout: 'fit',
    collapsible: true,
    autoScroll: true,
    tbar: new Ext.Toolbar({
        id: 'etriksToolbar',
        title: 'EAE',
        items: []
    }),
    autoLoad: {
        url: pageInfo.basePath + '/etriksEngines/landing',
        method: 'POST',
        evalScripts: false
    }
});

/**
 *   Renders the input form for entering the parameters for a visualization/script
 */
function gotToEngineDIV() {
    jQuery.ajax({
        url: pageInfo.basePath + '/EtriksEngines/renderEngine' ,
        type: "POST",
        timeout: '600000',
        data: {'engine': jQuery('#engineSelect').val()}
        }).done(function(serverAnswer) {
        jQuery("#index").html(serverAnswer);
        }).fail(function() {
        jQuery("#index").html("AJAX CALL FAILED!");
    });
}