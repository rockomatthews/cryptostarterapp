'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  MenuItem, 
  Button,
  InputAdornment,
  CircularProgress 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CampaignCard from '@/components/CampaignCard';

// Define types for campaigns
interface Campaign {
  id: string;
  title: string;
  shortDescription: string;
  fundingGoal: number;
  currentAmount: number;
  deadline: string;
  category: string;
  mainImage?: string;
  cryptocurrencyType: string;
  active: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

// Default category options
const categories = [
  { value: '', label: 'All Categories' },
  { value: 'technology', label: 'Technology' },
  { value: 'art', label: 'Art & Creative' },
  { value: 'community', label: 'Community' },
  { value: 'business', label: 'Business' },
  { value: 'education', label: 'Education' },
  { value: 'environment', label: 'Environment' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'other', label: 'Other' },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  // Load campaigns on initial render
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Fetch campaigns with optional filters
  const fetchCampaigns = async (title?: string, category?: string) => {
    setLoading(true);
    try {
      let url = '/api/campaigns';
      const params = new URLSearchParams();
      
      if (title) {
        params.append('title', title);
      }
      
      if (category) {
        params.append('category', category);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load campaigns. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search & filter
  const handleSearch = () => {
    fetchCampaigns(searchTerm, category);
  };

  // Handle category change
  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(event.target.value);
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle search on Enter key
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Discover Campaigns
        </Typography>
        
        {/* Search and filter controls */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2, 
          mb: 4, 
          alignItems: 'flex-start' 
        }}>
          <TextField
            label="Search campaigns"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            select
            label="Category"
            value={category}
            onChange={handleCategoryChange}
            variant="outlined"
            sx={{ minWidth: { xs: '100%', sm: 200 } }}
          >
            {categories.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSearch}
            sx={{ 
              height: 56, 
              minWidth: { xs: '100%', sm: 120 } 
            }}
          >
            Search
          </Button>
        </Box>
        
        {/* Campaigns grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="error">{error}</Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => fetchCampaigns()}
            >
              Try Again
            </Button>
          </Box>
        ) : campaigns.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No campaigns found
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your search or filters
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
            {campaigns.map((campaign) => (
              <Box key={campaign.id}>
                <CampaignCard campaign={campaign} />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
} 