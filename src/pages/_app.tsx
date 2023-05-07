import { SessionProvider } from "next-auth/react"
import { MantineProvider } from '@mantine/core';
import {HeaderTabs} from "../components/Layout";
import React from "react";

const user = {
    name: "John Doe",
    image: "https://example.com/user-image.png",
};
const tabs = [
    { label: "Add Post", path: "/instaForm" },
    { label: "Calendar", path: "/calendar" },
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
              <HeaderTabs user={user} tabs={tabs} />
              <Component {...pageProps} />
          </MantineProvider>
      </SessionProvider>
  )
}