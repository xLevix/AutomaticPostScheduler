/**
 * @swagger
 * /api/OpenAIStream:
 *   post:
 *     summary: Function to stream responses from the OpenAI API.
 *     description: This function receives a payload in the request body. It then sends a POST request to the OpenAI API with the payload. The API's response is streamed back to the client. The function uses the EventSource protocol to parse the streamed data and handle reconnect intervals. It also handles fragmented chunks of data from the API.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: The payload to be sent to the OpenAI API.
 *     responses:
 *       200:
 *         description: The data was successfully streamed.
 *       500:
 *         description: An error occurred and the data was not streamed.
 */

import {createParser, ParsedEvent, ReconnectInterval} from "eventsource-parser";

/**
 * Function to stream responses from the OpenAI API.
 * @param {object} payload - The payload to be sent to the OpenAI API.
 * @returns {Promise<ReadableStream>} - A promise that resolves to a ReadableStream of the API's response.
 * @throws {Error} - Throws an error if there is a problem streaming the data.
 */

export async function OpenAIStream(payload) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let counter = 0;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
        },
        method: "POST",
        body: JSON.stringify(payload),
    });

    return new ReadableStream({
        async start(controller) {
            function onParse(event: ParsedEvent | ReconnectInterval) {
                if (event.type === "event") {
                    const data = event.data;
                    if (data === "[DONE]") {
                        controller.close();
                        return;
                    }
                    try {
                        const json = JSON.parse(data);
                        console.log("Received data:", json);

                        const text = json.choices[0].delta.content;
                        const hasNewLine = (text.match(/\n/) || []).length > 0;
                        if (counter >= 2 || !hasNewLine) {
                            const queue = encoder.encode(text);
                            controller.enqueue(queue);
                            counter++;
                        }
                    } catch (e) {
                        controller.error(e);
                    }
                }
            }
            const parser = createParser(onParse);

            for await (const chunk of res.body as any) {
                parser.feed(decoder.decode(chunk));
            }
        },
    });
}