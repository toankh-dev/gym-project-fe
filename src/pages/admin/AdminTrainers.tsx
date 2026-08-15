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
  Rating,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  FitnessCenter as FitnessCenterIcon,
  Star as StarIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { trainerApi } from '../../services/api.service';
import { Trainer } from '../../types';
import { sanitizePayload, formatDisplayDate } from '../../utils/date';
import { getApiErrorMessage } from '../../utils/errorHandler';
import { useSnackbar } from '../../contexts/NotificationContext';

const AdminTrainers: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  // State management
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalTrainers, setTotalTrainers] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');

  // Menu and dialog states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewMembersDialogOpen, setViewMembersDialogOpen] = useState(false);
  const [trainerMembers, setTrainerMembers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    fullName: '',
    gender: 'MALE',
    dateOfBirth: '',
    experienceYears: 0,
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    avgRating: 0,
  });

  // Load trainers data
  const loadTrainers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter,
        specialization: specializationFilter,
      };

      const response = await trainerApi.getTrainers(params) as any;

      if (response.success) {
        setTrainers(response.data.trainers);
        setTotalTrainers(response.data.pagination.total);
      }
    } catch (err: any) {
      setError('Failed to load trainers: ' + (err.message || 'Unknown error'));
      console.error('Error loading trainers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await trainerApi.getTrainerStatistics() as any;
      if (response.success) {
        setStats(response.data.statistics);
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  // Effects
  useEffect(() => {
    loadTrainers();
  }, [page, rowsPerPage, searchTerm, statusFilter, specializationFilter]);

  useEffect(() => {
    loadStatistics();
  }, []);

  // Event handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleSpecializationFilterChange = (event: any) => {
    setSpecializationFilter(event.target.value);
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, trainer: Trainer) => {
    setAnchorEl(event.currentTarget);
    setSelectedTrainer(trainer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTrainer(null);
  };

  const handleDeleteTrainer = async () => {
    if (!selectedTrainer) return;

    try {
      await trainerApi.deleteTrainer(selectedTrainer.id);
      setDeleteDialogOpen(false);
      handleMenuClose();
      loadTrainers();
      loadStatistics();
    } catch (err: any) {
      setError('Failed to delete trainer: ' + (err.message || 'Unknown error'));
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
      experienceYears: 0,
    });
    setAddDialogOpen(true);
  };

  const handleOpenEditDialog = () => {
    if (!selectedTrainer) return;
    setFormData({
      username: selectedTrainer.user.username,
      email: selectedTrainer.user.email,
      password: '', // Leave empty when editing
      phone: selectedTrainer.user.phone,
      fullName: selectedTrainer.user.profile.fullName,
      gender: selectedTrainer.user.profile.gender,
      dateOfBirth: selectedTrainer.user.profile.dateOfBirth ? selectedTrainer.user.profile.dateOfBirth.split('T')[0] : '',
      experienceYears: selectedTrainer.experienceYears,
    });
    setEditDialogOpen(true);
  };

  const handleOpenViewMembersDialog = async () => {
    if (!selectedTrainer) return;
    try {
      setLoading(true);
      // Wait, trainerApi might not have getTrainerMembers, but memberApi has getMembersByTrainer
      const { memberApi } = await import('../../services/api.service');
      const res = await memberApi.getMembersByTrainer(selectedTrainer.id) as any;
      if (res.success) {
        setTrainerMembers(res.data.members || []);
      }
      setViewMembersDialogOpen(true);
    } catch (err: any) {
      enqueueSnackbar(getApiErrorMessage(err, 'Error loading members'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
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
      const submitData = sanitizePayload({
        ...formData,
        experienceYears: Number(formData.experienceYears)
      }, ['dateOfBirth']);
      const response = await trainerApi.createTrainer(submitData) as any;
      if (response.success) {
        enqueueSnackbar('Thêm huấn luyện viên thành công!', { variant: 'success' });
        handleCloseAddDialog();
        loadTrainers();
        loadStatistics();
      }
    } catch (err: any) {
      console.error('Error creating trainer:', err);
      enqueueSnackbar(getApiErrorMessage(err, 'Không thể tạo huấn luyện viên'), { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedTrainer) return;
    try {
      setSubmitting(true);
      const rawData: any = {
        phone: formData.phone,
        fullName: formData.fullName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        experienceYears: Number(formData.experienceYears)
      };
      if (formData.password) rawData.password = formData.password;

      const submitData = sanitizePayload(rawData, ['dateOfBirth']);

      const response = await trainerApi.updateTrainer(selectedTrainer.id, submitData) as any;
      if (response.success) {
        enqueueSnackbar('Cập nhật huấn luyện viên thành công!', { variant: 'success' });
        setEditDialogOpen(false);
        handleMenuClose();
        loadTrainers();
      }
    } catch (err: any) {
      console.error('Error updating trainer:', err);
      enqueueSnackbar(getApiErrorMessage(err, 'Không thể cập nhật huấn luyện viên'), { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper functions
  const getStatusColor = (status: string): "success" | "error" | "default" => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl">
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Trainer Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage trainer profiles, schedules, and assignments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          size="large"
          onClick={handleOpenAddDialog}
        >
          Add New Trainer
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FitnessCenterIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Trainers
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
                    Active Trainers
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
                <StarIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Average Rating
                  </Typography>
                  <Typography variant="h4">
                    {(Number(stats.avgRating) || 0).toFixed(1)}
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
                <GroupIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Inactive
                  </Typography>
                  <Typography variant="h4">
                    {stats.inactive}
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
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or trainer code..."
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
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Specialization</InputLabel>
              <Select
                value={specializationFilter}
                label="Specialization"
                onChange={handleSpecializationFilterChange}
              >
                <MenuItem value="">All Specializations</MenuItem>
                <MenuItem value="Weight Training">Weight Training</MenuItem>
                <MenuItem value="Cardio">Cardio</MenuItem>
                <MenuItem value="Yoga">Yoga</MenuItem>
                <MenuItem value="Pilates">Pilates</MenuItem>
                <MenuItem value="CrossFit">CrossFit</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setSpecializationFilter('');
                setPage(0);
              }}
            >
              Clear
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

      {/* Trainers Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Trainer</TableCell>
                <TableCell>Trainer Code</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Specializations</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading trainers...</Typography>
                  </TableCell>
                </TableRow>
              ) : trainers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {searchTerm || statusFilter || specializationFilter
                        ? 'No trainers found matching your criteria.'
                        : 'No trainers found.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                trainers.map((trainer) => (
                  <TableRow key={trainer.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={trainer.user.profile.avatarUrl}
                          sx={{ mr: 2 }}
                        >
                          {trainer.user.profile.fullName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {trainer.user.profile.fullName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {trainer.user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {trainer.trainerCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {trainer.experienceYears} years
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating
                          value={Number(trainer.ratingAvg) || 0}
                          readOnly
                          size="small"
                          precision={0.1}
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({(Number(trainer.ratingAvg) || 0).toFixed(1)})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {trainer.specializations?.slice(0, 2).map((spec) => (
                          <Chip
                            key={spec.id}
                            label={spec.name}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {trainer.specializations?.length > 2 && (
                          <Chip
                            label={`+${trainer.specializations.length - 2}`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={trainer.status}
                        color={getStatusColor(trainer.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="More options">
                        <IconButton
                          onClick={(e) => handleMenuClick(e, trainer)}
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
          count={totalTrainers}
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
        <MenuItem onClick={() => {
          handleOpenEditDialog();
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Trainer
        </MenuItem>
        <MenuItem onClick={() => {
          handleOpenViewMembersDialog();
          handleMenuClose();
        }}>
          <GroupIcon sx={{ mr: 1 }} />
          View Members
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <FitnessCenterIcon sx={{ mr: 1 }} />
          View Schedules
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Trainer
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Trainer</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete trainer "{selectedTrainer?.user.profile.fullName}"?
            This action cannot be undone and will affect all related schedules and member assignments.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteTrainer}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Fab
        color="primary"
        aria-label="add trainer"
        onClick={handleOpenAddDialog}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Add Trainer Dialog */}
      <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Trainer</DialogTitle>
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
            <Grid item xs={12} sm={6}>
              <TextField
                name="experienceYears"
                label="Experience Years"
                type="number"
                fullWidth
                value={formData.experienceYears}
                onChange={handleFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} disabled={submitting}>Cancel</Button>
          <Button onClick={handleAddSubmit} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : 'Add Trainer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Trainer Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Trainer: {selectedTrainer?.user.profile.fullName}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="fullName" label="Họ và tên" fullWidth required value={formData.fullName} onChange={handleFormChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="phone" label="Số điện thoại" fullWidth required value={formData.phone} onChange={handleFormChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Giới tính</InputLabel>
                <Select name="gender" value={formData.gender} label="Giới tính" onChange={handleFormChange as any}>
                  <MenuItem value="MALE">Nam</MenuItem>
                  <MenuItem value="FEMALE">Nữ</MenuItem>
                  <MenuItem value="OTHER">Khác</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="dateOfBirth" label="Ngày sinh" type="date" fullWidth required InputLabelProps={{ shrink: true }} value={formData.dateOfBirth} onChange={handleFormChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="experienceYears" label="Số năm kinh nghiệm" type="number" fullWidth required inputProps={{ min: 0 }} value={formData.experienceYears} onChange={handleFormChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="password" label="Mật khẩu mới (Để trống nếu không đổi)" type="password" fullWidth value={formData.password} onChange={handleFormChange} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleEditSubmit} disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Members Dialog */}
      <Dialog open={viewMembersDialogOpen} onClose={() => setViewMembersDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Members of Trainer: {selectedTrainer?.user.profile.fullName}</DialogTitle>
        <DialogContent dividers>
          {trainerMembers.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Mã HV</TableCell>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Số ĐT</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trainerMembers.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.memberCode}</TableCell>
                      <TableCell>{m.user?.profile?.fullName || m.user?.username}</TableCell>
                      <TableCell>{m.user?.phone}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>Không có hội viên nào.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewMembersDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminTrainers;