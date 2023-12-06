import handler from '../../pages/api/linkedinCall';
import { createMocks } from 'node-mocks-http';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('linkedinCall API Handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a post when the request is valid', async () => {
        mockedAxios.post.mockResolvedValueOnce({ status: 200, data: { message: 'Post created' } });

        const { req, res } = createMocks({
            method: 'POST',
            body: {
                accessToken: 'test-token',
                text: 'Hello world',
                userId: 'test-user',
                img: undefined,
            },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getJSONData()).toEqual({ message: 'Post created' });
        expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('should return an error when the axios post request fails', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('Post not created'));

        const { req, res } = createMocks({
            method: 'POST',
            body: {
                accessToken: 'test-token',
                text: 'Hello world',
                userId: 'test-user',
                img: undefined,
            },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(500);
        expect(res._getJSONData()).toEqual({ message: 'Post not created', error: new Error('Post not created') });
        expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('should handle image data when provided', async () => {
        mockedAxios.post.mockResolvedValueOnce({ status: 200, data: { message: 'Post created with image' } });

        const { req, res } = createMocks({
            method: 'POST',
            body: {
                accessToken: 'test-token',
                text: 'Hello world',
                userId: 'test-user',
                img: 'urn:li:image:id',
            },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getJSONData()).toEqual({ message: 'Post created with image' });
        expect(mockedAxios.post).toHaveBeenCalled();
    });
});