import { useState } from 'react';
export default function Home() {
    const [accessToken, setAccessToken] = useState('');
    const [text, setText] = useState('');
    const [result, setResult] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('https://qstash.upstash.io/v1/publish/https://automatic-post-scheduler.vercel.app/api/linkedinCall', {
            method: 'POST',
            body: JSON.stringify({ accessToken, text }),
            headers: {
                'Content-Type': 'application/json',
                'Upstash-Delay': '3m',
                'Authorization': 'Bearer eyJVc2VySUQiOiJjYThjYTZlZi0yYTFhLTQwMDAtOTVlZi1jYTM2NWZiOWYyMmQiLCJQYXNzd29yZCI6ImU1MTdjYWE0ZWUzOTQ0OTVhN2NkYzViMzBhZTAwNGU5In0='
            }
        });
        const data = await response.json();
        setResult(`Thank you, ${data.name} (${data.email})!`);
    };

    return (
        <div>
            <h1>Send a message</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    AccessToken
                    <input type="text" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} />
                </label>
                <br />
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
