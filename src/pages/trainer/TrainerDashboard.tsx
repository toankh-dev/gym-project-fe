import React, { useEffect, useState } from 'react';
import {
  Box, Container, Grid, Card, CardContent, Typography, Avatar, Chip, Button,
  List, ListItem, ListItemAvatar, ListItemText, LinearProgress, CircularProgress,
  Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import {
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as MoneyIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { trainerApi } from '../../services/api.service';

interface DashboardData {
  stats: {
    totalMembers: number;
    activeMembers: number;
    sessionsToday: number;
    sessionsThisWeek: number;
    monthlyIncome: number;
    completionRate: number;
    avgRating: number;
  };
  todaySchedule: Array<{
    id: number;
    className: string;
    startTime: string;
    endTime: string;
    classType: string;
    currentEnrollment: number;
    maxCapacity: number;
    location?: string;
  }>;
}

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const TrainerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [dashResp, membersResp] = await Promise.all([
          trainerApi.getMyDashboard() as Promise<any>,
          trainerApi.getMyMembers({ limit: 10 }) as Promise<any>,
        ]);
        if (dashResp.success) setDashboard(dashResp.data);
        if (membersResp?.success) setMembers(membersResp.data?.members || []);
      } catch (err: any) {
        setError('Failed to load dashboard: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const stats = dashboard?.stats;
  const todaySchedule = dashboard?.todaySchedule ?? [];

  return (
    <Container maxWidth="xl">
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Good morning, {user?.profile?.fullName?.split(' ').pop() || 'Trainer'}! 💪
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You have <strong>{stats?.sessionsToday ?? 0}</strong> sessions scheduled for today.
        </Typography>
      </Box>

      {/* Primary stat cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>Total Members</Typography>
                <Typography variant="h4">{stats?.totalMembers ?? 0}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats?.activeMembers ?? 0} active
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
                <Typography color="textSecondary" gutterBottom>Sessions Today</Typography>
                <Typography variant="h4">{stats?.sessionsToday ?? 0}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats?.sessionsThisWeek ?? 0} this week
                </Typography>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StarIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>Average Rating</Typography>
                <Typography variant="h4">{(stats?.avgRating ?? 0).toFixed(1)}</Typography>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>Completion Rate</Typography>
                <Typography variant="h4">{stats?.completionRate ?? 0}%</Typography>
                <Typography variant="caption" color="text.secondary">last 30 days</Typography>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* Monthly income card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MoneyIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>Monthly Income</Typography>
                <Typography variant="h4">{vnd(stats?.monthlyIncome ?? 0)}</Typography>
                <Typography variant="caption" color="text.secondary">completed sessions this month</Typography>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>

        {/* Today's schedule */}
        <Grid item xs={12} md={8}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>
              <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Today's Schedule
            </Typography>
            {todaySchedule.length === 0 ? (
              <Typography color="text.secondary">No sessions today.</Typography>
            ) : (
              <List dense>
                {todaySchedule.map((s) => (
                  <ListItem key={s.id}>
                    <ListItemAvatar>
                      <Avatar><EventIcon /></Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={s.className}
                      secondary={
                        <>
                          {s.startTime} - {s.endTime} • {s.currentEnrollment}/{s.maxCapacity}
                          {s.location && <> • <LocationIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} /> {s.location}</>}
                        </>
                      }
                    />
                    <Chip label={s.classType} size="small" color="primary" />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* My Members list */}
      <Card><CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            My Members ({members.length})
          </Typography>
          <Button size="small" href="/trainer/members">View All</Button>
        </Box>
        {members.length === 0 ? (
          <Typography color="text.secondary">No assigned members yet.</Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Join Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.slice(0, 5).map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.user?.profile?.fullName || `Member #${m.id}`}</TableCell>
                    <TableCell>{m.memberCode}</TableCell>
                    <TableCell>
                      <Chip
                        label={m.membershipStatus}
                        size="small"
                        color={m.membershipStatus === 'ACTIVE' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{m.joinDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent></Card>
    </Container>
  );
};

export default TrainerDashboard;
