import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Typography, Tabs, Tab, Paper, Card, CardContent, Grid, Button,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  TextField, MenuItem, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Schedule as ScheduleIcon, EventNote as EventIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { memberApi, scheduleApi, subscriptionApi } from '../../services/api.service';

const STATUS_OPTIONS = ['REGISTERED', 'ATTENDED', 'ABSENT', 'CANCELLED'];

const formatDate = (d?: string) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('vi-VN', { weekday: 'short', month: 'short', day: 'numeric' }); }
  catch { return d; }
};
const formatTime = (t?: string) => (t ? t.slice(0, 5) : '—');

const statusColor = (s: string): any => {
  switch (s) {
    case 'REGISTERED': return 'primary';
    case 'ATTENDED': return 'success';
    case 'ABSENT': return 'error';
    case 'CANCELLED': return 'default';
    case 'SCHEDULED': return 'primary';
    default: return 'default';
  }
};

const MemberSchedules: React.FC = () => {
  const navigate = useNavigate();
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  const [tab, setTab] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [available, setAvailable] = useState<any[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [myRegisteredIds, setMyRegisteredIds] = useState<Set<number>>(new Set());
  const [bookingId, setBookingId] = useState<number | null>(null);

  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [cancelConfirm, setCancelConfirm] = useState<number | null>(null);

  // Guard: check subscription, redirect to subscription page if not active
  useEffect(() => {
    subscriptionApi.getCurrentMemberSubscription()
      .then((resp: any) => {
        const sub = resp.data?.subscription ?? resp.data;
        const active = sub?.status === 'ACTIVE';
        setHasActiveSubscription(active);
        setSubscriptionChecked(true);
        if (!active) {
          navigate('/member/subscription', { replace: true });
        }
      })
      .catch(() => {
        setSubscriptionChecked(true);
        navigate('/member/subscription', { replace: true });
      });
  }, [navigate]);

  const loadAvailable = async () => {
    try {
      setAvailableLoading(true);
      setError(null);
      const [upcomingResp, mineResp] = await Promise.all([
        scheduleApi.getUpcomingSchedules(50) as Promise<any>,
        memberApi.getMySchedules({ status: 'REGISTERED', limit: 100 }) as Promise<any>,
      ]);
      const items = (upcomingResp.data as any)?.schedules || upcomingResp.data || [];
      setAvailable(items);
      const ids = new Set<number>(
        ((mineResp.data as any)?.sessions || []).map((s: any) => Number(s.schedule?.id)).filter(id => !isNaN(id)),
      );
      setMyRegisteredIds(ids);
    } catch (err: any) {
      setError('Failed to load schedules: ' + (err.message || 'Unknown error'));
    } finally {
      setAvailableLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      setError(null);
      const params: any = { page: page + 1, limit: rowsPerPage };
      if (statusFilter) params.status = statusFilter;
      const resp = await memberApi.getMySchedules(params) as any;
      setSessions(resp.data?.sessions || []);
      setTotal(resp.data?.pagination?.total || 0);
    } catch (err: any) {
      setError('Failed to load sessions: ' + (err.message || 'Unknown error'));
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => { if (hasActiveSubscription && tab === 0) loadAvailable(); }, [hasActiveSubscription, tab]);
  useEffect(() => { if (hasActiveSubscription && tab === 1) loadSessions(); }, [hasActiveSubscription, tab, page, rowsPerPage, statusFilter]);

  const book = async (scheduleId: number) => {
    try {
      setBookingId(scheduleId);
      await memberApi.bookSchedule(scheduleId);
      await loadAvailable();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err.message || 'Booking failed');
    } finally {
      setBookingId(null);
    }
  };

  const cancel = async (scheduleId: number) => {
    try {
      await memberApi.cancelBooking(scheduleId);
      setCancelConfirm(null);
      await loadSessions();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err.message || 'Cancel failed');
    }
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Show spinner while checking subscription (redirect is in progress)
  if (!subscriptionChecked || !hasActiveSubscription) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>Schedules</Typography>
        <Typography variant="body1" color="text.secondary">Book upcoming classes and review your sessions.</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Available to Book" icon={<EventIcon />} iconPosition="start" />
          <Tab label="My Sessions" icon={<ScheduleIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Box>
          {availableLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
          ) : available.length === 0 ? (
            <Typography color="text.secondary">No schedules available.</Typography>
          ) : (
            <Grid container spacing={2}>
              {available.map((s: any) => {
                const id = Number(s.id);
                const alreadyBooked = myRegisteredIds.has(id);
                const enrolled = Number(s.currentEnrollment ?? 0);
                const capacity = Number(s.maxCapacity ?? 0);
                const full = enrolled >= capacity;
                const disabled = alreadyBooked || full;
                const label = alreadyBooked ? 'Đã đặt' : full ? 'Đã đầy' : 'Đặt lịch';
                return (
                  <Grid item xs={12} sm={6} md={4} key={id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>{s.className || s.title}</Typography>
                        <Chip label={s.classType || s.scheduleType} size="small" variant="outlined" sx={{ mb: 1 }} />
                        <Typography variant="body2">{formatDate(s.startDate || s.scheduleDate)}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(s.startTime)} - {formatTime(s.endTime)} · {s.location || '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          {enrolled}/{capacity} enrolled
                        </Typography>
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{ mt: 2 }}
                          disabled={disabled || bookingId === id}
                          onClick={() => book(id)}
                        >
                          {bookingId === id ? 'Đang đặt…' : label}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Paper sx={{ p: 2, mb: 2 }}>
            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All</MenuItem>
              {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Paper>

          <Paper>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Trainer</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessionsLoading ? (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
                  ) : sessions.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No sessions yet.</Typography>
                    </TableCell></TableRow>
                  ) : sessions.map((s) => {
                    const canCancel = s.attendanceStatus === 'REGISTERED' && s.schedule?.startDate >= todayStr;
                    return (
                      <TableRow key={s.id} hover>
                        <TableCell>{formatDate(s.schedule?.startDate)}</TableCell>
                        <TableCell>{formatTime(s.schedule?.startTime)} - {formatTime(s.schedule?.endTime)}</TableCell>
                        <TableCell>{s.schedule?.className}</TableCell>
                        <TableCell>{s.schedule?.trainerName}</TableCell>
                        <TableCell>{s.schedule?.location || '—'}</TableCell>
                        <TableCell>
                          <Chip label={s.attendanceStatus} size="small" color={statusColor(s.attendanceStatus)} />
                        </TableCell>
                        <TableCell align="right">
                          {canCancel && (
                            <Button size="small" color="error" onClick={() => setCancelConfirm(s.schedule.id)}>
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
        </Box>
      )}

      <Dialog open={cancelConfirm != null} onClose={() => setCancelConfirm(null)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to cancel this booking?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelConfirm(null)}>Keep</Button>
          <Button color="error" variant="contained" onClick={() => cancelConfirm != null && cancel(cancelConfirm)}>
            Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MemberSchedules;
