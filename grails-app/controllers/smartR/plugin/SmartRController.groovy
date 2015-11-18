package smartR.plugin

import groovy.json.JsonBuilder
import grails.converters.JSON
import org.codehaus.groovy.grails.web.json.JSONArray
import org.codehaus.groovy.grails.web.json.JSONObject
import org.apache.commons.io.FilenameUtils

class SmartRController {

    def smartRService
    def scriptExecutorService
    def eaeService

    def computeResults = {
        params.init = params.init == null ? true : params.init // defaults to true
        def retCode = smartRService.runScript(params)
        render retCode.toString()
    }

    def reComputeResults = {
        params.init = false
        def retCode = smartRService.runScript(params)
        render retCode.toString()
    }

    // For handling results yourself
    def renderResults = {
        params.init = false
        def (success, results) = scriptExecutorService.getResults(params.cookieID)
        if (! success) {
            render new JsonBuilder([error: results]).toString()
        } else {
            render results.json // TODO: return json AND image
        }
    }

    // For (re)drawing the whole visualization
    def renderResultsInTemplate = {
        def (success, results) = scriptExecutorService.getResults(params.cookieID)
        if (! success) {
            render results
        } else {
            render template: "/visualizations/out${FilenameUtils.getBaseName(params.script)}",
                    model: [results: results.json, image: results.img.toString()]
        }
    }

    /**
    *   Renders the input form for initial script parameters
    */
    def renderInputDIV = {
        if (! params.script) {
            render 'Please select a script to execute.'
        } else {
            render template: "/smartR/in${FilenameUtils.getBaseName(params.script)}"
        }
    }

    def renderLoadingScreen = {
        render template: "/visualizations/outLoading"
    }


    /**
     *   Go to eTRIKS Analytical Engine
     */
    def goToEAEngine = {
        render template: '/eae/home', model:[ hpcScriptList: eaeService.hpcScriptList]
    }

    def loadScripts = {
        JSONObject result = new JSONObject()
        JSONObject script = new JSONObject()
        script.put("path", "${servletContext.contextPath}${pluginContextPath}/js/etriksEngines/engineSelection.js" as String)
        script.put("type", "script")
        result.put("success", true)
        result.put("files", new JSONArray() << script)
        render result as JSON;
    }
}
