import { SessionProvider, useSession, signOut } from "next-auth/react";
import { MantineProvider } from '@mantine/core';
import {HeaderResponsive} from "../components/Header";
import React, { useEffect } from "react";
import axios from 'axios';

function HeaderWithSession() {
    const { data: session } = useSession();


    const tabs = React.useMemo(() => {
        if (session) {
            const LogoutIcon =
                session.provider === 'linkedin' ? "https://cdk-hnb659fds-assets-329914929726-eu-north-1.s3.eu-north-1.amazonaws.com/linkedin-original.svg"
                : session.provider === 'twitter' ? "https://cdk-hnb659fds-assets-329914929726-eu-north-1.s3.eu-north-1.amazonaws.com/twitter.svg"
                    : session.provider === 'credentials' ? "https://cdk-hnb659fds-assets-329914929726-eu-north-1.s3.eu-north-1.amazonaws.com/instagram.svg"
                        : null;

            return [
                { label: "Add Post", link: "/formselector" },
                { label: "Calendar", link: "/calendar" },
                { label: "Trending Tags", link: "/trending" },
                {
                    label: (
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            Logout from
                            <img src={LogoutIcon} alt="Logout" style={{maxWidth: '35%', maxHeight: '35%', marginLeft: '10px'}}/>
                        </div>
                    ),
                    link: "/api/auth/signout"
                },
            ];
        } else {
            return [
                { label: "Login", link: "/api/auth/signin" },
            ];
        }
    }, [session]);

    function setLastCheckTime() {
    const now = new Date().getTime();
    localStorage.setItem('lastTokenCheck', now.toString());
    }

    function getLastCheckTime() {
    const time = localStorage.getItem('lastTokenCheck');
    return time ? parseInt(time, 10) : null;
    }

    function shouldCheckTokenValidity() {
    const TEN_MINUTES = 10 * 60 * 1000;
    const lastCheckTime = getLastCheckTime();

    if (!lastCheckTime) {
        return true;
    }

    const now = new Date().getTime();

    return now - lastCheckTime > TEN_MINUTES;
    }

    useEffect(() => {
        if (session && shouldCheckTokenValidity()) {
            axios.post('/api/validateToken', {
                provider: session.provider,
                username: session.user.id,
                accessToken: session.accessToken
            })
            .then(response => {
                if (response.data.valid === false) {
                    signOut();
                } else {
                    setLastCheckTime();
                }
            })
            .catch(error => {
                console.error('Błąd podczas sprawdzania ważności tokena:', error);
            });
        }
    }, [session]);

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
    );
}
