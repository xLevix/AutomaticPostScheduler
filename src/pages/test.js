import { useState } from 'react';
import {useSession} from "next-auth/react";
export default function Home() {
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const { data: session} = useSession();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('https://qstash.upstash.io/v1/publish/https://automatic-post-scheduler.vercel.app/api/linkedinCall', {
            method: 'POST',
            body: JSON.stringify({ accessToken: session?.user.accessToken, text, userId: session?.user.id }),
            headers: {
                'Content-Type': 'application/json',
                'Upstash-Delay': '1m',
                'Authorization': 'Bearer eyJVc2VySUQiOiJjYThjYTZlZi0yYTFhLTQwMDAtOTVlZi1jYTM2NWZiOWYyMmQiLCJQYXNzd29yZCI6ImU1MTdjYWE0ZWUzOTQ0OTVhN2NkYzViMzBhZTAwNGU5In0='
            }
        });
        await response.json();
    };

    return (
        <div>
            <h1>Send a message</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Text:
                    <input type="text" value={text} onChange={(e) => setText(e.target.value)} />
                </label>
                <br />
                <button type="submit">Send</button>
            </form>
            <p>{result}</p>
        </div>
    );
}
