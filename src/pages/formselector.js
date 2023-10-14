import { useState, useCallback } from 'react';
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
import { useEffect } from 'react';


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
    const endpoint = "api/uQStashCall?platform=" + provider;

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
            throw new Error("Server responded with non-OK status");
        }
    } catch (error) {
        setLoading(false);
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

export default function Home() {
    const { data: session } = useSession();
    const [time, setTime] = useState(0);
    const [date, setDate] = useState(new Date());
    const [image, setImage] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [notification, setNotification] = useState(null);
    const [provider, setProvider] = useState(session?.user.name ? 'linkedin' : 'instagram');
    const router = useRouter();
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    if (!session?.user) {
        return <div>Zaloguj się, aby korzystać z tej strony.</div>;
    }

    const askFunction = async (e) => {
        const promptData = { prompt: e }; // Update with appropriate prompt value

        const response = await fetch(
            'http://localhost:3000/api/gptCall',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(promptData)
            }
        );

        const reader = response.body
            .pipeThrough(new TextDecoderStream())
            .getReader()
        while (true) {
            const { value: chunk, done } = await reader.read();
            if (done) break;

            const messages = chunk.split('\n\n');
            for (let message of messages) {
                if (message.startsWith('data: ')) {
                    const possibleJson = message.replace('data: ', '');
                    try {
                        const jsonData = JSON.parse(possibleJson);
                        if (jsonData.content) {
                            setResult((prev) => prev + jsonData.content);
                        }
                    } catch (error) {
                        console.error('Error parsing JSON:', error.message);
                        console.log('Faulty data:', possibleJson);
                    }
                }
            }
        }
    }

    const fetchUploadUrl = async (name, type) => {
        const response = await fetch(`/api/upload-url?file=${encodeURIComponent(name)}&fileType=${encodeURIComponent(type)}`);
        if (!response.ok) throw new Error('Failed to fetch upload URL.');
        return await response.json();
    };

    const uploadToServer = async (url, fields, file) => {
        const formData = new FormData();
        Object.entries({ ...fields, file }).forEach(([key, value]) => formData.append(key, value));
        const response = await fetch(url, { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Failed to upload image.');
    };

    const postImageToLinkedIn = async (session, imageUrl) => {
        if (!session?.user?.name) return;
        const response = await axios.post('api/linkedinImgCall', {
            accessToken: session.user.accessToken,
            userId: session.user.id,
            img: imageUrl,
        });
        if (response.status !== 200) throw new Error('API call to LinkedIn failed.');
        return response.data.assetID.slice(1, -1);
    };


    const checkAspectRatio = (width, height) => {
        const aspectRatio = width / height;
        return aspectRatio >= (4 / 5) && aspectRatio <= 1.91;
    };

    const uploadPhoto = async (file) => {
        if (!file) return;

        return new Promise(async (resolve, reject) => {
            // Sprawdzanie aspect ratio
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = async () => {
                const aspectRatioValid = checkAspectRatio(img.width, img.height);
                if (!aspectRatioValid) {
                    alert('Nieprawidłowe proporcje obrazka. Upewnij się, że obrazek ma proporcje od 4:5 do 1.91:1.');
                    reject(new Error('Invalid aspect ratio.'));
                    return;
                }
                try {
                    const { name, type } = file;
                    const { url, fields } = await fetchUploadUrl(name, type);

                    await uploadToServer(url, fields, file);

                    const imageUrl = `https://${url.split('/')[3]}.${url.split('/')[2]}/${encodeURIComponent(name)}`;
                    setImage(imageUrl);
                    setImageUrl(imageUrl);

                    const assetId = await postImageToLinkedIn(session, imageUrl);
                    setImage(assetId);
                    resolve();

                } catch (error) {
                    console.error(error);
                    reject(error);
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
                                multiline
                                required
                            />
                            <Space h="md" />
                            <Button onClick={() => askFunction(text)} fullWidth={true}>Zapytaj</Button>
                            <Space h="xl" />
                            <Textarea
                                label="Wygenerowany tekst"
                                placeholder={"Tutaj pojawi się wygenerowany tekst"}
                                autosize
                                minRows={5}
                                maxRows={10}
                                value={result}
                                onChange={e => setResult(e.target.value)}
                            />
                            {loading && (
                                <LoadingOverlay
                                    visible={loading}
                                    opacity={0.9}
                                    color="gray"
                                    zIndex={1000}
                                    loader={<Loader />}
                                />
                            )}
                            <Space h="md" />
                            <FileInput
                                label="Prześlij zdjęcie (.png lub .jpg, max 1MB)"
                                placeholder={"Wybierz zdjęcie"}
                                icon={<IconUpload size={rem(14)} />}
                                onInput={(files) => uploadPhoto(files[0])}
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