import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Paper, Chip, CircularProgress, Alert,
} from '@mui/material';
import { memberApi } from '../../services/api.service';

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const formatDate = (d?: string) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleString('vi-VN'); } catch { return d; }
};

const statusColor = (s: string): any => {
  switch (s) {
    case 'COMPLETED': return 'success';
    case 'PENDING': return 'warning';
    case 'FAILED': return 'error';
    case 'REFUNDED': return 'default';
    default: return 'default';
  }
};

const PaymentHistoryPanel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await memberApi.getMyPayments({ page: page + 1, limit: rowsPerPage }) as any;
      if (resp.success) {
        setPayments(resp.data.payments || []);
        setTotal(resp.data.pagination?.total || 0);
      }
    } catch (err: any) {
      setError('Failed to load payments: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, rowsPerPage]);

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Payment History</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Package</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reference</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
              ) : payments.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No payments yet.</Typography>
                </TableCell></TableRow>
              ) : payments.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{formatDate(p.paymentDate)}</TableCell>
                  <TableCell>{vnd(p.amount)}</TableCell>
                  <TableCell>{p.paymentMethod}</TableCell>
                  <TableCell>{p.paymentType}</TableCell>
                  <TableCell>{p.subscription?.packageName || '—'}</TableCell>
                  <TableCell><Chip label={p.paymentStatus} size="small" color={statusColor(p.paymentStatus)} /></TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{p.transactionReference || '—'}</TableCell>
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
      </CardContent>
    </Card>
  );
};

export default PaymentHistoryPanel;
