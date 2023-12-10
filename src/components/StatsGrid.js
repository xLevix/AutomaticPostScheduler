import { Group, Paper, SimpleGrid, Text } from '@mantine/core';
import classes from './StatsGrid.module.css';

const StatsGrid = ({ statsData }) => {
    const stats = statsData.map((stat) => (
        <Paper withBorder p="md" radius="md" key={stat.title}>
            <Group justify="space-between">
                <Text size="xs" color="dimmed" className={classes.title}>
                    {stat.title}
                </Text>
            </Group>

            <Group align="center" gap="xs" mt={25}>
                <Text className={classes.value}>{stat.value}</Text>
            </Group>
        </Paper>
    ));

    return (
        <div className={classes.root}>
            <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }}>{stats}</SimpleGrid>
        </div>
    );
};

export default StatsGrid;
