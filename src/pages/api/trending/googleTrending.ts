/**
 * @swagger
 * /api/trending/googleTrending:
 *   post:
 *     summary: Retrieve trending topics from Google for a specific country.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               country:
 *                 type: string
 *                 description: The country to get trending topics for. If not provided, it will return trends for a set of predefined countries.
 *               token:
 *                 type: string
 *                 description: The CRON token for authorization.
 *     responses:
 *       200:
 *         description: A successful response returns the trending topics for the specified country or a set of predefined countries.
 *       401:
 *         description: Unauthorized access, invalid or missing CRON token.
 */

/**
 * Fetches trending topics from Google for a specific country.
 * @param {string} country - The country to get trending topics for.
 * @returns {Object} An object containing trending topics.
 * @throws {Error} If there is an error fetching the data.
 */

import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import nc from "next-connect";
import addTagsToDb from "../../../utils/addTagsToDb";

const getGoogleTrending = async (country: string) => {
    const options = {
        method: 'POST',
        url: 'https://trendly.p.rapidapi.com/realtime',
        headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'trendly.p.rapidapi.com'
        },
        data: {
            country: country,
            category: 'All categories'
        }
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching data: ' + error);
    }
}

const handler = nc<NextApiRequest, NextApiResponse>()
    .post(async (req, res) => {
            const { country, token } = req.body;
            if (!token || token!=process.env.CRON_TOKEN) {
                res.status(401).json({error: 'Unauthorized'});
                return;
            }

            res.writeHead(200, {
                'Content-Type': 'text/plain',
                'Transfer-Encoding': 'chunked'
            });

            if (country){
                const hashtags = await getGoogleTrending(country);
                await addTagsToDb('google', country, hashtags);
                res.write(JSON.stringify({ country: country, hashtags: hashtags }));
            }else{
                const countries = ['United States', 'Poland', 'United Kingdom', 'Germany', 'Spain', 'Russia', 'Turkey', 'Japan'];
                const allHashtags = [];
                for (const country of countries) {
                    const hashtags = await getGoogleTrending(country);
                    const formattedHashtags = Object.keys(hashtags.title).slice(0, 20).map(key => hashtags.title[key]);
                    allHashtags.push({ [country]: formattedHashtags });
                    res.write(JSON.stringify({ country: country, hashtags: formattedHashtags }));
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                const hashtagsByCountry = Object.assign({}, ...allHashtags);
                await addTagsToDb('google', 'all', hashtagsByCountry);
                res.status(200).json({ success: true });
            }
        }
    );

export default handler;
