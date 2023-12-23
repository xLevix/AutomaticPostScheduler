import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import addPostIdToDb from "../../utils/addPostIdToDb.js";
import axios from "axios";

/**
 * @swagger
 * /api/twitterCall:
 *   post:
 *     summary: Endpoint to post a tweet with or without an image.
 *     description: This endpoint receives an access token, text for the tweet, an image (optional), and an object ID. It then posts the tweet to Twitter using the provided access token and text. If an image is provided, it is included in the tweet. The ID of the posted tweet is then added to a database using the provided object ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: The access token for the Twitter API.
 *               text:
 *                 type: string
 *                 description: The text content of the tweet.
 *               img:
 *                 type: string
 *                 description: The image to be included in the tweet.
 *               objectId:
 *                 type: string
 *                 description: The ID of the object in the database where the tweet ID will be stored.
 *     responses:
 *       200:
 *         description: The tweet was successfully posted and its ID was stored in the database.
 *       500:
 *         description: An error occurred and the tweet was not posted.
 */

const handler = nc<NextApiRequest, NextApiResponse>()
    .post((req, res) => {
        const { accessToken, text, img, objectId } = req.body;

        const axios = require('axios');
        let data = JSON.stringify({
            text: text,
        });

        if(img){
            data = JSON.stringify({
                text: text,
                media: {
                    media_ids: [img]
                }
            });
        }

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.twitter.com/2/tweets',
            headers: {
                'X-Restli-Protocol-Version': '2.0.0',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            data : data
        };

        axios(config)
            .then(async function (response) {
                const postId = response.data.data.id;
                const updateResponse = await addPostIdToDb(objectId, postId)
                res.status(200).json({PostId: +postId, DatabaseUpdate: updateResponse.data});
            })
            .catch(function (error) {
                console.log(error);
                res.status(500).json({ message: 'Post not created' });
            });

    });

export default handler;
