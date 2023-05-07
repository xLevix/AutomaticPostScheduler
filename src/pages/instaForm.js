import { useState } from 'react';
import {useSession} from "next-auth/react";
import {Textarea} from "@mantine/core";
import {DateTimePicker} from "@mantine/dates";
import { useDisclosure } from '@mantine/hooks';
import { LoadingOverlay, Button, Group, Box } from '@mantine/core';

export default function Home() {
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const { data: session} = useSession();
    const [time, setTime] = useState(0);
    const [date, setDate] = useState(new Date());
    const [image, setImage] = useState('');
    const [visible, setVisible] = useState(false);

    const handleSubmit = async (e) => {        e.preventDefault();
        var axios = require('axios');
        var data = JSON.stringify({
            username: session?.user.id,
            password: session?.user.accessToken,
            desc: result,
            img: image,
            delay: time,
            title: text,
            date: date
        });

        console.log(session?.user.id);
        console.log("\n")
        console.log(session?.user.accessToken);
        console.log("\n")
        console.log(session?.user);
        console.log("\n")
        console.log(session);
        console.log("\n")
        console.log(image);

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
        setVisible(true);
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
                setVisible(false);
            })

            .catch(function (error) {
                console.log(error);
                ask(e);
            });

    };


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
            setImage('https://' + url.split('/')[3] + '.' + url.split('/')[2] + '/' + filename)

        } else {
            console.error('Upload failed.')
        }
    }



    return (
        <div>
            <h1>Send a message</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Opisz o czym chcialbys napisac i klinij play: <img src="https://cdn-icons-png.flaticon.com/512/0/375.png" alt="Zapytaj" width="50" height="50" onClick={ask}/>
                    <br />
                    <Textarea autosize minRows={2} maxRows={5} style={{width:"30%"}} value={text} onChange={(e) => setText(e.target.value)} />
                </label>
                <br />  <br />
                <label>
                Wygenerowany tekst: <br />
                    <LoadingOverlay visible={visible} overlayBlur={2} />
                <Textarea autosize minRows={5} maxRows={10} style={{width:"30%"}} value={result} onChange={(e) => setResult(e.target.value)} />
                </label>
                <br /> <br />
                <p>Upload a .png or .jpg image (max 1MB).</p>
                <input
                    onChange={uploadPhoto}
                    type="file"
                    accept="image/png, image/jpeg"
                />
                <br /> <br />
                Kiedy wiadomość ma zostać wysłana: <br />
                <DateTimePicker
                    style={{width:"30%"}}
                    clearable
                    defaultValue={new Date()}
                    label="Pick date and time"
                    placeholder="time"
                    onChange={(value) => {
                        const differenceInMilliseconds = Math.abs(Date.now() - value.getTime());
                        setTime(Math.floor(differenceInMilliseconds / (1000 * 60)));
                        setDate(value);
                    }}
                />
                <br />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}
