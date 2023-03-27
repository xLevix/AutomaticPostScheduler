require("dotenv").config();
const { IgApiClient } = require('instagram-private-api');
const { get } = require('request-promise');

const postToInsta = async () => {
    const ig = new IgApiClient();
    ig.state.generateDevice(process.env.IG_USERNAME);
    await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

    const imageBuffer = await get({
        url: 'https://media.istockphoto.com/id/1281804798/photo/very-closeup-view-of-amazing-domestic-pet-in-mirror-round-fashion-sunglasses-is-isolated-on.jpg?b=1&s=170667a&w=0&k=20&c=4CLWHzcFeku9olx0np2htie2cOdxWamO-6lJc-Co8Vc=',
        encoding: null,
    });

    await ig.publish.photo({
        file: imageBuffer,
        caption: 'Really nice photo from the internet!', // nice caption (optional)
    });
}

postToInsta();