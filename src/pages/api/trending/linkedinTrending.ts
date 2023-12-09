import axios from 'axios';
import cheerio from 'cheerio';
import nc from "next-connect";
import {NextApiRequest, NextApiResponse} from "next";

const handler = nc<NextApiRequest, NextApiResponse>()
    .get(async (req, res) => {
        const url = 'https://taplio.com/trending';

        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            const hashtags = [];

            $('span.css-1wn7vuo').each((i, el) => {
                hashtags.push($(el).text());
            });

            res.status(200).json({ hashtags });
        } catch (error) {
            res.status(500).json({ error: 'Error fetching data' });
        }
    }
);

export default handler;