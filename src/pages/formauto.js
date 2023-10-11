import { useState } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
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
    LoadingOverlay,
    Space
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconCheck, IconUpload, IconX } from '@tabler/icons-react';
import axios from 'axios';
import { set } from 'react-hook-form';

export default function Home() {
    const { data: session } = useSession();
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const [time, setTime] = useState(0);
    const [date, setDate] = useState(new Date());
    const [image, setImage] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [provider, setProvider] = useState(session?.user.name ? 'linkedin' : 'instagram');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotification(null);

        const data = {
            accessToken: session?.user.accessToken,
            text: result,
            userId: session?.user.id,
            delay: time,
            img: image || undefined,
            date,
            title: text,
            provider,
            imageUrl: imageUrl || undefined,
        };

        const endpoint = "api/uQStashCall?platform="+provider;

        try {
            const response = await axios.post(endpoint, data);
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
                setTimeout(() => {
                    router.push('/calendar');
                }, 2000);
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
        } catch (error) {
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
        }
    };

    const ask = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = {
            prompt: text,
        };
        try {
            const response = await axios.post('/api/gptCall', data, {
                headers: {
                    'Content-Type': 'text/event-stream',
                },
                responseType: 'stream', 
            });
    
            // Handle the streaming response
            const reader = response.data
                .pipeThrough(new TextDecoderStream())
                .getReader();
            let accumulatedResponse = '';
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                console.log('Received:', value);
                accumulatedResponse += value;
                setResult(accumulatedResponse);
            }
            setLoading(false);
        } catch (error) {
            console.log(error);
            ask(e);
        }
    };

    const checkAspectRatio = (width, height) => {
        const aspectRatio = width / height;
        return aspectRatio >= (4 / 5) && aspectRatio <= 1.91;
    };
    
    const uploadPhoto = async (file) => {
        if (!file) {
            return;
        }
    
        // Sprawdzanie aspect ratio
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = async () => {
                const aspectRatioValid = checkAspectRatio(img.width, img.height);
                if (!aspectRatioValid) {
                    alert('Nieprawidłowe proporcje obrazka. Upewnij się, że obrazek ma proporcje od 4:5 do 1.91:1.');
                    return;
                }
    
                // Kontynuowanie przesyłania
                const { name, type } = file;
                const res = await fetch(`/api/upload-url?file=${encodeURIComponent(name)}&fileType=${encodeURIComponent(type)}`);
                const { url, fields } = await res.json();
    
                const formData = new FormData();
                Object.entries({ ...fields, file }).forEach(([key, value]) => formData.append(key, value));
    
                const uploadRes = await fetch(url, { method: 'POST', body: formData });
                if (!uploadRes.ok) {
                    console.error('Upload failed.');
                    reject(new Error('Upload failed'));
                    return;
                }
    
                console.log('Uploaded successfully!');
                const imageUrl = `https://${url.split('/')[3]}.${url.split('/')[2]}/${encodeURIComponent(name)}`;
                setImage(imageUrl);
                setImageUrl(imageUrl);
    
                if (session?.user?.name) {
                    try {
                        const response = await axios.post('api/linkedinImgCall', {
                            accessToken: session.user.accessToken,
                            userId: session.user.id,
                            img: imageUrl,
                        });
                        console.log(JSON.stringify(response.data));
                        if (response.status === 200) {
                            const assetId = response.data.assetID.slice(1, -1);
                            setImage(assetId);
                            console.log(assetId);
                            resolve();
                        } else {
                            alert('Coś poszło nie tak :(');
                            reject(new Error('API call failed'));
                        }
                    } catch (error) {
                        console.error(error);
                        reject(error);
                    }
                }
            };
        });
    };
    


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
                            {loading ? (
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
                            )}
                            <Space h="md" />
                            <FileInput
                                label="Prześlij zdjęcie (.png lub .jpg, max 1MB)"
                                placeholder={"Wybierz zdjęcie"}
                                icon={<IconUpload size={rem(14)} />}
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
                                minDate={new Date()} 
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