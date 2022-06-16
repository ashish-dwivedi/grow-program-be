import mongoose from "mongoose";

const username = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const collectionName = process.env.COLLECTION_NAME;

const dbConnect = async () => {
  try {
    await mongoose.connect(`mongodb+srv://${username}:${password}@xpns.zcibt.mongodb.net/${collectionName}?retryWrites=true&w=majority`);
    console.log('Connected to database');
  } catch (err) {
    console.log(err);
  }
}

dbConnect();
