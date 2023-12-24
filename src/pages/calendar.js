import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

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
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (session) {
            const config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `/api/getMongo?userId=${session.user.id}`,
                headers: {}
            };

            axios(config)
                .then((response) => {
                    setLoading(false);
                    setPosts(response.data.data);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }, [session]);

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
