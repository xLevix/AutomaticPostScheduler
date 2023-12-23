/**
 * @swagger
 * /api/trending/instagramTrending:
 *   post:
 *     summary: Endpoint to retrieve trending hashtags from Instagram.
 *     description: This endpoint receives a country in the request body. It then retrieves the trending hashtags for Instagram in the provided country. If no country is provided, it retrieves the trending hashtags for a list of default countries. The hashtags are returned in the response.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               country:
 *                 type: string
 *                 description: The country for which the trending hashtags are to be retrieved.
 *     responses:
 *       200:
 *         description: The hashtags were successfully retrieved.
 *       500:
 *         description: An error occurred and the hashtags were not retrieved.
 */

import axios from 'axios';
import cheerio from 'cheerio';
import { NextApiRequest, NextApiResponse } from 'next';
import nc from "next-connect";
import addTagsToDb from "../../../utils/addTagsToDb";

/**
 * Function to get trending hashtags from Instagram for a specific country.
 * @param {string} country - The country for which the trending hashtags are to be retrieved.
 * @returns {Promise<string[]>} - A promise that resolves to an array of trending hashtags.
 * @throws {Error} - Throws an error if there is a problem fetching the data.
 */
const getInstagramTrending = async (country: string) => {
    const url = 'https://displaypurposes.com/hashtags/rank/best/country/' + country;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const hashtags = [];

        $('td.tag a').each((i, el) => {
            hashtags.push($(el).text());
        });

        await addTagsToDb('instagram', country, hashtags);
        return hashtags;
    } catch (error) {
        throw new Error('Error fetching data');
    }
}

const handler = nc<NextApiRequest, NextApiResponse>()
    .post(async (req, res) => {
        const { country, token } = req.body;
        if (!token || token!=process.env.CRON_TOKEN) {
            res.status(401).json({error: 'Unauthorized'});
            return;
        }

        if (country){
            const hashtags = await getInstagramTrending(country);
            res.status(200).json({ hashtags });
        }else{
            const countries = ['us', 'pl', 'gb', 'de', 'es', 'ru', 'tr', 'ae', 'cn', 'jp'];
            for (const country of countries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                await getInstagramTrending(country);
            }
            res.status(200).json({ success: true });
        }
    }
);

export default handler;
