package smartR.plugin

import groovy.json.JsonBuilder
import org.apache.commons.io.FilenameUtils

class SmartRController {

    def smartRService
    def scriptExecutorService
    def eaeService

    def computeResults = {
        params.init = params.init == null ? true : params.init // defaults to true
        smartRService.runScript(params)
        render ''
    }

    def reComputeResults = {
        params.init = false
        redirect controller: 'SmartR',
                 action: 'computeResults', 
                 params: params
    }

    // For handling results yourself
    def renderResults = {
        params.init = false
        def (success, answer) = scriptExecutorService.getResults(params.cookieID)
        if (! success) {
            render new JsonBuilder([error: answer]).toString()
        } else {
            render answer.json // TODO: return json AND image
        }
    }

    // For (re)drawing the whole visualization
    def renderResultsInTemplate = {
        def (success, answer) = scriptExecutorService.getResults(params.cookieID)
        if (! success) {
            render answer
        } else {
            render template: "/visualizations/out${FilenameUtils.getBaseName(params.script)}",
                    model: [results: answer.json, image: answer.img.toString()]
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
        render template: '/eae/home', model:[ hpcScriptList: eaeService.hpcScriptList] }


}
