import * as mongo from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

<<<<<<< HEAD
const databaseUrl = process.env.MONGODB_URL || "";
=======
const databaseUrl = process.env.MONGO_URL || "";
>>>>>>> 6306838a80012ff0ea82ba3d565560e47024abe0

const options = { useNewUrlParser: true, useUnifiedTopology: true };

export default (): Promise<mongo.MongoClient> => {
  return new Promise((resolve, reject) => {
    mongo.MongoClient.connect(databaseUrl, options, (error, client) => {
      if (error) {
        reject(error);
      } else {
        resolve(client);
      }
    });
  });
};
