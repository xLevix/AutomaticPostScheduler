import { NextApiRequest, NextApiResponse } from "next";
import axios from 'axios';

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
    console.log("Deleting post", process.env.QSTASH_TOKEN);

    await axios.delete(`https://qstash.upstash.io/v2/messages/${messageId}`, {
      headers: { Authorization: `Bearer ${process.env.QSTASH_TOKEN}` },
    });

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting the post", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
