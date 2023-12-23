/**
 * @swagger
 * /api/validateToken:
 *   post:
 *     summary: Endpoint to validate access tokens for different providers.
 *     description: This endpoint receives a provider name, username, and access token in the request body. It then validates the access token by making a request to the provider's API. If the token is valid, it returns a response with valid set to true. If the token is not valid, it returns a response with valid set to false. If an error occurs, it returns a server error.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *                 description: The name of the provider for which the token is to be validated.
 *               username:
 *                 type: string
 *                 description: The username of the user who owns the token.
 *               accessToken:
 *                 type: string
 *                 description: The access token to be validated.
 *     responses:
 *       200:
 *         description: The token is valid.
 *       401:
 *         description: The token is not valid.
 *       500:
 *         description: A server error occurred.
 */

import { NextApiRequest, NextApiResponse } from "next";
import axios from 'axios';
import { IgApiClient } from "instagram-private-api";

/**
 * Handler for the /api/validateToken endpoint.
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { provider, username, accessToken } = req.body;

    console.log('Validating token:', provider, username, accessToken);

    try {
        switch (provider) {
            case 'linkedin':
                await axios.get('https://api.linkedin.com/v2/me', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                break;

            case 'twitter':
                await axios.get('https://api.twitter.com/2/users/me', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                break;

            case 'credentials':
                const ig = new IgApiClient();
                ig.state.generateDevice(username);
                ig.state.proxyUrl = process.env.IG_PROXY;
                const auth = await ig.account.login(username, accessToken); 
                console.log(auth);
                const followersFeed = ig.feed.accountFollowers(auth.pk);
                await followersFeed.request();
                break;
        }

        res.send({ valid: true });
    } catch (error) {
        console.error('Error when validating token:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
            return res.send({ valid: false });
        }

        res.status(500).send({ valid: false, message: 'Server error' });
    }
}