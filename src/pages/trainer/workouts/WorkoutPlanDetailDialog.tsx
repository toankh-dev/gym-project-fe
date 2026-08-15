import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Chip,
  Grid, Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell,
  TableHead, TableRow, CircularProgress, Alert,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { workoutPlanApi } from '../../../services/api.service';

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];

interface Props {
  planId: number | null;
  open: boolean;
  onClose: () => void;
}

const WorkoutPlanDetailDialog: React.FC<Props> = ({ planId, open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    if (!open || planId == null) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await workoutPlanApi.getPlanById(planId) as any;
        if (resp.success) setPlan(resp.data.plan);
      } catch (err: any) {
        setError('Failed to load plan: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [open, planId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{plan?.planName || 'Workout Plan'}</DialogTitle>
      <DialogContent dividers>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}
        {error && <Alert severity="error">{error}</Alert>}
        {plan && (
          <>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip label={plan.status} color={plan.status === 'ACTIVE' ? 'success' : plan.status === 'CANCELLED' ? 'error' : 'default'} />
              <Chip label={`Member: ${plan.member?.fullName}`} variant="outlined" />
              <Chip label={`Goal: ${plan.goal}`} variant="outlined" />
              <Chip label={`Level: ${plan.difficultyLevel}`} variant="outlined" />
            </Box>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} sm={3}><Typography variant="caption">Duration</Typography><Typography>{plan.durationWeeks} weeks</Typography></Grid>
              <Grid item xs={6} sm={3}><Typography variant="caption">Sessions/Week</Typography><Typography>{plan.sessionsPerWeek}</Typography></Grid>
              <Grid item xs={6} sm={3}><Typography variant="caption">Start Date</Typography><Typography>{plan.startDate}</Typography></Grid>
              <Grid item xs={6} sm={3}><Typography variant="caption">End Date</Typography><Typography>{plan.endDate || '—'}</Typography></Grid>
            </Grid>
            {plan.description && (
              <Box sx={{ mb: 2 }}><Typography variant="caption">Description</Typography><Typography>{plan.description}</Typography></Box>
            )}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Exercises by Day</Typography>
            {DAYS.map((day) => {
              const items = plan.exercisesByDay?.[day] || [];
              return (
                <Accordion key={day} defaultExpanded={items.length > 0}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ flex: 1 }}>{day}</Typography>
                    <Typography variant="caption" color="text.secondary">{items.length} exercises</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {items.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">Rest day</Typography>
                    ) : (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Exercise</TableCell>
                            <TableCell>Sets</TableCell>
                            <TableCell>Reps</TableCell>
                            <TableCell>Weight (kg)</TableCell>
                            <TableCell>Rest (s)</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {items.map((ex: any) => (
                            <TableRow key={ex.id}>
                              <TableCell>{ex.exerciseOrder}</TableCell>
                              <TableCell>
                                {ex.exercise?.name}
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                  {ex.exercise?.muscleGroup}
                                </Typography>
                              </TableCell>
                              <TableCell>{ex.sets ?? '—'}</TableCell>
                              <TableCell>{ex.reps ?? '—'}</TableCell>
                              <TableCell>{ex.weightKg ?? '—'}</TableCell>
                              <TableCell>{ex.restSeconds ?? '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkoutPlanDetailDialog;
