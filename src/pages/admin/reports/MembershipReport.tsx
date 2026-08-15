import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, Typography, CircularProgress, Alert } from '@mui/material';
import {
  ComposedChart, Bar, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts';
import { reportApi } from '../../../services/api.service';

interface Data {
  monthly: { month: string; newMembers: number; activeTotal: number }[];
  statusDistribution: { ACTIVE: number; EXPIRED: number; SUSPENDED: number; CANCELLED: number };
}

const COLORS = { ACTIVE: '#2e7d32', EXPIRED: '#ed6c02', SUSPENDED: '#d32f2f', CANCELLED: '#757575' };

const MembershipReport: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await reportApi.getMembership(12) as any;
        if (resp.success) setData(resp.data as Data);
      } catch (err: any) {
        setError('Failed to load membership report: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  const pieData = (Object.keys(data.statusDistribution) as (keyof Data['statusDistribution'])[]).map((k) => ({
    name: k,
    value: data.statusDistribution[k],
  }));
  const totalActive = data.statusDistribution.ACTIVE;
  const lastMonth = data.monthly[data.monthly.length - 1];
  const prevMonth = data.monthly[data.monthly.length - 2];
  const growth = prevMonth && prevMonth.newMembers > 0
    ? Math.round(((lastMonth.newMembers - prevMonth.newMembers) / prevMonth.newMembers) * 1000) / 10
    : 0;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <Card><CardContent>
          <Typography color="textSecondary" gutterBottom>Active Members</Typography>
          <Typography variant="h4">{totalActive}</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Card><CardContent>
          <Typography color="textSecondary" gutterBottom>New Member Growth (mom)</Typography>
          <Typography variant="h4" color={growth >= 0 ? 'success.main' : 'error.main'}>
            {growth >= 0 ? '+' : ''}{growth}%
          </Typography>
        </CardContent></Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Membership Growth</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="newMembers" fill="#1976d2" name="New" />
              <Line type="monotone" dataKey="activeTotal" stroke="#2e7d32" name="Total" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent></Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Status Distribution</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent></Card>
      </Grid>
    </Grid>
  );
};

export default MembershipReport;
