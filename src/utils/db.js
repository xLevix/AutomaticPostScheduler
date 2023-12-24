/**
 * @swagger
 * /utils/db:
 *   get:
 *     summary: Function to connect to MongoDB.
 *     description: This function connects to MongoDB using the connection string provided in the environment variables. If a connection has already been established, it reuses the existing connection. Otherwise, it creates a new connection and caches it for future use. It returns an object containing the database instance and the MongoDB client.
 *     responses:
 *       200:
 *         description: The connection was successfully established.
 *       500:
 *         description: An error occurred and the connection was not established.
 */

import { MongoClient } from "mongodb";

let cachedDb = null;

/**
 * Function to connect to MongoDB.
 * @returns {Promise<{db: Db, client: MongoClient|null}>} - A promise that resolves to an object containing the database instance and the MongoDB client.
 * @throws {Error} - Throws an error if there is a problem connecting to the database.
 */
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