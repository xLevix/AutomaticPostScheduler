import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import {connectToDatabase} from "../../utils/db";

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
