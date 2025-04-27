'use client';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { NextAppDirEmotionCacheProvider } from '.';

// Create a custom dark theme with yellow accents
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFEB3B', // Yellow color
      contrastText: '#000000', // Black text on yellow backgrounds
    },
    secondary: {
      main: '#FFFFFF', // White as secondary color
      contrastText: '#000000',
    },
    background: {
      default: '#000000', // Black background
      paper: '#121212', // Slightly lighter black for cards/paper elements
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#FFEB3B', // Yellow buttons
          color: '#000000', // Black text
          '&:hover': {
            backgroundColor: '#FFD600', // Darker yellow on hover
          },
        },
        outlined: {
          borderColor: '#FFFFFF',
          color: '#FFFFFF',
          '&:hover': {
            borderColor: '#FFEB3B',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#000000', // Black interior
            color: '#FFFFFF', // White text
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.5)', // White outline with opacity
            },
            '&:hover fieldset': {
              borderColor: '#FFFFFF', // Solid white on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FFEB3B', // Yellow when focused
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#FFEB3B',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#121212',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#121212',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          color: '#FFFFFF',
          boxShadow: '0 1px 0 0 rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
        bar: {
          backgroundColor: '#FFEB3B',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Geist", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </NextAppDirEmotionCacheProvider>
  );
} 