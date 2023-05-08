import { SessionProvider } from "next-auth/react"
import { MantineProvider } from '@mantine/core';
import {HeaderSimple} from "../components/Layout";
import React from "react";

const tabs = [
    { label: "Add Post", link: "/instaForm" },
    { label: "Calendar", link: "/calendar" },
];

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
              <HeaderSimple links={tabs} />
              <Component {...pageProps} />
          </MantineProvider>
      </SessionProvider>
  )
}