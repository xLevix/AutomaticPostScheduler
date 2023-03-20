import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import {IgApiClient} from "instagram-private-api";
import {get} from "request-promise";

const handler = nc<NextApiRequest, NextApiResponse>()
    .post(async (req, res) => {

        const { username, password } = req.body;

        const loginToInsta = async () => {
            const ig = new IgApiClient();
            ig.state.generateDevice(username);
            await ig.account.login(username, password);
        }

        loginToInsta().then(() => {
            res.status(200).json({message: 'success'});

        }).catch((err) => {
            res.status(400).json({message: err});
        });

    });

export default handler;
