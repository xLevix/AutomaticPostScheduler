import { OpenAIStream } from "../../utils/OpenAIStream";

export const config = {
    runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
    const { prompt } = (await req.json()) as {
        prompt?: string;
    };

    const payload = {
        model: "gpt-3.5-turbo-instruct",
        prompt,
        max_tokens: 2048,
        stream: true
    };

    const stream = await OpenAIStream(payload);
    return new Response(stream);
};

export default handler;