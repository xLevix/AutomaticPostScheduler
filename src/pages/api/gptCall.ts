import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import axios from 'axios';
import cors from 'cors';


const handler = nc<NextApiRequest, NextApiResponse>({
    onError(error, req, res) {
      res.status(500).end(`Something went wrong: ${error.message}`);
    },
    onNoMatch(req, res) {
      res.status(405).end(`Method ${req.method} Not Allowed`);
    },
});

handler.use(cors({ 
    origin: '*',
    methods: ['GET', 'HEAD', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

const openaiAxios = axios.create({
    baseURL: 'https://api.openai.com/v1/',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.OPENAI_API_KEY ? `Bearer ${process.env.OPENAI_API_KEY}` : ''
    },
});

const rateLimitWindowMs = 20000;
const maxRequestsPerWindow = 3;
let requestTimestamps = [];

handler.post(async (req, res) => {
    console.log('Received payload:', req.body);

    const now = Date.now();

    requestTimestamps = requestTimestamps.filter(timestamp => now - timestamp < rateLimitWindowMs);

    if (requestTimestamps.length >= maxRequestsPerWindow) {
        res.status(429).end("Rate limit exceeded. Please try again later.");
        return;
    }

    requestTimestamps.push(now);

    const { prompt } = req.body;
    const data = {
        model: "gpt-3.5-turbo",
        max_tokens: 2048,
        messages: [
            {
                role: "system",
                content: "You are assistant writing posts to social media like Instagram, Twitter, and Linkedin. Write the post in the language that user asked the question. Limit your post to a maximum of 2200 characters; it can be less if you want."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        stream: true,
    };

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    function handleData(chunk, res) {
        const payloads = chunk.toString().split('\n\n');
        for (const payload of payloads) {
            if (payload.includes('[DONE]')) {
                res.write(`event: done\ndata: {}\n\n`);
                res.flush();
                res.end();
                return;
            }
            processPayload(payload, res);
        }
    }
    
    function processPayload(payload, res) {
        if (!payload.startsWith('data:')) return;

        const data = JSON.parse(payload.replace('data: ', ''));
        try {
            const text = data.choices[0].delta?.content;
            if (text) {
                res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
                res.flush();
            }
        } catch (error) {
            console.error(`Error with JSON.parse and ${payload}.\n${error}`);
        }
    }
    
    openaiAxios.post('chat/completions', data, { responseType: 'stream' })
        .then((response) => {
            response.data.on('data', (chunk) => handleData(chunk, res));
        })
        .catch((error) => {
            console.error('Error when calling OpenAI:', error.response?.data);
            res.status(500).end(`Internal Server Error: ${error.message}`);
        });
});

export default handler;
