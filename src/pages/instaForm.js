import { useState } from 'react';
import {useSession} from "next-auth/react";

export default function Home() {
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const { data: session} = useSession();
    const [time, setTime] = useState(0);
    const {image, setImage} = useState('');

    const handleSubmit = async (e) => {        e.preventDefault();
        var axios = require('axios');
        var data = JSON.stringify({
            username: session?.user.id,
            password: session?.user.accessToken,
            desc: result,
            img: image,
            delay: time
        });

        var config = {
            method: 'post',
            url: 'api/qstashCall2',
            headers: {
                'Content-Type': 'application/json'
            },
            data : data
        };

        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                response.status === 200 ? alert("Wiadomość wysłana!") : alert("Coś poszło nie tak :(");
                setText('');
                setResult('');
                setTime(0)
            })

            .catch(function (error) {
                console.log(error);
            });

    };

    const ask = async (e) => {
        e.preventDefault();
        var axios = require('axios');
        var data = JSON.stringify({
            prompt: text,
        });

        var config = {
            method: 'post',
            url: 'api/gptCall',
            headers: {
                'Content-Type': 'application/json'
            },
            data : data
        };

        axios(config)
            .then(function (response) {
                var json = response.data;
                json = json.replace(/\\n/g, '');
                json = json.replaceAll("\\", "")
                json = json.substring(1, json.length-1);
                console.log(json);
                setResult(json);
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
                    Opisz o czym chcialbys napisac i klinij play: <img src="https://cdn-icons-png.flaticon.com/512/0/375.png" alt="Zapytaj" width="50" height="50" onClick={ask}/>
                    <br />
                    <textarea rows={5} cols={50} value={text} onChange={(e) => setText(e.target.value)} />
                </label>
                <br />  <br />
                Wygenerowany tekst: <br />
                <textarea rows={10} cols={70} value={result} onChange={(e) => setResult(e.target.value)} />
                <br /> <br />
                <p>Upload a .png or .jpg image (max 1MB).</p>
                <input
                    onChange={uploadPhoto}
                    type="file"
                    accept="image/png, image/jpeg"
                />
                <br /> <br />
                Czas za jaki wiadomość ma zostać wysłana: <br />
                <input type={"number"} min={0} max={30} placeholder={"time"} onChange={(e)=>setTime(e.target.value)}/>
                <br />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}


const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    const filename = encodeURIComponent(file.name)
    const fileType = encodeURIComponent(file.type)

    const res = await fetch(
        `/api/upload-url?file=${filename}&fileType=${fileType}`
    )
    const {url, fields} = await res.json()
    const formData = new FormData()

    Object.entries({...fields, file}).forEach(([key, value]) => {
        formData.append(key, value)
    })

    const upload = await fetch(url, {
        method: 'POST',
        body: formData,
    })

    if (upload.ok) {
        console.log('Uploaded successfully!')
        console.log('https://' + url.split('/')[3] + '.' + url.split('/')[2] + '/' + filename)
        return 'https://' + url.split('/')[3] + '.' + url.split('/')[2] + '/' + filename

    } else {
        console.error('Upload failed.')
    }
}
