import React, { useEffect, useState } from 'react';
import {
  Box, Container, Grid, Card, CardContent, Typography, Avatar, Chip,
  CircularProgress, Alert, LinearProgress, List, ListItem, ListItemAvatar,
  ListItemText, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  FitnessCenter as FitnessIcon,
  EventAvailable as CheckInIcon,
  MonitorWeight as WeightIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { memberApi } from '../../services/api.service';

interface DashboardData {
  stats: {
    daysLeftInSubscription: number;
    workoutsThisMonth: number;
    checkInsThisMonth: number;
    currentWeightKg: number | null;
  };
  currentSubscription: {
    id: number; packageName: string; startDate: string; endDate: string;
    actualPrice: number; status: string; daysRemaining: number; progressPercent: number;
  } | null;
  upcomingSchedules: Array<{
    id: number; scheduleId: number; className: string;
    startDate: string; startTime: string; endTime: string;
    trainerName: string; location: string; attendanceStatus: string;
  }>;
  recentWorkouts: Array<{
    id: number; workoutDate: string; exerciseName: string;
    sets: number | null; reps: number | null; weightKg: number | null; durationMinutes: number | null;
  }>;
  assignedTrainer: {
    id: number; trainerCode: string; fullName: string;
    avatarUrl: string | null; ratingAvg: number; specializations: string[];
  } | null;
}

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const formatDate = (d?: string) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return d; }
};

const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await memberApi.getMyDashboard() as any;
        if (resp.success) setData(resp.data as DashboardData);
      } catch (err: any) {
        setError('Failed to load dashboard: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="xl">
        {error && <Alert severity="error">{error}</Alert>}
      </Container>
    );
  }

  const { stats, currentSubscription, upcomingSchedules, recentWorkouts, assignedTrainer } = data;

  return (
    <Container maxWidth="xl">
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Xin chào, {user?.profile?.fullName?.split(' ').pop() || 'Member'} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Theo dõi quá trình tập luyện và lịch sử của bạn.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>Days Left</Typography>
                <Typography variant="h4">{stats.daysLeftInSubscription}</Typography>
                <Typography variant="caption" color="text.secondary">in subscription</Typography>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FitnessIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>Workouts</Typography>
                <Typography variant="h4">{stats.workoutsThisMonth}</Typography>
                <Typography variant="caption" color="text.secondary">this month</Typography>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckInIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>Check-ins</Typography>
                <Typography variant="h4">{stats.checkInsThisMonth}</Typography>
                <Typography variant="caption" color="text.secondary">this month</Typography>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WeightIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>Current Weight</Typography>
                <Typography variant="h4">{stats.currentWeightKg ?? '—'}{stats.currentWeightKg !== null && ' kg'}</Typography>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Current Subscription</Typography>
            {currentSubscription ? (
              <Box>
                <Typography variant="h5">{currentSubscription.packageName}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {formatDate(currentSubscription.startDate)} → {formatDate(currentSubscription.endDate)}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={currentSubscription.progressPercent}
                  sx={{ height: 8, borderRadius: 1, mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption">{currentSubscription.progressPercent}% used</Typography>
                  <Typography variant="caption">{currentSubscription.daysRemaining} days left</Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 2 }}>{vnd(currentSubscription.actualPrice)}</Typography>
              </Box>
            ) : (
              <Typography color="text.secondary">No active subscription.</Typography>
            )}
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Assigned Trainer
            </Typography>
            {assignedTrainer ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={assignedTrainer.avatarUrl || undefined} sx={{ width: 64, height: 64 }}>
                  {assignedTrainer.fullName[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6">{assignedTrainer.fullName}</Typography>
                  <Typography variant="caption" color="text.secondary">{assignedTrainer.trainerCode}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <StarIcon sx={{ fontSize: 18, color: 'warning.main', mr: 0.5 }} />
                    <Typography variant="body2">{assignedTrainer.ratingAvg.toFixed(1)}</Typography>
                  </Box>
                  <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {assignedTrainer.specializations.map((s) => (
                      <Chip key={s} label={s} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              </Box>
            ) : (
              <Typography color="text.secondary">No trainer assigned yet.</Typography>
            )}
          </CardContent></Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>
              <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Upcoming Sessions
            </Typography>
            {upcomingSchedules.length > 0 ? (
              <List dense>
                {upcomingSchedules.map((s, i) => (
                  <React.Fragment key={s.id}>
                    <ListItem>
                      <ListItemAvatar><Avatar><ScheduleIcon /></Avatar></ListItemAvatar>
                      <ListItemText
                        primary={s.className}
                        secondary={`${formatDate(s.startDate)} • ${s.startTime} - ${s.endTime} • ${s.trainerName}`}
                      />
                    </ListItem>
                    {i < upcomingSchedules.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No upcoming sessions.</Typography>
            )}
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>
              <FitnessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Recent Workouts
            </Typography>
            {recentWorkouts.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Exercise</TableCell>
                      <TableCell>Sets×Reps</TableCell>
                      <TableCell>Weight</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentWorkouts.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell>{formatDate(w.workoutDate)}</TableCell>
                        <TableCell>{w.exerciseName}</TableCell>
                        <TableCell>{w.sets ?? '—'}×{w.reps ?? '—'}</TableCell>
                        <TableCell>{w.weightKg ? `${w.weightKg} kg` : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">No workouts logged yet.</Typography>
            )}
          </CardContent></Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MemberDashboard;
