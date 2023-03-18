import type { NextRequest } from 'next/server';
import {redis} from "../../utils/Redis";
import {IAddTweet} from "../../types/Tweet";

export default async function handler(req: NextRequest) {
    const reqJson: IAddTweet = await req.json();

    await redis.zadd('tweet', {
        score: new Date(reqJson.scheduledDate).getTime() / 1000, // convert to seconds
        member: reqJson.message,
    });

    return new Response(
        JSON.stringify({
            success: true,
        }),
        {
            status: 200,
            headers: {
                'content-type': 'application/json',
            },
        }
    );
}

export const config = {
    runtime: 'experimental-edge',
};