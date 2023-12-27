/**
 * @swagger
 * /api/deletePost:
 *   delete:
 *     summary: Endpoint to delete a post.
 *     description: This endpoint receives a message ID and a user ID in the request body. It then retrieves the post with the provided message ID. If the post exists and the user ID matches the user ID of the post, it deletes the post. If the post does not exist, it returns a 404 error. If the user ID does not match, it returns a 403 error.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageId:
 *                 type: string
 *                 description: The ID of the message to be deleted.
 *               userId:
 *                 type: string
 *                 description: The ID of the user who is deleting the post.
 *     responses:
 *       200:
 *         description: The post was successfully deleted.
 *       403:
 *         description: The user does not have permission to delete the post.
 *       404:
 *         description: The post was not found.
 *       500:
 *         description: An error occurred and the post was not deleted.
 */

import { NextApiRequest, NextApiResponse } from "next";
import axios from 'axios';

/**
 * Handler for the /api/deletePost endpoint.
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { messageId, userId } = req.body;

  if (req.method !== 'DELETE') {
    return res.status(405).end();
  }

  try {
    const response = await axios.get(`https://automatic-post-scheduler.vercel.app/api/getMongo?messageId=${messageId}`);
    const post = response.data.data;

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ message: "You don't have permission to delete this post" });
    }


    console.log("Deleting post", messageId);

    await axios.delete(`https://qstash.upstash.io/v2/messages/${messageId}`, {
      headers: { Authorization: `Bearer ${process.env.QSTASH_TOKEN}` },
    });

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting the post", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
