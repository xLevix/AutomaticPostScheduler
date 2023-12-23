/**
 * @swagger
 * /api/getMongo:
 *   get:
 *     summary: Endpoint to retrieve posts from MongoDB.
 *     description: This endpoint receives a user ID or a message ID in the query parameters. If a user ID is provided, it returns all posts by that user. If a message ID is provided, it returns the post with that message ID. If neither is provided, it returns an error.
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: The ID of the user whose posts are to be retrieved.
 *       - in: query
 *         name: messageId
 *         schema:
 *           type: string
 *         description: The ID of the message to be retrieved.
 *     responses:
 *       200:
 *         description: The posts were successfully retrieved.
 *       400:
 *         description: Invalid query parameters were provided.
 *   post:
 *     summary: Endpoint to add a new post to MongoDB.
 *     description: This endpoint receives a post object in the request body and adds it to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: The post to be added to the database.
 *     responses:
 *       200:
 *         description: The post was successfully added.
 *   put:
 *     summary: Endpoint to update a post in MongoDB.
 *     description: This endpoint receives a message ID, object ID, and post ID in the request body. If a message ID is provided, it sets the isDeleted field of the corresponding post to true. If an object ID and post ID are provided, it updates the post ID of the corresponding post. If neither is provided, it returns an error.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageId:
 *                 type: string
 *                 description: The ID of the message to be deleted.
 *               objectId:
 *                 type: string
 *                 description: The ID of the object to be updated.
 *               postId:
 *                 type: string
 *                 description: The new post ID.
 *     responses:
 *       200:
 *         description: The post was successfully updated.
 *       400:
 *         description: Invalid query parameters were provided.
 *       404:
 *         description: The post was not found.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import {connectToDatabase} from "../../utils/db";

/**
 * Handler for the /api/getMongo endpoint.
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 */

const handler = nc<NextApiRequest, NextApiResponse>()
    .get(async (req, res) => {
        const { db } = await connectToDatabase();
        const { userId, messageId } = req.query;

        if (userId) {
            const posts = await db.collection("UserPosts").find({ userId }).toArray();
            res.status(200).json({ success: true, data: posts });
        } else if (messageId) {
            const post = await db.collection("UserPosts").findOne({ messageId });
            res.status(200).json({ success: true, data: post });
        } else {
            res.status(400).json({ success: false, message: "Invalid query parameters" });
        }
    })

    .post(async (req, res) => {
        const { db } = await connectToDatabase();
        const posts = await db.collection("UserPosts").insertOne(req.body);
        res.status(200).json({ success: true, data: posts });
    })

    .put(async (req, res) => {
        const { db } = await connectToDatabase();
        const { messageId, objectId, postId } = req.body;

        let filter = {};
        let update = {};

        if (messageId) {
            filter = { messageId };
            update = { $set: { isDeleted: true } };
        } else if (objectId && postId) {
            filter = { _id: objectId };
            update = { $set: { postId } };
        } else {
            return res.status(400).json({ success: false, message: "Invalid query parameters" });
        }

        const updateResult = await db.collection("UserPosts").updateOne(filter, update);

        if (updateResult.modifiedCount === 0) {
            return res.status(404).json({ success: false, message: "Post not found." });
        }

        res.status(200).json({ success: true, message: "Post updated successfully." });
    });

export default handler;
