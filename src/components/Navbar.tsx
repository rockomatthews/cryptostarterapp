'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';

// Custom hook for fetching user data
function useUserData(userId: string | undefined) {
  const [userData, setUserData] = useState<{
    username?: string;
    name?: string;
    bio?: string;
    image?: string;
  }>({});
  
  const [loading, setLoading] = useState(false);
  
  // Fetch user data function
  const fetchUserData = useCallback(async () => {
    if (!userId) {
      return;
    }
    
    try {
      setLoading(true);
      
      console.log(`Fetching user data for ID: ${userId}`);
      const response = await fetch(`/api/users/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched user data:', data);
        setUserData(data);
      } else {
        console.warn(`Failed to fetch user data: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  // Initial data fetch
  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId, fetchUserData]);
  
  return {
    userData,
    loading
  };
}

const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get user data from custom hook
  const { userData } = useUserData(session?.user?.id);
  
  // Use session data as fallback if API fails
  const displayName = userData?.username || userData?.name || session?.user?.name || 'User';
  const displayImage = userData?.image || session?.user?.image || undefined;
  
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
    handleCloseUserMenu();
    setMobileMenuOpen(false);
  };

  const handleCreateCampaign = (e: React.MouseEvent) => {
    if (status !== 'authenticated') {
      e.preventDefault();
      router.push('/login');
    }
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const mobileMenu = (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      PaperProps={{
        sx: {
          backgroundColor: '#121212',
          width: '250px',
          borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
        }
      }}
    >
      <List sx={{ pt: 2 }}>
        <ListItem component={Link} href="/" onClick={() => setMobileMenuOpen(false)} sx={{ color: 'white', textDecoration: 'none' }}>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem component={Link} href="/explore" onClick={() => setMobileMenuOpen(false)} sx={{ color: 'white', textDecoration: 'none' }}>
          <ListItemText primary="Explore" />
        </ListItem>
        <ListItem 
          component={Link} 
          href={status === 'authenticated' ? "/create-campaign" : "#"} 
          onClick={handleCreateCampaign} 
          sx={{ color: 'white', textDecoration: 'none' }}
        >
          <ListItemText primary="Create Campaign" />
        </ListItem>
        
        {status === 'authenticated' ? (
          <>
            <ListItem component={Link} href="/profile" onClick={() => setMobileMenuOpen(false)} sx={{ color: 'white', textDecoration: 'none' }}>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem component={Link} href="/dashboard" onClick={() => setMobileMenuOpen(false)} sx={{ color: 'white', textDecoration: 'none' }}>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem onClick={handleSignOut} sx={{ color: 'white', textDecoration: 'none' }}>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <ListItem component={Link} href="/login" onClick={() => setMobileMenuOpen(false)} sx={{ color: '#FFEB3B', textDecoration: 'none' }}>
            <ListItemText primary="Sign In" />
          </ListItem>
        )}
      </List>
    </Drawer>
  );

  return (
    <AppBar position="static" elevation={1} sx={{ bgcolor: 'black', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="h5"
                noWrap
                sx={{
                  fontFamily: 'var(--font-logo)',
                  fontWeight: 700,
                  fontSize: { xs: '22px', sm: '28px' },
                  color: '#FFEB3B',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  textShadow: '0 0 10px rgba(255, 235, 59, 0.3)',
                }}
              >
                CryptoStarter
              </Typography>
            </Link>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button component={Link} href="/" sx={{ color: 'white' }}>
                Home
              </Button>
              <Button component={Link} href="/explore" sx={{ color: 'white' }}>
                Explore
              </Button>
              <Button 
                component={Link} 
                href={status === 'authenticated' ? "/create-campaign" : "#"} 
                sx={{ color: 'white' }}
                onClick={handleCreateCampaign}
              >
                Create Campaign
              </Button>

              {status === 'authenticated' && session?.user ? (
                <Box sx={{ ml: 2 }}>
                  <Tooltip title="Open profile menu">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar 
                        alt={displayName} 
                        src={displayImage}
                        sx={{ 
                          border: '2px solid #FFEB3B',
                          bgcolor: '#FFEB3B',
                          color: 'black'
                        }}
                      >
                        {!displayImage && <PersonIcon />}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ 
                      mt: '45px',
                      '& .MuiPaper-root': {
                        backgroundColor: '#121212',
                        borderRadius: 2,
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                      }
                    }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem onClick={handleCloseUserMenu} component={Link} href="/profile">
                      <Typography textAlign="center">Profile</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleCloseUserMenu} component={Link} href="/profile/edit">
                      <Typography textAlign="center">Edit Profile</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleSignOut}>
                      <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Button 
                  component={Link} 
                  href="/login" 
                  variant="contained" 
                  sx={{ 
                    ml: 2,
                    bgcolor: '#FFEB3B', 
                    color: 'black',
                    '&:hover': {
                      bgcolor: '#FFD600',
                    } 
                  }}
                >
                  Sign In
                </Button>
              )}
            </Box>
          ) : (
            /* Mobile Menu Button */
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={toggleMobileMenu}
              sx={{ color: 'white' }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </Container>
      {mobileMenu}
    </AppBar>
  );
};

export default Navbar; 