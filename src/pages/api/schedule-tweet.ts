import { verifySignature } from '@upstash/qstash/nextjs';
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import {redis} from "../../utils/Redis";

async function handler(_req: NextApiRequest, res: NextApiResponse) {
    const currentTimestamp = Date.now() / 1000;
    const list = await redis.zrange('tweet', 0, currentTimestamp, {
        byScore: true,
    });

    for (let i = 0; i < list.length; i += 1) {
        // Run sequentially the requests to prevent overloading Twitter API
        await axios.post(
            'https://api.linkedin.com/rest/posts',
            {
                text: list[i],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.LINKEDIN_BEARER_TOKEN}`,
                },
            }
        );
    }

    await redis.zremrangebyscore('tweet', 0, currentTimestamp);

    res.status(200).json({
        success: true,
    });
}

export default verifySignature(handler);

export const config = {
    api: {
        bodyParser: false,
    },
};