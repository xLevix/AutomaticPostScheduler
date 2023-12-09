import axios from 'axios';
import cheerio from 'cheerio';
import { NextApiRequest, NextApiResponse } from 'next';
import nc from "next-connect";

const handler = nc<NextApiRequest, NextApiResponse>()
    .post(async (req, res) => {
        const { country } = req.body;
        const url = 'https://displaypurposes.com/hashtags/rank/best/language/' + country;

        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            const hashtags = [];

            $('td.tag a').each((i, el) => {
                hashtags.push($(el).text());
            });

            res.status(200).json({ hashtags });
        } catch (error) {
            res.status(500).json({ error: 'Error fetching data' });
        }
    }
);

export default handler;
