import axios from 'axios';
import cheerio from 'cheerio';
import nc from "next-connect";
import {NextApiRequest, NextApiResponse} from "next";

const handler = nc<NextApiRequest, NextApiResponse>()
    .post(async (req, res) => {
        const { country } = req.body;
        const url = 'https://trends24.in/' + country;

        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            const hashtags = [];

            $('.trend-card__list li').each((i, el) => {
                hashtags.push($(el).text());
            });

            res.status(200).json({ hashtags });
        } catch (error) {
            res.status(500).json({ error: 'Error fetching data' });
        }
    }
);

export default handler;