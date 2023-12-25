/**
 * @swagger
 * /api/trending/scrapDB:
 *   get:
 *     summary: Retrieve trending tags from the database for a specific provider and country.
 *     parameters:
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *         required: true
 *         description: The provider of the trending tags.
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: The country to get trending tags for. If not provided, it will return tags for all countries.
 *     responses:
 *       200:
 *         description: A successful response returns the trending tags for the specified provider and country.
 *       400:
 *         description: Invalid query parameters.
 *   post:
 *     summary: Delete all trending tags for a specific provider and insert new ones.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *                 description: The provider of the trending tags.
 *     responses:
 *       200:
 *         description: A successful response returns the inserted trending tags.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import {connectToDatabase} from "../../../utils/db";

const handler = nc<NextApiRequest, NextApiResponse>()
    .get(async (req, res) => {
        const { db } = await connectToDatabase();
        const { provider, country } = req.query;

        if (provider && country) {
            const document = await db.collection("TrendingTags").findOne({ provider });
            const tags = document.tags[country];
            res.status(200).json({ success: true, data: tags });
        } else if (provider) {
            const document = await db.collection("TrendingTags").findOne({ provider });
            const tags = document.tags;
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
