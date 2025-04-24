'use client';

import { useEffect, useState } from 'react';
import { signIn, getProviders, type ClientSafeProvider } from 'next-auth/react';
import { Button, Container, Box, Typography, Paper } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

export default function Login() {
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const providers = await getProviders();
      setProviders(providers);
    };
    fetchProviders();
  }, []);

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
          
          {providers && providers.google && (
            <Button
              startIcon={<GoogleIcon />}
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => signIn('google', { callbackUrl: '/profile' })}
              sx={{ mt: 2 }}
            >
              Sign in with Google
            </Button>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 