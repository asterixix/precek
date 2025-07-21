import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import getMuiTheme from '../src/lib/mui-theme';
import Footer from '../src/components/Footer';
import '../src/styles/globals.css';

// Inner component to access the theme context
function AppContent({ Component, pageProps }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render after mounting to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure theme consistency across the app
  useEffect(() => {
    if (mounted && resolvedTheme) {
      const html = document.documentElement;
      
      // Force synchronization of CSS classes
      if (resolvedTheme === 'dark') {
        html.classList.add('dark');
        html.style.colorScheme = 'dark';
      } else {
        html.classList.remove('dark');
        html.style.colorScheme = 'light';
      }
      
      // Update CSS custom properties for immediate effect
      const root = document.documentElement;
      if (resolvedTheme === 'dark') {
        root.style.setProperty('--background', '222.2 84% 4.9%');
        root.style.setProperty('--foreground', '210 40% 98%');
        root.style.setProperty('--card', '222.2 84% 4.9%');
        root.style.setProperty('--card-foreground', '210 40% 98%');
        root.style.setProperty('--primary', '210 40% 98%');
        root.style.setProperty('--primary-foreground', '222.2 47.4% 11.2%');
        root.style.setProperty('--secondary', '217.2 32.6% 17.5%');
        root.style.setProperty('--secondary-foreground', '210 40% 98%');
        root.style.setProperty('--muted', '217.2 32.6% 17.5%');
        root.style.setProperty('--muted-foreground', '215 20.2% 65.1%');
        root.style.setProperty('--border', '217.2 32.6% 17.5%');
        root.style.setProperty('--input', '217.2 32.6% 17.5%');
        root.style.setProperty('--ring', '212.7 26.8% 83.9%');
      } else {
        root.style.setProperty('--background', '0 0% 100%');
        root.style.setProperty('--foreground', '222.2 84% 4.9%');
        root.style.setProperty('--card', '0 0% 100%');
        root.style.setProperty('--card-foreground', '222.2 84% 4.9%');
        root.style.setProperty('--primary', '222.2 47.4% 11.2%');
        root.style.setProperty('--primary-foreground', '210 40% 98%');
        root.style.setProperty('--secondary', '210 40% 96.1%');
        root.style.setProperty('--secondary-foreground', '222.2 47.4% 11.2%');
        root.style.setProperty('--muted', '210 40% 96.1%');
        root.style.setProperty('--muted-foreground', '215.4 16.3% 46.9%');
        root.style.setProperty('--border', '214.3 31.8% 91.4%');
        root.style.setProperty('--input', '214.3 31.8% 91.4%');
        root.style.setProperty('--ring', '222.2 84% 4.9%');
      }
    }
  }, [mounted, resolvedTheme]);

  // Create the MUI theme based on the resolved theme from next-themes
  const currentMuiTheme = useMemo(() => {
    if (!mounted) return getMuiTheme('light'); // Default to light theme during SSR
    return getMuiTheme(resolvedTheme);
  }, [resolvedTheme, mounted]);

  // Prevent rendering until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <MuiThemeProvider theme={currentMuiTheme}>
      <CssBaseline />
      <div 
        className="min-h-screen font-sans antialiased flex flex-col"
        style={{
          backgroundColor: currentMuiTheme.palette.background.default,
          color: currentMuiTheme.palette.text.primary,
        }}
      >
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta charSet="utf-8" />
          <title>Precek - Text, Image, Audio, and Video Processing</title>
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
    // Fix for browser extension errors
    if (typeof window !== 'undefined') {
      if (!window.chrome) {
        window.chrome = {
          runtime: {
            sendMessage: () => {},
            connect: () => ({ onMessage: { addListener: () => {} } }),
            getManifest: () => ({}),
            id: ''
          }
        };
      } else if (window.chrome && !window.chrome.runtime) {
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
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={false}
      forcedTheme={undefined}
      storageKey="precek-theme"
    >
      <AppContent {...props} />
    </NextThemesProvider>
  );
}

export default MyApp;
