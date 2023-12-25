import axios from 'axios';
import cheerio from 'cheerio';
import nc from "next-connect";
import {NextApiRequest, NextApiResponse} from "next";
import addTagsToDb from "../../../utils/addTagsToDb";

const getTwitterTrending = async (country: string) => {
    if (country === 'worldwide') country = '';
    const url = 'https://trends24.in/' + country;

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

        await addTagsToDb('twitter', country, hashtags);
        console.log(country, hashtags)
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
            res.status(200).json({hashtags});
        }else {
            const countries = ['worldwide', 'united-states', 'poland', 'germany', 'united-kingdom', 'spain', 'turkey', 'russia', 'japan'];
            const allHashtags = await Promise.all(countries.map(async (country) => {
                const hashtags = await getTwitterTrending(country);
                return { [country]: hashtags };
            }));
            const hashtagsByCountry = Object.assign({}, ...allHashtags);
            res.status(200).json({ hashtags: hashtagsByCountry });
        }
    }
);

export default handler;