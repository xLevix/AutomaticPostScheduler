import { useState } from 'react';
import { useSession } from "next-auth/react";
import {
    Textarea,
    Paper,
    Grid,
    Container,
    Button,
    FileInput,
    Loader,
    Notification,
    Col,
    rem,
    Group,
    LoadingOverlay, Space
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import {IconCheck, IconUpload, IconX} from '@tabler/icons-react';
import axios from 'axios';

export default function Home() {
    const { data: session } = useSession();
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const [time, setTime] = useState(0);
    const [date, setDate] = useState(new Date());
    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [provider, setProvider] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotification(null);

        let data={};
        if (session?.user.name) {
            setProvider('linkedin');
            data = {
                accessToken: session?.user.accessToken,
                text: result,
                userId: session?.user.id,
                delay: time,
                img: image ? image : undefined,
                date: date,
                title: text,
                provider: 'linkedin'
            };
        } else {
            setProvider('instagram');
            data = {
                username: session?.user.id,
                password: session?.user.accessToken,
                desc: result,
                img: image ? image : undefined,
                delay: time,
                title: text,
                date: date,
                provider: 'instagram'
            };
        }

        let endpoint = session?.user.name ? 'api/qstashCall' : 'api/qstashCall2';

        axios.post(endpoint, data)
            .then(response => {
                setLoading(false);
                if (response.status === 200) {
                    setNotification(
                        <Notification
                            title="Success"
                            color="teal"
                            icon={<IconCheck size="1.1rem" />}
                        >
                            Wiadomość została dodana do kolejki.
                        </Notification>
                    );
                } else {
                    setNotification(
                        <Notification
                            title="Failure"
                            color="red"
                            icon={<IconX size="1.1rem" />}
                        >
                            Wystąpił błąd podczas przesyłania.
                        </Notification>
                    );
                }
            })
            .catch(error => {
                setLoading(false);
                console.log(error);
                setNotification(
                    <Notification
                        title="Error"
                        message="Wystąpił błąd podczas przesyłania."
                        color="red"
                        icon={<IconX size="1.1rem" />}
                    />
                );
            });
    };

    const ask = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = {
            prompt: text,
        };
        axios.post('api/gptCall', data)
            .then(response => {
                setResult(response.data.replace(/['"]+/g, ''));
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
                ask(e);
            });
    };

    const uploadPhoto = async (file) => {
        if(!file) {
            return;
        }

        const filename = encodeURIComponent(file.name)
        const fileType = encodeURIComponent(file.type)
        const res = await fetch(
            `/api/upload-url?file=${filename}&fileType=${fileType}`
        )
        const { url, fields } = await res.json()
        const formData = new FormData()
        Object.entries({ ...fields, file }).forEach(([key, value]) => {
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

            if (provider=== 'linkedin') {
                axios.post('api/linkedinImgCall', {
                    accessToken: session?.user.accessToken,
                    userId: session?.user.id,
                    img: 'https://' + url.split('/')[3] + '.' + url.split('/')[2] + '/' + filename
                })
                    .then(function (response) {
                        console.log(JSON.stringify(response.data));
                        if (response.status === 200) {
                            setImage(response.data.assetID.slice(1,-1));
                            console.log(response.data.assetID.slice(1,-1))
                        } else {
                            alert("Coś poszło nie tak :(");
                        }
                    })

                    .catch(function (error) {
                        console.log(error);
                    });
            }
        } else {
            console.error('Upload failed.')
        }
    }


    return (
        <Container size={700}>
            {notification}
            <Grid gutter="md">
                <Col span={12}>
                    <Paper shadow="xl" radius="lg" p="xl" withBorder>
                        <form onSubmit={handleSubmit}>
                            <Textarea
                                label="Opisz o czym chciałbyś napisać i kliknij play"
                                placeholder="Opis..."
                                autosize
                                minRows={2}
                                maxRows={5}
                                value={text}
                                onChange={e => setText(e.target.value)}
                            />
                            <Space h="md" />
                            <Button onClick={ask} fullWidth={true}>Zapytaj</Button>
                            <Space h="xl" />
                            {
                                loading ? (
                                    <LoadingOverlay
                                        visible={loading}
                                        opacity={0.9}
                                        color="gray"
                                        zIndex={1000}
                                        loader={<Loader />}
                                    >
                                    </LoadingOverlay>
                                ) : (
                                    <Textarea
                                        label="Wygenerowany tekst"
                                        placeholder={"Tutaj pojawi się wygenerowany tekst"}
                                        autosize
                                        minRows={5}
                                        maxRows={10}
                                        value={result}
                                        onChange={e => setResult(e.target.value)}
                                    />
                                )
                            }
                            <Space h="md" />
                            <FileInput
                                label="Prześlij zdjęcie (.png lub .jpg, max 1MB)"
                                placeholder={"Wybierz zdjęcie"}
                                icon={<IconUpload size={rem(14)}/>}
                                onChange={(file) => {
                                    uploadPhoto(file);
                                }}
                                accept={['image/png', 'image/jpeg']}
                            />
                            <Space h="md" />
                            <DateTimePicker
                                clearable
                                label="Kiedy wiadomość ma zostać wysłana?"
                                placeholder={"Wybierz datę i godzinę"}
                                onChange={value => {
                                    const differenceInMilliseconds = Math.abs(Date.now() - value.getTime());
                                    setTime(Math.floor(differenceInMilliseconds / (1000 * 60)));
                                    setDate(value);
                                }}
                            />
                            <Space h="md" />
                            <Button fullWidth={true} type="submit">Send</Button>
                        </form>
                    </Paper>
                </Col>
            </Grid>
        </Container>
    );
}