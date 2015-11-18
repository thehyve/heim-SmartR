package eae.plugin

import com.mongodb.BasicDBObject
import grails.plugins.rest.client.RestBuilder
import grails.transaction.Transactional
import org.apache.oozie.client.OozieClient

@Transactional
class EaeService {

    def mongoCacheService

    /**
     *   Renders the default view
     */
    def getHpcScriptList() {
        def scriptList = ['Cross Validation', 'Pathway Enrichment'] //['Cross Validation', 'GWAS - LP', 'Pathway Enrichment', 'General Testing']
        return scriptList
    }

    def scheduleOOzieJob(String OOZIE_URL, String JOB_TRACKER, String JOB_TRACKER_PORT, String NAMENODE, String NAMENODE_PORT, String workflow, workflowParameters){
        // get a OozieClient for local Oozie
        OozieClient wc = new OozieClient(OOZIE_URL);

        // create a workflow job configuration and set the workflow application path
        Properties conf = wc.createConfiguration();
        conf.setProperty(OozieClient.USER_NAME, "centos");
        conf.setProperty("jobTracker", JOB_TRACKER + ":" + JOB_TRACKER_PORT); // the port must match yarn.resourcemanager.address's
        conf.setProperty("nameNode", "hdfs://" + NAMENODE + ":" + NAMENODE_PORT)
        conf.setProperty(OozieClient.APP_PATH, "hdfs://"+ NAMENODE + ":" + NAMENODE_PORT + "/user/centos/worflows/" + workflow +"_workflow.xml");

        // setting workflow parameters
        workflowParameters.each{
            k, v -> conf.setProperty(k,v) }

        // submit and start the workflow job
        String jobId = wc.run(conf);

        return jobId;
    }

    def sparkSubmit(String scriptDir, String SparkURL, String worflowFileName, String dataFileName, String workflowSpecificParameters, String mongoDocumentID){
        def script = scriptDir +'executeSparkJob.sh'

        def scriptFile = new File(script)
        if (scriptFile.exists()) {
            if (!scriptFile.canExecute()) {
                scriptFile.setExecutable(true)
            }
        }else {
            log.error('The Script file spark submit wasn\'t found')
        }
        def executeCommand = script + " " + SparkURL + " " + worflowFileName + " " + dataFileName + " " + workflowSpecificParameters + " " + mongoDocumentID
        println(executeCommand)
        executeCommand.execute().waitFor()
        return 0
    }

    def customPreProcessing(params, workflow, MONGO_URL,MONGO_PORT,database,username){
        switch (workflow){
            case "cv":
                return cvPreprocessing(params, MONGO_URL,MONGO_PORT,database,username);
            case "gt":
                return gtPreprocessing(params); //TODO
            default:
                throw new Exception("The workflow in customPreProcessing doesn't exist.")
        }
    }

    private def cvPreprocessing(params, MONGO_URL,MONGO_PORT,database,username){
        def workflowParameters = [:]
        String mongoDocumentIDPE = "abcd0000" // fake mongoId
        String doEnrichement = "false"
        if( params.doEnrichment){
            mongoDocumentIDPE = mongoCacheService.initJob(MONGO_URL, MONGO_PORT, database, "pe", username, new BasicDBObject("ListOfGenes" , ""))
            doEnrichement = "true"
        }
        workflowParameters['algorithmToUse'] = "SVM";
        workflowParameters['kfold'] = "0.2";
        workflowParameters['resampling'] = "1";
        workflowParameters['numberOfFeaturesToremove'] = "0.5";
        workflowParameters['mongoDocIdPE'] = mongoDocumentIDPE.toString();
        workflowParameters['doEnrichement'] = doEnrichement;

        return workflowParameters;
    }


    def customPostProcessing(result, workflow) {

        switch (workflow){
            case "pe":
                return pePostProcessing(result);
            default:
                return result
        }
    }

    private def pePostProcessing(result){
        def topPathway = result.get('TopPathways').get(0).get(0)
        def url = "http://www.kegg.jp/pathway/" + topPathway;
        def listOfGenesIDs = result.get('ListOfGenesIDs').split(" ");

        for (int i = 0; i < listOfGenesIDs.size(); i++) {
            url += "+" + listOfGenesIDs[i]
        }

        def rest = new RestBuilder();
        def resp = rest.get(url);
        result.put("KeggHTML", resp.text);

        return result;
    }
}
