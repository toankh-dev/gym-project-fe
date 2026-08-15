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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Alert,
  CircularProgress,
  Fab,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { memberApi, trainerApi, packageApi } from '../../services/api.service';
import { Member } from '../../types';
import { formatToISODate, formatDisplayDate, sanitizePayload } from '../../utils/date';
import { getApiErrorMessage } from '../../utils/errorHandler';
import { useSnackbar } from '../../contexts/NotificationContext';

const AdminMembers: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  // State management
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalMembers, setTotalMembers] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Menu and dialog states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    fullName: '',
    gender: 'MALE',
    dateOfBirth: '',
    packageId: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Tên đăng nhập không được để trống';
        if (value.length < 3 || value.length > 50) return 'Tên đăng nhập từ 3 đến 50 ký tự';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Tên đăng nhập chỉ gồm chữ cái, số và dấu gạch dưới (_)';
        return '';
      case 'email':
        if (!value.trim()) return 'Email không được để trống';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email không hợp lệ (ví dụ: member@gym.com)';
        return '';
      case 'password':
        if (!value) return 'Mật khẩu không được để trống';
        if (value.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
        if (!/[a-z]/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 chữ cái thường (a-z)';
        if (!/[A-Z]/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 chữ cái hoa (A-Z)';
        if (!/\d/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 chữ số (0-9)';
        if (!/[@$!%*?&]/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&)';
        return '';
      case 'fullName':
        if (!value.trim()) return 'Họ và tên không được để trống';
        if (value.trim().length < 2 || value.trim().length > 150) return 'Họ và tên từ 2 đến 150 ký tự';
        return '';
      case 'phone':
        if (value && value.trim() && !/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(value.trim())) {
          return 'Số điện thoại không hợp lệ (10-15 chữ số)';
        }
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const fieldsToValidate = ['username', 'email', 'password', 'fullName', 'phone'];
    fieldsToValidate.forEach((field) => {
      const err = validateField(field, (formData as any)[field] || '');
      if (err) errors[field] = err;
    });
    return errors;
  };

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | ''>('');

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    newThisMonth: 0,
  });

  // Load members data
  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter,
      };

      const response = await memberApi.getMembers(params) as any;

      if (response.success) {
        setMembers(response.data.members);
        setTotalMembers(response.data.pagination.total);
      }
    } catch (err: any) {
      setError('Failed to load members: ' + (err.message || 'Unknown error'));
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await memberApi.getMemberStatistics() as any;
      if (response.success) {
        setStats(response.data.statistics);
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  const loadTrainers = async () => {
    try {
      const response = await trainerApi.getActiveTrainers() as any;
      if (response.success) {
        setTrainers(response.data.trainers || []);
      }
    } catch (err) {
      console.error('Error loading trainers:', err);
    }
  };

  const loadPackages = async () => {
    try {
      const response = await packageApi.getActivePackages() as any;
      if (response.success) {
        const activePackages = (response.data.packages || []).filter((pkg: any) => pkg.status === 'ACTIVE');
        setPackages(activePackages);
      }
    } catch (err) {
      console.error('Error loading packages:', err);
    }
  };

  // Effects
  useEffect(() => {
    loadMembers();
  }, [page, rowsPerPage, searchTerm, statusFilter]);

  useEffect(() => {
    loadStatistics();
    loadTrainers();
    loadPackages();
  }, []);

  // Event handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, member: Member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    try {
      await memberApi.deleteMember(selectedMember.id);
      setDeleteDialogOpen(false);
      handleMenuClose();
      loadMembers(); // Reload the list
      loadStatistics(); // Update stats
    } catch (err: any) {
      setError('Failed to delete member: ' + (err.message || 'Unknown error'));
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
      packageId: '',
    });
    setFormErrors({});
    setAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
    setFormErrors({});
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setFormData(prev => ({ ...prev, [name]: value }));

    const fieldError = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const handleAddSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = sanitizePayload(formData, ['dateOfBirth']);

    try {
      setSubmitting(true);
      const response = await memberApi.createMember(payload) as any;
      if (response.success) {
        enqueueSnackbar('Thêm hội viên thành công!', { variant: 'success' });
        handleCloseAddDialog();
        loadMembers();
        loadStatistics();
      }
    } catch (err: any) {
      console.error('Error creating member:', err);
      const apiErrors = err?.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        const backendFormErrors: Record<string, string> = {};
        apiErrors.forEach((e: any) => {
          if (e.field) backendFormErrors[e.field] = e.message;
        });
        setFormErrors(prev => ({ ...prev, ...backendFormErrors }));
      } else {
        enqueueSnackbar(getApiErrorMessage(err, 'Không thể tạo hội viên'), { variant: 'error' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Helper functions
  const getStatusColor = (status: string): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'EXPIRED': return 'warning';
      case 'SUSPENDED':
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return formatDisplayDate(dateString);
  };

  return (
    <Container maxWidth="xl">
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Member Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all gym members, their subscriptions, and profiles
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          size="large"
          onClick={handleOpenAddDialog}
        >
          Add New Member
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Members
                  </Typography>
                  <Typography variant="h4">
                    {stats.total}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Members
                  </Typography>
                  <Typography variant="h4">
                    {stats.active}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventNoteIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Expired
                  </Typography>
                  <Typography variant="h4">
                    {stats.expired}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PaymentIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    New This Month
                  </Typography>
                  <Typography variant="h4">
                    {stats.newThisMonth}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or member code..."
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="EXPIRED">Expired</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPage(0);
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Members Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Member Code</TableCell>
                <TableCell>Join Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Trainer</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading members...</Typography>
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {searchTerm || statusFilter ? 'No members found matching your criteria.' : 'No members found.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={member.user.profile.avatarUrl}
                          sx={{ mr: 2 }}
                        >
                          {member.user.profile.fullName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {member.user.profile.fullName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {member.memberCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatDate(member.joinDate)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.membershipStatus}
                        color={getStatusColor(member.membershipStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {member.assignedTrainer ? (
                        <Box>
                          <Typography variant="body2">
                            {member.assignedTrainer.user.profile.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.assignedTrainer.trainerCode}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not assigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="More options">
                        <IconButton
                          onClick={(e) => handleMenuClick(e, member)}
                        >
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

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalMembers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Member
        </MenuItem>
        {selectedMember?.membershipStatus === 'ACTIVE' && (
          <MenuItem onClick={() => {
            const targetMember = selectedMember;
            setAnchorEl(null);
            if (targetMember) {
              setSelectedMember(targetMember);
              setSelectedTrainerId(targetMember.assignedTrainerId || '');
              setAssignDialogOpen(true);
            }
          }}>
            <PersonAddIcon sx={{ mr: 1 }} />
            Assign Trainer
          </MenuItem>
        )}
        <MenuItem onClick={handleMenuClose}>
          <PaymentIcon sx={{ mr: 1 }} />
          View Payments
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Member
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Member</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete member "{selectedMember?.user.profile.fullName}"?
            This action cannot be undone and will also remove all related data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteMember}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Fab
        color="primary"
        aria-label="add member"
        onClick={handleOpenAddDialog}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Add Member Dialog */}
      <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Member</DialogTitle>
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
                error={Boolean(formErrors.username)}
                helperText={formErrors.username || 'Từ 3-50 ký tự (chữ cái, số, _)'}
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
                error={Boolean(formErrors.email)}
                helperText={formErrors.email}
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
                error={Boolean(formErrors.password)}
                helperText={formErrors.password || 'Tối thiểu 8 ký tự (chữ HOA, chữ thường, số, ký tự đặc biệt @$!%*?&)'}
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
                error={Boolean(formErrors.fullName)}
                helperText={formErrors.fullName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone"
                fullWidth
                value={formData.phone}
                onChange={handleFormChange}
                error={Boolean(formErrors.phone)}
                helperText={formErrors.phone}
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
              <FormControl fullWidth>
                <InputLabel id="package-select-label">Gói tập (Membership Package)</InputLabel>
                <Select
                  labelId="package-select-label"
                  name="packageId"
                  value={formData.packageId}
                  label="Gói tập (Membership Package)"
                  onChange={handleFormChange as any}
                >
                  <MenuItem value="">
                    <em>Chưa chọn gói tập (None)</em>
                  </MenuItem>
                  {packages.map((pkg) => (
                    <MenuItem key={pkg.id} value={pkg.id}>
                      {pkg.name} — {Number(pkg.price).toLocaleString('vi-VN')} VNĐ ({pkg.durationMonths} tháng)
                    </MenuItem>
                  ))}
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
            {submitting ? <CircularProgress size={24} /> : 'Add Member'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Trainer Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Phân công Huấn luyện viên (Assign Trainer)</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Hội viên: {selectedMember?.user?.profile?.fullName || selectedMember?.user?.username} ({selectedMember?.memberCode})
          </Typography>

          {selectedMember?.membershipStatus !== 'ACTIVE' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              ⚠️ Hội viên này chưa có gói tập đang hoạt động (Trạng thái: {selectedMember?.membershipStatus}). Cần hoàn tất đăng ký/thanh toán gói tập trước khi phân công HLV.
            </Alert>
          )}

          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="trainer-select-label">Huấn luyện viên (Trainer)</InputLabel>
            <Select
              labelId="trainer-select-label"
              value={selectedTrainerId}
              label="Huấn luyện viên (Trainer)"
              onChange={(e) => setSelectedTrainerId(e.target.value as number)}
            >
              <MenuItem value="">
                <em>Chưa phân công (Bỏ HLV)</em>
              </MenuItem>
              {trainers.map((trainer) => (
                <MenuItem key={trainer.id} value={trainer.id}>
                  {trainer.user?.profile?.fullName || trainer.user?.username} ({trainer.trainerCode}) — Rating: {trainer.ratingAvg}★
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            disabled={submitting}
            onClick={async () => {
              if (!selectedMember) return;
              try {
                setSubmitting(true);

                if (selectedMember.assignedTrainerId && !selectedTrainerId) {
                  const res = await memberApi.removeTrainer(selectedMember.id) as any;
                  if (res.success) {
                    enqueueSnackbar('Đã bỏ phân công HLV thành công', { variant: 'success' });
                    setAssignDialogOpen(false);
                    loadMembers();
                  }
                } else if (selectedTrainerId && selectedMember.assignedTrainerId !== selectedTrainerId){
                  const res = await memberApi.assignTrainer(selectedMember.id, Number(selectedTrainerId)) as any;
                  if (res.success) {
                    enqueueSnackbar('Phân công HLV thành công!', { variant: 'success' });
                    setAssignDialogOpen(false);
                    loadMembers();
                  }
                }
              } catch (err: any) {
                console.error('Error assigning trainer:', err);
                enqueueSnackbar(getApiErrorMessage(err, 'Không thể phân công HLV'), { variant: 'error' });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? <CircularProgress size={24} /> : 'Lưu phân công'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminMembers;