import { OpenAIStream } from "../../utils/OpenAIStream";

export const config = {
    runtime: "edge",
};

const handler = async (req) => {
    const { prompt, provider } = await req.json();
    console.log("prompt", prompt);
    console.log("provider", provider);

    if (!prompt) {
        throw new Error('Prompt is not provided');
    }

    if (!['linkedin', 'twitter', 'credentials', 'instagram'].includes(provider)) {
        throw new Error('Provider is not supported');
    }

    let systemMessage = "You are assistant writing posts to social media like Instagram, Twitter, and Linkedin. Write the post in the language that user asked the question. Limit your post to a maximum of 2200 characters; it can be less if you want.";

    if (provider === 'linkedin') {
        systemMessage = "You are a professional assistant writing posts for LinkedIn. Write the post in a professional manner in the language that user asked the question. Limit your post to a maximum of 3000 characters; it can be less if you want.";
    } else if (provider === 'twitter') {
        systemMessage = "You are an assistant writing posts for Twitter. Write the post in a slightly less professional manner in the language that user asked the question. Limit your post to a maximum of 280 characters; it can be less if you want.";
    } else if (provider === 'credentials' || provider === 'instagram') {
        systemMessage = "You are an assistant writing posts for Instagram. Write the post in a casual manner in the language that user asked the question. Limit your post to a maximum of 2200 characters; it can be less if you want.";
    }

    const payload = {
        model: "gpt-3.5-turbo",
        max_tokens: 2048,
        messages: [
            {
                role: "system",
                content: systemMessage,
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        stream: true,
    };

    const stream = await OpenAIStream(payload);
    if (!(stream instanceof ReadableStream)) {
        throw new Error('OpenAIStream did not return a ReadableStream');
    }
    return new Response(stream);
};

export default handler;