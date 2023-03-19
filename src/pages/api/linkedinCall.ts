import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import axios from "axios";

const handler = nc<NextApiRequest, NextApiResponse>()
    .post((req, res) => {
        const { accessToken, text } = req.body; // pobieranie danych z ciała żądania

        // tutaj można wykonać jakieś operacje na danych, np. zapisać w bazie danych
        const headers = {
            ContentType: 'application/json',
            LinkedInVersion: '202301',
            XRestliProtocolVersion: '2.0.0',
            Authorization: `Bearer ${accessToken}`
        }

        const data = {
            "author": "urn:li:person:eJiIx5Mbul",
            "commentary": `${text}`,
            "visibility": "PUBLIC",
            "distribution": {
                "feedDistribution": "MAIN_FEED",
                "targetEntities": [],
                "thirdPartyDistributionChannels": []
            },
            "lifecycleState": "PUBLISHED",
            "isReshareDisabledByAuthor": false
        }

        // wysyłanie odpowiedzi z potwierdzeniem otrzymania danych
        console.log(accessToken, text)
        axios.post('https://api.linkedin.com/rest/posts', data, { headers: headers})
            .then(function (response) {
                console.log(response);
                res.status(200).json({ message: 'success' })
            } )
            .catch(function (error) {
                console.log(error);
                res.status(500).json({ message: 'error' })
            }
        );
    });

export default handler;
