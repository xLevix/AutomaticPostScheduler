/**
 * @swagger
 * /api/trending/twitterTrending:
 *   post:
 *     summary: Retrieve trending hashtags from Twitter for a specific country or worldwide.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               country:
 *                 type: string
 *                 description: The country to get trending hashtags for. If not provided, it will return worldwide trends.
 *               token:
 *                 type: string
 *                 description: The CRON token for authorization.
 *     responses:
 *       200:
 *         description: A successful response returns the trending hashtags for the specified country or worldwide.
 *       401:
 *         description: Unauthorized access, invalid or missing CRON token.
 */

/**
 * Fetches trending hashtags from Twitter for a specific country or worldwide.
 * @param {string} country - The country to get trending hashtags for.
 * @returns {Array<string>} An array of trending hashtags.
 * @throws {Error} If there is an error fetching the data.
 */

import axios from 'axios';
import cheerio from 'cheerio';
import nc from "next-connect";
import {NextApiRequest, NextApiResponse} from "next";
import addTagsToDb from "../../../utils/addTagsToDb";

const getTwitterTrending = async (country: string) => {
    let url = 'https://trends24.in/' + country;
    if (country === 'worldwide') url = 'https://trends24.in/';

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const hashtags = [];

        $('.trend-card__list li').each((i, el) => {
            if (hashtags.length < 20) {
                hashtags.push($(el).text());
            } else {
                return false;
            }
        });

        return hashtags;
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

        if (country) {
            const hashtags = await getTwitterTrending(country);
            await addTagsToDb('twitter', country, hashtags);
            res.status(200).json({hashtags});
        }else {
            const countries = ['worldwide', 'united-states', 'poland', 'germany', 'united-kingdom', 'spain', 'turkey', 'russia', 'japan'];
            const allHashtags = await Promise.all(countries.map(async (country) => {
                const hashtags = await getTwitterTrending(country);
                return { [country]: hashtags };
            }));
            const hashtagsByCountry = Object.assign({}, ...allHashtags);
            await addTagsToDb('twitter', 'all', hashtagsByCountry);
            res.status(200).json({ hashtags: hashtagsByCountry });
        }
    }
);

export default handler;