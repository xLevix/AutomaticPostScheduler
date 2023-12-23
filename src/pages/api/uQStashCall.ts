import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import axios from 'axios';
import {ObjectId} from "mongodb";

/**
 * @swagger
 * /api/uQStashCall:
 *   post:
 *     summary: Endpoint to schedule posts for different platforms.
 *     description: This endpoint receives a platform type, access token, text for the post, an image (optional), user ID (optional), and other platform-specific parameters. It then schedules the post for the specified platform using the provided access token and text. If an image is provided, it is included in the post. The ID of the scheduled post is then added to a database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               platform:
 *                 type: string
 *                 description: The platform for which the post is to be scheduled.
 *               accessToken:
 *                 type: string
 *                 description: The access token for the platform API.
 *               text:
 *                 type: string
 *                 description: The text content of the post.
 *               img:
 *                 type: string
 *                 description: The image to be included in the post.
 *               userId:
 *                 type: string
 *                 description: The ID of the user who is scheduling the post.
 *               delay:
 *                 type: string
 *                 description: The delay after which the post should be published.
 *               title:
 *                 type: string
 *                 description: The title of the post.
 *               date:
 *                 type: string
 *                 description: The date when the post should be published.
 *               imageUrl:
 *                 type: string
 *                 description: The URL of the image to be included in the post.
 *     responses:
 *       200:
 *         description: The post was successfully scheduled and its ID was stored in the database.
 *       400:
 *         description: Invalid platform type was provided.
 *       500:
 *         description: An error occurred and the post was not scheduled.
 */

interface DataPayload {
    accessToken: string;
    text: string;
    userId?: string;
    img?: string;
    [key: string]: any;
}

const baseEndpoint = 'https://automatic-post-scheduler.vercel.app/api/';
const endpoints = {
    linkedin: 'linkedinCall',
    instagram: 'instagramCall',
    twitter: 'twitterCall',
    credentials: 'instagramCall',
};

const handleData = (body, platform: 'linkedin' | 'instagram' | 'twitter' | 'credentials', objectId): DataPayload => {
    const data: DataPayload = {
        accessToken: body.accessToken,
        text: body.text,
        objectId: objectId,
    };

    if (body.img) data.img = body.img;
    if (body.userId) data.userId = body.userId;

    if (platform === 'instagram') {
        data.username = body.username;
        data.password = body.password;
        data.desc = body.desc;
    }

    return data;
};

const handler = nc<NextApiRequest, NextApiResponse>()
    .post(async (req, res) => {
        const platform: 'linkedin' | 'instagram' | 'twitter' | 'credentials' = req.body.platform;

        if (!platform || !endpoints[platform]) {
            return res.status(400).json({ message: 'Invalid platform' });
        }

        const objectId = new ObjectId().toString();
        const dataToSend = handleData(req.body, platform, objectId);
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://qstash.upstash.io/v2/publish/${baseEndpoint}${endpoints[platform]}`,
            headers: {
                'Content-Type': 'application/json',
                'Upstash-Delay': `${req.body.delay}m`,
                'Authorization': `Bearer ${process.env.QSTASH_TOKEN}`,
            },
            data: JSON.stringify(dataToSend),
        };

        try {
            const response = await axios(config);
            const mongoData = {
                userId: req.body.userId || req.body.username,
                img: req.body.img,
                text: req.body.text,
                delay: req.body.delay,
                title: req.body.title,
                date: req.body.date,
                imgUrl: req.body.imageUrl,
                messageId: response.data.messageId,
                _id: objectId,
            };

            const mongoConfig = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${baseEndpoint}getMongo`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: JSON.stringify(mongoData),
            };

            const mongoResponse = await axios(mongoConfig);
            console.log(JSON.stringify(mongoResponse.data));
            res.status(200).json({ success: true, data: mongoResponse.data, response: response.data.messageId });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Post not created' });
        }
    });

export default handler;
