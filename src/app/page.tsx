import { 
  Box, 
  Button, 
  Card, 
  CardActions, 
  CardContent, 
  Container,
  LinearProgress, 
  Stack, 
  Typography
} from "@mui/material";
import Link from 'next/link';
import Image from 'next/image';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChatIcon from '@mui/icons-material/Chat';
import TwitterIcon from '@mui/icons-material/Twitter';
import TelegramIcon from '@mui/icons-material/Telegram';

// Define campaign type
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
const featuredCampaigns = [
  {
    id: 1,
    title: "Decentralized Healthcare Platform",
    description: "A blockchain-based platform to securely store and share medical records.",
    image: "/images/card-healthcare.svg",
    raised: 240,
    goal: 500,
    backers: 45,
    daysLeft: 18
  },
  {
    id: 2,
    title: "Green Energy Trading Marketplace",
    description: "Enabling peer-to-peer renewable energy trading with transparent token economics.",
    image: "/images/card-energy.svg",
    raised: 180,
    goal: 300,
    backers: 32,
    daysLeft: 12
  },
  {
    id: 3,
    title: "Decentralized Identity Solution",
    description: "Self-sovereign identity platform using blockchain for secure and private authentication.",
    image: "/images/card-identity.svg",
    raised: 80,
    goal: 200,
    backers: 15,
    daysLeft: 25
  }
];

// Campaign card component
function CampaignCard({ campaign }: { campaign: Campaign }) {
  const progress = (campaign.raised / campaign.goal) * 100;
  
  return (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        bgcolor: 'black',
        color: 'white',
        borderRadius: 2,
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 8px 16px rgba(255, 255, 255, 0.2)'
        }
      }}
    >
      <Box sx={{ position: 'relative', height: 180 }}>
        <Image
          src={campaign.image}
          alt={campaign.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2" sx={{ color: 'white' }}>
          {campaign.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
          {campaign.description}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 8, 
            borderRadius: 4, 
            mb: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            '.MuiLinearProgress-bar': {
              backgroundColor: '#FFEB3B'
            }
          }} 
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            ${campaign.raised}K raised
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            ${campaign.goal}K goal
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {campaign.backers} backers
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {campaign.daysLeft} days left
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          component={Link} 
          href={`/campaigns/${campaign.id}`}
          endIcon={<ArrowForwardIcon />}
          sx={{
            backgroundColor: '#FFEB3B', 
            color: 'black',
            '&:hover': {
              backgroundColor: '#FFD600',
            }
          }}
        >
          View Campaign
        </Button>
      </CardActions>
    </Card>
  );
}

// How it works step component
function HowItWorksStep({ 
  number, 
  title, 
  description 
}: { 
  number: number; 
  title: string; 
  description: string;
}) {
  return (
    <Box textAlign="center" p={2}>
      <Box 
        sx={{ 
          backgroundColor: '#FFEB3B', 
          color: 'black', 
          width: 60, 
          height: 60, 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}
      >
        {number}
      </Box>
      <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>{title}</Typography>
      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>{description}</Typography>
    </Box>
  );
}

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
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 6,
            alignItems: 'center' 
          }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 58.33%' } }}>
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
            </Box>
            <Box 
              sx={{ 
                flex: { xs: '1 1 100%', md: '1 1 41.67%' }, 
                display: { xs: 'none', md: 'block' }
              }}
            >
              <Box 
                sx={{ 
                  borderRadius: 4, 
                  overflow: 'hidden',
                  height: 350,
                }}
              >
                <img
                  src="/images/hero-image.png"
                  alt="Cryptocurrency illustration"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
            </Box>
          </Box>
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
          
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4,
              mt: 4 
            }}
          >
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.333%' } }}>
              <HowItWorksStep 
                number={1} 
                title="Create Your Campaign" 
                description="Set up your fundraising campaign with project details, funding goals, and rewards."
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.333%' } }}>
              <HowItWorksStep 
                number={2} 
                title="Get Funded" 
                description="Receive funding in cryptocurrency from supporters around the world."
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.333%' } }}>
              <HowItWorksStep 
                number={3} 
                title="Build Your Project" 
                description="Use the funds to build your project and deliver on your promises."
              />
            </Box>
          </Box>
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
          
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              margin: '-8px', // Negative margin to offset padding
            }}
          >
            {featuredCampaigns.map((campaign) => (
              <Box 
                key={campaign.id} 
                sx={{ 
                  width: { xs: '100%', md: '33.33%' },
                  padding: '8px',
                  boxSizing: 'border-box',
                }}
              >
                <CampaignCard campaign={campaign} />
              </Box>
            ))}
          </Box>
          
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
          
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'center',
              gap: 2
            }}
          >
            <Button 
              variant="outlined" 
              size="large"
              startIcon={<ChatIcon />}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Discord
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              startIcon={<TwitterIcon />}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Twitter
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              startIcon={<TelegramIcon />}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Telegram
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
