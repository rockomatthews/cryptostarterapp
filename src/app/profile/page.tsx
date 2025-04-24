'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, Avatar, Button, Tabs, Tab, Card, CardContent, CardMedia } from '@mui/material';
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
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [userData, setUserData] = useState<{
    username?: string;
    bio?: string;
    image?: string;
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          setLoading(true);
          const response = await fetch(`/api/users/${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    if (session?.user?.id) {
      fetchUserData();
    }
    
    // Here you would fetch campaigns and contributions data
    // When implemented, you would use the user's ID to fetch their campaigns and contributions
    // For now, we'll use dummy data
    
    // For example:
    // if (session?.user?.id) {
    //   fetch(`/api/users/${session.user.id}/campaigns`)
    //     .then(res => res.json())
    //     .then(data => setCampaigns(data));
    //   
    //   fetch(`/api/users/${session.user.id}/contributions`)
    //     .then(res => res.json())
    //     .then(data => setContributions(data));
    // }
  }, [status, router, session]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (status === 'loading' || loading) {
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
                  src={userData.image || session?.user?.image || ''}
                  alt={userData.username || session?.user?.name || 'Profile'}
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
              </Box>
              <Typography variant="h5">{userData.username || session?.user?.name}</Typography>
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
                  {userData.username || session?.user?.name || 'Not set'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Bio
                </Typography>
                <Typography variant="body1">
                  {userData.bio || 'No bio information available'}
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
                {/* This would be populated with actual campaign data */}
                <Box>
                  <Card>
                    <CardMedia
                      component="img"
                      height="140"
                      image="/placeholder-image.jpg"
                      alt="Campaign"
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">
                        Example Campaign
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This is a placeholder for when you create your first campaign.
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Map through the user's contributions */}
                {/* This would be populated with actual contribution data */}
                <Box>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">
                        Example Contribution
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You contributed $100 to Example Campaign
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        April 24, 2025
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
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
                  href="/explore"
                >
                  Explore Campaigns
                </Button>
              </Box>
            )}
          </TabPanel>
        </Box>
      </Box>
    </Container>
  );
} 