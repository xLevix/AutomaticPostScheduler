import { SessionProvider, useSession } from "next-auth/react"
import { MantineProvider } from '@mantine/core';
import {HeaderResponsive} from "../components/Header";
import React from "react";

function HeaderWithSession() {
    const { data: session } = useSession();

    const tabs = React.useMemo(() => {
        if (session) {
            // Użytkownik jest zalogowany
            return [
                { label: "Add Post", link: "/instaForm" },
                { label: "Calendar", link: "/calendar" },
                { label: "Logout", link: "/api/auth/signout" },
            ];
        } else {
            // Użytkownik nie jest zalogowany
            return [
                { label: "Login", link: "/api/auth/signin" },
            ];
        }
    }, [session]);  // Aktualizuj tabs, gdy stan sesji się zmieni

    return <HeaderResponsive links={tabs} />;
}

export default function App({
                                Component,
                                pageProps: { session, ...pageProps },
                            }) {
    return (
        <SessionProvider session={session}>
            <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={{
                    /** Put your mantine theme override here */
                    colorScheme: 'light',
                }}
            >
                <HeaderWithSession />
                <Component {...pageProps} />
            </MantineProvider>
        </SessionProvider>
    )
}
