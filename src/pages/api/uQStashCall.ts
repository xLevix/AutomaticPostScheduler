import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import axios from 'axios';
import {ObjectId} from "mongodb";

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

        const objectId = new ObjectId();
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
            console.log(JSON.stringify(response.data));
            res.status(200).json({ message: 'Post created' });

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

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Post not created' });
        }
    });

export default handler;
