import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Badge as BadgeIcon,
  SupervisorAccount as SupervisorIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { userApi } from '../../services/api.service';
import { sanitizePayload, formatDisplayDate } from '../../utils/date';
import { getApiErrorMessage } from '../../utils/errorHandler';
import { useSnackbar } from '../../contexts/NotificationContext';

const AdminStaff: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  // State
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);

  // Dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    fullName: '',
    gender: 'MALE',
    dateOfBirth: '',
  });

  // Statistics
  const [stats, setStats] = useState({
    admin: 0,
    staff: 0,
    trainer: 0,
    total: 0,
  });

  // Load staff/admin users
  const loadStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter,
        // Default to ADMIN + STAFF management view; role filter narrows it
        role: roleFilter,
      };

      const response = await userApi.getUsers(params);
      if (response.success) {
        const data = response.data as any;
        // Endpoint returns { users, pagination }
        let users: StaffUser[] = data.users || [];

        // When no specific role is selected, show only non-member staff roles
        if (!roleFilter) {
          users = users.filter((u) => u.role?.name !== 'MEMBER');
        }

        setStaff(users);
        setTotal(roleFilter ? (data.pagination?.total || users.length) : users.length);
      }
    } catch (err: any) {
      setError('Failed to load staff: ' + (err.message || 'Unknown error'));
      console.error('Error loading staff:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load role statistics
  const loadStatistics = async () => {
    try {
      const response = await userApi.getUserStatistics();
      if (response.success) {
        const data = response.data as any;
        const byRole = data.byRole || {};
        setStats({
          admin: byRole.admin || 0,
          staff: byRole.staff || 0,
          trainer: byRole.trainer || 0,
          total: (byRole.admin || 0) + (byRole.staff || 0) + (byRole.trainer || 0),
        });
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  useEffect(() => {
    loadStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    loadStatistics();
  }, []);

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, member: StaffUser) => {
    setAnchorEl(event.currentTarget);
    setSelectedStaff(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStaff(null);
  };

  const handleToggleStatus = async () => {
    if (!selectedStaff) return;
    const newStatus = selectedStaff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await userApi.updateUserStatus(selectedStaff.id, newStatus);
      handleMenuClose();
      loadStaff();
    } catch (err: any) {
      setError('Failed to update status: ' + (err.message || 'Unknown error'));
    }
  };

  const handleOpenAddDialog = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      phone: '',
      fullName: '',
      gender: 'MALE',
      dateOfBirth: '',
    });
    setAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async () => {
    try {
      setSubmitting(true);
      const payload = sanitizePayload(formData, ['dateOfBirth']);
      const response = await userApi.createStaff(payload) as any;
      if (response.success) {
        enqueueSnackbar('Thêm nhân viên thành công!', { variant: 'success' });
        handleCloseAddDialog();
        loadStaff();
        loadStatistics();
      }
    } catch (err: any) {
      console.error('Error creating staff:', err);
      enqueueSnackbar(getApiErrorMessage(err, 'Không thể tạo nhân viên'), { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Helpers
  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'warning';
      case 'LOCKED': return 'error';
      default: return 'default';
    }
  };

  const getRoleColor = (role: string): 'error' | 'primary' | 'info' | 'default' => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'STAFF': return 'primary';
      case 'TRAINER': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Staff Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage gym staff, administrators, and trainers
        </Typography>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>Total Staff</Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AdminIcon sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>Administrators</Typography>
                  <Typography variant="h4">{stats.admin}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BadgeIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>Staff Members</Typography>
                  <Typography variant="h4">{stats.staff}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SupervisorIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>Trainers</Typography>
                  <Typography variant="h4">{stats.trainer}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={1}>
          <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          size="large"
          onClick={handleOpenAddDialog}
        >
          Add New Staff
        </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
              >
                <MenuItem value="">All Staff Roles</MenuItem>
                <MenuItem value="ADMIN">Administrator</MenuItem>
                <MenuItem value="STAFF">Staff</MenuItem>
                <MenuItem value="TRAINER">Trainer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="LOCKED">Locked</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => { setSearchTerm(''); setRoleFilter(''); setStatusFilter(''); setPage(0); }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading staff...</Typography>
                  </TableCell>
                </TableRow>
              ) : staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {searchTerm || roleFilter || statusFilter
                        ? 'No staff found matching your criteria.'
                        : 'No staff members found.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                staff.map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={member.profile?.avatarUrl} sx={{ mr: 2 }}>
                          {member.profile?.fullName?.charAt(0) || member.username.charAt(0)}
                        </Avatar>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {member.profile?.fullName || '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">{member.username}</Typography>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Chip label={member.role.name} color={getRoleColor(member.role.name)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={member.status} color={getStatusColor(member.status)} size="small" />
                    </TableCell>
                    <TableCell>{formatDate(member.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="More options">
                        <IconButton onClick={(e) => handleMenuClick(e, member)}>
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleToggleStatus}>
          {selectedStaff?.status === 'ACTIVE' ? (
            <>
              <BlockIcon sx={{ mr: 1 }} color="warning" />
              Deactivate
            </>
          ) : (
            <>
              <CheckCircleIcon sx={{ mr: 1 }} color="success" />
              Activate
            </>
          )}
        </MenuItem>
      </Menu>

      <Fab
        color="primary"
        aria-label="add staff"
        onClick={handleOpenAddDialog}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Add Staff Dialog */}
      <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Staff</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="username"
                label="Username"
                fullWidth
                required
                value={formData.username}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="password"
                label="Password"
                type="password"
                fullWidth
                required
                value={formData.password}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="fullName"
                label="Full Name"
                fullWidth
                required
                value={formData.fullName}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone"
                fullWidth
                value={formData.phone}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  label="Gender"
                  onChange={handleFormChange as any}
                >
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.dateOfBirth}
                onChange={handleFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} disabled={submitting}>Cancel</Button>
          <Button onClick={handleAddSubmit} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : 'Add Staff'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminStaff;
