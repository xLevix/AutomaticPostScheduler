import axios from 'axios';
import cheerio from 'cheerio';
import nc from "next-connect";
import {NextApiRequest, NextApiResponse} from "next";
import addTagsToDb from "../../../utils/addTagsToDb";
import { getToken } from "next-auth/jwt"


const getTwitterTrending = async (country: string) => {
    const url = 'https://trends24.in/' + country;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const hashtags = [];

        $('.trend-card__list li').each((i, el) => {
            hashtags.push($(el).text());
        });

        await addTagsToDb('twitter', country, hashtags);
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

        if (country) {
            const hashtags = await getTwitterTrending(country);
            res.status(200).json({hashtags});
        }else {
            const countries = ['worldwide', 'united-states', 'poland', 'germany', 'united-kingdom', 'spain', 'turkey', 'russia', 'japan', 'china', 'united-arab-emirates'];
            for (const country of countries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                await getTwitterTrending(country);
            }
            res.status(200).json({success: true});
        }
    }
);

export default handler;