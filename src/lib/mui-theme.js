import { createTheme } from '@mui/material/styles';

// Define palettes matching Tailwind CSS variables from globals.css
// WCAG 1.4.3/1.4.6: Ensure these color combinations meet contrast requirements (AA minimum).
// Use tools like browser devtools or online checkers to verify contrast ratios.
const lightPalette = {
  mode: 'light',
  primary: {
    main: 'hsl(222.2, 47.4%, 11.2%)', // Matches --primary
    contrastText: 'hsl(210, 40%, 98%)', // Matches --primary-foreground
  },
  secondary: {
    main: 'hsl(210, 40%, 96.1%)', // Matches --secondary
    contrastText: 'hsl(222.2, 47.4%, 11.2%)', // Matches --secondary-foreground
  },
  error: {
    main: 'hsl(0, 84.2%, 60.2%)', // Matches --destructive
    contrastText: 'hsl(210, 40%, 98%)', // Matches --destructive-foreground
  },
  background: {
    default: 'hsl(0, 0%, 100%)', // Matches --background
    paper: 'hsl(0, 0%, 100%)', // Matches --card
  },
  text: {
    primary: 'hsl(222.2, 84%, 4.9%)', // Matches --foreground
    secondary: 'hsl(215.4, 16.3%, 46.9%)', // Matches --muted-foreground
  },
  divider: 'hsl(214.3, 31.8%, 91.4%)', // Matches --border
};

// WCAG 1.4.3/1.4.6: Ensure these color combinations meet contrast requirements (AA minimum).
const darkPalette = {
  mode: 'dark',
  primary: {
    main: 'hsl(210, 40%, 98%)', // Matches .dark --primary
    contrastText: 'hsl(222.2, 47.4%, 11.2%)', // Matches .dark --primary-foreground
  },
  secondary: {
    main: 'hsl(217.2, 32.6%, 17.5%)', // Matches .dark --secondary
    contrastText: 'hsl(210, 40%, 98%)', // Matches .dark --secondary-foreground
  },
  error: {
    main: 'hsl(0, 62.8%, 30.6%)', // Matches .dark --destructive
    contrastText: 'hsl(210, 40%, 98%)', // Matches .dark --destructive-foreground
  },
  background: {
    default: 'hsl(222.2, 84%, 4.9%)', // Matches .dark --background
    paper: 'hsl(222.2, 84%, 4.9%)', // Matches .dark --card
  },
  text: {
    primary: 'hsl(210, 40%, 98%)', // Matches .dark --foreground
    secondary: 'hsl(215, 20.2%, 65.1%)', // Matches .dark --muted-foreground
  },
  divider: 'hsl(217.2, 32.6%, 17.5%)', // Matches .dark --border
};

// Common settings for both themes
const commonSettings = {
  typography: {
    fontFamily: '"Noto Sans", sans-serif', // Ensure consistency with Tailwind and CSS
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Keep custom button styling
          borderRadius: 'var(--radius)', // Use Tailwind radius variable
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius)', // Use Tailwind radius variable
          backgroundImage: 'none', // Prevent potential gradient issues
        },
      },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 'var(--radius)',
                backgroundImage: 'none', // Ensure card background matches theme
            }
        }
    },
    // Add other component overrides if needed
  },
};

// Function to create the theme based on the mode
const getMuiTheme = (mode) => {
  // Use the appropriate palette based on the mode passed from _app.js
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  return createTheme({
    palette: palette, // Apply the selected light/dark palette
    ...commonSettings,
  });
};

export default getMuiTheme;
