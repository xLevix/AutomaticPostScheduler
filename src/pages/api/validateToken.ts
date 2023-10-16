import { NextApiRequest, NextApiResponse } from "next";
import axios from 'axios';
import { IgApiClient } from "instagram-private-api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { provider, username, accessToken } = req.body;

    console.log('Validating token:', provider, username, accessToken);

    try {
        switch (provider) {
            case 'linkedin':
                await axios.get('https://api.linkedin.com/v2/me', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                break;

            case 'twitter':
                await axios.get('https://api.twitter.com/2/users/me', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                break;

            case 'credentials':
                const ig = new IgApiClient();
                ig.state.generateDevice(username);
                ig.state.proxyUrl = process.env.IG_PROXY;
                const auth = await ig.account.login(username, accessToken); 
                console.log(auth);
                const followersFeed = ig.feed.accountFollowers(auth.pk);
                await followersFeed.request();
                break;
        }

        res.send({ valid: true });
    } catch (error) {
        console.error('Error when validating token:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
            return res.send({ valid: false });
        }

        res.status(500).send({ valid: false, message: 'Server error' });
    }
}