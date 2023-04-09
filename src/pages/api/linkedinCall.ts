import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';

const handler = nc<NextApiRequest, NextApiResponse>()
    .post((req, res) => {
        const { accessToken, text, userId, img } = req.body; // pobieranie danych z ciała żądania

        var axios = require('axios');
        var data = JSON.stringify({
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

        //if img is not empty add content to data
        if (img !== '') {
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

        var config = {
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
                console.log(JSON.stringify(response.data));
                res.status(200).json({ message: 'Post created' });
            })
            .catch(function (error) {
                console.log(error);
                res.status(500).json({ message: 'Post not created' });
            });

    });

export default handler;
