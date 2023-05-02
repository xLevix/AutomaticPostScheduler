import { SessionProvider } from "next-auth/react"
import { MantineProvider } from '@mantine/core';

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
              <Component {...pageProps} />
          </MantineProvider>
      </SessionProvider>
  )
}