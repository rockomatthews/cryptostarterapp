import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Avatar,
  Chip,
  useTheme
} from '@mui/material';
import { SUPPORTED_CRYPTOCURRENCIES } from '@/lib/cryptoApi';

interface Contribution {
  id: string;
  amount: number;           // USD equivalent
  originalAmount: number;   // Original crypto amount
  donationCurrency: string; // Crypto currency code
  anonymous: boolean;
  user?: {
    id: string;
    name: string;
    image?: string;
  };
}

interface DonationLeaderboardProps {
  contributions: Contribution[];
  limit?: number;
}

export default function DonationLeaderboard({ contributions, limit = 10 }: DonationLeaderboardProps) {
  const theme = useTheme();
  
  // Function to get cryptocurrency details 
  const getCryptoCurrency = (code: string) => {
    return SUPPORTED_CRYPTOCURRENCIES.find(crypto => crypto.value === code) || {
      value: code,
      label: code,
      icon: undefined
    };
  };
  
  // Take only the top contributions up to the limit
  const topContributions = contributions.slice(0, limit);
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Top Supporters
      </Typography>
      
      {topContributions.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '5%' }}>#</TableCell>
                <TableCell>Supporter</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Cryptocurrency</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topContributions.map((contribution, index) => {
                const crypto = getCryptoCurrency(contribution.donationCurrency);
                
                return (
                  <TableRow 
                    key={contribution.id}
                    sx={{ 
                      '&:nth-of-type(odd)': { bgcolor: theme.palette.action.hover },
                      // Highlight top 3 with different colors
                      ...(index < 3 && {
                        bgcolor: [
                          'rgba(255, 215, 0, 0.1)', // Gold
                          'rgba(192, 192, 192, 0.1)', // Silver
                          'rgba(205, 127, 50, 0.1)', // Bronze
                        ][index],
                        '&:hover': {
                          bgcolor: [
                            'rgba(255, 215, 0, 0.2)',
                            'rgba(192, 192, 192, 0.2)',
                            'rgba(205, 127, 50, 0.2)',
                          ][index],
                        },
                      })
                    }}
                  >
                    <TableCell>
                      {/* Medal for top 3 */}
                      {index < 3 ? (
                        <Typography fontWeight="bold">
                          {['🥇', '🥈', '🥉'][index]}
                        </Typography>
                      ) : (
                        index + 1
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={contribution.anonymous ? '' : contribution.user?.image}
                          alt={contribution.anonymous ? 'Anonymous' : contribution.user?.name || 'User'}
                          sx={{ mr: 2, width: 32, height: 32 }}
                        >
                          {contribution.anonymous ? '?' : contribution.user?.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Typography>
                          {contribution.anonymous ? 'Anonymous' : contribution.user?.name || 'Anonymous'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={index < 3 ? 'bold' : 'normal'}>
                        {contribution.originalAmount.toLocaleString(undefined, { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6 
                        })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (${contribution.amount.toLocaleString()} USD)
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={crypto.label}
                        size="small"
                        icon={crypto.icon ? (
                          <Box 
                            component="img" 
                            src={crypto.icon} 
                            alt={crypto.label} 
                            sx={{ width: 16, height: 16 }} 
                          />
                        ) : undefined}
                        sx={{ 
                          fontWeight: 'medium',
                          '& .MuiChip-icon': { 
                            ml: 1,
                            mr: -0.5 
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No donations yet. Be the first to support!
          </Typography>
        </Box>
      )}
    </Paper>
  );
} 