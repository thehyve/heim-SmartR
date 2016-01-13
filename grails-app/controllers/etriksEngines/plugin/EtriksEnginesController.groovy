package etriksEngines.plugin
import grails.converters.JSON
import org.codehaus.groovy.grails.web.json.JSONArray
import org.codehaus.groovy.grails.web.json.JSONObject

class EtriksEnginesController {

    def smartRService
    def eaeService

    /**
     *   Renders the default view
     */
    def landing = {
        def engineList = ['smartR', 'EAE'];
        render view: 'landing', model: [engineList: engineList]
    }

    /**
     *   Called to get the path to smartR.js such that the plugin can be loaded in the datasetExplorer
     */
    def loadScripts = {
        JSONObject result = new JSONObject()
        JSONObject script = new JSONObject()
        script.put("path", "${servletContext.contextPath}${pluginContextPath}/js/etriksEngines/engineSelection.js" as String)
        script.put("type", "script")
        result.put("success", true)
        result.put("files", new JSONArray() << script)
        render result as JSON;
    }


    /**
     *   Renders the input form for initial script parameters
     */
    def renderEngine = {
        if (! params.engine) {
            render 'Please select an engine to execute.'
        } else {
            if(params.engine == 'smartR'){
                render template: '/smartR/index', model:[ scriptList: smartRService.scriptList] }
            else{
                render template: '/eae/home', model:[ hpcScriptList: eaeService.hpcScriptList] }
        }
    }

}
