'use client';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button, Container, Box, Typography, Paper, Alert } from '@mui/material';

export default function LoginTest() {
  const [message, setMessage] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if the environment variables are set correctly
    fetch('/api/auth-test')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setMessage('Auth configuration looks good! Try signing in with Google.');
        } else {
          setError('Auth configuration check failed.');
        }
      })
      .catch(err => {
        setError(`Error checking auth configuration: ${err.message}`);
      });
  }, []);

  const handleGoogleSignIn = () => {
    setMessage('Redirecting to Google...');
    // Use callbackUrl to redirect back to this page after sign-in
    signIn('google', { callbackUrl: '/login-test' });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Login Test Page
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Typography paragraph>
            {message}
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleGoogleSignIn}
            fullWidth
            sx={{ mt: 2 }}
          >
            Sign in with Google
          </Button>
        </Paper>
      </Box>
    </Container>
  );
} 