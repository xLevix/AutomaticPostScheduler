/**
 * @swagger
 * /api/statistics/instagramStatistics:
 *   post:
 *     summary: Retrieve Instagram post statistics
 *     description: This endpoint retrieves Instagram post statistics using the ApifyClient. It requires a postId in the request body.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *             properties:
 *               postId:
 *                 type: string
 *                 description: The ID of the Instagram post.
 *     responses:
 *       200:
 *         description: The Instagram post statistics were successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 likes:
 *                   type: number
 *                   description: The number of likes on the Instagram post.
 *                 comments:
 *                   type: number
 *                   description: The number of comments on the Instagram post.
 *                 shares:
 *                   type: number
 *                   description: The number of shares of the Instagram post.
 *       500:
 *         description: No results were found for the provided postId.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { ApifyClient } from 'apify-client';

/**
 * Handler for the /api/statistics/instagramStatistics endpoint.
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 */

const handler = nc<NextApiRequest, NextApiResponse>()
    .post(async (req, res) => {

        const {postId} = req.body;

        const client = new ApifyClient({
            token: process.env.APIFY_TOKEN,
        });

        const input = {
            "directUrls": [
                `https://www.instagram.com/p/${postId}`
            ],
            "resultsType": "posts",
            "resultsLimit": 1,
            "searchLimit": 1
        };

        const run = await client.actor("apify/instagram-scraper").call(input);

        console.log('Results from dataset');
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        if (items.length === 0) {
            res.status(500).json({ message: "No results found" });

        }
        res.status(200).json({ likes: items[0].likesCount, comments: items[0].commentsCount, shares:'--' });
    });

export default handler;