package smartR.plugin

import grails.converters.JSON
import groovy.json.JsonBuilder
import heim.session.SessionService
import org.apache.commons.io.FilenameUtils
import org.codehaus.groovy.grails.web.json.JSONArray
import org.codehaus.groovy.grails.web.json.JSONObject

class SmartRController {

    SessionService sessionService
    def smartRService
    def scriptExecutorService

    static layout = 'smartR'

    def index() {
        [
                scriptList: sessionService.availableWorkflows(),
                //legacyScriptList: sessionService.legacyWorkflows(), FIXME display rest original scripts
        ]
    }
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
            render template: "/heim/in${FilenameUtils.getBaseName(params.script).capitalize()}"
        }
    }

    /**
     *   Renders the input form for initial script parameters
     */
    def renderInput = {
        if (! params.script) {
            render 'Please select a script to execute.'
        } else {
            render template: "/smartR/in${FilenameUtils.getBaseName(params.script).capitalize()}"
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

        // list of required javascript files
        def scripts = [
                servletContext.contextPath + pluginContextPath + '/js/smartR/smartR.js'
        ]

        // list of required css files
        def styles = []

        JSONObject result = new JSONObject()
        JSONArray rows = new JSONArray()

        // for all js files
        for (file in scripts) {
            def m = [:]
            m["path"] = file.toString()
            m["type"] = "script"
            rows.put(m);
        }

        // for all css files
        for (file in styles) {
            def n = [:]
            n["path"] = file.toString()
            n["type"] = "css"
            rows.put(n);
        }
        result.put("success", true)
        result.put("totalCount", scripts.size())
        result.put("files", rows)

        render result as JSON;
    }
}
