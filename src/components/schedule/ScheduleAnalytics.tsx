import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { reportApi } from '../../services/api.service';

interface TopSchedule {
  id: number;
  className: string;
  classType: string;
  currentEnrollment: number;
  maxCapacity: number;
  fillRate: number;
}

interface Data {
  utilization: {
    avgFillRate: number;
    totalSchedules: number;
    totalEnrollment: number;
    totalCapacity: number;
    topByEnrollment: TopSchedule[];
  };
  attendanceByType: Array<{
    classType: string;
    ATTENDED: number;
    ABSENT: number;
    REGISTERED: number;
    CANCELLED: number;
  }>;
  statusDistribution: { SCHEDULED: number; ONGOING: number; COMPLETED: number; CANCELLED: number };
  peakHours: Array<{ dayOfWeek: string; hour: number; count: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: '#1976d2',
  ONGOING: '#ed6c02',
  COMPLETED: '#2e7d32',
  CANCELLED: '#d32f2f',
};

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_LABEL: Record<string, string> = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed',
  THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
};

const ScheduleAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await reportApi.getScheduleAnalytics() as any;
        if (resp.success) setData(resp.data as Data);
      } catch (err: any) {
        setError('Failed to load schedule analytics: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build a Map<day, Map<hour, count>> for the heatmap
  const heatmap = useMemo(() => {
    if (!data) return { map: new Map<string, Map<number, number>>(), max: 0, hours: [] as number[] };
    const map = new Map<string, Map<number, number>>();
    let max = 0;
    const hourSet = new Set<number>();
    data.peakHours.forEach((p) => {
      hourSet.add(p.hour);
      if (!map.has(p.dayOfWeek)) map.set(p.dayOfWeek, new Map());
      map.get(p.dayOfWeek)!.set(p.hour, p.count);
      if (p.count > max) max = p.count;
    });
    return { map, max, hours: Array.from(hourSet).sort((a, b) => a - b) };
  }, [data]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  const statusPie = (Object.keys(data.statusDistribution) as (keyof Data['statusDistribution'])[])
    .map((k) => ({ name: k, value: data.statusDistribution[k] }))
    .filter((d) => d.value > 0);

  return (
    <Grid container spacing={3}>
      {/* Summary cards */}
      <Grid item xs={12} sm={6} md={3}>
        <Card><CardContent>
          <Typography color="textSecondary" gutterBottom>Total Schedules</Typography>
          <Typography variant="h4">{data.utilization.totalSchedules}</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card><CardContent>
          <Typography color="textSecondary" gutterBottom>Avg Fill Rate</Typography>
          <Typography variant="h4" color="primary.main">{data.utilization.avgFillRate}%</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card><CardContent>
          <Typography color="textSecondary" gutterBottom>Total Enrollment</Typography>
          <Typography variant="h4">{data.utilization.totalEnrollment}</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card><CardContent>
          <Typography color="textSecondary" gutterBottom>Total Capacity</Typography>
          <Typography variant="h4">{data.utilization.totalCapacity}</Typography>
        </CardContent></Card>
      </Grid>

      {/* Attendance breakdown by class type */}
      <Grid item xs={12} md={8}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Attendance Breakdown by Class Type</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.attendanceByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="classType" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ATTENDED" fill="#2e7d32" />
              <Bar dataKey="REGISTERED" fill="#1976d2" />
              <Bar dataKey="ABSENT" fill="#ed6c02" />
              <Bar dataKey="CANCELLED" fill="#d32f2f" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent></Card>
      </Grid>

      {/* Status distribution pie */}
      <Grid item xs={12} md={4}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Schedules by Status</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusPie} dataKey="value" nameKey="name" outerRadius={100} label>
                {statusPie.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#999'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent></Card>
      </Grid>

      {/* Top 10 schedules by enrollment */}
      <Grid item xs={12}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Top 10 Schedules by Enrollment</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Class</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Enrollment</TableCell>
                  <TableCell align="right">Capacity</TableCell>
                  <TableCell align="right">Fill Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.utilization.topByEnrollment.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.className}</TableCell>
                    <TableCell><Chip label={s.classType} size="small" /></TableCell>
                    <TableCell align="right">{s.currentEnrollment}</TableCell>
                    <TableCell align="right">{s.maxCapacity}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${s.fillRate}%`}
                        size="small"
                        color={s.fillRate >= 80 ? 'success' : s.fillRate >= 50 ? 'warning' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent></Card>
      </Grid>

      {/* Peak hours heatmap */}
      <Grid item xs={12}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Peak Hours (Day × Hour)</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Number of schedules grouped by start hour.
          </Typography>
          {heatmap.hours.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No schedule data available.</Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ display: 'inline-block', minWidth: '100%' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: `80px repeat(${heatmap.hours.length}, 40px)`, gap: 0.5 }}>
                  <Box />
                  {heatmap.hours.map((h) => (
                    <Box key={h} sx={{ textAlign: 'center', fontSize: 12, fontWeight: 600 }}>
                      {String(h).padStart(2, '0')}
                    </Box>
                  ))}
                  {DAYS.map((day) => (
                    <React.Fragment key={day}>
                      <Box sx={{ fontSize: 13, fontWeight: 600, alignSelf: 'center' }}>{DAY_LABEL[day]}</Box>
                      {heatmap.hours.map((h) => {
                        const count = heatmap.map.get(day)?.get(h) || 0;
                        const intensity = heatmap.max === 0 ? 0 : count / heatmap.max;
                        const bg = count === 0
                          ? '#f5f5f5'
                          : `rgba(25, 118, 210, ${0.2 + intensity * 0.8})`;
                        return (
                          <Box
                            key={`${day}-${h}`}
                            sx={{
                              height: 32,
                              backgroundColor: bg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              color: intensity > 0.5 ? '#fff' : 'text.primary',
                              borderRadius: 0.5,
                            }}
                            title={`${day} ${String(h).padStart(2, '0')}:00 — ${count} schedules`}
                          >
                            {count > 0 ? count : ''}
                          </Box>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </CardContent></Card>
      </Grid>
    </Grid>
  );
};

export default ScheduleAnalytics;
