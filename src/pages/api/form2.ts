import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';

const handler = nc<NextApiRequest, NextApiResponse>()
    .post((req, res) => {
        const { name, email } = req.body; // pobieranie danych z ciała żądania

        // tutaj można wykonać jakieś operacje na danych, np. zapisać w bazie danych

        res.status(200).json({ message: `Otrzymano dane: ${name}, ${email}` }); // wysyłanie odpowiedzi z potwierdzeniem otrzymania danych
    });

export default handler;
