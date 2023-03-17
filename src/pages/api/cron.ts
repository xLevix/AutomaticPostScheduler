import { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";
// @ts-ignore
import { verifySignature } from "@upstash/qstash/nextjs";

async function handler(_req: NextApiRequest, res: NextApiResponse) {
    try {

        /**
         * The API returns something like this:
         * ```json
         * {
         *   "USD": {
         *     "last": 123
         *   },
         *   ...
         * }
         * ```
         */
        const raw = await fetch("https://blockchain.info/ticker");
        const prices = await raw.json();
        const bitcoinPrice = prices["USD"]["last"] as number;

        /**
         * After we have loaded the current bitcoin price, we can store it in the
         * database together with the current time
         */
        const redis = Redis.fromEnv();
        await redis.zadd("bitcoin-prices", {
            score: Date.now(),
            member: bitcoinPrice,
        });

        res.send("OK");
    } catch (err) {
        res.status(500).send(err);
    } finally {
        res.end();
    }
}

/**
 * Wrap your handler with `verifySignature` to automatically reject all
 * requests that are not coming from Upstash.
 */
export default verifySignature(handler);

/**
 * To verify the authenticity of the incoming request in the `verifySignature`
 * function, we need access to the raw request body.
 */
export const config = {
    api: {
        bodyParser: false,
    },
};
