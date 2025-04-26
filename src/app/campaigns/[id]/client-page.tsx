'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Container, Box, Typography, Paper, Chip, Avatar,
  Button, LinearProgress, Divider, Link as MuiLink,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import DonationModal from '@/components/DonationModal';
import DonationLeaderboard from '@/components/DonationLeaderboard';
import { SUPPORTED_CRYPTOCURRENCIES } from '@/lib/cryptoApi';

// Define types for our components
interface Campaign {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  fundingGoal: number;
  currentAmount: number;
  deadline: string;
  category: string;
  mainImage?: string;
  additionalMedia?: Array<{
    id: string;
    url: string;
    type: string;
  }>;
  website?: string;
  socials?: Array<{
    id: string;
    platform: string;
    url: string;
  }>;
  cryptocurrencyType: string;
  active: boolean;
  goalReached: boolean;
  fundsDistributed: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

interface Contribution {
  id: string;
  amount: number;
  originalAmount: number;
  donationCurrency: string;
  message?: string;
  anonymous: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    image?: string;
  };
}

// Client component that receives id directly
export default function CampaignClientPage({ id }: { id: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [leaderboardContributions, setLeaderboardContributions] = useState<Contribution[]>([]);
  
  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/campaigns/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch campaign');
        }
        const data = await response.json();
        setCampaign(data);
        
        // Fetch recent contributions
        const contributionsResponse = await fetch(`/api/campaigns/${id}/contributions`);
        if (contributionsResponse.ok) {
          const contributionsData = await contributionsResponse.json();
          setContributions(contributionsData);
        }
        
        // Fetch leaderboard data
        const leaderboardResponse = await fetch(`/api/campaigns/${id}/contributions?leaderboard=true`);
        if (leaderboardResponse.ok) {
          const leaderboardData = await leaderboardResponse.json();
          setLeaderboardContributions(leaderboardData);
        }
      } catch (error) {
        console.error('Error fetching campaign:', error);
        setError('Failed to load campaign. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaign();
  }, [id]);
  
  const handleOpenDonationModal = () => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/campaigns/${id}`);
      return;
    }
    setShowDonationModal(true);
  };
  
  const handleDonationComplete = (contribution: Contribution) => {
    // Add the new contribution to the list
    setContributions(prev => [contribution, ...prev]);
    
    // Update leaderboard if needed
    setLeaderboardContributions(prev => {
      const newList = [...prev, contribution];
      return newList.sort((a, b) => b.originalAmount - a.originalAmount).slice(0, 10);
    });
    
    // Update campaign funding amount
    setCampaign(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        currentAmount: prev.currentAmount + contribution.amount
      };
    });
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Typography>Loading campaign details...</Typography>
        </Box>
      </Container>
    );
  }
  
  if (error || !campaign) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Typography color="error">{error || 'Campaign not found'}</Typography>
        </Box>
      </Container>
    );
  }
  
  const progress = (campaign.currentAmount / campaign.fundingGoal) * 100;
  const cryptoCurrency = SUPPORTED_CRYPTOCURRENCIES.find(c => c.value === campaign.cryptocurrencyType);
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  const isEnded = new Date(campaign.deadline) < new Date();
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 66.67%' }}}>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                {/* Campaign Image */}
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' }}}>
                  {campaign.mainImage ? (
                    <Box sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <img 
                        src={campaign.mainImage} 
                        alt={campaign.title} 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '400px', 
                          borderRadius: '8px' 
                        }} 
                      />
                    </Box>
                  ) : (
                    <Box sx={{ 
                      height: '300px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: 'grey.200',
                      borderRadius: '8px'
                    }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        No image available
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {/* Campaign Info */}
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' }}}>
                  <Box>
                    <Chip 
                      label={categories.find(c => c.value === campaign.category)?.label || campaign.category} 
                      size="small" 
                      color="primary" 
                      sx={{ mb: 1 }} 
                    />
                    
                    <Typography variant="h4" gutterBottom>
                      {campaign.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        src={campaign.user?.image} 
                        alt={campaign.user?.name || 'User'} 
                        sx={{ width: 24, height: 24, mr: 1 }} 
                      />
                      <Typography variant="body2">
                        by {campaign.user?.name || 'Anonymous'}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1" paragraph>
                      {campaign.shortDescription}
                    </Typography>
                    
                    <Box sx={{ my: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(progress, 100)} 
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="h6">
                          ${campaign.currentAmount.toLocaleString()} raised
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          of ${campaign.fundingGoal.toLocaleString()} goal
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Funding in
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {cryptoCurrency?.icon && (
                            <Box 
                              component="img" 
                              src={cryptoCurrency.icon} 
                              alt={cryptoCurrency.label} 
                              sx={{ width: 20, mr: 1 }} 
                            />
                          )}
                          <Typography variant="body1" fontWeight="bold">
                            {cryptoCurrency?.label || campaign.cryptocurrencyType}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {isEnded ? 'Campaign ended' : 'Time left'}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {isEnded ? 'Ended' : `${daysLeft} days left`}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Contributors
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {contributions.length}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        onClick={handleOpenDonationModal}
                        disabled={isEnded || campaign.fundsDistributed}
                      >
                        {isEnded 
                          ? 'Campaign Ended' 
                          : campaign.fundsDistributed 
                            ? 'Funds Distributed'
                            : 'Support This Campaign'
                        }
                      </Button>
                      
                      {campaign.website && (
                        <Button
                          variant="outlined"
                          startIcon={<LanguageIcon />}
                          component={MuiLink}
                          href={campaign.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Website
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
            
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                About This Campaign
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {campaign.description}
              </Typography>
              
              {campaign.additionalMedia && campaign.additionalMedia.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Gallery
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                    {campaign.additionalMedia.map((media, index) => (
                      <Box sx={{ gridColumn: { xs: 'span 6', sm: 'span 4' } }} key={index}>
                        {media.type === 'image' ? (
                          <img 
                            src={media.url} 
                            alt={`Campaign media ${index}`} 
                            style={{ width: '100%', borderRadius: '4px' }} 
                          />
                        ) : (
                          <video 
                            src={media.url} 
                            controls 
                            style={{ width: '100%', borderRadius: '4px' }} 
                          />
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
            
            {/* Add donation leaderboard before the contribution list */}
            <DonationLeaderboard contributions={leaderboardContributions} />
            
            {/* Recent contributions list */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Recent Contributions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {contributions.length > 0 ? (
                <List>
                  {contributions.map((contribution) => (
                    <ListItem key={contribution.id} divider>
                      <ListItemIcon>
                        <Avatar
                          src={contribution.anonymous ? '' : contribution.user?.image}
                          alt={contribution.anonymous ? 'Anonymous' : contribution.user?.name || 'User'}
                        >
                          {contribution.anonymous ? '?' : contribution.user?.name?.charAt(0) || 'U'}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography>
                            <strong>${contribution.amount.toLocaleString()}</strong>
                            {' '}from{' '}
                            {contribution.anonymous ? 'Anonymous' : contribution.user?.name || 'Anonymous'}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(contribution.createdAt), 'MMM d, yyyy')}
                            </Typography>
                            {contribution.message && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                &quot;{contribution.message}&quot;
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No contributions yet. Be the first to support!
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33%' }}}>
            {/* Creator Info */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                About the Creator
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  src={campaign.user?.image} 
                  alt={campaign.user?.name || 'User'} 
                  sx={{ width: 50, height: 50, mr: 2 }} 
                />
                <Box>
                  <Typography variant="subtitle1">
                    {campaign.user?.name || 'Anonymous'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Campaign Creator
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            {/* Delete Campaign Button - Only shown to campaign creator */}
            {session?.user?.id === campaign.user.id && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button 
                  variant="outlined" 
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this campaign? This will refund all contributors.')) {
                      fetch(`/api/campaigns/${id}`, {
                        method: 'DELETE',
                      })
                      .then(response => {
                        if (response.ok) {
                          router.push('/profile');
                        } else {
                          alert('Failed to delete campaign');
                        }
                      })
                      .catch(error => {
                        console.error('Error deleting campaign:', error);
                        alert('Error deleting campaign');
                      });
                    }
                  }}
                >
                  Delete Campaign
                </Button>
              </Box>
            )}
            
            {/* Campaign Details */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Campaign Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <AccessTimeIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Campaign Deadline"
                    secondary={format(new Date(campaign.deadline), 'MMM d, yyyy')}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <MonetizationOnIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Funding Goal"
                    secondary={`$${campaign.fundingGoal.toLocaleString()}`}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <PeopleAltIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Contributors"
                    secondary={contributions.length}
                  />
                </ListItem>
              </List>
              
              {campaign.socials && campaign.socials.length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                    Social Links
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {campaign.socials.map((social, index) => (
                      <Chip 
                        key={index}
                        label={social.platform}
                        component={MuiLink}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        clickable
                      />
                    ))}
                  </Box>
                </>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>
      
      {/* Donation Modal */}
      <DonationModal
        open={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        campaignId={id}
        campaignTitle={campaign?.title || ''}
        onDonationComplete={handleDonationComplete}
      />
    </Container>
  );
}

// Campaign categories (same as in create page)
const categories = [
  { value: 'technology', label: 'Technology' },
  { value: 'art', label: 'Art & Creative' },
  { value: 'community', label: 'Community' },
  { value: 'business', label: 'Business' },
  { value: 'education', label: 'Education' },
  { value: 'environment', label: 'Environment' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'nonprofit', label: 'Nonprofit' },
  { value: 'other', label: 'Other' },
]; 