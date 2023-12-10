import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import BadgeCard from '../../components/BadgeCard';
import axios from 'axios';
import { useSession } from "next-auth/react";
import {LoadingOverlay} from "@mantine/core";

const PostPage = () => {
    const { data: session } = useSession();
    const [postData, setPostData] = useState(null);
    const [stats, setStats] = useState(null);
    const router = useRouter();
    const { messageId } = router.query;
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
                }
            };

            fetchPostData();
        }
    }, [messageId, session]);


    useEffect(() => {
        if (postData && session) {
            const fetchStatistics = async () => {
                try {
                    const statsResponse = await axios.post(`/api/statistics/${session.provider}Statistics`, {
                        accountId: session.user.id,
                        postId: postData.postId,
                    });

                    const statsData = [
                        { title: 'Likes', value: statsResponse.data.likes || 0 },
                        { title: 'Comments', value: statsResponse.data.comments || 0 },
                        { title: 'Shares', value: statsResponse.data.reposts || 0 },
                    ];
                    console.log("Stats data", statsData);
                    setStats(statsData);
                } catch (error) {
                    console.error("Error fetching statistics", error);
                }
            };

            fetchStatistics();
        }
    }, [postData, session]);

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

    if (!stats) return <LoadingOverlay visible/>;
    if (error) return <p>{error}</p>;

    return (
        <div>{stats && (
            <BadgeCard postData={postData} statsData={stats} onDelete={handleDelete} />
        )}
        </div>
    );
};

export default PostPage;
