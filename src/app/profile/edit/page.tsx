'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, Avatar, IconButton, Tooltip, Snackbar, Alert, CircularProgress } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

export default function EditProfile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [initialData, setInitialData] = useState<{username: string, bio: string, image: string | null}>({
    username: '',
    bio: '',
    image: null
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    const fetchUserData = async () => {
      if (session?.user?.id) {
        setFetchingUser(true);
        try {
          const response = await fetch(`/api/users/${session.user.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          
          const userData = await response.json();
          console.log('Fetched user data:', userData);
          
          const username = userData.username || userData.name || session?.user?.name || '';
          const bio = userData.bio || '';
          const image = userData.image || session?.user?.image || null;
          
          setUsername(username);
          setBio(bio);
          setImagePreview(image);
          setInitialData({
            username,
            bio,
            image
          });
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load your profile data. Please try again.');
        } finally {
          setFetchingUser(false);
        }
      } else {
        setFetchingUser(false);
      }
    };
    
    if (session?.user?.id) {
      fetchUserData();
    }
  }, [status, router, session]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
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
    setImageFile(null);
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
        username,
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
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      const updatedUser = await response.json();
      console.log('Profile updated successfully:', updatedUser);
      
      // Update the initial data to reflect the changes
      setInitialData({
        username,
        bio,
        image: imagePreview
      });
      
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
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
} 