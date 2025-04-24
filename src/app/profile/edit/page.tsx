'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, Avatar, IconButton, Tooltip } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

export default function EditProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    if (session?.user?.name) {
      setUsername(session.user.name);
    }
    
    if (session?.user?.image) {
      setImagePreview(session.user.image);
    }
    
    // Here you would fetch the user's bio from your API
    // For example:
    // if (session?.user?.id) {
    //   fetch(`/api/users/${session.user.id}`)
    //     .then(res => res.json())
    //     .then(data => {
    //       setBio(data.bio || '');
    //     });
    // }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would upload the image if changed
    // and update the user profile
    
    // For example:
    // let imageUrl = session?.user?.image;
    // if (imageFile) {
    //   const formData = new FormData();
    //   formData.append('file', imageFile);
    //   const uploadRes = await fetch('/api/upload', {
    //     method: 'POST',
    //     body: formData
    //   });
    //   const uploadData = await uploadRes.json();
    //   imageUrl = uploadData.url;
    // }
    
    // Then update the user profile
    // await fetch(`/api/users/${session?.user?.id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     username,
    //     bio,
    //     image: imageUrl
    //   })
    // });
    
    // For now, just navigate back to profile
    router.push('/profile');
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
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
              >
                Save Changes
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
} 