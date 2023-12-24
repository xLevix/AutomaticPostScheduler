/**
 * @swagger
 * /api/trending/scrapDB:
 *   get:
 *     summary: Endpoint to retrieve trending hashtags from the database.
 *     description: This endpoint receives a provider and a country in the query parameters. If both are provided, it returns the trending hashtags for the provider in the provided country. If only the provider is provided, it returns the trending hashtags for the provider worldwide. If neither is provided, it returns an error.
 *     parameters:
 *       - in: query
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *         description: The provider for which the trending hashtags are to be retrieved.
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: The country for which the trending hashtags are to be retrieved.
 *     responses:
 *       200:
 *         description: The hashtags were successfully retrieved.
 *       400:
 *         description: Invalid query parameters were provided.
 *   post:
 *     summary: Endpoint to add a new trending hashtag to the database.
 *     description: This endpoint receives a hashtag object in the request body and adds it to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: The hashtag to be added to the database.
 *     responses:
 *       200:
 *         description: The hashtag was successfully added.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import {connectToDatabase} from "../../../utils/db";

/**
 * Handler for the /api/trending/scrapDB endpoint.
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 */

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
        const { provider } = req.body;
        await db.collection("TrendingTags").deleteMany({ provider });
        const tags = await db.collection("TrendingTags").insertOne(req.body);
        res.status(200).json({ success: true, data: tags });
    });

export default handler;
