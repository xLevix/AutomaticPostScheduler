import axios from 'axios';

const addPostIdToDb = async (objectId, postId) => {
    let putConfig = {
        method: 'put',
        url: 'api/getMongo',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            objectId: objectId,
            postId: postId
        })
    };

    try {
        console.log('PUT Data:', putConfig.data);
        const putResponse = await axios(putConfig);
        console.log('PUT Response:', putResponse);
        return putResponse.data;
    } catch (putError) {
        console.error('PUT Request error:', putError);
        throw new Error('Failed to update the post in database');
    }
};

export default addPostIdToDb;
