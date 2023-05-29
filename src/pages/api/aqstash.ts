import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';

const handler = nc<NextApiRequest, NextApiResponse>()
    .post((req, res) => {
        const { delay, img, username, password, desc, title, date, accessToken, text, userId, session, provider } = req.body;
        let axios = require('axios');
        let url = provider === 'linkedin' ? 'https://automatic-post-scheduler.vercel.app/api/linkedinCall' : 'https://automatic-post-scheduler.vercel.app/api/instagramCall';
        let data = provider === 'linkedin' ? JSON.stringify({
            accessToken: accessToken,
            text: text,
            userId: userId,
            img: img ? img : undefined
        }) : JSON.stringify({
            username: username,
            password: password,
            desc: desc,
            img: img
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://qstash.upstash.io/v1/publish/${url}`,
            headers: {
                'Content-Type': 'application/json',
                'Upstash-Delay': `${delay}m`,
                'Authorization': `Bearer ${process.env.QSTASH_TOKEN}`
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));

                let data2 ={};
                if (provider === 'linkedin') {
                    data2 = JSON.stringify({
                        "userId": userId,
                        "img": img ? img : undefined,
                        "text": text,
                        "delay": delay,
                        "title": title,
                        "date": date,
                    });
                }else {
                    data2 = JSON.stringify({
                        "userId": username,
                        "img": img ? img : undefined,
                        "text": desc,
                        "delay": delay,
                        "title": title,
                        "date": date,
                    });
                }


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
                        res.status(200).json({ message: 'Post created' });
                        console.log(JSON.stringify(response2.data));
                    })
                    .catch((error2) => {
                        console.log(error2);
                        res.status(500).json({ message: 'Post not created', error: error2 });
                    });

            })
            .catch(function (error) {
                console.log(error);
                res.status(500).json({ message: 'Post not created', error: error });
            });

    });

export default handler;
