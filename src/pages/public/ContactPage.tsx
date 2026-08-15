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

const ContactPage: React.FC = () => {
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
          Contact Us
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
          Get in touch with us for more information about our services and facilities.
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

export default ContactPage;