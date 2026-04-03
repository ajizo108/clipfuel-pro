import { SessionProvider } from "next-auth/react";
import Head from "next/head"; // ✅ ADDED

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>ClipFuel – AI Viral Content Generator</title>
        <meta
          name="description"
          content="ClipFuel helps creators generate viral titles, hooks, captions, and scripts instantly."
        />
        <meta
          name="google-site-verification"
          content="wRbFRQEKqPidi6gvBxNd1GpJ0JdRKmhDrG8e4rxf1As"
        />
      </Head>

      <SessionProvider session={pageProps.session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
}