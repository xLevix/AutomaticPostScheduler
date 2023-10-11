import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';

const handler = nc<NextApiRequest, NextApiResponse>();

// Initialize rate limiting variables
let lastRequestTime = 0;
let requestCount = 0;

handler.post(async (req, res) => {
    // Check if rate limit has been exceeded
    // const now = Date.now();
    // if (now - lastRequestTime < 20000 && requestCount >= 3) {
    //     res.status(429).json({ message: 'Rate limit exceeded. Please try again later.' });
    //     return;
    // }

    // // Update rate limiting variables
    // lastRequestTime = now;
    // requestCount++;

    const { prompt } = req.body;
    const axios = require('axios');
    let data = {
        model: "gpt-3.5-turbo",
        stream: true,
        messages: [
            {
                role: "system",
                content: " You are assistant writing posts to social media like Instagram, Twitter and Linkedin. Write post in language that user asked question. Limit your post to maximum 2200 characters, can be less if you want."
            },
            {
                role: "user",
                content: prompt
            }
        ],
    };

    let config = {
        method: 'post',
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        data: data,
        responseType: 'stream'
    };


    axios.request(config)
    .then((response) => {
        response.data.on('data', (chunk) => {
            const payloads = chunk.toString().split('\n\n');
            for (const payload of payloads) {
                if (payload.includes('[DONE]')) {
                    res.end();
                    return;
                }
                if (payload.startsWith('data:')) {
                    const data = JSON.parse(payload.replace('data: ', ''));
                    try {
                        const text = data.choices[0].delta?.content;
                        if (text) {
                            res.write(`${text}`);
                        }
                    } catch (error) {
                        console.error(`Error with JSON.parse and ${payload}.\n${error}`);
                    }
                }
            }
        });
    })
    .catch((error) => {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    });
});

export default handler;