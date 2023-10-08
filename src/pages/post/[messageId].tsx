import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import BadgeCard from '../../components/BadgeCard';
import axios from 'axios';
import { useSession } from "next-auth/react";

const PostPage = () => {
    const { data: session} = useSession();
    const [postData, setPostData] = useState(null);
    const router = useRouter();
    const { messageId } = router.query;

    useEffect(() => {
        if (messageId) { 
            const fetchPostData = async () => {
                try {
                    const response = await axios.get(`/api/getMongo?messageId=${messageId}`);
                    setPostData(response.data.data);
                } catch (error) {
                    console.error("Error fetching the post data", error);
                }
            };

            fetchPostData();
        }
    }, [messageId, session]);  

    return postData ? <BadgeCard postData={postData} /> : <p>Loading...</p>;
}

export default PostPage;
