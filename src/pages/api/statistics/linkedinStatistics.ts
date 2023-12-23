/**
 * @swagger
 * /api/statistics/linkedinStatistics:
 *   post:
 *     summary: Endpoint to retrieve the statistics of a specific LinkedIn post.
 *     description: This endpoint receives a post ID in the request body. It then logs into LinkedIn using a stored cookie, and retrieves the reactions, comments, and shares of the post with the provided post ID. The statistics are returned in the response.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 * Handler for the /api/statistics/linkedinStatistics endpoint.
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 */

const handler = nc<NextApiRequest, NextApiResponse>()
    .post(async (req, res) => {
            const { postId } = req.body;
            const linkedinUrl = 'https://www.linkedin.com/feed/update/urn:li:activity:'+postId;
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            await page.setCookie({
                    name: "li_at",
                    value: process.env.LINKEDIN_COOKIE,
                    domain: "www.linkedin.com"
            });
            await page.goto(linkedinUrl, { waitUntil: 'networkidle2' });
            try {
                    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const reactions = await page.$eval('.social-details-social-counts__reactions-count', (el: HTMLElement) => el.innerText.trim()).catch(() => '0 reakcji');
                    const comments = await page.$eval('.social-details-social-counts__comments', (el: HTMLElement) => el.innerText.trim()).catch(() => '0 komentarzy');
                    const shares = await page.$eval('.social-details-social-counts__item--right-aligned', (el: HTMLElement) => el.innerText.trim()).catch(() => '0 udostępnień');

                    res.status(200).json({ reactions, comments, shares });
            } catch (error) {
                    res.status(500).json(error);
            } finally {
                    await browser.close();
            }
    }
);

export default handler;