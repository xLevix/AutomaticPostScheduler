import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';

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
            .then(function (response) {
                console.log("Response: " + response);
                res.status(200).json({ message: 'PostId: '+ response });
            })
            .catch(function (error) {
                console.error('Axios error:', error);
                res.status(500).json({ message: 'Post not created', error: error });
            });

    });

export default handler;
