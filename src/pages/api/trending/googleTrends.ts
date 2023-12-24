/**
 * @swagger
 * /api/trending/googleTrends:
 *   post:
 *     summary: Retrieve trending hashtags from Google Trends
 *     description: This endpoint retrieves trending hashtags from Google Trends for a specific country or a predefined list of countries. It uses the google-trends-api package to fetch the trends and returns them as an array of strings. If a country is specified in the request body, it returns the trends for that country. If no country is specified, it fetches the trends for a predefined list of countries with a delay of 2 seconds between each request to avoid rate limiting.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               country:
 *                 type: string
 *                 description: The country for which to fetch the trends. If not specified, the trends for a predefined list of countries will be fetched.
 *               token:
 *                 type: string
 *                 description: A token to authenticate the request. Must match the CRON_TOKEN environment variable.
 *     responses:
 *       200:
 *         description: The request was successful. The response body contains an array of trending hashtags.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hashtags:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Unauthorized. The token provided in the request body did not match the CRON_TOKEN environment variable.
 */
import { NextApiRequest, NextApiResponse } from 'next';
import nc from "next-connect";
import addTagsToDb from "../../../utils/addTagsToDb";

const googleTrends = require('google-trends-api');

/**
 * Fetches trending hashtags from Google Trends for a specific country.
 * @param {string} country - The country for which to fetch the trends.
 * @returns {Promise<string[]>} A promise that resolves to an array of trending hashtags.
 */

const getGoogleTrends = (country: string) => {
    return new Promise<string[]>((resolve, reject) => {
        googleTrends.dailyTrends({
            trendDate: new Date(),
            geo: country,
        }, async function (err, results) {
            if (err) {
                console.log(err)
                reject('there was an error!');
            } else {
                const hashtags = [];
                results = JSON.parse(results);
                results.default.trendingSearchesDays[0].trendingSearches.forEach((el) => {
                    hashtags.push(el.title.query);
                });
                await addTagsToDb('google', country, hashtags);
                resolve(hashtags);
            }
        });
    });
}

const handler = nc<NextApiRequest, NextApiResponse>()
    .post(async (req, res) => {
        const { country, token } = req.body;
        if (!token || token != process.env.CRON_TOKEN) {
            res.status(401).json({error: 'Unauthorized'});
            return;
        }

        if (country) {
            const hashtags = await getGoogleTrends(country);
            res.status(200).json({ hashtags });
        } else {
            const countries = ['US', 'PL', 'GB', 'DE', 'ES', 'RU', 'TR', 'JP'];
            const allHashtags = await Promise.all(countries.map(async (country) => {
                const hashtags = await getGoogleTrends(country);
                return { [country]: hashtags };
            }));
            const hashtagsByCountry = Object.assign({}, ...allHashtags);
            res.status(200).json({ hashtags: hashtagsByCountry });
        }
    });


export default handler;
