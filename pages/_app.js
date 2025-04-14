import React, { useEffect, useMemo } from 'react';
import Head from 'next/head';
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import getMuiTheme from '../src/lib/mui-theme'; // Import the function
import Footer from '../src/components/Footer';
import '../src/styles/globals.css';

// Inner component to access the theme context
function AppContent({ Component, pageProps }) {
  const { resolvedTheme } = useTheme(); // Get the actual theme ('light' or 'dark')

  // Create the MUI theme based on the resolved theme from next-themes
  const currentMuiTheme = useMemo(() => getMuiTheme(resolvedTheme), [resolvedTheme]);

  return (
    <MuiThemeProvider theme={currentMuiTheme}>
      <CssBaseline /> {/* Ensures baseline styles match the theme */}
      <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta charSet="utf-8" />
          <title>Precek - Text, Image, Audio, and Video Processing</title>
          {/* Add meta tag for theme color */}
          <meta name="theme-color" content={currentMuiTheme.palette.background.default} />
        </Head>
        <div className="flex-grow">
          <Component {...pageProps} />
        </div>
        <Footer />
      </div>
    </MuiThemeProvider>
  );
}


function MyApp(props) {
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
    // NextThemesProvider manages theme switching (light/dark/system) and applies the 'dark' class to <html>
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {/* AppContent now handles MUI theme application based on next-themes */}
      <AppContent {...props} />
    </NextThemesProvider>
  );
}

export default MyApp;
