import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Grid, Card, CardContent, Alert, CircularProgress, Chip,
} from '@mui/material';
import {
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  Whatshot as StreakIcon,
} from '@mui/icons-material';
import { memberApi } from '../../services/api.service';

interface AttendanceLog {
  id: number;
  checkinTime: string;
  checkoutTime: string | null;
  attendanceType: string;
}

interface AttendanceStats {
  totalCheckIns: number;
  monthCheckIns: number;
  currentStreak: number;
  averagePerWeek: number;
}

const formatDateTime = (s?: string | null) => {
  if (!s) return '—';
  try { return new Date(s).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return s; }
};

const calcDuration = (a: string, b: string | null) => {
  if (!b) return 'In progress';
  const ms = new Date(b).getTime() - new Date(a).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60}m`;
};

const MemberAttendance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalCheckIns: 0, monthCheckIns: 0, currentStreak: 0, averagePerWeek: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await memberApi.getMyAttendance({ days: 30 }) as any;
        if (resp.success) {
          setLogs(resp.data.logs || []);
          setStats(resp.data.stats || stats);
        }
      } catch (err: any) {
        setError('Failed to load attendance: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>Attendance History</Typography>
        <Typography variant="body1" color="text.secondary">
          Your gym check-ins and attendance summary.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarTodayIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>Total Check-ins</Typography>
                <Typography variant="h4">{stats.totalCheckIns}</Typography>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>This Month</Typography>
                <Typography variant="h4">{stats.monthCheckIns}</Typography>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StreakIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>Current Streak</Typography>
                <Typography variant="h4">{stats.currentStreak}</Typography>
                <Typography variant="caption" color="text.secondary">days</Typography>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>Avg per Week</Typography>
                <Typography variant="h4">{stats.averagePerWeek}</Typography>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Check-in</TableCell>
                <TableCell>Check-out</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
              ) : logs.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No attendance records yet.</Typography>
                </TableCell></TableRow>
              ) : logs.map((l) => (
                <TableRow key={l.id} hover>
                  <TableCell>{formatDateTime(l.checkinTime)}</TableCell>
                  <TableCell>{formatDateTime(l.checkoutTime)}</TableCell>
                  <TableCell>{calcDuration(l.checkinTime, l.checkoutTime)}</TableCell>
                  <TableCell><Chip size="small" label={l.attendanceType} variant="outlined" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default MemberAttendance;
