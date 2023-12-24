import { Container, Title, Text, Button, Card, Image, SimpleGrid, Space } from '@mantine/core';
import Head from 'next/head';
import photo from '../../public/posts.png';

const HomePage = () => {
  const steps = [
    {
      number: 1,
      title: 'Define the Topic of the Post',
      description: 'Start by defining the main topic of your post. This will be the starting point for AI to generate content.'
    },
    {
      number: 2,
      title: 'Wait for Content from AI',
      description: 'AI (GPT-3) will generate a preliminary draft of your post. The text will be tailored to the chosen topic.'
    },
    {
      number: 3,
      title: 'Edit the Text',
      description: 'Modify the text as you see fit. Maximum word limit: 3000.'
    },
    {
      number: 4,
      title: 'Add a Photo',
      description: 'Upload a photo (up to 1MB, aspect ratio from 4:5 to 1.91:1).'
    },
    {
      number: 5,
      title: 'Choose the Publication Date',
      description: 'Choose the date and time of the post publication, then click "Submit".'
    }
  ];

  return (
    <>
      <Head>
        <title>Automatic Post Scheduling</title>
      </Head>

      <Container>
        <div style={{ textAlign: 'center', marginTop: '-70px' }}>
          <Image src={photo.src} alt="Automatic Post Scheduling" height={photo.width*0.7} />
          <Title style={{ marginTop: '30px' }}>Post Scheduling Tool</Title>
          <Text style={{ marginTop: '30px' }}>Generate and publish posts on social media with AI</Text>
          <Button color="blue" size="lg" style={{ marginTop: '30px' }} onClick={() =>  window.location.href='/api/auth/signin'}>Try now</Button>
        </div>

        <SimpleGrid cols={5} breakpoints={[{ maxWidth: 'lg', cols: 1 }]} spacing="lg" style={{ marginTop: '70px' }}>
          {steps.map((step) => (
            <Card key={step.number} shadow="sm" padding="lg">
              <Title order={4}>Step {step.number}</Title>
              <Text>{step.title}</Text>
              <Space h="md"/>
              <Text size="sm">{step.description}</Text>
            </Card>
          ))}
        </SimpleGrid>

        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <Title>See how it works</Title>
          <Button color="green" size="lg" style={{ marginTop: '20px' }}>Demo</Button>
        </div>
      </Container>
    </>
  );
}

export default HomePage;