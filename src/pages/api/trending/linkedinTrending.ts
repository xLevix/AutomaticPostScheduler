/**
 * @swagger
 * /api/trending/linkedinTrending:
 *   post:
 *     summary: Endpoint to retrieve trending hashtags from LinkedIn.
 *     description: This endpoint retrieves the trending hashtags for LinkedIn worldwide. The hashtags are returned in the response.
 *     responses:
 *       200:
 *         description: The hashtags were successfully retrieved.
 *       500:
 *         description: An error occurred and the hashtags were not retrieved.
 */

import axios from 'axios';
import cheerio from 'cheerio';
import nc from "next-connect";
import {NextApiRequest, NextApiResponse} from "next";
import addTagsToDb from "../../../utils/addTagsToDb";

/**
 * Handler for the /api/trending/linkedinTrending endpoint.
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 */

const handler = nc<NextApiRequest, NextApiResponse>()
    .post(async (req, res) => {
        const { token } = req.body;
        if (!token || token!=process.env.CRON_TOKEN) {
            res.status(401).json({error: 'Unauthorized'});
            return;
        }
        const url = 'https://taplio.com/trending';
        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            const hashtags = [];

            $('span.css-1wn7vuo').each((i, el) => {
                hashtags.push($(el).text());
            });

            await addTagsToDb('linkedin', 'worldwide', hashtags);
            res.status(200).json({ hashtags });
        } catch (error) {
            res.status(500).json({ error: 'Error fetching data' });
        }
    }
);

export default handler;