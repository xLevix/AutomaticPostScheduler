import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { useRouter } from "next/router";

export default function Calendar() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const router = useRouter();

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session]); // Dependency array includes session

    if (status === "loading") {
        return <p>Loading...</p>;
    }

    if (status === "unauthenticated") {
        router.push('/api/auth/signin');
        return null;
    }

    async function fetchData() {
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `/api/getMongo?userId=${session.user.id}`,
            headers: {}
        };

        try {
            const response = await axios(config);
            setPosts(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const events = posts.map((post) => ({
        title: post.title,
        date: post.date,
        text: post.text,
        url: `/post/${post.messageId}`,
        isDeleted: post.isDeleted || false
    }));

    const eventContent = (eventInfo) => {
        let title = eventInfo.event.title;
        let time = eventInfo.event.startStr.split('T')[1].substring(0, 5); // Extracts the time from the startStr
        return {
            html: eventInfo.event.extendedProps.isDeleted ? `<s>${time} ${title}</s>` : `${time} ${title}`
        };
    };

    const eventDidMount = (info) => {
        if (info.event.extendedProps.isDeleted) {
            info.el.classList.add('deleted-post');
        }
    };

    return (
        <div>
            <style jsx>{`
                .deleted-post {
                    text-decoration: line-through;
                    color: red;
                }
            `}</style>
            {!loading && (
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    events={events}
                    eventTimeFormat={{
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: false
                    }}
                    eventContent={eventContent}
                    eventDidMount={eventDidMount}
                />
            )}
        </div>
    );
}
