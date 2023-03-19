import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';

const handler = nc<NextApiRequest, NextApiResponse>()
    .post((req, res) => {
        const { accessToken, text } = req.body; // pobieranie danych z ciała żądania

        // tutaj można wykonać jakieś operacje na danych, np. zapisać w bazie danych

        res.status(200).json({ message: `Otrzymano dane: ${accessToken}, ${text}` }); // wysyłanie odpowiedzi z potwierdzeniem otrzymania danych
        console.log(accessToken, text)
    });

export default handler;
