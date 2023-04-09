import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import request from "request";

const handler = nc<NextApiRequest, NextApiResponse>()
    .post((req, res) => {
        const { img, userId, accessToken } = req.body;

        var axios = require('axios');
        var data = JSON.stringify({
            "registerUploadRequest": {
                "owner": `urn:li:person:${userId}`,
                "recipes": [
                    "urn:li:digitalmediaRecipe:feedshare-image"
                ],
                "serviceRelationships": [
                    {
                        "identifier": "urn:li:userGeneratedContent",
                        "relationshipType": "OWNER"
                    }
                ],
                "supportedUploadMechanism": [
                    "SYNCHRONOUS_UPLOAD"
                ]
            }
        });

        var config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.linkedin.com/rest/assets?action=registerUpload',
            headers: {
                'X-Restli-Protocol-Version': '2.0.0',
                'Content-Type': 'application/json',
                'LinkedIn-Version': '202301',
                'Authorization': `Bearer ${accessToken}`,
            },
            data : data
        };

        axios(config)
            .then(function (response) {
                let uploadUrl = JSON.stringify(response.data["value"]["uploadMechanism"]["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]["uploadUrl"]);
                const assetID = JSON.stringify(response.data["value"]["asset"]);
                const FormData = require('form-data');
                let data = new FormData();
                uploadUrl = uploadUrl.replace(/['"]+/g, '');
                data.append('file', request(img));

                var config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: uploadUrl,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    data : data
                }

                axios(config)
                    .then(function (response) {
                        console.log(JSON.stringify(response.data));
                        res.status(200).json({ message: 'IMG uploaded', assetID: assetID });
                    })
            })
            .catch(function (error) {
                console.log(error);
                res.status(500).json({ message: 'IMG error', error: error });
            });

    });

export default handler;
