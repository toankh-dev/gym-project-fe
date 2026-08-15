import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Card, CardContent, Typography, LinearProgress,
  Chip, List, ListItem, ListItemText, ListItemIcon, Divider, Alert, CircularProgress,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  People as PeopleIcon,
  FitnessCenter as FitnessCenterIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  AttachMoney as AttachMoneyIcon,
  EventNote as EventNoteIcon,
  Assessment as AssessmentIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardApi } from '../../services/api.service';

interface DashboardData {
  stats: {
    totalMembers: number; activeMembers: number;
    totalTrainers: number; activeTrainers: number;
    todaySessions: number; monthlyRevenue: number;
    membershipGrowth: number; attendanceRate: number;
  };
  todaySchedule: Array<{
    id: number; className: string; startTime: string; endTime: string;
    classType: string; trainerName: string;
    currentEnrollment: number; maxCapacity: number;
  }>;
  recentActivities: Array<{
    id: string; type: 'MEMBER_REGISTERED' | 'PAYMENT' | 'SCHEDULE_CREATED' | 'CHECK_IN';
    actorName: string; description: string; createdAt: string;
  }>;
  quickStats: {
    checkIns: { today: number; week: number; month: number; growth: number };
    registrations: { today: number; week: number; month: number; growth: number };
    classes: { today: number; week: number; month: number; growth: number };
    revenue: { today: number; week: number; month: number; growth: number };
  };
}

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const activityIcon = (type: string) => {
  switch (type) {
    case 'MEMBER_REGISTERED': return <PersonAddIcon color="primary" />;
    case 'PAYMENT': return <AttachMoneyIcon color="success" />;
    case 'SCHEDULE_CREATED': return <ScheduleIcon color="info" />;
    case 'CHECK_IN': return <CheckCircleIcon color="action" />;
    default: return <EventNoteIcon />;
  }
};

const formatRelative = (iso: string) => {
  const then = new Date(iso).getTime();
  const diffSec = Math.floor((Date.now() - then) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};

const growthChip = (g: number) => (
  <Chip label={`${g >= 0 ? '+' : ''}${g}%`} color={g >= 0 ? 'success' : 'error'} size="small" />
);

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await dashboardApi.getDashboard() as any;
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

  const { stats, todaySchedule, recentActivities, quickStats } = data;

  return (
    <Container maxWidth="xl">
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.profile?.fullName}! Here's what's happening at your gym today.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>Total Members</Typography>
                <Typography variant="h4">{stats.totalMembers}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  {growthChip(stats.membershipGrowth)}
                </Box>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FitnessCenterIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>Active Trainers</Typography>
                <Typography variant="h4">{stats.activeTrainers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  of {stats.totalTrainers} total trainers
                </Typography>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>Today's Sessions</Typography>
                <Typography variant="h4">{stats.todaySessions}</Typography>
                <LinearProgress variant="determinate" value={stats.attendanceRate} sx={{ mt: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {stats.attendanceRate}% attendance rate
                </Typography>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoneyIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>Monthly Revenue</Typography>
                <Typography variant="h4">{vnd(stats.monthlyRevenue)}</Typography>
                <Typography variant="body2" color="text.secondary">This month</Typography>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>
              <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Today's Schedule
            </Typography>
            {todaySchedule.length > 0 ? (
              <List dense>
                {todaySchedule.map((s) => (
                  <ListItem key={s.id}>
                    <ListItemText
                      primary={s.className}
                      secondary={`${s.startTime} - ${s.endTime} • ${s.trainerName} • ${s.currentEnrollment}/${s.maxCapacity}`}
                    />
                    <Chip label={s.classType} size="small" color="primary" />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">No schedules for today</Typography>
            )}
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>
              <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Recent Activities
            </Typography>
            {recentActivities.length > 0 ? (
              <List dense>
                {recentActivities.map((a, idx) => (
                  <React.Fragment key={a.id}>
                    <ListItem>
                      <ListItemIcon>{activityIcon(a.type)}</ListItemIcon>
                      <ListItemText
                        primary={a.description}
                        secondary={`${a.actorName} • ${formatRelative(a.createdAt)}`}
                      />
                    </ListItem>
                    {idx < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">No recent activity</Typography>
            )}
          </CardContent></Card>
        </Grid>

        <Grid item xs={12}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Quick Statistics Overview</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell>Today</TableCell>
                    <TableCell>This Week</TableCell>
                    <TableCell>This Month</TableCell>
                    <TableCell>Growth</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Member Check-ins</TableCell>
                    <TableCell>{quickStats.checkIns.today}</TableCell>
                    <TableCell>{quickStats.checkIns.week}</TableCell>
                    <TableCell>{quickStats.checkIns.month}</TableCell>
                    <TableCell>{growthChip(quickStats.checkIns.growth)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>New Registrations</TableCell>
                    <TableCell>{quickStats.registrations.today}</TableCell>
                    <TableCell>{quickStats.registrations.week}</TableCell>
                    <TableCell>{quickStats.registrations.month}</TableCell>
                    <TableCell>{growthChip(quickStats.registrations.growth)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Classes Completed</TableCell>
                    <TableCell>{quickStats.classes.today}</TableCell>
                    <TableCell>{quickStats.classes.week}</TableCell>
                    <TableCell>{quickStats.classes.month}</TableCell>
                    <TableCell>{growthChip(quickStats.classes.growth)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Revenue</TableCell>
                    <TableCell>{vnd(quickStats.revenue.today)}</TableCell>
                    <TableCell>{vnd(quickStats.revenue.week)}</TableCell>
                    <TableCell>{vnd(quickStats.revenue.month)}</TableCell>
                    <TableCell>{growthChip(quickStats.revenue.growth)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent></Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
