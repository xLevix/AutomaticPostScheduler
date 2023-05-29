import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';

const handler = nc<NextApiRequest, NextApiResponse>()
    .post((req, res) => {
        const { accessToken, text, userId, delay, img, date, title } = req.body;

        var axios = require('axios');
        var data = JSON.stringify({
            accessToken: accessToken,
            text: text,
            userId: userId
        });

        if (img) {
            data = JSON.stringify({
                accessToken: accessToken,
                text: text,
                userId: userId,
                img: img
            });
        }

        var config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://qstash.upstash.io/v1/publish/https://automatic-post-scheduler.vercel.app/api/linkedinCall',
            headers: {
                'Content-Type': 'application/json',
                'Upstash-Delay': `${delay}m`,
                'Authorization': `Bearer ${process.env.QSTASH_TOKEN}`
            },
            data : data
        };

        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                res.status(200).json({ message: 'Post created' });

                let data2 = JSON.stringify({
                    "userId": userId,
                    "img": img,
                    "text": text,
                    "delay": delay,
                    "title": title,
                    "date": date
                });

                let config2 = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: 'https://automatic-post-scheduler.vercel.app/api/getMongo',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data : data2
                };

                axios.request(config2)
                    .then((response2) => {
                        console.log(JSON.stringify(response2.data));
                    })
                    .catch((error2) => {
                        console.log(error2);
                    });

            })
            .catch(function (error) {
                console.log(error);
                res.status(500).json({ message: 'Post not created' });
            });

    });

export default handler;
