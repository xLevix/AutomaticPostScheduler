import handler from '../../pages/api/generate';
import { OpenAIStream } from '../../utils/OpenAIStream';
import { createMocks } from 'node-mocks-http';

jest.mock('../../utils/OpenAIStream');

describe('generate API Handler', () => {
    const createRequest = (body) => {
        const { req } = createMocks({
            method: 'POST',
            body,
        });
        req.json = jest.fn().mockResolvedValue(body);
        return req;
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    const testCases = [
        { provider: 'twitter', systemMessageContains: 'Twitter' },
        { provider: 'linkedin', systemMessageContains: 'LinkedIn' },
        { provider: 'credentials', systemMessageContains: 'Instagram' },
        { provider: 'instagram', systemMessageContains: 'Instagram' },
    ];

    testCases.forEach(({ provider, systemMessageContains }) => {
        it(`should handle the provider: ${provider} correctly`, async () => {
            const mockStream = new ReadableStream();
            (OpenAIStream as jest.Mock).mockResolvedValueOnce(mockStream);

            const req = createRequest({
                prompt: 'Hello world',
                provider,
            });

            const response = await handler(req);

            expect(OpenAIStream).toHaveBeenCalledWith(expect.objectContaining({
                messages: expect.arrayContaining([
                    expect.objectContaining({
                        role: 'system',
                        content: expect.stringContaining(systemMessageContains),
                    }),
                    expect.objectContaining({
                        role: 'user',
                        content: 'Hello world',
                    }),
                ]),
            }));
            expect(response).toBeInstanceOf(Response);
        });
    });

    it('should throw an error when the provider is not supported', async () => {
        const req = createRequest({ prompt: 'Hello world', provider: 'unsupported' });

        await expect(handler(req)).rejects.toThrow();
    });

    it('should throw an error when the prompt is not provided', async () => {
        const req = createRequest({ provider: 'linkedin' });

        await expect(handler(req)).rejects.toThrow();
    });

    it('should handle error from OpenAIStream function', async () => {
        (OpenAIStream as jest.Mock).mockRejectedValueOnce(new Error('OpenAIStream error'));
        const req = createRequest({ prompt: 'Hello world', provider: 'twitter' });

        await expect(handler(req)).rejects.toThrow('OpenAIStream error');
    });

    it('should handle error when OpenAIStream function returns a non-ReadableStream object', async () => {
        (OpenAIStream as jest.Mock).mockResolvedValueOnce({});
        const req = createRequest({ prompt: 'Hello world', provider: 'twitter' });

        await expect(handler(req)).rejects.toThrow();
    });

    it('should handle long-running OpenAIStream function', async () => {
        const mockStream = new ReadableStream();
        (OpenAIStream as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockStream), 2000)));

        const req = createRequest({ prompt: 'Hello world', provider: 'twitter' });

        const response = await handler(req);
        expect(response).toBeInstanceOf(Response);
    });
});
