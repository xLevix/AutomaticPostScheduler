import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';

const handler = nc<NextApiRequest, NextApiResponse>()
    .post(async (req, res) => {

        const { prompt } = req.body;

        const axios = require('axios');
        let data = JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "user",
                    "content": `${prompt}`
                }
            ]
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.openai.com/v1/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                res.status(200).json(JSON.stringify(response.data.choices[0].message.content));
            })
            .catch((error) => {
                res.status(500).json(error);
            });

    });

export default handler;
