/**
 * @swagger
 * /api/twitterImgCall:
 *   post:
 *     summary: Endpoint to upload an image to Twitter.
 *     description: This endpoint receives an image and additional owners (optional) in the request body. It then uploads the image to Twitter using the Twitter API. The media ID of the uploaded image is returned in the response.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               img:
 *                 type: string
 *                 description: The image to be uploaded.
 *               additionalOwners:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Additional owners of the media.
 *     responses:
 *       200:
 *         description: The image was successfully uploaded and the media ID is returned in the response.
 *       500:
 *         description: An error occurred and the image was not uploaded.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

/**
 * Handler for the /api/twitterImgCall endpoint.
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 */

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
