import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, Typography, CircularProgress, Alert } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { reportApi } from '../../../services/api.service';

interface Data {
  daily: { date: string; checkInCount: number }[];
  regularMemberRate: number;
}

const AttendanceReport: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await reportApi.getAttendance(30) as any;
        if (resp.success) setData(resp.data as Data);
      } catch (err: any) {
        setError('Failed to load attendance report: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  const totalCheckIns = data.daily.reduce((s, d) => s + d.checkInCount, 0);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <Card><CardContent>
          <Typography color="textSecondary" gutterBottom>Total Check-ins (30 days)</Typography>
          <Typography variant="h4">{totalCheckIns}</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Card><CardContent>
          <Typography color="textSecondary" gutterBottom>Regular Member Rate</Typography>
          <Typography variant="h4" color="primary.main">{data.regularMemberRate}%</Typography>
          <Typography variant="caption" color="text.secondary">
            Members attending 8+ sessions this month
          </Typography>
        </CardContent></Card>
      </Grid>

      <Grid item xs={12}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Daily Check-ins (last 30 days)</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="checkInCount" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent></Card>
      </Grid>
    </Grid>
  );
};

export default AttendanceReport;
