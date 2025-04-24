'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleProfileClick = () => {
    router.push('/profile');
    handleCloseMenu();
  };
  
  const handleEditProfileClick = () => {
    router.push('/profile/edit');
    handleCloseMenu();
  };
  
  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
    handleCloseMenu();
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}
          >
            CryptoStarter
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Link href="/" passHref>
              <Button sx={{ my: 2, color: 'white', display: 'block' }}>
                Home
              </Button>
            </Link>
            <Link href="/explore" passHref>
              <Button sx={{ my: 2, color: 'white', display: 'block' }}>
                Explore
              </Button>
            </Link>
            <Link href="/create-campaign" passHref>
              <Button sx={{ my: 2, color: 'white', display: 'block' }}>
                Create Campaign
              </Button>
            </Link>
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {status === 'authenticated' ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
                    <Avatar 
                      alt={session?.user?.name || "User"} 
                      src={session?.user?.image || ""} 
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                >
                  <MenuItem onClick={handleProfileClick}>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleEditProfileClick}>
                    Edit Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button 
                color="inherit" 
                variant="outlined" 
                onClick={() => signIn(undefined, { callbackUrl: '/profile' })}
              >
                Log In
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 