package eae.plugin
import com.mongodb.BasicDBObject
import com.mongodb.MongoClient
import com.mongodb.client.MongoCollection
import com.mongodb.client.MongoCursor
import com.mongodb.client.MongoDatabase
import grails.transaction.Transactional
import groovy.json.JsonSlurper
import mongo.MongoCacheFactory
import org.bson.Document
import org.json.JSONArray
import org.json.JSONObject

@Transactional
class MongoCacheService {

    def retrieveValueFromCache(String mongoURL, String mongoPort, String dbName, String collectionName, BasicDBObject query) {

        MongoClient mongoClient = MongoCacheFactory.getMongoConnection(mongoURL,mongoPort)
        MongoDatabase db = mongoClient.getDatabase( dbName )
        MongoCollection<Document> coll = db.getCollection(collectionName)

        def result = new JSONObject(((Document)coll.find(query).first()).toJson())
        mongoClient.close()

        return result;
    }

    def copyPresentInCache(String mongoURL, String mongoPort, String dbName, String collectionName, BasicDBObject query) {

        MongoClient mongoClient = MongoCacheFactory.getMongoConnection(mongoURL,mongoPort)
        MongoDatabase db = mongoClient.getDatabase( dbName )
        MongoCollection<Document> coll = db.getCollection(collectionName)

        def cursor = coll.find(query).iterator();
        def copyExists = false;

        while(cursor.hasNext()) {
            copyExists= true ;
            return copyExists
        }
        mongoClient.close()

        return copyExists;
    }

    def initJob(String mongoURL, String mongoPort, String dbName, String workflowSelected, String user, BasicDBObject query){
        MongoClient mongoClient = MongoCacheFactory.getMongoConnection(mongoURL,mongoPort);
        MongoDatabase db = mongoClient.getDatabase( dbName );
        MongoCollection<Document> coll = db.getCollection(workflowSelected);

        Document cacheRecord = new Document();
        Document doc = new Document();
        doc.append("Status", "started");
        doc.append("User", user);
        doc.append("StartTime", new Date());
        doc.append("EndTime", new Date());
        doc.append("DocumentType", "Original")
        switch (workflowSelected) {
            case "pe":
                cacheRecord = initJobPE(doc, query);
                break;
            default:
                cacheRecord = initJobDefault(doc, query);
                break;

        }

        coll.insertOne(cacheRecord)
        def jobId = doc.get( "_id" );

        return jobId;
    }

    def checkIfPresentInCache(String mongoURL, String mongoPort, String dbName, String collectionName, query ){
        MongoClient mongoClient = MongoCacheFactory.getMongoConnection(mongoURL,mongoPort);
        MongoDatabase db = mongoClient.getDatabase( dbName );

        def cursor = db.getCollection(collectionName).find(query).iterator();
        def recordsCount = 0;
        JSONObject cacheItem;

        while(cursor.hasNext()) {
            cacheItem =new JSONObject(cursor.next().toJson());
            recordsCount+=1;
        }
        mongoClient.close();
        if(recordsCount>1){
           throw new Exception("Invalid number of records in the mongoDB")
        }else{
            if (recordsCount == 0){
                return "NotCached"
            }else if(cacheItem.get("status") == "started" ){
                return "started"
            }else{
                return "Completed"
            }
        }
    }

    def buildMongoQuery(params){
        def conceptBoxes = new JsonSlurper().parseText(params.conceptBoxes)
        String workflowData = conceptBoxes.concepts[0][0];
        BasicDBObject query = new BasicDBObject();
        query.append('result_instance_id1', params.result_instance_id1);
        query.append('result_instance_id2', params.result_instance_id2);
        query.append('WorkflowData', workflowData);
        query.append("DocumentType", "Original")
        return query
    }
    /**
     * Method that will get the list of jobs to show in the eae jobs table
     */
    def getjobsFromMongo(String mongoURL, String mongoPort, String dbName, String userName, String workflowSelected) {

        MongoClient mongoClient = MongoCacheFactory.getMongoConnection(mongoURL,mongoPort);
        MongoDatabase  db = mongoClient.getDatabase( dbName );
        MongoCollection coll = db.getCollection(workflowSelected);

        BasicDBObject query = new BasicDBObject("User", userName);
        def cursor = coll.find(query).iterator();
        def rows;

        switch (workflowSelected) {
            case "pe":
                rows = retrieveRowsForPE(cursor);
                break;
            default:
                rows = retrieveRowsDefault(cursor);
                break;

        }

        JSONObject res =  new JSONObject();
        res.put("success", true)
        res.put("totalCount", rows[1])
        res.put("jobs", rows[0])

        mongoClient.close();

        return res
    }

    /************************************************************************************************
     *                                                                                              *
     *  Pathway Enrichement section                                                                    *
     *                                                                                              *
     ************************************************************************************************/

    def initJobPE(Document doc, query){
        doc.append("TopPathways", [])
        doc.append("KeggTopPathway", "")

        doc.append("ListOfGenes", query.get("ListOfGenes"))
        doc.append("Correction", "")

        return doc;
    }

    def retrieveRowsForPE(MongoCursor cursor){
        def rows = new JSONArray();
        JSONObject result;
        def count = 0;
        while(cursor.hasNext()) {
            JSONObject obj =  new JSONObject(cursor.next().toJson());
            result = new JSONObject();
            String name =  obj.get("ListOfGenes");
            result.put("status", obj.get("Status"));
            result.put("start", obj.get("StartTime"));
            result.put("name", name);
            rows.put(result);
            count+=1;
        }

        return [rows, count]
    }

    def duplicatePECacheForUser(String mongoURL, String mongoPort, String username, JSONObject cacheRes){
        MongoClient mongoClient = MongoCacheFactory.getMongoConnection(mongoURL,mongoPort);
        MongoDatabase db = mongoClient.getDatabase("eae");
        MongoCollection<Document> coll = db.getCollection("pe");

        def arrayList = new ArrayList();
        def topPath = (JSONArray)cacheRes.get("TopPathways")
        for(int i =0; i < topPath.length();i++){
            arrayList.add(i,[topPath.get(i).get(0),topPath.get(i).get(1)])
       }

        Document doc = new Document();
        doc.append("TopPathways", arrayList)
        doc.append("KeggTopPathway",cacheRes.get("KeggTopPathway") )
        doc.append("status", "Completed")
        doc.append("User", username)
        doc.append("ListOfGenes",cacheRes.get("ListOfGenes") )
        doc.append("Correction",cacheRes.get("Correction") )
        doc.append("StartTime", new Date())
        doc.append("EndTime", new Date())
        doc.append("DocumentType", "Copy")

        coll.insertOne(doc)

        return 0
    }

/************************************************************************************************
 *                                                                                              *
 *  Worflow Default section                                                                    *
 *                                                                                              *
 ************************************************************************************************/

    def initJobDefault(Document doc, BasicDBObject query){
        doc.append("WorkflowData", query.get("WorkflowData"));
        doc.append("result_instance_id1", query.get("result_instance_id1"));
        doc.append("result_instance_id2", query.get("result_instance_id2"));
        return doc;
    }

    def retrieveRowsDefault(MongoCursor cursor){
        def rows = new JSONArray();
        JSONObject result;
        def count = 0;
        while(cursor.hasNext()) {
            JSONObject obj =  new JSONObject(cursor.next().toJson());
            result = new JSONObject();
            String highDimName =  obj.get("WorkflowData");
            String result_instance_id1 =  obj.get("result_instance_id1");
            String result_instance_id2 =  obj.get("result_instance_id2");
            String name = "HighDim Data: " +  highDimName + "<br /> cohort 1 : " + result_instance_id1 + "<br /> cohort 2 : " + result_instance_id2;
            result.put("status", obj.get("Status"));
            result.put("start", obj.get("StartTime"));
            result.put("name", name);
            rows.put(result);
            count+=1;
        }

        return [rows, count]
    }
}
