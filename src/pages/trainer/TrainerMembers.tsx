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
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  Assessment as AssessmentIcon,
  FitnessCenter as FitnessCenterIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { trainerApi } from '../../services/api.service';
import { Member } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const TrainerMembers: React.FC = () => {
  const { user } = useAuth();

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

  // Statistics
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    newThisMonth: 0,
    avgProgress: 0,
  });

  // Load trainer's assigned members
  const loadTrainerMembers = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter,
      };

      const response = await trainerApi.getMyMembers(params) as any;

      if (response.success) {
        setMembers(response.data.members);
        setTotalMembers(response.data.pagination.total);
      }
    } catch (err: any) {
      setError('Failed to load members: ' + (err.message || 'Unknown error'));
      console.error('Error loading trainer members:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load trainer statistics
  const loadStatistics = async () => {
    if (!user?.id) return;

    try {
      const response = await trainerApi.getMyDashboard() as any;
      if (response.success) {
        const s = response.data.stats || {};
        setStats({
          totalMembers: s.totalMembers || 0,
          activeMembers: s.activeMembers || 0,
          newThisMonth: 0,
          avgProgress: 0,
        });
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  // Effects
  useEffect(() => {
    if (user?.id) {
      loadTrainerMembers();
      loadStatistics();
    }
  }, [page, rowsPerPage, searchTerm, statusFilter, user?.id]);

  // Event handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
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
    setSelectedMember(null);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="xl">
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Members
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and track the progress of members assigned to you
        </Typography>
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
                    {stats.totalMembers}
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
                    {stats.activeMembers}
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
                <EventNoteIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
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

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Progress
                  </Typography>
                  <Typography variant="h4">
                    {stats.avgProgress.toFixed(1)}%
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
                <TableCell>Last Workout</TableCell>
                <TableCell>Progress</TableCell>
                {/* <TableCell align="right">Actions</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading members...</Typography>
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <FitnessCenterIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography color="textSecondary">
                      {searchTerm || statusFilter ? 'No members found matching your criteria.' : 'No members assigned yet.'}
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
                      <Typography variant="body2" color="text.secondary">
                        {(member as any).lastWorkout ? formatDate((member as any).lastWorkout) : 'No workouts yet'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 100 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(member as any).progressPercentage || 0}
                          sx={{ flexGrow: 1, mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {Math.round((member as any).progressPercentage || 0)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    {/* <TableCell align="right">
                      <Tooltip title="More options">
                        <IconButton
                          onClick={(e) => handleMenuClick(e, member)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell> */}
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
          <VisibilityIcon sx={{ mr: 1 }} />
          View Progress
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1 }} />
          Update Plan
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ScheduleIcon sx={{ mr: 1 }} />
          Schedule Session
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <AssessmentIcon sx={{ mr: 1 }} />
          View Reports
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default TrainerMembers;