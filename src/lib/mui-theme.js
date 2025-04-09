import { createTheme } from '@mui/material/styles';

// Create a theme instance that integrates with your existing tailwind theme
const muiTheme = createTheme({
  palette: {
    primary: {
      main: 'hsl(222.2, 47.4%, 11.2%)', // Based on your existing primary color
      light: 'hsl(210, 40%, 98%)',
      dark: 'hsl(217.2, 32.6%, 17.5%)',
    },
    secondary: {
      main: 'hsl(210, 40%, 96.1%)',
      light: 'hsl(214.3, 31.8%, 91.4%)',
      dark: 'hsl(215.4, 16.3%, 46.9%)',
    },
    error: {
      main: 'hsl(0, 62.8%, 30.6%)',
    },
    background: {
      default: 'hsl(0, 0%, 100%)',
      paper: 'hsl(0, 0%, 100%)',
      dark: 'hsl(222.2, 84%, 4.9%)',
    },
    text: {
      primary: 'hsl(222.2, 84%, 4.9%)',
      secondary: 'hsl(215.4, 16.3%, 46.9%)',
    },
  },
  typography: {
    fontFamily: 'var(--font-sans)',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '0.375rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
        },
      },
    },
  },
});

export default muiTheme;
