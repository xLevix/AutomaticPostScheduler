import axios from 'axios';

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
