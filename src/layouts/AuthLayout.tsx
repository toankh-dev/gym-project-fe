import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  FitnessCenter,
} from '@mui/icons-material';

const AuthLayout: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FF8A65 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ mb: 3 }}>
          <IconButton
            component={Link}
            to="/"
            sx={{
              color: 'white',
              mb: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ArrowBack />
          </IconButton>
        </Box>

        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          {/* Logo Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'white',
                mb: 2,
              }}
            >
              <FitnessCenter sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              GymFit Pro
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your fitness journey starts here
            </Typography>
          </Box>

          {/* Auth Forms Outlet */}
          <Outlet />
        </Paper>

        {/* Footer */}
        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 3, color: 'rgba(255, 255, 255, 0.8)' }}
        >
          © 2024 GymFit Pro. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default AuthLayout;