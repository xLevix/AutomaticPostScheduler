import { Container, Title, Text, Button, Card, Image, SimpleGrid, Space } from '@mantine/core';
import Head from 'next/head';
import photo from '../../public/posts.png';

const HomePage = () => {
  const steps = [
    {
      number: 1,
      title: 'Określ Temat Postu',
      description: 'Rozpocznij od zdefiniowania głównego tematu Twojego postu. To będzie punkt wyjścia dla AI do generowania treści.'
    },
    {
      number: 2,
      title: 'Oczekuj na Treść od AI',
      description: 'AI (GPT-3) wygeneruje wstępny szkic Twojego postu. Tekst będzie dostosowany do wybranego tematu.'
    },
    {
      number: 3,
      title: 'Edytuj Tekst',
      description: 'Zmodyfikuj tekst według uznania. Maksymalny limit słów: 3000.'
    },
    {
      number: 4,
      title: 'Dodaj Zdjęcie',
      description: 'Prześlij zdjęcie (do 1MB, aspect ratio od 4:5 do 1.91:1).'
    },
    {
      number: 5,
      title: 'Wybierz Datę Publikacji',
      description: 'Wybierz datę i godzinę publikacji postu, a następnie kliknij "Wyślij".'
    }
  ];

  return (
    <>
      <Head>
        <title>Automatyczne Harmonogramowanie Postów</title>
      </Head>

      <Container>
        <div style={{ textAlign: 'center', marginTop: '-70px' }}>
          <Image src={photo.src} alt="Automatyczne Harmonogramowanie Postów" height={photo.width*0.7} />
          <Title style={{ marginTop: '30px' }}>Narzędzie do Harmonogramowania Postów</Title>
          <Text style={{ marginTop: '30px' }}>Generuj i publikuj posty na mediach społecznościowych z AI</Text>
          <Button color="blue" size="lg" style={{ marginTop: '30px' }} onClick={() =>  window.location.href='/api/auth/signin'}>Wypróbuj teraz</Button>
        </div>

        <SimpleGrid cols={5} breakpoints={[{ maxWidth: 'lg', cols: 1 }]} spacing="lg" style={{ marginTop: '70px' }}>
          {steps.map((step) => (
            <Card key={step.number} shadow="sm" padding="lg">
              <Title order={4}>Krok {step.number}</Title>
              <Text>{step.title}</Text>
              <Space h="md"/>
              <Text size="sm">{step.description}</Text>
            </Card>
          ))}
        </SimpleGrid>

        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <Title>Zobacz, jak to działa</Title>
          <Button color="green" size="lg" style={{ marginTop: '20px' }}>Demo</Button>
        </div>
      </Container>
    </>
  );
}

export default HomePage;
