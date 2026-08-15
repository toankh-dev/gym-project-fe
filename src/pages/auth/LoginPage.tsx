import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData.email, formData.password);

      // Redirect based on user role after successful login
      if (from !== '/') {
        navigate(from, { replace: true });
      } else {
        // Default redirects based on email (for demo purposes)
        if (formData.email === 'admin@gym.com') {
          navigate('/admin/dashboard');
        } else if (formData.email === 'trainer@gym.com') {
          navigate('/trainer/dashboard');
        } else {
          navigate('/member/dashboard');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleDemoLogin = (email: string) => {
    setFormData({ email, password: 'password' });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" align="center" gutterBottom fontWeight={600}>
        Welcome Back
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
        Sign in to your account to continue
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Demo Accounts */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Demo Accounts (Password: password)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="Admin"
            size="small"
            onClick={() => handleDemoLogin('admin@gym.com')}
            sx={{ cursor: 'pointer' }}
            color="secondary"
          />
          <Chip
            label="Trainer"
            size="small"
            onClick={() => handleDemoLogin('trainer@gym.com')}
            sx={{ cursor: 'pointer' }}
            color="success"
          />
          <Chip
            label="Member"
            size="small"
            onClick={() => handleDemoLogin('member@gym.com')}
            sx={{ cursor: 'pointer' }}
            color="primary"
          />
        </Box>
      </Paper>

      <TextField
        fullWidth
        name="email"
        type="email"
        label="Email Address"
        value={formData.email}
        onChange={handleChange}
        required
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        name="password"
        type={showPassword ? 'text' : 'password'}
        label="Password"
        value={formData.password}
        onChange={handleChange}
        required
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        startIcon={<LoginIcon />}
        sx={{ mb: 2, py: 1.5 }}
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>

      <Box textAlign="center">
        <Button
          component={Link}
          to="/auth/forgot-password"
          variant="text"
          size="small"
          sx={{ mb: 1 }}
        >
          Forgot your password?
        </Button>
      </Box>

      <Divider sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">
          or
        </Typography>
      </Divider>

      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{' '}
          <Button
            component={Link}
            to="/auth/register"
            variant="text"
            sx={{ textDecoration: 'underline', p: 0, minWidth: 'auto' }}
          >
            Sign up here
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;