import { createTheme } from '@mui/material/styles';

// Light theme palette
const lightPalette = {
  mode: 'light',
  primary: {
    main: '#1a1a1a', // Dark text for light theme
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#6b7280',
    contrastText: '#ffffff',
  },
  error: {
    main: '#ef4444',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f59e0b',
    contrastText: '#000000',
  },
  info: {
    main: '#3b82f6',
    contrastText: '#ffffff',
  },
  success: {
    main: '#10b981',
    contrastText: '#ffffff',
  },
  background: {
    default: '#ffffff',
    paper: '#ffffff',
  },
  text: {
    primary: '#1a1a1a',
    secondary: '#6b7280',
  },
  divider: '#e5e7eb',
  grey: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

// Dark theme palette
const darkPalette = {
  mode: 'dark',
  primary: {
    main: '#ffffff', // Light text for dark theme
    contrastText: '#000000',
  },
  secondary: {
    main: '#9ca3af',
    contrastText: '#000000',
  },
  error: {
    main: '#f87171',
    contrastText: '#000000',
  },
  warning: {
    main: '#fbbf24',
    contrastText: '#000000',
  },
  info: {
    main: '#60a5fa',
    contrastText: '#000000',
  },
  success: {
    main: '#34d399',
    contrastText: '#000000',
  },
  background: {
    default: '#0f1419',
    paper: '#1a1a1a',
  },
  text: {
    primary: '#ffffff',
    secondary: '#d1d5db',
  },
  divider: '#374151',
  grey: {
    50: '#111827',
    100: '#1f2937',
    200: '#374151',
    300: '#4b5563',
    400: '#6b7280',
    500: '#9ca3af',
    600: '#d1d5db',
    700: '#e5e7eb',
    800: '#f3f4f6',
    900: '#f9fafb',
  },
};

// Function to create the theme based on the mode
const getMuiTheme = (mode) => {
  const isDark = mode === 'dark';
  const palette = isDark ? darkPalette : lightPalette;

  return createTheme({
    palette: palette,
    typography: {
      fontFamily: '"Noto Sans", sans-serif',
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.background.default,
            color: palette.text.primary,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
            padding: '8px 16px',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isDark 
                ? '0 4px 12px rgba(255, 255, 255, 0.1)' 
                : '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease-in-out',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          contained: {
            backgroundColor: palette.primary.main,
            color: palette.primary.contrastText,
            '&:hover': {
              backgroundColor: isDark ? '#e5e7eb' : '#374151',
            },
          },
          outlined: {
            borderColor: palette.primary.main,
            color: palette.primary.main,
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              borderColor: palette.primary.main,
            },
          },
          text: {
            color: palette.text.primary,
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: palette.text.primary,
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              transform: 'scale(1.05)',
              transition: 'all 0.2s ease-in-out',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: palette.background.default,
              '& fieldset': {
                borderColor: palette.divider,
              },
              '&:hover fieldset': {
                borderColor: palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: palette.primary.main,
                borderWidth: '2px',
              },
              '& input': {
                color: palette.text.primary,
              },
              '& textarea': {
                color: palette.text.primary,
              },
            },
            '& .MuiInputLabel-root': {
              color: palette.text.secondary,
            },
            '& .MuiFormHelperText-root': {
              color: palette.text.secondary,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: palette.background.paper,
            color: palette.text.primary,
            borderRadius: 12,
            border: `1px solid ${palette.divider}`,
            boxShadow: isDark 
              ? '0 1px 3px rgba(255, 255, 255, 0.1)' 
              : '0 1px 3px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: palette.background.paper,
            color: palette.text.primary,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${palette.divider}`,
          },
          indicator: {
            backgroundColor: palette.primary.main,
            height: 3,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            color: palette.text.secondary,
            '&.Mui-selected': {
              color: palette.primary.main,
              fontWeight: 600,
            },
            '&:hover': {
              color: palette.primary.main,
              opacity: 0.8,
            },
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: 'inherit',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: palette.background.paper,
            color: palette.text.primary,
            boxShadow: `0 1px 3px ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            color: palette.text.primary,
          },
        },
      },
    },
  });
};

export default getMuiTheme;
