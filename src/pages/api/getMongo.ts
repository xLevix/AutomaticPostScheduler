import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import {connectToDatabase} from "../../utils/db";

const handler = nc<NextApiRequest, NextApiResponse>()
    .get(async (req, res) => {
        const { db } = await connectToDatabase();
        const userId = req.query.userId;
        const posts = await db.collection("UserPosts").find({ userId }).toArray();
        res.status(200).json({ success: true, data: posts });
    })

    .post(async (req, res) => {
        const { db } = await connectToDatabase();
        const posts = await db.collection("UserPosts").insertOne(req.body);
        res.status(200).json({ success: true, data: posts });
    });

export default handler;
