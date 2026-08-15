import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, Typography, CircularProgress, Alert } from '@mui/material';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts';
import { reportApi } from '../../../services/api.service';

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

interface Data {
  monthly: { month: string; revenue: number; transactionCount: number }[];
  byPackage: { packageName: string; totalRevenue: number; subscriberCount: number }[];
}

const RevenueReport: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await reportApi.getRevenue(12) as any;
        if (resp.success) setData(resp.data as Data);
      } catch (err: any) {
        setError('Failed to load revenue report: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  const totalRevenue = data.monthly.reduce((s, m) => s + m.revenue, 0);
  const totalTxn = data.monthly.reduce((s, m) => s + m.transactionCount, 0);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <Card><CardContent>
          <Typography color="textSecondary" gutterBottom>Total Revenue (12 months)</Typography>
          <Typography variant="h4">{vnd(totalRevenue)}</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Card><CardContent>
          <Typography color="textSecondary" gutterBottom>Total Transactions</Typography>
          <Typography variant="h4">{totalTxn}</Typography>
        </CardContent></Card>
      </Grid>

      <Grid item xs={12}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Revenue by Month</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `${v / 1_000_000}M`} />
              <Tooltip formatter={(v: number) => vnd(v)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#1976d2" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent></Card>
      </Grid>

      <Grid item xs={12}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Revenue by Package</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.byPackage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="packageName" />
              <YAxis tickFormatter={(v) => `${v / 1_000_000}M`} />
              <Tooltip formatter={(v: number) => vnd(v)} />
              <Bar dataKey="totalRevenue" fill="#2e7d32" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent></Card>
      </Grid>
    </Grid>
  );
};

export default RevenueReport;
