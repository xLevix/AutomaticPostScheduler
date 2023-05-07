import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Calendar() {
    const { data: session} = useSession();
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (session) {
            const axios = require('axios');

            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `api/getMongo?userId=${session.user.id}`,
                headers: { }
            };

            axios.request(config)
                .then((response) => {
                    setLoading(false);
                    setPosts(response.data.data);
                })
                .catch((error) => {
                    console.log(error);
                });

        }
    }, [session]);

    // Map posts to events for FullCalendar
    const events = posts.map((post) => ({
        title: post.title,
        date: post.date,
    }));


    return (
        <div>
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
            />
            )}
        </div>
    );
}
