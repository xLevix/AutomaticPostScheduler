import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';

const handler = nc<NextApiRequest, NextApiResponse>()
    .post((req, res) => {
        const { delay, img, username, password, desc } = req.body; // pobieranie danych z ciała żądania

        var axios = require('axios');
        var data = JSON.stringify({
            username: username,
            password: password,
            desc: desc,
            img: img
        });

        var config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://qstash.upstash.io/v1/publish/https://automatic-post-scheduler.vercel.app/api/instagramCall',
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
            })
            .catch(function (error) {
                console.log(error);
                res.status(500).json({ message: 'Post not created' });
            });

    });

export default handler;
