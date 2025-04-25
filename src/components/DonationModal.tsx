'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  Typography, 
  Alert,
  Chip
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { SUPPORTED_CRYPTOCURRENCIES } from '@/lib/cryptoApi';

interface DonationModalProps {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
  onDonationComplete: (contribution: any) => void;
}

export default function DonationModal({ 
  open, 
  onClose, 
  campaignId, 
  campaignTitle,
  onDonationComplete 
}: DonationModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'amount' | 'wallet' | 'processing'>('amount');
  
  const handleSubmit = async () => {
    if (step === 'amount') {
      if (!amount || !selectedCurrency) {
        setError('Please enter an amount and select a currency');
        return;
      }
      setStep('wallet');
      return;
    }
    
    if (step === 'wallet') {
      if (!walletAddress) {
        setError('Please enter your wallet address');
        return;
      }
      setStep('processing');
      processDonation();
    }
  };
  
  const processDonation = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      // In a real implementation, this would:
      // 1. Connect to the user's wallet
      // 2. Process the transaction via cryptoprocessing.io
      // 3. Wait for blockchain confirmation
      
      // For demo purposes, we'll simulate API call
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          amount: parseFloat(amount),
          currency: selectedCurrency,
          walletAddress,
          message,
          anonymous,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process donation');
      }
      
      const contribution = await response.json();
      
      // Notify parent component
      onDonationComplete(contribution);
      
      // Reset form and close
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Donation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process donation');
      setStep('wallet'); // Go back to wallet step on error
    } finally {
      setIsProcessing(false);
    }
  };
  
  const resetForm = () => {
    setAmount('');
    setSelectedCurrency('');
    setWalletAddress('');
    setMessage('');
    setAnonymous(false);
    setError('');
    setStep('amount');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={isProcessing ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Support this Campaign
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {step === 'amount' && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Donate to: {campaignTitle}
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                fullWidth
                required
                InputProps={{
                  inputProps: { min: 0, step: 0.01 }
                }}
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth required>
                <InputLabel id="currency-label">Cryptocurrency</InputLabel>
                <Select
                  labelId="currency-label"
                  value={selectedCurrency}
                  label="Cryptocurrency"
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  {SUPPORTED_CRYPTOCURRENCIES.map((crypto) => (
                    <MenuItem key={crypto.value} value={crypto.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {crypto.icon && (
                          <Box component="img" src={crypto.icon} alt={crypto.label} sx={{ width: 24, mr: 1 }} />
                        )}
                        {crypto.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Message (Optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                fullWidth
                multiline
                rows={2}
                sx={{ mt: 2 }}
              />
              
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={anonymous ? "Anonymous Donation" : "Public Donation"}
                  onClick={() => setAnonymous(!anonymous)}
                  color={anonymous ? "primary" : "default"}
                  variant={anonymous ? "filled" : "outlined"}
                  sx={{ cursor: 'pointer' }}
                />
              </Box>
            </Box>
          </>
        )}
        
        {step === 'wallet' && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Connect Your Wallet
            </Typography>
            
            <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Donation Summary
              </Typography>
              <Typography variant="body1">
                {amount} {selectedCurrency} to {campaignTitle}
              </Typography>
              {message && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Message: "{message}"
                </Typography>
              )}
              {anonymous && (
                <Chip 
                  label="Anonymous" 
                  size="small" 
                  sx={{ mt: 1 }} 
                />
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Please enter your wallet address to complete the donation:
            </Typography>
            
            <TextField
              label="Your Wallet Address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              fullWidth
              required
            />
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Your donation will be converted to USDT and held in escrow until the campaign deadline. 
              If the goal is met, funds will be distributed to the creator in their desired currency.
              If not, you will receive a refund in {selectedCurrency}.
            </Typography>
          </>
        )}
        
        {step === 'processing' && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Processing Your Donation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we process your {amount} {selectedCurrency} donation.
              This may take a moment to confirm on the blockchain.
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        {step !== 'processing' && (
          <Button onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
        )}
        
        {step !== 'processing' && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSubmit}
            disabled={
              isProcessing || 
              (step === 'amount' && (!amount || !selectedCurrency)) ||
              (step === 'wallet' && !walletAddress)
            }
          >
            {step === 'amount' ? 'Next' : 'Donate'}
          </Button>
        )}
        
        {step === 'processing' && (
          <LoadingButton
            loading
            variant="contained"
            color="primary"
            sx={{ mx: 'auto', mb: 2 }}
          >
            Processing...
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  );
} 