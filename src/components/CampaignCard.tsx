'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip, 
  Avatar, 
  LinearProgress
} from '@mui/material';
import Link from 'next/link';
import { differenceInDays } from 'date-fns';
import { SUPPORTED_CRYPTOCURRENCIES } from '@/lib/cryptoApi';

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

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  // Calculate progress percentage
  const progress = (campaign.currentAmount / campaign.fundingGoal) * 100;
  
  // Calculate days left
  const today = new Date();
  const deadlineDate = new Date(campaign.deadline);
  const daysLeft = differenceInDays(deadlineDate, today);
  const isEnded = daysLeft <= 0;
  
  // Find cryptocurrency info
  const cryptoCurrency = SUPPORTED_CRYPTOCURRENCIES.find(
    crypto => crypto.value === campaign.cryptocurrencyType
  );

  // Find default categories
  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'art', label: 'Art & Creative' },
    { value: 'community', label: 'Community' },
    { value: 'business', label: 'Business' },
    { value: 'education', label: 'Education' },
    { value: 'environment', label: 'Environment' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      }
    }}>
      <Link href={`/campaigns/${campaign.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="160"
            image={campaign.mainImage || '/placeholder-image.jpg'}
            alt={campaign.title}
          />
          <Chip 
            label={categories.find(c => c.value === campaign.category)?.label || campaign.category} 
            size="small" 
            color="primary" 
            sx={{ 
              position: 'absolute', 
              top: 10, 
              left: 10,
              fontSize: '0.7rem'
            }} 
          />
        </Box>
        
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography gutterBottom variant="h6" component="div" sx={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.2,
            height: '2.4em'
          }}>
            {campaign.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar 
              src={campaign.user?.image} 
              alt={campaign.user?.name || 'User'} 
              sx={{ width: 20, height: 20, mr: 1 }} 
            />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              by {campaign.user?.name || 'Anonymous'}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ 
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            height: '2.5em',
            fontSize: '0.9rem'
          }}>
            {campaign.shortDescription}
          </Typography>
          
          <Box sx={{ mt: 'auto' }}>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(progress, 100)} 
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Box>
                <Typography variant="subtitle2">
                  ${campaign.currentAmount.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  of ${campaign.fundingGoal.toLocaleString()}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" align="right">
                  {isEnded ? 'Ended' : `${daysLeft} days`}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem', textAlign: 'right' }}>
                  {isEnded ? 'Campaign ended' : 'remaining'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, justifyContent: 'flex-start' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem', mr: 0.5 }}>
                Funding in:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {cryptoCurrency?.icon && (
                  <Box 
                    component="img" 
                    src={cryptoCurrency.icon} 
                    alt={cryptoCurrency.label} 
                    sx={{ width: 14, mr: 0.5 }} 
                  />
                )}
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  {cryptoCurrency?.label || campaign.cryptocurrencyType}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Link>
    </Card>
  );
} 