/**
 * @swagger
 * /api/trending/instagramTrending:
 *   post:
 *     summary: Retrieve trending hashtags from Instagram for a specific country or all countries.
 *     description: This endpoint retrieves trending hashtags from Instagram for a specific country or all countries. It uses the Display Purposes website to scrape the data. The country is passed in the request body. If no country is specified, it retrieves data for all countries.
 *     parameters:
 *       - in: body
 *         name: country
 *         schema:
 *           type: string
 *         description: The country for which the trending hashtags are to be retrieved.
 *       - in: body
 *         name: token
 *         schema:
 *           type: string
 *         description: The token to authorize the request.
 *     responses:
 *       200:
 *         description: A successful response returns the trending hashtags.
 *       401:
 *         description: Unauthorized. The token is missing or incorrect.
 */

/**
 * Function to get trending hashtags from Instagram for a specific country.
 * @param {string} country - The country for which the trending hashtags are to be retrieved.
 * @returns {Promise<string[]>} - A promise that resolves to an array of trending hashtags.
 * @throws {Error} - Throws an error if there is a problem fetching the data.
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
            if (hashtags.length < 20) {
                const hashtag = $(el).text();
                hashtags.push(hashtag.substring(1));
            } else {
                return false;
            }
        });

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
            await addTagsToDb('instagram', country, hashtags);
            res.status(200).json({ hashtags });
        }else{
            const countries = ['us', 'pl', 'gb', 'de', 'es', 'ru', 'tr', 'jp'];
            const allHashtags = await Promise.all(countries.map(async (country) => {
                const hashtags = await getInstagramTrending(country);
                return { [country]: hashtags };
            }));
            const hashtagsByCountry = Object.assign({}, ...allHashtags);
            await addTagsToDb('instagram', 'all', hashtagsByCountry);
            res.status(200).json({ hashtags: hashtagsByCountry });
        }
    }
);

export default handler;
