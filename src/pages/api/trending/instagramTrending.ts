import axios from 'axios';
import cheerio from 'cheerio';
import { NextApiRequest, NextApiResponse } from 'next';
import nc from "next-connect";
import addTagsToDb from "../../../utils/addTagsToDb";

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
        const { country } = req.body;

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
