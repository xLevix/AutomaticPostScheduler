import axios from 'axios';
import cheerio from 'cheerio';

export default async function handler(req, res) {
    const url = 'https://displaypurposes.com/hashtags/rank/best/language/pl';

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
