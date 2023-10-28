import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import BadgeCard from '../../components/BadgeCard';
import axios from 'axios';
import { useSession } from "next-auth/react";

const PostPage = () => {
    const { data: session } = useSession();
    const [postData, setPostData] = useState(null);
    const router = useRouter();
    const { messageId } = router.query;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (messageId && session) { 
            const fetchPostData = async () => {
                try {
                    const response = await axios.get(`/api/getMongo?messageId=${messageId}`);
                    const post = response.data.data;
                    if (post.userId !== session.user.id) {
                        setError("Nie masz uprawnień do przeglądania tego postu.");
                        return;
                    }
                    setPostData(post);
                } catch (error) {
                    console.error("Error fetching the post data", error);
                    setError("Wystąpił błąd podczas ładowania postu.");
                } finally {
                    setLoading(false);
                }
            };

            fetchPostData();
        }
    }, [messageId, session]);

    const handleDelete = async () => {
        try {
            await axios.delete('/api/deletePost', {
                data: {
                    messageId: messageId,
                    userId: session.user.id
                }
            });

            await axios.put('/api/getMongo', { messageId });
            router.replace('/calendar');
        } catch (error) {
            console.error("Error deleting the post", error);
        }
    };

    if (loading) return <p>Ładowanie...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <BadgeCard postData={postData} onDelete={handleDelete} />
        </div>
    );
};

export default PostPage;
