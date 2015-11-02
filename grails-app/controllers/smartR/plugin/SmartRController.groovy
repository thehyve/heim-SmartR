package smartR.plugin

import groovy.json.JsonBuilder
import org.apache.commons.io.FilenameUtils

class SmartRController {

    def smartRService
    def eaeService


    /**
    *   Renders the actual visualization based on the chosen script and the results computed
    */
    def renderOutputDIV = {
        params.init = params.init == null ? true : params.init // defaults to true
        def (success, answer) = smartRService.runScript(params)
        if (! success) {
            render answer
        } else {
            print answer.json
            render template: "/visualizations/out${FilenameUtils.getBaseName(params.script)}",
                    model: [results: answer.json, image: answer.img.toString()]
        }
    }

    def updateOutputDIV = {
        params.init = false
        def (success, answer) = smartRService.runScript(params)
        if (! success) {
            render new JsonBuilder([error: answer]).toString()
        } else {
            render answer.json // TODO: return json AND image
        }
    }

    def recomputeOutputDIV = {
        params.init = false
        redirect controller: 'SmartR',
                 action: 'renderOutputDIV', 
                 params: params
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
