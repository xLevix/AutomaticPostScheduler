import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import axios from "axios";

const handler = nc<NextApiRequest, NextApiResponse>()
    .post((req, res) => {
        const { accessToken, text } = req.body; // pobieranie danych z ciała żądania

        // tutaj można wykonać jakieś operacje na danych, np. zapisać w bazie danych

        // wysyłanie odpowiedzi z potwierdzeniem otrzymania danych
        console.log(accessToken, text)
        axios.post('https://api.linkedin.com/rest/posts', {
            headers: {
                'Content-Type': 'application/json',
                'LinkedIn-Version': '202301',
                'X-Restli-Protocol-Version': '2.0.0',
                'Authorization': `Bearer ` + accessToken
            },
            data: {
                "author": "urn:li:person:eJiIx5Mbul",
                "commentary": text,
                "visibility": "PUBLIC",
                "distribution": {
                    "feedDistribution": "MAIN_FEED",
                    "targetEntities": [],
                    "thirdPartyDistributionChannels": []
                },
                "lifecycleState": "PUBLISHED",
                "isReshareDisabledByAuthor": false
            }
        })
            .then(function (response) {
                console.log(response);
                res.status(200).json({ message: 'success' })
            } )
    });

export default handler;
