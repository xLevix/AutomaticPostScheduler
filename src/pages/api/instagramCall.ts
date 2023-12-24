/**
 * @swagger
 * /api/instagramCall:
 *   post:
 *     summary: Endpoint to post a photo to Instagram.
 *     description: This endpoint receives a username, password, text for the post, an image URL, and an object ID in the request body. It then logs into Instagram using the provided username and password, and posts the photo with the provided text. The ID of the posted photo is then added to a database using the provided object ID.
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
 *               text:
 *                 type: string
 *                 description: The text content of the post.
 *               img:
 *                 type: string
 *                 description: The URL of the image to be posted.
 *               objectId:
 *                 type: string
 *                 description: The ID of the object in the database where the post ID will be stored.
 *     responses:
 *       200:
 *         description: The photo was successfully posted and its ID was stored in the database.
 *       500:
 *         description: An error occurred and the photo was not posted.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import {IgApiClient} from "instagram-private-api";
import {get} from "request-promise";
import addPostIdToDb from "../../utils/addPostIdToDb.js";

/**
 * Handler for the /api/instagramCall endpoint.
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 */

const handler = nc<NextApiRequest, NextApiResponse>()
    .post(async (req, res) => {

        const { userId:username, accessToken:password, text:desc, img, objectId } = req.body;

        const ig = new IgApiClient();
        ig.state.generateDevice(username);
        const auth = await ig.account.login(username, password);

        if (JSON.stringify(auth)) {

            const imageBuffer = await get({
                url: img,
                encoding: null,
            });

            const publishResult = await ig.publish.photo({
                file: imageBuffer,
                caption: desc,
            });

            if (JSON.stringify(publishResult)) {
                const postId = publishResult.upload_id;
                const updateResponse = await addPostIdToDb(objectId, postId);
                res.status(200).json({PostId: + postId, DatabaseUpdate: updateResponse.data});
            } else {
                res.status(500).json("Failed to publish");
            }
        }

    });

export default handler;
