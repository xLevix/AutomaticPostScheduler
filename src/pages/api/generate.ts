import { OpenAIStream } from "../../utils/OpenAIStream";

export const config = {
    runtime: "edge",
};

const handler = async (req) => {
    const { prompt } = await req.json();
    console.log("prompt", prompt);
    const payload = {
        model: "gpt-3.5-turbo",
        max_tokens: 2048,
        messages: [
            {
                role: "system",
                content:
                    "You are assistant writing posts to social media like Instagram, Twitter, and Linkedin. Write the post in the language that user asked the question. Limit your post to a maximum of 2200 characters; it can be less if you want.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        stream: true,
    };

    const stream = await OpenAIStream(payload);
    return new Response(stream);
};

export default handler;