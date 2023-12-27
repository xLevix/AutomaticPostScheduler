/**
 * @swagger
 * /api/linkedinCall:
 *   post:
 *     summary: Endpoint to create a LinkedIn post.
 *     description: This endpoint creates a LinkedIn post with the provided text, user ID, and optional image. The post ID is returned in the response.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: The access token for LinkedIn API.
 *               text:
 *                 type: string
 *                 description: The text of the post.
 *               userId:
 *                 type: string
 *                 description: The user ID of the post author.
 *               img:
 *                 type: string
 *                 description: The image of the post (optional).
 *               objectId:
 *                 type: string
 *                 description: The object ID of the post.
 *     responses:
 *       200:
 *         description: The post was successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 PostId:
 *                   type: number
 *                   description: The ID of the created post.
 *                 DatabaseUpdate:
 *                   type: object
 *                   description: The response from the database update operation.
 *       500:
 *         description: An error occurred and the post was not created.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import addPostIdToDb from "../../utils/addPostIdToDb.js";

/**
 * Handler for the /api/linkedinCall endpoint.
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 */

const handler = nc<NextApiRequest, NextApiResponse>()
    .post((req, res) => {
        const { accessToken, text, userId, img, objectId } = req.body;

        let axios = require('axios');
        let data = JSON.stringify({
            "author": `urn:li:person:${userId}`,
            "commentary": `${text}`,
            "visibility": "PUBLIC",
            "distribution": {
                "feedDistribution": "MAIN_FEED",
                "targetEntities": [],
                "thirdPartyDistributionChannels": []
            },
            "lifecycleState": "PUBLISHED",
            "isReshareDisabledByAuthor": false
        });

        if (img !== undefined) {
            data = JSON.stringify({
                "author": `urn:li:person:${userId}`,
                "commentary": `${text}`,
                "visibility": "PUBLIC",
                "distribution": {
                    "feedDistribution": "MAIN_FEED",
                    "targetEntities": [],
                    "thirdPartyDistributionChannels": []
                },
                "content": {
                    "media": {
                        "title":"zdjecie test",
                        "id": `urn:li:image:${img.split(":").pop()}`,
                    }
                },
                "lifecycleState": "PUBLISHED",
                "isReshareDisabledByAuthor": false
            });

        }

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.linkedin.com/rest/posts',
            headers: {
                'X-Restli-Protocol-Version': '2.0.0',
                'Content-Type': 'application/json',
                'LinkedIn-Version': '202301',
                'Authorization': `Bearer ${accessToken}`,
            },
            data : data
        };

        axios(config)
            .then(async function (response) {
                const restliIdHeader = response.headers['x-restli-id'];
                const postId = restliIdHeader.split(':').pop();
                const updateResponse = await addPostIdToDb(objectId, postId);
                res.status(200).json({PostId: BigInt(postId).toString() , DatabaseUpdate: updateResponse.data});
            })
            .catch(function (error) {
                console.error('Axios error:', error);
                res.status(500).json({ message: 'Post not created', error: error });
            });

    });

export default handler;

