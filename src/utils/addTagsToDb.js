/**
 * @swagger
 * /utils/addTagsToDb:
 *   post:
 *     summary: Endpoint to add a new trending hashtag to the database.
 *     description: This endpoint receives a provider, country, tags, and date in the request body. It then adds the provided tags to the database for the provided provider and country, with the provided date.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *                 description: The provider for which the tags are to be added.
 *               country:
 *                 type: string
 *                 description: The country for which the tags are to be added.
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The tags to be added.
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: The date when the tags were retrieved.
 *     responses:
 *       200:
 *         description: The tags were successfully added.
 *       500:
 *         description: An error occurred and the tags were not added.
 */

import axios from 'axios';

/**
 * Function to add tags to the database.
 * @param {string} provider - The provider for which the tags are to be added.
 * @param {string} country - The country for which the tags are to be added.
 * @param {string[]} tags - The tags to be added.
 * @returns {Promise<object>} - A promise that resolves to the response data.
 * @throws {Error} - Throws an error if there is a problem adding the tags.
 */
const addTagsToDb = async (provider, country, tags) => {
    let config = {
        method: 'post',
        url: 'https://automatic-post-scheduler.vercel.app/api/trending/scrapDB',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            provider: provider,
            country: country,
            tags: tags,
            date: new Date().toISOString(),
        })
    };

    try {
        return await axios(config);
    } catch (error) {
        console.log(error);
        throw new Error('Failed to add tags to DB');
    }
};

export default addTagsToDb;