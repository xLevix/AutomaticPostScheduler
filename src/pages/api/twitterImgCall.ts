import type { NextApiRequest, NextApiResponse } from 'next';
import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { img, additionalOwners } = req.body;

  try {
    const response = await axios.get(img, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');
    const mimeType = response.headers['content-type'];

    if (!mimeType) {
      throw new Error('Unable to determine MIME type of the image');
    }

    const mediaId = await twitterClient.v1.uploadMedia(imageBuffer, {
      mimeType: mimeType,
      additionalOwners,
    });

    res.status(200).json({
      message: 'Image uploaded successfully',
      mediaId,
    });
  } catch (error) {
    console.error('Error uploading image to Twitter:', error);
    res.status(500).json({ message: 'Error uploading image', error });
  }
}
