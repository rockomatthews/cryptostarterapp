'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Container, Typography, Paper, Box, Button, Alert, CircularProgress } from '@mui/material';

export default function AuthStatusPage() {
  const { data: session, status } = useSession();
  const [prismaStatus, setPrismaStatus] = useState<{
    isInitialized?: boolean;
    isBuildTime?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch Prisma status
    fetch('/api/prisma-status')
      .then(res => res.json())
      .then(data => {
        setPrismaStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error checking Prisma status:', err);
        setError('Could not fetch Prisma status');
        setLoading(false);
      });
  }, []);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Authentication & Database Status
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            NextAuth Status
          </Typography>
          
          {status === 'loading' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} />
              <Typography>Loading authentication status...</Typography>
            </Box>
          ) : status === 'authenticated' ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                You are authenticated!
              </Alert>
              <Typography variant="subtitle1">User details:</Typography>
              <Box component="pre" sx={{ 
                p: 2, 
                backgroundColor: 'grey.100', 
                borderRadius: 1,
                overflow: 'auto',
                fontSize: '0.875rem'
              }}>
                {JSON.stringify(session, null, 2)}
              </Box>
            </Box>
          ) : (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                You are not authenticated
              </Alert>
              <Button 
                variant="contained" 
                color="primary"
                href="/login"
                sx={{ mt: 1 }}
              >
                Go to Login
              </Button>
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Prisma Status
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} />
              <Typography>Checking Prisma status...</Typography>
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : prismaStatus ? (
            <Box>
              <Alert 
                severity={prismaStatus.isInitialized ? "success" : "warning"}
                sx={{ mb: 2 }}
              >
                {prismaStatus.isInitialized 
                  ? "Prisma client is initialized and working!" 
                  : "Prisma client is not initialized"}
              </Alert>
              <Typography variant="subtitle1">Prisma details:</Typography>
              <Box component="pre" sx={{ 
                p: 2, 
                backgroundColor: 'grey.100', 
                borderRadius: 1,
                overflow: 'auto',
                fontSize: '0.875rem'
              }}>
                {JSON.stringify(prismaStatus, null, 2)}
              </Box>
            </Box>
          ) : (
            <Alert severity="error">Could not determine Prisma status</Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 