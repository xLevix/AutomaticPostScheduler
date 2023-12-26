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
import nc from "next-connect";
import {NextApiRequest, NextApiResponse} from "next";
import addTagsToDb from "../../../utils/addTagsToDb";

const countryWoeidMapping = {
    'worldwide': '1',
    'united-states': '23424977',
    'poland': '23424923',
    'germany': '23424829',
    'united-kingdom': '23424975',
    'spain': '23424950',
    'turkey': '23424969',
    'russia': '23424936',
    'japan': '23424856'
};

const getTwitterTrending = async (country: string) => {
    const encodedParams = new URLSearchParams();
    const woeid = countryWoeidMapping[country] || countryWoeidMapping['worldwide'];
    encodedParams.set('woeid', woeid);

    const options = {
        method: 'POST',
        url: 'https://twitter-trends5.p.rapidapi.com/twitter/request.php',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'twitter-trends5.p.rapidapi.com'
        },
        data: encodedParams,
    };

    try {
        const response = await axios.request(options);
        const trends = response.data.trends;
        // @ts-ignore
        const hashtags = Object.values(trends).map(trend => trend.name);
        return hashtags.slice(0, 20);
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
            res.status(200).json({ hashtags: { [country]: hashtags } });
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