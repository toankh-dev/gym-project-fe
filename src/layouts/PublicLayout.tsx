import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  FitnessCenter,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
} from '@mui/icons-material';

const PublicLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigationItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Packages', path: '/packages' },
    { label: 'Trainers', path: '/trainers' },
    { label: 'Contact', path: '/contact' },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FitnessCenter sx={{ mr: 1 }} />
        GymFit Pro
      </Typography>
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={Link} to={item.path} sx={{ textAlign: 'center' }}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/auth/login')} sx={{ textAlign: 'center' }}>
            <ListItemText primary="Login" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/auth/register')} sx={{ textAlign: 'center' }}>
            <ListItemText primary="Register" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            {/* Logo */}
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 700,
              }}
            >
              <FitnessCenter sx={{ mr: 1, color: 'primary.main' }} />
              GymFit Pro
            </Typography>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.label}
                    component={Link}
                    to={item.path}
                    color="inherit"
                    sx={{ fontSize: '0.95rem' }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Auth Buttons */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  color="inherit"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/auth/login')}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  startIcon={<RegisterIcon />}
                  onClick={() => navigate('/auth/register')}
                >
                  Register
                </Button>
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: 'secondary.main',
          color: 'white',
          py: 3,
          mt: 'auto',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © 2024 GymFit Pro. All rights reserved. | Gym Management System
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicLayout;