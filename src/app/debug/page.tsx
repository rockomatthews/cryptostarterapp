'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Container, Typography, Box, Paper, Button, Divider, Alert, CircularProgress } from '@mui/material';

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [prismaStatus, setPrismaStatus] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        setLoading(true);
        
        // Fetch Prisma status
        const prismaRes = await fetch('/api/prisma-status');
        const prismaData = await prismaRes.json();
        setPrismaStatus(prismaData);
        
        // Fetch Auth status
        const authRes = await fetch('/api/auth-status');
        const authData = await authRes.json();
        setAuthStatus(authData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching status:', err);
        setError('Failed to fetch diagnostics');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStatus();
  }, []);
  
  const regeneratePrisma = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/prisma-test');
      const data = await res.json();
      setPrismaStatus(data);
      setError(null);
    } catch (err) {
      console.error('Error regenerating Prisma:', err);
      setError('Failed to regenerate Prisma client');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading diagnostic information...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          System Diagnostics
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Authentication Status
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              NextAuth Status: <strong>{status}</strong>
            </Typography>
            {session && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  User ID: {session.user?.id || 'Not available'}
                </Typography>
                <Typography variant="body2">
                  User Name: {session.user?.name || 'Not available'}
                </Typography>
                <Typography variant="body2">
                  User Email: {session.user?.email || 'Not available'}
                </Typography>
              </Box>
            )}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Environment Configuration
          </Typography>
          
          {authStatus && (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.default', 
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              overflow: 'auto'
            }}>
              <pre>{JSON.stringify(authStatus, null, 2)}</pre>
            </Box>
          )}
        </Paper>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Prisma Status
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              Initialization: <strong>{prismaStatus?.status?.isInitialized ? 'Success' : 'Failed'}</strong>
            </Typography>
            <Typography variant="body1">
              Build Time Mode: <strong>{prismaStatus?.status?.isBuildTime ? 'Yes' : 'No'}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last Checked: {prismaStatus?.timestamp || 'Unknown'}
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            onClick={regeneratePrisma}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Regenerate Prisma Client
          </Button>
          
          <Button 
            variant="outlined" 
            href="/profile"
            sx={{ mr: 2 }}
          >
            Go to Profile
          </Button>
          
          <Button 
            variant="outlined" 
            color="secondary"
            href="/profile/edit"
          >
            Edit Profile
          </Button>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Raw Status Data
          </Typography>
          
          {prismaStatus && (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.default', 
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              overflow: 'auto'
            }}>
              <pre>{JSON.stringify(prismaStatus, null, 2)}</pre>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 