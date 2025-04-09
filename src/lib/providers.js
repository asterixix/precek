import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import muiTheme from './mui-theme';

// Root providers wrapper to ensure proper context initialization
export function Providers({ children }) {
  return (
    <React.StrictMode>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </React.StrictMode>
  );
}
