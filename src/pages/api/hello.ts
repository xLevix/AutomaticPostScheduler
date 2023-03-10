import { Redis } from '@upstash/redis'
import type { NextApiRequest, NextApiResponse } from 'next'

const redis = new Redis({
    url: 'https://eu2-game-gibbon-31937.upstash.io',
    token: 'AXzBASQgNDgxYzFiY2EtMzdkNC00M2VhLWI2NTQtOTM0ZDAzOTlkNDNmN2M4YTdlMTY2NDFhNDQ3ZWFlOTBhMjhlYjVhMjNjYWU=',
})

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    let count = await redis.incr("counter")
    res.status(200).json({count: count})
}