import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Card, CardContent, Typography, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper,
} from '@mui/material';
import { reportApi } from '../../../services/api.service';

interface Trainer {
  trainerId: number;
  trainerName: string;
  totalSessions: number;
  assignedMembers: number;
  avgRating: number;
}

type SortKey = 'trainerName' | 'totalSessions' | 'assignedMembers' | 'avgRating';

const TrainerPerformanceReport: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('totalSessions');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await reportApi.getTrainerPerformance() as any;
        if (resp.success) setTrainers(resp.data.trainers || []);
      } catch (err: any) {
        setError('Failed to load trainer performance: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sorted = useMemo(() => {
    const arr = [...trainers];
    arr.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return arr;
  }, [trainers, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Card><CardContent>
      <Typography variant="h6" gutterBottom>Trainer Performance</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={sortKey === 'trainerName' ? sortDir : false}>
                <TableSortLabel
                  active={sortKey === 'trainerName'}
                  direction={sortKey === 'trainerName' ? sortDir : 'asc'}
                  onClick={() => handleSort('trainerName')}
                >Trainer</TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortKey === 'totalSessions' ? sortDir : false}>
                <TableSortLabel
                  active={sortKey === 'totalSessions'}
                  direction={sortKey === 'totalSessions' ? sortDir : 'asc'}
                  onClick={() => handleSort('totalSessions')}
                >Sessions</TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortKey === 'assignedMembers' ? sortDir : false}>
                <TableSortLabel
                  active={sortKey === 'assignedMembers'}
                  direction={sortKey === 'assignedMembers' ? sortDir : 'asc'}
                  onClick={() => handleSort('assignedMembers')}
                >Assigned Members</TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortKey === 'avgRating' ? sortDir : false}>
                <TableSortLabel
                  active={sortKey === 'avgRating'}
                  direction={sortKey === 'avgRating' ? sortDir : 'asc'}
                  onClick={() => handleSort('avgRating')}
                >Avg Rating</TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((t) => (
              <TableRow key={t.trainerId}>
                <TableCell>{t.trainerName}</TableCell>
                <TableCell>{t.totalSessions}</TableCell>
                <TableCell>{t.assignedMembers}</TableCell>
                <TableCell>{t.avgRating.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent></Card>
  );
};

export default TrainerPerformanceReport;
