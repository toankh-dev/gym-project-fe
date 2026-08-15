import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, TextField, MenuItem, CircularProgress, Alert, Typography, Grid,
} from '@mui/material';
import { trainerApi } from '../../services/api.service';

const STATUSES = ['REGISTERED', 'ATTENDED', 'ABSENT', 'CANCELLED'];

const formatDate = (d?: string) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return d;
  }
};

const formatTime = (t?: string) => (t ? t.slice(0, 5) : '—');

const statusColor = (s: string): any => {
  switch (s) {
    case 'ATTENDED': return 'success';
    case 'REGISTERED': return 'primary';
    case 'ABSENT': return 'error';
    case 'CANCELLED': return 'default';
    default: return 'default';
  }
};

const MemberSessionsPanel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { page: page + 1, limit: rowsPerPage };
      if (statusFilter) params.status = statusFilter;
      const resp = await trainerApi.getMyMemberSessions(params) as any;
      if (resp.success) {
        setSessions(resp.data.sessions || []);
        setTotal(resp.data.pagination?.total || 0);
      }
    } catch (err: any) {
      setError('Failed to load member sessions: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, rowsPerPage, statusFilter]);

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Attendance Status"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          >
            <MenuItem value="">All</MenuItem>
            {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Member</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
              ) : sessions.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No member sessions found.</Typography>
                </TableCell></TableRow>
              ) : sessions.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>{formatDate(s.schedule?.startDate)}</TableCell>
                  <TableCell>{formatTime(s.schedule?.startTime)} - {formatTime(s.schedule?.endTime)}</TableCell>
                  <TableCell>{s.schedule?.className || '—'}</TableCell>
                  <TableCell>
                    {s.member?.fullName}
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {s.member?.memberCode}
                    </Typography>
                  </TableCell>
                  <TableCell><Chip label={s.schedule?.classType} size="small" variant="outlined" /></TableCell>
                  <TableCell>{s.schedule?.location || '—'}</TableCell>
                  <TableCell><Chip label={s.attendanceStatus} size="small" color={statusColor(s.attendanceStatus)} /></TableCell>
                  <TableCell sx={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.notes || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>
    </Box>
  );
};

export default MemberSessionsPanel;
