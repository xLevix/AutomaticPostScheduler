import { Card, Image, Text, Badge, Button, Group, Container } from '@mantine/core';

const BadgeCard = ({ postData }) => {
  const { imgUrl, title, text, date, messageId } = postData;

  return (
    <Container size={700}>
    <Card shadow="sm" padding="lg" radius="md" withBorder >
      <Card.Section>
        <Image src={imgUrl} height={160} alt={title} />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>{title}</Text>
        <Badge color="blue" variant="light">
          {new Date(date).toLocaleString()}
        </Badge>
      </Group>

      <Text size="sm" c="dimmed">
        {text}
      </Text>

      <Button variant="light" color="blue" fullWidth mt="md" radius="md" color={"red"}>
        Delete planned post
      </Button>
    </Card>
    </Container>
  );
};

export default BadgeCard;