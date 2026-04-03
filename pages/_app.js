console.log("DEPLOY FIX");
import { SessionProvider } from "next-auth/react";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      
      {/* FORCE HEAD TO RENDER */}
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

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

      <Component {...pageProps} />
    </SessionProvider>
  );
}