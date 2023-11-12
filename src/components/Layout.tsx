import { useState } from 'react';
import { createStyles, Header, Container, Group, Burger, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Image } from '@mantine/core';
import Link from 'next/link';
import {useSession} from "next-auth/react";

const useStyles = createStyles((theme) => ({
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
    },

    links: {
        [theme.fn.smallerThan('xs')]: {
            display: 'none',
        },
    },

    burger: {
        [theme.fn.largerThan('xs')]: {
            display: 'none',
        },
    },

    link: {
        display: 'block',
        lineHeight: 1,
        padding: `${rem(8)} ${rem(12)}`,
        borderRadius: theme.radius.sm,
        textDecoration: 'none !important',
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
        fontSize: theme.fontSizes.sm,
        fontWeight: 500,

        '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        },
    },

    linkActive: {
        '&, &:hover': {
            backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
            color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
        },
    },
}));

interface HeaderSimpleProps {
    links: { link: string; label: string }[];
}


export function HeaderSimple({ links }: HeaderSimpleProps | null) {
    const [opened, { toggle }] = useDisclosure(false);
    const [active, setActive] = useState(links[0].link);
    const { classes, cx } = useStyles();
    const { data: session} = useSession();

    const items = links.map((link) => (
        <Link key={link.label} href={link.link} passHref>
            <a
                className={cx(classes.link, { [classes.linkActive]: active === link.link })}
                onClick={() => setActive(link.link)}
            >
                {link.label}
            </a>
        </Link>
    ));


    if (session?.user) {
        items.push(
            <Link key={"logout"} href={"/api/auth/signout"} passHref>
                <a
                    className={cx(classes.link, { [classes.linkActive]: active === "logout" })}
                    onClick={() => setActive("logout")}
                >
                    {"Logout"}
                </a>
            </Link>
        )
    }else{
        items.push(
            <Link key={"login"} href={"/api/auth/signin"} passHref>
                <a
                    className={cx(classes.link, { [classes.linkActive]: active === "login" })}
                    onClick={() => setActive("login")}
                >
                    {"Login"}
                </a>
            </Link>
        )
    }

    return (
        <Header height={60} mb={120}>
            <Container className={classes.header}>
                <Image height={"40%"} width={"40%"} src="https://cdk-hnb659fds-assets-329914929726-eu-north-1.s3.eu-north-1.amazonaws.com/logo.png" alt="Logo" />
                <Group spacing={5} className={classes.links}>
                    {items}
                </Group>

                <Burger opened={opened} onClick={toggle} className={classes.burger} size="sm" />
            </Container>
        </Header>
    );
}