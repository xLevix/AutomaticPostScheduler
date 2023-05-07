import { MongoClient } from "mongodb";

let cachedDb = null;

export async function connectToDatabase() {
    if (cachedDb) {
        return { db: cachedDb, client: null };
    }

    const client = new MongoClient(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    await client.connect();
    const db = client.db("Posts");
    cachedDb = db;

    return { db, client };
}
