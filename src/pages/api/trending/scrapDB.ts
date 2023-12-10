import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import {connectToDatabase} from "../../../utils/db";

const handler = nc<NextApiRequest, NextApiResponse>()
    .get(async (req, res) => {
        const { db } = await connectToDatabase();
        const { provider, country } = req.query;

        if (provider && country) {
            const tags = await db.collection("TrendingTags").find({ provider, country }).sort({ date: -1 }).limit(1).toArray();
            res.status(200).json({ success: true, data: tags });
        }else if (provider) {
            const tags = await db.collection("TrendingTags").find({ provider }).sort({ date: -1 }).limit(1).toArray();
            res.status(200).json({ success: true, data: tags });
        } else {
            res.status(400).json({ success: false, message: "Invalid query parameters" });
        }
    })

    .post(async (req, res) => {
        const { db } = await connectToDatabase();
        const tags = await db.collection("TrendingTags").insertOne(req.body);
        res.status(200).json({ success: true, data: tags });
    });

export default handler;
