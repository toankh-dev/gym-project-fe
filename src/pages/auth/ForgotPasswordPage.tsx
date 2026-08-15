import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Email as EmailIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Box textAlign="center">
        <Paper
          sx={{
            p: 3,
            bgcolor: 'success.light',
            color: 'success.contrastText',
            borderRadius: 2,
            mb: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Reset Link Sent!
          </Typography>
          <Typography variant="body2">
            We've sent password reset instructions to your email address.
          </Typography>
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Check your inbox and follow the instructions to reset your password.
          If you don't see the email, check your spam folder.
        </Typography>

        <Button
          component={Link}
          to="/auth/login"
          variant="contained"
          startIcon={<ArrowBackIcon />}
          fullWidth
        >
          Back to Sign In
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" align="center" gutterBottom fontWeight={600}>
        Forgot Password?
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
        Enter your email address and we'll send you instructions to reset your password.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        name="email"
        type="email"
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading || !email}
        startIcon={<SendIcon />}
        sx={{ mb: 3, py: 1.5 }}
      >
        {isLoading ? 'Sending...' : 'Send Reset Instructions'}
      </Button>

      <Box textAlign="center">
        <Button
          component={Link}
          to="/auth/login"
          variant="text"
          startIcon={<ArrowBackIcon />}
        >
          Back to Sign In
        </Button>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;