import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Construction as ConstructionIcon,
} from '@mui/icons-material';

const AboutPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
        }}
      >
        <ConstructionIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
        <Typography variant="h4" gutterBottom>
          About Us
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
          Learn more about GymFit Pro and our mission to help you achieve your fitness goals.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Coming soon...
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutPage;