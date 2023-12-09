import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import {IgApiClient} from "instagram-private-api";
import {urlSegmentToInstagramId} from "instagram-id-to-url-segment";

const handler = nc<NextApiRequest, NextApiResponse>()
    .post(async (req, res) => {

        const {userId: username, accessToken: password, mediaId} = req.body;

        const ig = new IgApiClient();

        ig.state.generateDevice(username);

        const auth = await ig.account.login(username, password);

        if (JSON.stringify(auth)) {
            const likers = await ig.media.likers(
                urlSegmentToInstagramId(mediaId)
            );
            res.status(200).json(likers);
        } else {
            res.status(500).json("Failed to login");
        }

    });

export default handler;