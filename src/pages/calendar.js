import { useSession } from "next-auth/react";
import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import {useRouter} from "next/router";

<style jsx>{`
    .fc-event.deleted-post {
        text-decoration: line-through !important;
        color: red !important;
    }
    .fc-event {
        height: 60px !important;
    }
`}</style>


export default function Calendar() {
    const { data: session, status } = useSession()
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const router = useRouter();

    if (status === "loading") {
        return <p>Loading...</p>
    }

    if (status === "unauthenticated") {
        router.push('/api/auth/signin');
    }

    const fetchData = async () => {
        if (session) {
            const config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `/api/getMongo?userId=${session.user.id}`,
                headers: {}
            };

            try {
                const response = await axios(config);
                setLoading(false);
                setPosts(response.data.data);
            } catch (error) {
                console.log(error);
            }
        }
    };

    fetchData();

    const events = posts.map((post) => ({
        title: post.title,
        date: post.date,
        text: post.text,
        url: `/post/${post.messageId}`,
        isDeleted: post.isDeleted || false
    }));

    const eventClassNames = (eventInfo) => {
        console.log("eventClassNames called");
    
        if (eventInfo.event.extendedProps.isDeleted) {
            console.log("Post is deleted!");
            return ['deleted-post'];
        }
        return [];
    };
    
    const eventContent = (eventInfo) => {
    console.log(eventInfo);
    let classNames = [];
    if (eventInfo.event.extendedProps.isDeleted) {
        classNames.push('deleted-post');
    }

    return {
        html: eventInfo.event.title,
        classNames: classNames
    };
};

    
    return (
        <div>
            <style jsx>{`
                .deleted-post {
                    text-decoration: line-through;
                }

                .fc-event {
                    height: 60px !important;
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
                    eventClassNames={eventClassNames}
                />
            )}
        </div>
    );
}
