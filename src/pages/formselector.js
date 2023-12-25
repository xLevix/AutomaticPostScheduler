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
    LoadingOverlay,
    Space,
    Text,
    Progress,
    Card,
    Switch
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconCheck, IconUpload, IconX } from '@tabler/icons-react';
import axios from 'axios';

export default function Home() {
    const { data: session, status } = useSession()
    const router = useRouter();

    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const [time, setTime] = useState(0);
    const [date, setDate] = useState(new Date());
    const [image, setImage] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [hideResult, setHideResult] = useState(false);

    if (status === "loading") {
        return <p>Loading...</p>
    }

    if (status === "unauthenticated") {
        router.push('/api/auth/signin');
    }

    const askFunction = async (prompt) => {
        setLoading(true);
        setNotification(null);
        setResult("");

        const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt,
                provider: session?.provider,
            }),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const data = response.body;
        if (!data) {
            return;
        }
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value);
            setResult(prev => prev + chunkValue);
        }

        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            accessToken: session?.user.accessToken,
            text: result,
            userId: session?.user.id,
            delay: time,
            img: image || undefined,
            date,
            title: text,
            platform: session?.provider,
            imageUrl: imageUrl || undefined,
        };
        const endpoint = "api/uQStashCall";

        try {
            const response = await axios.post(endpoint, data);
            if (response.status === 200) {
                setNotification(
                    <Notification
                        title="Success"
                        color="teal"
                        icon={<IconCheck size="1.1rem" />}
                    >
                        The message has been added to the queue.
                    </Notification>
                );
                setTimeout(() => {
                    router.push('/calendar');
                }, 2000);
            } else {
                throw new Error("Server responded with non-OK status");
            }
        } catch (error) {
            setNotification(
                <Notification
                    title="Error"
                    message="An error occurred during transmission."
                    color="red"
                    icon={<IconX size="1.1rem" />}
                />
            );
        }
    };

    const fetchUploadUrl = async (name, type) => {
        const response = await fetch(`/api/upload-url?file=${encodeURIComponent(name)}&fileType=${encodeURIComponent(type)}`);
        if (!response.ok) throw new Error('Failed to fetch upload URL.');
        return await response.json();
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

    const postImageToTwitter = async (session, imageUrl) => {
        if (!session?.user?.name) return;
    
        const response = await axios.post('api/twitterImgCall', {
            accessToken: session.user.accessToken,
            img: imageUrl,
            additionalOwners: session.user.id,
        });
    
        if (response.status !== 200) throw new Error('API call to Twitter failed.');
        return response.data.mediaId;
    };    

    const checkAspectRatio = (width, height) => {
        const aspectRatio = width / height;
        return aspectRatio >= 4 / 5 && aspectRatio <= 1.91;
    };

    const uploadPhoto = async (file) => {
        if (!file) return;
    
        if (file.size > 1024 * 1024) {
            alert("The file is too large. The maximum file size is 1MB.");
            setImage(''); 
            setImageUrl('');
            setSelectedFile(null); 
            return;
        }
        
        try {
            const img = new Image();
            img.src = URL.createObjectURL(file);
    
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    const aspectRatioValid = checkAspectRatio(img.width, img.height);
                    if (!aspectRatioValid) {
                        alert("Incorrect image proportions. Make sure the image has proportions from 4:5 to 1.91:1.");
                        setImage(''); 
                        setImageUrl(''); 
                        setSelectedFile(null);
                    } else {
                        resolve();
                    }
                };
    
                img.onerror = () => {
                    reject(new Error("Failed to load image."));
                };
            });
    
            const { name, type } = file;
            const { url, fields } = await fetchUploadUrl(name, type);
    
            const formData = new FormData();
            Object.entries({ ...fields, file }).forEach(([key, value]) =>
                formData.append(key, value)
            );
    
            const response = await fetch(url, { method: "POST", body: formData });
            if (!response.ok) throw new Error("Failed to upload image.");
    
            const imageUrl = `https://${url.split("/")[3]}.${url.split("/")[2]}/${encodeURIComponent(
                name
            )}`;
            console.log("Uploaded image URL: ", imageUrl);
            setImage(imageUrl);
            setImageUrl(imageUrl);
    
            if (session?.provider === 'twitter') {
                const mediaId = await postImageToTwitter(session, imageUrl);
                setImage(mediaId);
            } else if (session?.provider === 'linkedin') {
                const assetId = await postImageToLinkedIn(session, imageUrl);
                setImage(assetId);
            }
            console.log("Uploaded image ID: ", image);
        } catch (error) {
            console.error(error);
            setImage('');
            setImageUrl('');
        }
    };

    let characterLimit = 3000;
    let warningThreshold = 0.8;

    if (session?.provider === 'twitter') {
        characterLimit = 280;
    } else if (session?.provider === 'credentials') {
        characterLimit = 2200;
    }

    const characterCount = result.length;
    const charactersRemaining = characterLimit - characterCount;
    const progress = (characterCount / characterLimit) * 100;

    let progressColor = 'green';
    if (progress > warningThreshold * 100) {
        progressColor = 'yellow';
    }
    if (progress > 100) {
        progressColor = 'red';
    }

    return (
        <Container size={700}>
            {notification}
            <Grid gutter="md">
                <Col span={12}>
                    <Paper shadow="xl" radius="lg" p="xl" withBorder>
                        <form onSubmit={handleSubmit}>
                            <Textarea
                                label="Describe what you would like to write about and click ask"
                                placeholder="Description..."
                                autosize
                                minRows={2}
                                maxRows={5}
                                value={text}
                                onChange={e => setText(e.target.value)}
                                multiline
                                required
                            />
                            <Space h="md" />
                            <Button onClick={() => askFunction(text)} fullWidth={true}>Ask</Button>
                            <Space h="xl" />
                            <Switch
                                checked={hideResult}
                                onChange={() => setHideResult(!hideResult)}
                                label="Surprise me :) !"
                            />
                            <Space h="md" />
                            {hideResult ? null : (
                                <Textarea
                                label="Generated text"
                                placeholder={"The generated text will appear here"}
                                autosize
                                minRows={5}
                                maxRows={10}
                                value={result}
                                onChange={e => setResult(e.target.value)}
                            />
                            )}
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
                            <Card withBorder radius="md" padding="xl" bg="var(--mantine-color-body)">
                                <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
                                    Character limit
                                </Text>
                                <Text fz="lg" fw={500}>
                                    {characterCount} / {characterLimit}
                                </Text>
                                <Progress
                                    value={(characterCount / characterLimit) * 100}
                                    mt="md"
                                    size="lg"
                                    radius="xl"
                                    styles={{
                                        bar: {
                                            backgroundColor: progressColor
                                        }
                                    }}
                                />
                            </Card>
                            <FileInput
                                label="Upload a photo (.png lub .jpg, max 1MB)"
                                placeholder={"Choose a photo"}
                                icon={<IconUpload size={rem(14)} />}
                                onChange={(file) => {
                                    setSelectedFile(file);
                                    uploadPhoto(file);
                                }}
                                value={selectedFile}
                                accept={['image/png', 'image/jpeg']}
                            />
                            <Space h="md" />
                            <DateTimePicker
                                clearable
                                label="When should the post be published?"
                                placeholder={"Choose a date and time"}
                                minDate={new Date()} 
                                onChange={value => {
                                    const differenceInMilliseconds = Math.abs(Date.now() - value.getTime());
                                    setTime(Math.floor(differenceInMilliseconds / (1000 * 60)));
                                    setDate(value);
                                }}
                            />
                            <Space h="md" />
                            <Button fullWidth={true} type="submit" disabled={charactersRemaining < 0}>Send</Button>
                        </form>
                    </Paper>
                </Col>
            </Grid>
        </Container>
    );
}