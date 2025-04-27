'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, Avatar, IconButton, Tooltip, Snackbar, Alert, CircularProgress } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

// Custom hook for fetching and managing user data
function useUserData(userId: string | undefined) {
  const { data: session } = useSession();
  
  const [userData, setUserData] = useState<{
    username: string;
    bio: string;
    image: string | null;
  }>({
    username: '',
    bio: '',
    image: null
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Fetch user data function that can be called on demand
  const fetchUserData = useCallback(async () => {
    if (!userId) {
      setError('User ID is missing');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching user data for ID: ${userId}`);
      const response = await fetch(`/api/users/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to fetch user data (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Fetched user data:', data);
      
      // Check if we got an error but with status 200
      if (data.error) {
        console.log('Received error with 200 status:', data.error);
        // Still use any data provided as fallback
        setUserData({
          username: data.name || session?.user?.name || '',
          bio: data.bio || '',
          image: data.image || session?.user?.image || null
        });
        
        // Don't throw - use what we got
        setLoading(false);
        return;
      }
      
      // Extract relevant data with fallbacks
      const username = data.name || data.username || session?.user?.name || '';
      const bio = data.bio || '';
      const image = data.image || session?.user?.image || null;
      
      setUserData({
        username,
        bio,
        image
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      
      // Fallback to session data if available
      if (session?.user) {
        setUserData({
          username: session.user.name || '',
          bio: '',
          image: session.user.image || null
        });
      }
      
      setError(err instanceof Error ? err.message : 'Failed to load your profile data');
      setLoading(false);
      
      // If there's an error, increment retry count
      setRetryCount(prev => prev + 1);
    }
  }, [userId, session]);
  
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
    setUserData,
    loading,
    error,
    retry: fetchUserData,
    retryCount
  };
}

export default function EditProfile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  // Get user data from custom hook
  const {
    userData: initialData,
    loading: fetchingUser,
    error: fetchError,
    retry: retryFetch
  } = useUserData(session?.user?.id);
  
  // Form state
  const [username, setUsername] = useState(initialData.username);
  const [bio, setBio] = useState(initialData.bio);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData.image);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Update form values when initialData changes
  useEffect(() => {
    setUsername(initialData.username);
    setBio(initialData.bio);
    setImagePreview(initialData.image);
  }, [initialData]);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setUsername(initialData.username);
    setBio(initialData.bio);
    setImagePreview(initialData.image);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!session?.user?.id) {
        throw new Error('You must be logged in to update your profile');
      }
      
      // For now, we'll just use the image preview as the image URL
      // In a real app, you would upload the image to a storage service
      const userData = {
        name: username, // Use name instead of username to match schema
        bio,
        image: imagePreview
      };
      
      console.log('Updating user with data:', userData);
      
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `Failed to update profile (${response.status})`);
      }
      
      const updatedUser = await response.json();
      
      // Check if we got an error with status 200
      if (updatedUser.error) {
        console.warn('Profile update returned error with 200 status:', updatedUser.error);
        // We still update the session
        throw new Error(updatedUser.error);
      }
      
      console.log('Profile updated successfully:', updatedUser);
      
      // Update the session to reflect changes
      await update({
        ...session,
        user: {
          ...session?.user,
          name: username,
          image: imagePreview
        }
      });
      
      setSuccess(true);
      
      // Navigate back to profile after short delay
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = 
    username !== initialData.username || 
    bio !== initialData.bio || 
    imagePreview !== initialData.image;

  if (status === 'loading' || fetchingUser) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading profile data...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            Edit Profile
          </Typography>
          
          {fetchError && (
            <Alert 
              severity="warning" 
              sx={{ mb: 3 }}
              action={
                <Button color="inherit" size="small" onClick={retryFetch}>
                  Retry
                </Button>
              }
            >
              {fetchError}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={imagePreview || ''}
                alt={session?.user?.name || 'Profile'}
                sx={{ width: 100, height: 100 }}
              />
              <Tooltip title="Change profile picture">
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    right: -8,
                    bottom: -8,
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
                    onChange={handleImageChange}
                  />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                variant="outlined"
                disabled={loading}
                required
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Email"
                value={session?.user?.email || ''}
                variant="outlined"
                disabled
                helperText="Email cannot be changed"
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                variant="outlined"
                multiline
                rows={4}
                placeholder="Tell us about yourself"
                disabled={loading}
              />
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Profile updated successfully!
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={() => hasChanges ? resetForm() : router.push('/profile')}
                disabled={loading}
              >
                {hasChanges ? 'Reset Changes' : 'Cancel'}
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading || !hasChanges}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
      
      <Snackbar 
        open={success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success">Profile updated successfully!</Alert>
      </Snackbar>
    </Container>
  );
} 