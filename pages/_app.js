import React, { useEffect } from 'react';
import Head from 'next/head';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import muiTheme from '../src/lib/mui-theme';
import '../src/styles/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Fix for browser extension errors about "Cannot read properties of null (reading 'runtime')"
    if (typeof window !== 'undefined') {
      if (!window.chrome) {
        // Create a dummy chrome object to prevent extension errors
        window.chrome = {
          runtime: {
            sendMessage: () => {},
            connect: () => ({ onMessage: { addListener: () => {} } }),
            getManifest: () => ({}),
            id: ''
          }
        };
      } else if (window.chrome && !window.chrome.runtime) {
        // Some environments have chrome object but no runtime
        window.chrome.runtime = {
          sendMessage: () => {},
          connect: () => ({ onMessage: { addListener: () => {} } }),
          getManifest: () => ({}),
          id: ''
        };
      }
    }
  }, []);
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        <div className="min-h-screen bg-background font-sans antialiased">
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta charSet="utf-8" />
            <title>Precek - Text, Image, Audio, and Video Processing</title>
          </Head>
          <Component {...pageProps} />
        </div>
      </MuiThemeProvider>
    </NextThemesProvider>
  );
}

export default MyApp;
