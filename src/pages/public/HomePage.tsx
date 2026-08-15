import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
} from '@mui/material';
import {
  FitnessCenter,
  TrendingUp,
  Groups,
  Schedule,
  Star,
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <FitnessCenter />,
      title: 'Professional Equipment',
      description: 'State-of-the-art fitness equipment for all your workout needs',
    },
    {
      icon: <Groups />,
      title: 'Expert Trainers',
      description: 'Certified personal trainers to guide your fitness journey',
    },
    {
      icon: <Schedule />,
      title: 'Flexible Schedules',
      description: 'Book sessions at your convenience with our online system',
    },
    {
      icon: <TrendingUp />,
      title: 'Progress Tracking',
      description: 'Monitor your fitness progress with detailed analytics',
    },
  ];

  const packages = [
    {
      name: '1 Month Basic',
      price: '500,000',
      duration: '1 month',
      features: ['Gym access', 'Basic equipment', 'Locker room'],
    },
    {
      name: '3 Month Standard',
      price: '1,350,000',
      duration: '3 months',
      features: ['Gym access', 'Group classes', 'Nutrition consultation'],
      popular: true,
    },
    {
      name: '12 Month Premium',
      price: '4,500,000',
      duration: '12 months',
      features: ['All access', 'Personal trainer', 'Priority booking', 'Meal planning'],
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
          color: 'white',
          py: 10,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight={700}>
                Transform Your
                <br />
                <span style={{ color: '#FFE0B2' }}>Fitness Journey</span>
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Join GymFit Pro and achieve your fitness goals with our professional
                equipment, expert trainers, and comprehensive tracking system.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  Start Free Trial
                </Button>
                <Button variant="outlined" size="large" sx={{ borderColor: 'white', color: 'white' }}>
                  View Packages
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: 400,
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography variant="h4" color="white" sx={{ opacity: 0.7 }}>
                  Gym Equipment Image
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom fontWeight={600}>
          Why Choose GymFit Pro?
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Everything you need for a successful fitness journey
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  '&:hover': { boxShadow: 4 },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      color: 'primary.main',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pricing Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom fontWeight={600}>
            Choose Your Plan
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
            Flexible pricing options to fit your needs
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            {packages.map((pkg, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    border: pkg.popular ? '2px solid' : '1px solid',
                    borderColor: pkg.popular ? 'primary.main' : 'grey.200',
                  }}
                >
                  {pkg.popular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1,
                      }}
                    />
                  )}
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="h5" gutterBottom fontWeight={600}>
                      {pkg.name}
                    </Typography>
                    <Typography variant="h3" color="primary.main" gutterBottom>
                      {pkg.price}
                      <Typography component="span" variant="body2" color="text.secondary">
                        /{pkg.duration}
                      </Typography>
                    </Typography>
                    <Box sx={{ my: 3 }}>
                      {pkg.features.map((feature, idx) => (
                        <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                          ✓ {feature}
                        </Typography>
                      ))}
                    </Box>
                    <Button
                      variant={pkg.popular ? 'contained' : 'outlined'}
                      fullWidth
                      size="large"
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center', p: 6 }}>
            <Typography variant="h3" gutterBottom fontWeight={600}>
              Ready to Start Your Fitness Journey?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of members who have transformed their lives with GymFit Pro
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                Join Now
              </Button>
              <Button variant="outlined" size="large" sx={{ borderColor: 'white', color: 'white' }}>
                Schedule Tour
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default HomePage;