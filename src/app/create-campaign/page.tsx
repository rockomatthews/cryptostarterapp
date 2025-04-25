'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Container, Typography, Box, Paper, TextField, Button,
  Chip, FormControl, InputLabel, Select,
  MenuItem, InputAdornment, Divider, Alert,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SUPPORTED_CRYPTOCURRENCIES, CAMPAIGN_CREATION_FEE, createPaymentIntent } from '@/lib/cryptoApi';

// Social media platforms
const platforms = [
  { value: 'twitter', label: 'Twitter' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'discord', label: 'Discord' },
  { value: 'telegram', label: 'Telegram' },
];

// Campaign categories
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

interface SocialLink {
  platform: string;
  url: string;
}

interface MediaItem {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

export default function CreateCampaign() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Campaign form state
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [fundingGoal, setFundingGoal] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [category, setCategory] = useState('');
  const [website, setWebsite] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [cryptocurrencyType, setCryptocurrencyType] = useState('');
  
  // Media state
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [additionalMedia, setAdditionalMedia] = useState<MediaItem[]>([]);
  
  // Social links state
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [donorWalletAddress, setDonorWalletAddress] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAdditionalMedia(prev => [
            ...prev, 
            { 
              file, 
              preview: reader.result as string,
              type: file.type.startsWith('image/') ? 'image' : 'video'
            }
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveAdditionalMedia = (index: number) => {
    setAdditionalMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddSocialLink = () => {
    if (newSocialPlatform && newSocialUrl) {
      setSocialLinks(prev => [...prev, { platform: newSocialPlatform, url: newSocialUrl }]);
      setNewSocialPlatform('');
      setNewSocialUrl('');
    }
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title) newErrors.title = 'Title is required';
    if (!shortDescription) newErrors.shortDescription = 'Short description is required';
    if (!description) newErrors.description = 'Description is required';
    if (!fundingGoal) newErrors.fundingGoal = 'Funding goal is required';
    if (!deadline) newErrors.deadline = 'Deadline is required';
    if (!category) newErrors.category = 'Category is required';
    if (!walletAddress) newErrors.walletAddress = 'Wallet address is required';
    if (!cryptocurrencyType) newErrors.cryptocurrencyType = 'Cryptocurrency type is required';
    if (!mainImage) newErrors.mainImage = 'Main image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Show payment modal for campaign creation fee
    setShowPaymentModal(true);
  };
  
  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setPaymentError('');
  };
  
  const handleProcessPayment = async () => {
    if (!donorWalletAddress) {
      setPaymentError('Please enter your wallet address');
      return;
    }
    
    setIsProcessingPayment(true);
    setPaymentError('');
    
    try {
      // Create payment intent for campaign creation fee
      const paymentIntent = await createPaymentIntent({
        amount: CAMPAIGN_CREATION_FEE,
        currency: 'USDT',
        description: `Campaign creation fee for: ${title}`
      });
      
      // In a real implementation, we would now:
      // 1. Connect to user's wallet
      // 2. Process the payment
      // 3. Wait for blockchain confirmation
      
      // For demo purposes, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPaymentSuccess(true);
      
      // After successful payment, submit the campaign
      await submitCampaign();
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  const submitCampaign = async () => {
    try {
      // 1. Upload main image
      // In a real implementation, we would upload the image to a storage service
      // For now, we'll simulate the upload
      const mainImageUrl = `https://example.com/images/${mainImage?.name}`;
      
      // 2. Upload additional media
      const mediaUrls = additionalMedia.map((media, index) => ({
        url: `https://example.com/media/${index}-${media.file.name}`,
        type: media.type
      }));
      
      // 3. Create campaign
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          shortDescription,
          description,
          fundingGoal: parseFloat(fundingGoal),
          deadline,
          category,
          cryptocurrencyType,
          mainImage: mainImageUrl,
          additionalMedia: mediaUrls,
          website,
          socials: socialLinks,
          walletAddress
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }
      
      const campaign = await response.json();
      
      // Navigate to the new campaign page
      router.push(`/campaigns/${campaign.id}`);
      
    } catch (error) {
      console.error('Error creating campaign:', error);
      setPaymentError('Failed to create campaign after payment');
    }
  };

  if (status === 'loading') {
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
      <Box sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" gutterBottom align="center">
          Create New Campaign
        </Typography>
        
        <Paper sx={{ p: 3, mt: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Campaign creation requires a one-time fee of {CAMPAIGN_CREATION_FEE} USDT. 
            Your campaign will be automatically distributed if successful or refunded if not successful.
          </Alert>
          
          <form onSubmit={handleSubmit}>
            {/* Main Image Upload */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Campaign Image
              </Typography>
              
              {mainImagePreview ? (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={mainImagePreview} 
                    alt="Campaign Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '300px',
                      borderRadius: '8px'
                    }} 
                  />
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      right: 8,
                      bottom: 8,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  >
                    <AddPhotoAlternateIcon />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleMainImageChange}
                    />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddPhotoAlternateIcon />}
                  sx={{ height: '150px', width: '100%', borderStyle: 'dashed' }}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleMainImageChange}
                  />
                  Add Main Campaign Image
                </Button>
              )}
              {errors.mainImage && (
                <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
                  {errors.mainImage}
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Basic Information */}
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <TextField
                  fullWidth
                  label="Campaign Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  variant="outlined"
                  error={!!errors.title}
                  helperText={errors.title}
                  required
                />
              </Box>
              
              <Box>
                <TextField
                  fullWidth
                  label="Funding Goal"
                  value={fundingGoal}
                  onChange={(e) => setFundingGoal(e.target.value)}
                  variant="outlined"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  error={!!errors.fundingGoal}
                  helperText={errors.fundingGoal}
                  required
                />
              </Box>
              
              <Box>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Campaign Deadline"
                    value={deadline}
                    onChange={(newValue) => setDeadline(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                        required: true,
                        error: !!errors.deadline,
                        helperText: errors.deadline,
                      }
                    }}
                    disablePast
                  />
                </LocalizationProvider>
              </Box>
              
              <Box>
                <FormControl fullWidth error={!!errors.category} required>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    value={category}
                    label="Category"
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && (
                    <Typography color="error" variant="caption">
                      {errors.category}
                    </Typography>
                  )}
                </FormControl>
              </Box>
              
              <Box>
                <FormControl fullWidth error={!!errors.cryptocurrencyType} required>
                  <InputLabel id="cryptocurrency-label">Preferred Cryptocurrency</InputLabel>
                  <Select
                    labelId="cryptocurrency-label"
                    value={cryptocurrencyType}
                    label="Preferred Cryptocurrency"
                    onChange={(e) => setCryptocurrencyType(e.target.value)}
                  >
                    {SUPPORTED_CRYPTOCURRENCIES.map((crypto) => (
                      <MenuItem key={crypto.value} value={crypto.value}>
                        {crypto.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.cryptocurrencyType && (
                    <Typography color="error" variant="caption">
                      {errors.cryptocurrencyType}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    Select the cryptocurrency you want to receive if your campaign is successful.
                  </Typography>
                </FormControl>
              </Box>
              
              <Box>
                <TextField
                  fullWidth
                  label="Short Description"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  variant="outlined"
                  multiline
                  rows={2}
                  error={!!errors.shortDescription}
                  helperText={errors.shortDescription || "A brief summary of your campaign (max 150 characters)"}
                  inputProps={{ maxLength: 150 }}
                  required
                />
              </Box>
              
              <Box>
                <TextField
                  fullWidth
                  label="Full Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  variant="outlined"
                  multiline
                  rows={6}
                  error={!!errors.description}
                  helperText={errors.description || "Detailed information about your campaign"}
                  required
                />
              </Box>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Additional Media */}
            <Typography variant="h6" gutterBottom>
              Additional Media (Optional)
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AddPhotoAlternateIcon />}
              >
                <input
                  type="file"
                  hidden
                  accept="image/*,video/*"
                  multiple
                  onChange={handleAdditionalMediaChange}
                />
                Add Photos/Videos
              </Button>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2, mt: 2 }}>
                {additionalMedia.map((media, index) => (
                  <Box key={index}>
                    <Box sx={{ position: 'relative' }}>
                      {media.type === 'image' ? (
                        <img
                          src={media.preview}
                          alt={`Media ${index}`}
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                        />
                      ) : (
                        <video
                          src={media.preview}
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                          controls
                        />
                      )}
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          },
                        }}
                        onClick={() => handleRemoveAdditionalMedia(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Links & Wallet */}
            <Typography variant="h6" gutterBottom>
              Links & Wallet
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <TextField
                  fullWidth
                  label="Website (Optional)"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  variant="outlined"
                  placeholder="https://example.com"
                />
              </Box>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Social Media Links (Optional)
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <FormControl sx={{ mr: 1, flex: 1 }}>
                    <InputLabel id="social-platform-label">Platform</InputLabel>
                    <Select
                      labelId="social-platform-label"
                      value={newSocialPlatform}
                      label="Platform"
                      onChange={(e) => setNewSocialPlatform(e.target.value)}
                      fullWidth
                    >
                      {platforms.map((platform) => (
                        <MenuItem key={platform.value} value={platform.value}>
                          {platform.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    sx={{ flex: 2, mx: 1 }}
                    label="URL"
                    value={newSocialUrl}
                    onChange={(e) => setNewSocialUrl(e.target.value)}
                    variant="outlined"
                    placeholder="https://twitter.com/username"
                  />
                  
                  <Button
                    variant="contained"
                    onClick={handleAddSocialLink}
                    disabled={!newSocialPlatform || !newSocialUrl}
                    sx={{ mt: 1 }}
                  >
                    <AddIcon />
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {socialLinks.map((link, index) => (
                    <Chip
                      key={index}
                      label={`${platforms.find(p => p.value === link.platform)?.label}: ${link.url}`}
                      onDelete={() => handleRemoveSocialLink(index)}
                    />
                  ))}
                </Box>
              </Box>
              
              <Box>
                <TextField
                  fullWidth
                  label="Wallet Address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  variant="outlined"
                  error={!!errors.walletAddress}
                  helperText={errors.walletAddress || `Your ${cryptocurrencyType || 'cryptocurrency'} wallet address where funds will be sent if campaign is successful`}
                  required
                />
              </Box>
            </Box>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={() => router.push('/profile')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                size="large"
              >
                Create Campaign ({CAMPAIGN_CREATION_FEE} USDT)
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
      
      {/* Payment Modal */}
      <Dialog
        open={showPaymentModal}
        onClose={handlePaymentModalClose}
        aria-labelledby="payment-dialog-title"
      >
        <DialogTitle id="payment-dialog-title">
          Campaign Creation Payment
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Creating a campaign requires a one-time fee of {CAMPAIGN_CREATION_FEE} USDT.
            This helps ensure high-quality campaigns on our platform.
          </DialogContentText>
          
          {paymentSuccess ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Payment successful! Creating your campaign...
            </Alert>
          ) : (
            <>
              <TextField
                fullWidth
                margin="dense"
                label="Your Wallet Address"
                type="text"
                value={donorWalletAddress}
                onChange={(e) => setDonorWalletAddress(e.target.value)}
                required
                sx={{ mt: 2 }}
              />
              
              {paymentError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {paymentError}
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          {!paymentSuccess && (
            <>
              <Button onClick={handlePaymentModalClose} disabled={isProcessingPayment}>
                Cancel
              </Button>
              <Button 
                onClick={handleProcessPayment} 
                disabled={isProcessingPayment || !donorWalletAddress}
                variant="contained"
                color="primary"
              >
                {isProcessingPayment ? 'Processing...' : `Pay ${CAMPAIGN_CREATION_FEE} USDT`}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
} 