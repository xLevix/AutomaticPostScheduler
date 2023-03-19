import { useState } from 'react';
import {useSession} from "next-auth/react";
export default function Home() {
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const { data: session} = useSession();

    const handleSubmit = async (e) => {
        e.preventDefault();
        //make axios post for /api/qstashCall
        var axios = require('axios');
        var data = JSON.stringify({
            accessToken: session?.user.accessToken,
            text: text,
            userId: session?.user.id
        });

        var config = {
            method: 'post',
            url: 'api/qstashCall',
            headers: {
                'Content-Type': 'application/json'
            },
            data : data
        };

        axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
            setResult(JSON.stringify(response.data));
        })

        .catch(function (error) {
            console.log(error);
        });

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
