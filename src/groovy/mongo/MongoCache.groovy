package mongo

import com.mongodb.MongoClient

public class MongoCacheFactory {


    static def getMongoConnection(String IPAdress, String port){
        int portToUse = Integer.parseInt(port)
        return new MongoClient(IPAdress,portToUse);
    }

}
