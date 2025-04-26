'use client';

import { useEffect, useState } from 'react';
import { signIn, getProviders, type ClientSafeProvider } from 'next-auth/react';
import { Button, Container, Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

export default function Login() {
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const providers = await getProviders();
        console.log('Auth providers loaded:', providers);
        setProviders(providers);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch providers:', err);
        setError('Could not load authentication providers. Using fallback.');
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  const handleGoogleSignIn = () => {
    console.log('Signing in with Google...');
    signIn('google', { callbackUrl: '/profile' });
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4, 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', 
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Sign in to CryptoStarter
          </Typography>
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {error && (
            <Alert severity="warning" sx={{ mb: 3, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          {/* Show Google sign-in button regardless of provider loading */}
          <Button
            startIcon={<GoogleIcon />}
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleGoogleSignIn}
            sx={{ mt: 2 }}
          >
            Sign in with Google
          </Button>
        </Paper>
      </Box>
    </Container>
  );
} 