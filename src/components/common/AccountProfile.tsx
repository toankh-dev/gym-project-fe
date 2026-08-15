import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api.service';

interface AccountProfileProps {
  title?: string;
}

/**
 * Shared account profile page for roles without a role-specific profile
 * (Admin, Staff, Trainer). Handles personal info editing and password change
 * using the generic auth endpoints.
 */
const AccountProfile: React.FC<AccountProfileProps> = ({ title = 'My Profile' }) => {
  const { user, setUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editData, setEditData] = useState({
    fullName: user?.profile?.fullName || '',
    phone: user?.phone || '',
    dateOfBirth: user?.profile?.dateOfBirth || '',
    gender: user?.profile?.gender || 'OTHER',
    address: user?.profile?.address || '',
    bio: user?.profile?.bio || '',
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const resetEditData = () => {
    setEditData({
      fullName: user?.profile?.fullName || '',
      phone: user?.phone || '',
      dateOfBirth: user?.profile?.dateOfBirth || '',
      gender: user?.profile?.gender || 'OTHER',
      address: user?.profile?.address || '',
      bio: user?.profile?.bio || '',
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await authApi.updateProfile(editData);
      if (response.success) {
        const respData = response.data as any;
        setUser(respData.user);
        setIsEditing(false);
        setSuccess('Profile updated successfully');
      }
    } catch (err: any) {
      setError('Failed to update profile: ' + (err.response?.data?.error?.message || err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    resetEditData();
    setIsEditing(false);
    setError(null);
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }

    try {
      setChangingPassword(true);
      setError(null);
      setSuccess(null);

      const response = await authApi.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );

      if (response.success) {
        setSuccess('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err: any) {
      setError('Failed to change password: ' + (err.response?.data?.error?.message || err.message || 'Unknown error'));
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Container maxWidth="lg">
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Profile Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                src={user?.profile?.avatarUrl}
                sx={{ width: 80, height: 80 }}
              >
                {user?.profile?.fullName?.charAt(0) || 'U'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                {user?.profile?.fullName || 'User'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <Chip label={user?.role?.name || 'USER'} color="primary" />
                <Chip label={user?.status || 'ACTIVE'} color="success" />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Grid>
            <Grid item>
              {!isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={editData.fullName}
                    onChange={(e) => setEditData((prev) => ({ ...prev, fullName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={user?.email || ''}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={editData.phone}
                    onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date of Birth"
                    value={editData.dateOfBirth ? String(editData.dateOfBirth).split('T')[0] : ''}
                    onChange={(e) => setEditData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                    disabled={!isEditing}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={editData.gender}
                      label="Gender"
                      onChange={(e) => setEditData((prev) => ({ ...prev, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' }))}
                    >
                      <MenuItem value="MALE">Male</MenuItem>
                      <MenuItem value="FEMALE">Female</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={editData.address}
                    onChange={(e) => setEditData((prev) => ({ ...prev, address: e.target.value }))}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    value={editData.bio}
                    onChange={(e) => setEditData((prev) => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                <LockIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Change Password
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current Password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleChangePassword}
                    disabled={
                      changingPassword ||
                      !passwordForm.currentPassword ||
                      !passwordForm.newPassword ||
                      !passwordForm.confirmPassword
                    }
                  >
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AccountProfile;
