import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import addPostIdToDb from "../../utils/addPostIdToDb.js";

/**
 * @swagger
 * /api/linkedinCall:
 *   post:
 *     description: Creates a LinkedIn post with the provided data and adds the post ID to the database.
 *     parameters:
 *       - in: body
 *         name: accessToken
 *         description: The access token of the LinkedIn user.
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: text
 *         description: The text content of the LinkedIn post.
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: userId
 *         description: The user ID of the LinkedIn user.
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: img
 *         description: The image content of the LinkedIn post.
 *         required: false
 *         schema:
 *           type: string
 *       - in: body
 *         name: objectId
 *         description: The object ID to which the post ID will be added in the database.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The post ID and the database update response.
 *       500:
 *         description: An error message if the post was not created.
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
                res.status(200).json({PostId: +postId, DatabaseUpdate: updateResponse.data});
            })
            .catch(function (error) {
                console.error('Axios error:', error);
                res.status(500).json({ message: 'Post not created', error: error });
            });

    });

export default handler;

