/**
 * @swagger
 * /api/upload-url:
 *   post:
 *     summary: Endpoint to create a pre-signed URL for AWS S3.
 *     description: This endpoint receives a file name and file type in the query parameters. It then creates a pre-signed URL using AWS S3, which can be used to upload the file directly to S3. The URL expires after 60 seconds and the file size must be up to 1 MB.
 *     parameters:
 *       - in: query
 *         name: file
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the file to be uploaded.
 *       - in: query
 *         name: fileType
 *         required: true
 *         schema:
 *           type: string
 *         description: The MIME type of the file to be uploaded.
 *     responses:
 *       200:
 *         description: The pre-signed URL was successfully created.
 *       500:
 *         description: An error occurred and the pre-signed URL was not created.
 */

import S3 from 'aws-sdk/clients/s3'
import { NextApiRequest, NextApiResponse } from 'next'

/**
 * Handler for the /api/upload-url endpoint.
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const s3 = new S3({
        apiVersion: '2006-03-01',
    })

    const post = await s3.createPresignedPost({
        Bucket: process.env.BUCKET_NAME,
        Fields: {
            key: req.query.file,
            'Content-Type': req.query.fileType,
        },
        Expires: 60,
        Conditions: [
            ['content-length-range', 0, 1048576],
        ],
    })

    res.status(200).json(post)
}