import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Paper, Button, TextField, MenuItem, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Chip, IconButton, Menu, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon, Visibility as ViewIcon, Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { workoutPlanApi, trainerApi } from '../../services/api.service';
import WorkoutPlanFormDialog from './workouts/WorkoutPlanFormDialog';
import WorkoutPlanDetailDialog from './workouts/WorkoutPlanDetailDialog';

const STATUSES = ['DRAFT','ACTIVE','COMPLETED','PAUSED','CANCELLED'];

const TrainerWorkouts: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState<number | ''>('');
  const [members, setMembers] = useState<any[]>([]);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activePlanId, setActivePlanId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editPlanId, setEditPlanId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPlanId, setDetailPlanId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { page: page + 1, limit: rowsPerPage };
      if (statusFilter) params.status = statusFilter;
      if (memberFilter !== '') params.memberId = memberFilter;
      const resp = await workoutPlanApi.getPlans(params) as any;
      if (resp.success) {
        setPlans(resp.data.plans || []);
        setTotal(resp.data.pagination?.total || 0);
      }
    } catch (err: any) {
      setError('Failed to load plans: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const resp = await trainerApi.getMyMembers({ limit: 100 }) as any;
      if (resp.success) setMembers(resp.data.members || []);
    } catch { /* ignore */ }
  };

  useEffect(() => { loadMembers(); }, []);
  useEffect(() => { loadPlans(); }, [page, rowsPerPage, statusFilter, memberFilter]);

  const openMenu = (e: React.MouseEvent<HTMLElement>, planId: number) => {
    setAnchorEl(e.currentTarget); setActivePlanId(planId);
  };
  const closeMenu = () => { setAnchorEl(null); setActivePlanId(null); };

  const handleView = () => { setDetailPlanId(activePlanId); setDetailOpen(true); closeMenu(); };
  const handleEdit = () => { setEditPlanId(activePlanId); setFormOpen(true); closeMenu(); };
  const handleDelete = () => { setConfirmDeleteId(activePlanId); closeMenu(); };

  const doDelete = async () => {
    if (confirmDeleteId == null) return;
    try {
      await workoutPlanApi.deletePlan(confirmDeleteId);
      setConfirmDeleteId(null);
      loadPlans();
    } catch (err: any) {
      setError('Delete failed: ' + (err.message || 'Unknown'));
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Workout Plans</Typography>
          <Typography variant="body1" color="text.secondary">Create and manage training plans for your members.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => { setEditPlanId(null); setFormOpen(true); }}>
          Create Plan
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth label="Status" value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value="">All</MenuItem>
              {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth label="Member" value={memberFilter}
              onChange={(e) => { setMemberFilter(e.target.value === '' ? '' : Number(e.target.value)); setPage(0); }}>
              <MenuItem value="">All</MenuItem>
              {members.map((m: any) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.user?.profile?.fullName || `Member #${m.id}`}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button fullWidth variant="outlined"
              onClick={() => { setStatusFilter(''); setMemberFilter(''); setPage(0); }}>
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Plan Name</TableCell>
                <TableCell>Member</TableCell>
                <TableCell>Goal</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
              ) : plans.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No plans yet.</Typography>
                </TableCell></TableRow>
              ) : plans.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.planName}</TableCell>
                  <TableCell>{p.member?.fullName}</TableCell>
                  <TableCell>{p.goal}</TableCell>
                  <TableCell>{p.difficultyLevel}</TableCell>
                  <TableCell>{p.durationWeeks}w × {p.sessionsPerWeek}/wk</TableCell>
                  <TableCell>
                    <Chip label={p.status} size="small"
                      color={p.status === 'ACTIVE' ? 'success' : p.status === 'CANCELLED' ? 'error' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => openMenu(e, p.id)}><MoreVertIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={handleView}><ViewIcon sx={{ mr: 1 }} /> View</MenuItem>
        <MenuItem onClick={handleEdit}><EditIcon sx={{ mr: 1 }} /> Edit</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}><DeleteIcon sx={{ mr: 1 }} /> Delete</MenuItem>
      </Menu>

      <WorkoutPlanFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={loadPlans}
        planId={editPlanId}
        members={members}
      />
      <WorkoutPlanDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        planId={detailPlanId}
      />

      <Dialog open={confirmDeleteId != null} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Delete Workout Plan</DialogTitle>
        <DialogContent>
          <Typography>Are you sure? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={doDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TrainerWorkouts;
