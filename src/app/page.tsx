import { Box, Button, Card, CardContent, Container, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChatIcon from '@mui/icons-material/Chat';
import TwitterIcon from '@mui/icons-material/Twitter';
import TelegramIcon from '@mui/icons-material/Telegram';

type Campaign = {
  id: number;
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  backers: number;
  daysLeft: number;
};

// Mock data for featured campaigns
const featuredCampaigns: Campaign[] = [
  {
    id: 1,
    title: 'Eco-Friendly Water Bottle',
    description: 'A sustainable water bottle that removes microplastics from your water.',
    image: '/images/campaign1.jpg',
    raised: 15000,
    goal: 20000,
    backers: 254,
    daysLeft: 12,
  },
  {
    id: 2,
    title: 'Smart Home Garden',
    description: 'An AI-powered garden that grows vegetables with minimal intervention.',
    image: '/images/campaign2.jpg',
    raised: 45000,
    goal: 50000,
    backers: 532,
    daysLeft: 8,
  },
  {
    id: 3,
    title: 'Blockchain Education Platform',
    description: 'Making blockchain learning accessible to everyone through interactive courses.',
    image: '/images/campaign3.jpg',
    raised: 85000,
    goal: 100000,
    backers: 943,
    daysLeft: 25,
  }
];

interface CampaignCardProps {
  campaign: Campaign;
}

// Campaign card component
const CampaignCard = ({ campaign }: CampaignCardProps) => {
  const progress = (campaign.raised / campaign.goal) * 100;
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6,
        }
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', height: 200 }}>
        <Image
          src={campaign.image}
          alt={campaign.title}
          fill
          style={{ objectFit: 'cover' }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          {campaign.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {campaign.description}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" fontWeight="bold">${campaign.raised.toLocaleString()}</Typography>
            <Typography variant="body2" color="text.secondary">${campaign.goal.toLocaleString()}</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2">{campaign.backers} backers</Typography>
            <Typography variant="body2">{campaign.daysLeft} days left</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

interface HowItWorksStepProps {
  number: number;
  title: string;
  description: string;
}

// How it works step component
const HowItWorksStep = ({ number, title, description }: HowItWorksStepProps) => {
  return (
    <Box textAlign="center" sx={{ mb: { xs: 4, md: 0 } }}>
      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          mx: 'auto',
        }}
      >
        <Typography variant="h5" color="white">
          {number}
        </Typography>
      </Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
  );
};

export default function Home() {
  return (
    <Box sx={{ bgcolor: 'black', color: 'white' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'black', 
          color: 'white',
          py: { xs: 8, md: 12 },
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Container maxWidth="lg">
          <Grid container component="div" spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }} component="div">
              <Typography 
                component="h1" 
                variant="h2" 
                fontWeight="bold" 
                gutterBottom
              >
                Fund Innovation with Crypto
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  opacity: 0.9,
                  fontWeight: 'normal' 
                }}
              >
                Decentralized crowdfunding for the next generation of blockchain projects
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  variant="contained" 
                  size="large" 
                  component={Link}
                  href="/explore"
                  sx={{ 
                    bgcolor: '#FFEB3B', 
                    color: 'black',
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: '#FFD600'
                    }
                  }}
                >
                  Explore Projects
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  component={Link}
                  href="/create-campaign"
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    '&:hover': {
                      borderColor: '#FFEB3B',
                      bgcolor: 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                >
                  Start a Campaign
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }} component="div" sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box 
                sx={{ 
                  borderRadius: 4, 
                  overflow: 'hidden',
                  height: 350,
                }}
              >
                <Image
                  src="/images/hero-image.png"
                  alt="Cryptocurrency illustration"
                  fill
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How it Works Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography variant="h2" component="h2" textAlign="center" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="subtitle1" textAlign="center" mb={6} color="text.secondary">
            Our platform makes it easy to launch and support blockchain projects
          </Typography>
          
          <Grid container component="div" spacing={4} sx={{ mt: 4 }}>
            <Grid size={{ xs: 12, md: 4 }} component="div">
              <HowItWorksStep 
                number={1} 
                title="Create Your Campaign" 
                description="Set up your fundraising campaign with project details, funding goals, and rewards."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} component="div">
              <HowItWorksStep 
                number={2} 
                title="Get Funded" 
                description="Receive funding in cryptocurrency from supporters around the world."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} component="div">
              <HowItWorksStep 
                number={3} 
                title="Build Your Project" 
                description="Use the funds to build your project and deliver on your promises."
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Featured Campaigns */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" component="h2" textAlign="center" gutterBottom>
            Featured Campaigns
          </Typography>
          <Typography variant="subtitle1" textAlign="center" mb={6} color="text.secondary">
            Discover innovative blockchain projects seeking support
          </Typography>
          
          <Grid container component="div" spacing={2}>
            {featuredCampaigns.map((campaign) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} component="div" key={campaign.id}>
                <CampaignCard campaign={campaign} />
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Button 
              variant="contained" 
              size="large" 
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                borderRadius: 2,
                px: 4,
                bgcolor: '#2196F3',
                color: 'white',
                '&:hover': {
                  bgcolor: '#42a5f5',
                }
              }}
            >
              Explore All Campaigns
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Join Community */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 12 },
          textAlign: 'center',
          backgroundImage: 'linear-gradient(180deg, black, #1a1a1a)',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h2" gutterBottom>
            Join Our Community
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 4 }} color="text.secondary">
            Connect with creators, backers, and blockchain enthusiasts
          </Typography>
          
          <Grid container component="div" justifyContent="center" spacing={2}>
            <Grid size={{ xs: 12, md: 6 }} component="div">
              <Button 
                variant="outlined" 
                size="large"
                startIcon={<ChatIcon />}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Discord
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} component="div">
              <Button 
                variant="outlined" 
                size="large"
                startIcon={<TwitterIcon />}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Twitter
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} component="div">
              <Button 
                variant="outlined" 
                size="large"
                startIcon={<TelegramIcon />}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Telegram
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
