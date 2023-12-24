/**
 * @swagger
 * /api/statistics/instagramStatistics:
 *   post:
 *     summary: Endpoint to retrieve the likers of a specific Instagram post.
 *     description: This endpoint receives a username, password, and media ID in the request body. It then logs into Instagram using the provided username and password, and retrieves the likers of the post with the provided media ID. The likers are returned in the response.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The username of the Instagram account.
 *               accessToken:
 *                 type: string
 *                 description: The password of the Instagram account.
 *               mediaId:
 *                 type: string
 *                 description: The ID of the media whose likers are to be retrieved.
 *     responses:
 *       200:
 *         description: The likers were successfully retrieved.
 *       500:
 *         description: An error occurred and the likers were not retrieved.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import {IgApiClient} from "instagram-private-api";
import {urlSegmentToInstagramId} from "instagram-id-to-url-segment";

/**
 * Handler for the /api/statistics/instagramStatistics endpoint.
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 */

const handler = nc<NextApiRequest, NextApiResponse>()
    .post(async (req, res) => {

        const {userId: username, accessToken: password, mediaId} = req.body;

        const ig = new IgApiClient();

        ig.state.generateDevice(username);

        const auth = await ig.account.login(username, password);

        if (JSON.stringify(auth)) {
            const likers = await ig.media.likers(
                urlSegmentToInstagramId(mediaId)
            );
            res.status(200).json(likers);
        } else {
            res.status(500).json("Failed to login");
        }

    });

export default handler;