import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';

const handler = nc<NextApiRequest, NextApiResponse>()
    .post((req, res) => {
        const { accessToken, text, img, objectId } = req.body;
        console.log("Otrzymano dane: " + req.body);

        var axios = require('axios');
        var data = JSON.stringify({
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

        var config = {
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
            .then(function (response) {
                console.log("Axios response: " + response.data);
                res.status(200).json({ message: 'Post created' });
            })
            .catch(function (error) {
                console.log(error);
                res.status(500).json({ message: 'Post not created' });
            });

    });

export default handler;
