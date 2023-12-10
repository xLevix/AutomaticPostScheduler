import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import addPostIdToDb from "../../utils/addPostIdToDb";
import axios from "axios";

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
