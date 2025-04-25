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
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
    handleCloseUserMenu();
  };

  const handleCreateCampaign = (e: React.MouseEvent) => {
    if (status !== 'authenticated') {
      e.preventDefault();
      router.push('/login');
    }
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                }}
              >
                CryptoStarter
              </Typography>
            </Link>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button component={Link} href="/" color="inherit">
              Home
            </Button>
            <Button component={Link} href="/explore" color="inherit">
              Explore
            </Button>
            <Button 
              component={Link} 
              href={status === 'authenticated' ? "/create-campaign" : "#"} 
              color="inherit"
              onClick={handleCreateCampaign}
            >
              Create Campaign
            </Button>

            {status === 'authenticated' && session?.user ? (
              <Box sx={{ ml: 2 }}>
                <Tooltip title="Open profile menu">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar 
                      alt={session.user.name || 'User'} 
                      src={session.user.image || ''}
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
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
                  <MenuItem onClick={handleCloseUserMenu} component={Link} href="/dashboard">
                    <Typography textAlign="center">Dashboard</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleSignOut}>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Button component={Link} href="/login" variant="contained" color="primary" sx={{ ml: 2 }}>
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 