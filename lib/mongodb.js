import { MongoClient } from "mongodb";

export async function connectDB() {
  const client = await MongoClient.connect(process.env.MONGODB_URI, {
    dbName:'bitbird',
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // serverSelectionTimeoutMS: 30000,
    // socketTimeoutMS: 45000,
  } );

  return client;
}