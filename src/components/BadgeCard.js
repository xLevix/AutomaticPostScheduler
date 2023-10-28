import { Card, Image, Text, Badge, Button, Group, Container } from '@mantine/core';

const BadgeCard = ({ postData, onDelete }) => {
  const { imgUrl, title, text, date, messageId } = postData;
  const isPostPublished = new Date(date) <= new Date();
  return (
    <Container size={700}>
    <Card shadow="sm" padding="lg" radius="md" withBorder >
      <Card.Section>
        <Image src={imgUrl} alt={title} objectFit="contain" />
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

      <Button
          variant="light"
          color="red"
          fullWidth
          mt="md"
          radius="md"
          onClick={onDelete}
          disabled={isPostPublished || postData.isDeleted}
        >
          {postData.isDeleted ? 'Post został usunięty' : (isPostPublished ? 'Post został opublikowany' : 'Delete planned post')}
        </Button>
    </Card>
    </Container>
  );
};

export default BadgeCard;