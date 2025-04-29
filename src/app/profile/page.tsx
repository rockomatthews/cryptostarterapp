'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Container, Typography, Box, Paper, Avatar, Button, Tabs, Tab, Card, CardContent, CardMedia, Alert, Grid } from '@mui/material';
import Link from 'next/link';
import EditIcon from '@mui/icons-material/Edit';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Custom hook for fetching user data
function useUserData(userId: string | undefined) {
  const { data: session } = useSession();
  
  const [userData, setUserData] = useState<{
    username: string;
    bio: string;
    image: string | null;
    preferredCrypto: string | null;
    walletAddresses: Record<string, string> | null;
  }>({
    username: '',
    bio: '',
    image: null,
    preferredCrypto: null,
    walletAddresses: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Fetch user data function that can be called on demand
  const fetchUserData = useCallback(async () => {
    if (!userId) {
      setError('User ID is missing');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching user data for ID: ${userId}`);
      const response = await fetch(`/api/users/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to fetch user data (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Fetched user data:', data);
      
      // Check if we got an error but with status 200
      if (data.error) {
        console.log('Received error with 200 status:', data.error);
        // Still use any data provided as fallback
        setUserData({
          username: data.name || session?.user?.name || '',
          bio: data.bio || '',
          image: data.image || session?.user?.image || null,
          preferredCrypto: data.preferredCrypto || null,
          walletAddresses: data.walletAddresses || null
        });
        
        // Don't throw - use what we got
        setLoading(false);
        return;
      }
      
      // Extract relevant data with fallbacks
      const username = data.name || data.username || session?.user?.name || '';
      const bio = data.bio || '';
      const image = data.image || session?.user?.image || null;
      const preferredCrypto = data.preferredCrypto || null;
      const walletAddresses = data.walletAddresses || null;
      
      setUserData({
        username,
        bio,
        image,
        preferredCrypto,
        walletAddresses
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      
      // Fallback to session data if available
      if (session?.user) {
        setUserData({
          username: session.user.name || '',
          bio: '',
          image: session.user.image || null,
          preferredCrypto: null,
          walletAddresses: null
        });
      }
      
      setError(err instanceof Error ? err.message : 'Failed to load your profile data');
      setLoading(false);
      
      // If there's an error, increment retry count
      setRetryCount(prev => prev + 1);
    }
  }, [userId, session]);
  
  // Initial data fetch
  useEffect(() => {
    if (userId) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [userId, fetchUserData]);
  
  return {
    userData,
    loading,
    error,
    retry: fetchUserData,
    retryCount
  };
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [campaigns] = useState<Array<{
    id: string;
    title: string;
    shortDescription: string;
    image?: string;
  }>>([]);
  const [contributions] = useState<Array<{
    id: string;
    amount: number;
    currency: string;
    createdAt: string;
    campaign?: {
      title: string;
    };
  }>>([]);
  
  // Get user data from custom hook
  const {
    userData,
    loading: fetchingUser,
    error: fetchError,
    retry: retryFetch
  } = useUserData(session?.user?.id);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    // Here you would fetch campaigns and contributions data
    // For now, we'll use empty arrays
  }, [status, router]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (status === 'loading' || fetchingUser) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">
              Profile
              </Typography>
              <Button 
                variant="contained" 
              startIcon={<EditIcon />}
                onClick={() => router.push('/profile/edit')}
              >
                Edit Profile
              </Button>
            </Box>
          
          {fetchError && (
            <Alert 
              severity="warning" 
              sx={{ mb: 3 }}
              action={
                <Button color="inherit" size="small" onClick={retryFetch}>
                  Retry
                </Button>
              }
            >
              {fetchError}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Avatar
              src={userData.image || ''}
              alt={userData.username}
              sx={{ width: 100, height: 100 }}
            />
          </Box>
          
              <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                  Username
                </Typography>
                <Typography variant="body1">
              {userData.username}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                  Bio
                </Typography>
                <Typography variant="body1">
              {userData.bio || 'No bio provided'}
                </Typography>
          </Box>
        </Paper>

        <Box sx={{ width: '100%', mt: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
              <Tab label="My Campaigns" />
              <Tab label="My Contributions" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            {campaigns && campaigns.length > 0 ? (
              <Grid container spacing={3}>
                {/* Map through the user's campaigns */}
                {campaigns.map((campaign) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={campaign.id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="140"
                        image={campaign.image || "/placeholder-image.jpg"}
                        alt={campaign.title}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">
                          {campaign.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                          {campaign.shortDescription}
                      </Typography>
                    </CardContent>
                  </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  You haven&apos;t created any campaigns yet
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  component={Link}
                  href="/create-campaign"
                >
                  Create Your First Campaign
                </Button>
              </Box>
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            {contributions && contributions.length > 0 ? (
              <Grid container spacing={3}>
                {/* Map through the user's contributions */}
                {contributions.map((contribution) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={contribution.id}>
                  <Card>
                    <CardContent>
                        <Typography gutterBottom variant="h6" component="div">
                          {contribution.campaign?.title || 'Untitled Campaign'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                          Amount: {contribution.amount} {contribution.currency}
                      </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Date: {new Date(contribution.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  You haven&apos;t made any contributions yet
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  component={Link}
                  href="/campaigns"
                >
                  Browse Campaigns
                </Button>
              </Box>
            )}
          </TabPanel>
        </Box>
      </Box>
    </Container>
  );
} 