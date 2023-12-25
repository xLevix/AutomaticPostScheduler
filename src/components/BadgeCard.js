import {Card, Image, Text, Badge, Button, Group, Container, Grid} from '@mantine/core';
import StatsGrid from "./StatsGrid";

const BadgeCard = ({ postData, onDelete, statsData }) => {
  const { imgUrl, title, text, date } = postData;
  const isPostPublished = new Date(date) <= new Date();
  return (
    <Container size={1200}>
      <Grid>
        <Grid.Col span={10}>
    <Card shadow="sm" padding="lg" radius="md" withBorder >
      <Card.Section style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Image src={imgUrl} alt={title} objectFit="contain" style={{ maxWidth: '500px' }} />
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
          {postData.isDeleted ? 'Post has been deleted' : (isPostPublished ? 'Post has been published' : 'Delete planned post')}
        </Button>
    </Card>
        </Grid.Col>
        <Grid.Col span={2} offset={0}>
          <StatsGrid statsData={statsData} />
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default BadgeCard;