'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Container, Typography, Box, Paper, Avatar, Button, Tabs, Tab, Card, CardContent, CardMedia, Alert } from '@mui/material';
import Link from 'next/link';

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

// Custom hook for fetching and managing user data
function useUserData(userId: string | undefined) {
  const [userData, setUserData] = useState<{
    username?: string;
    bio?: string;
    image?: string;
  }>({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user data function that can be called on demand
  const fetchUserData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching user data for ID: ${userId}`);
      const response = await fetch(`/api/users/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched user data:', data);
        setUserData(data);
      } else {
        console.warn(`Failed to fetch user data: ${response.status}`);
        // Don't set error - we'll use session data as fallback
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Don't set error - we'll use session data as fallback
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
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
    retry: fetchUserData
  };
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  
  // Get user data from custom hook
  const {
    userData,
    loading: fetchingUserData,
    retry: refetchUserData
  } = useUserData(session?.user?.id);
  
  // Use session data as fallback if API fails
  const displayName = userData?.username || userData?.name || session?.user?.name || 'User';
  const displayImage = userData?.image || session?.user?.image || '';
  const displayBio = userData?.bio || 'No bio information available';
  
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

  if (status === 'loading' || fetchingUserData) {
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
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: { md: '0 0 33.33%' }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={displayImage}
                  alt={displayName}
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
              </Box>
              <Typography variant="h5">{displayName}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {session?.user?.email}
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => router.push('/profile/edit')}
              >
                Edit Profile
              </Button>
            </Box>
            <Box sx={{ flex: { md: '0 0 66.67%' } }}>
              <Typography variant="h4" gutterBottom>
                Profile Information
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Username
                </Typography>
                <Typography variant="body1">
                  {displayName}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Bio
                </Typography>
                <Typography variant="body1">
                  {displayBio}
                </Typography>
              </Box>
            </Box>
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
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
                {/* Map through the user's campaigns */}
                {campaigns.map((campaign) => (
                  <Card key={campaign.id}>
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
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  You haven't created any campaigns yet
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
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
                {/* Map through the user's contributions */}
                {contributions.map((contribution) => (
                  <Card key={contribution.id}>
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
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  You haven't made any contributions yet
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