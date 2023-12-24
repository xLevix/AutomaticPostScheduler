/**
 * @swagger
 * /utils/addPostIdToDb
 *   put:
 *     summary: Endpoint to update a post in MongoDB.
 *     description: This endpoint receives an object ID and a post ID in the request body. It then updates the post ID of the post with the provided object ID. If the post does not exist, it returns a 404 error.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               objectId:
 *                 type: string
 *                 description: The ID of the object to be updated.
 *               postId:
 *                 type: string
 *                 description: The new post ID.
 *     responses:
 *       200:
 *         description: The post was successfully updated.
 *       404:
 *         description: The post was not found.
 *       500:
 *         description: An error occurred and the post was not updated.
 */

const axios = require('axios');

/**
 * Function to add a post ID to a post in the database.
 * @param {string} objectId - The ID of the object to be updated.
 * @param {string} postId - The new post ID.
 * @returns {Promise<object>} - A promise that resolves to the response data.
 * @throws {Error} - Throws an error if there is a problem updating the post.
 */
const addPostIdToDb = async (objectId, postId) => {
    let putConfig = {
        method: 'put',
        url: 'https://automatic-post-scheduler.vercel.app/api/getMongo',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            objectId: objectId,
            postId: postId
        })
    };

    try {
        const putResponse = await axios(putConfig);
        return putResponse.data;
    } catch (putError) {
        console.error('PUT Request error:', putError);
        throw new Error('Failed to update the post in database');
    }
};

export default addPostIdToDb;