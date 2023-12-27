/**
 * @swagger
 * /api/statistics/twitterStatistics:
 *   post:
 *     summary: Endpoint to retrieve the statistics of a specific Twitter post.
 *     description: This endpoint receives an account ID and a post ID in the request body. It then logs into Twitter using a stored cookie, and retrieves the comments, reposts, likes, bookmarks, and views of the post with the provided post ID. The statistics are returned in the response.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountId:
 *                 type: string
 *                 description: The ID of the account whose post's statistics are to be retrieved.
 *               postId:
 *                 type: string
 *                 description: The ID of the post whose statistics are to be retrieved.
 *     responses:
 *       200:
 *         description: The statistics were successfully retrieved.
 *       500:
 *         description: An error occurred and the statistics were not retrieved.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import puppeteer from 'puppeteer';

/**
 * Handler for the /api/statistics/twitterStatistics endpoint.
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 */

const handler = nc<NextApiRequest, NextApiResponse>()
    .post(async (req, res) => {
        const { accountId, postId } = req.body;
        const twitterUrl = 'https://twitter.com/' + accountId + '/status/' + postId;
        let browser;

        try {
            res.status(200);
            res.setHeader('Content-Type', 'application/json');

            browser = await puppeteer.connect({
                browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`,
            });

            const page = await browser.newPage();
            const cookies = JSON.parse(process.env.TWITTER_COOKIE);
            for (let cookie of cookies) {
                await page.setCookie(cookie);
            }
            await page.goto(twitterUrl, { waitUntil: 'networkidle2' });

            const [comments, reposts, likes, bookmarks, views] = await Promise.all([
                page.$eval('[aria-label*="Reply"]', (el: HTMLElement) => el.innerText.trim()).catch(() => 'Brak danych'),
                page.$eval('[aria-label*="Repost"]', (el: HTMLElement) => el.innerText.trim()).catch(() => 'Brak danych'),
                page.$eval('[aria-label*="Like"]', (el: HTMLElement) => el.innerText.trim()).catch(() => 'Brak danych'),
                page.$eval('[aria-label*="Bookmark"]', (el: HTMLElement) => el.innerText.trim()).catch(() => 'Brak danych'),
                page.$eval('.css-1rynq56.r-bcqeeo.r-qvutc0.r-37j5jr.r-a023e6.r-rjixqe.r-16dba41 span:nth-of-type(1) span:nth-of-type(1)', (el: HTMLElement) => el.innerText.trim()).catch(() => 'Brak danych')
            ]);

            res.write(JSON.stringify({ likes, comments, shares:reposts, bookmarks, views }));
        } catch (error) {
            res.write(JSON.stringify(error));
        } finally {
            if (browser) {
                await browser.disconnect();
            }
            res.end();
        }
    });

export default handler;