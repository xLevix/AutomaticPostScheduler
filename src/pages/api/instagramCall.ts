import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import {IgApiClient} from "instagram-private-api";
import {get} from "request-promise";
import addPostIdToDb from "../../utils/addPostIdToDb";

const handler = nc<NextApiRequest, NextApiResponse>()
    .post(async (req, res) => {

        const { userId:username, accessToken:password, text:desc, img, objectId } = req.body;

        const ig = new IgApiClient();
        ig.state.generateDevice(username);
        const auth = await ig.account.login(username, password);

        if (JSON.stringify(auth)) {

            const imageBuffer = await get({
                url: img,
                encoding: null,
            });

            const publishResult = await ig.publish.photo({
                file: imageBuffer,
                caption: desc,
            });

            if (JSON.stringify(publishResult)) {
                const postId = publishResult.upload_id;
                const updateResponse = await addPostIdToDb(objectId, postId);
                res.status(200).json({PostId: + postId, DatabaseUpdate: updateResponse});
            } else {
                res.status(500).json("Failed to publish");
            }
        }

    });

export default handler;
