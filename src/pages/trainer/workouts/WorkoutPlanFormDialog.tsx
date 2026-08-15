import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  Stepper, Step, StepLabel, TextField, MenuItem, Grid, Tabs, Tab, Autocomplete,
  IconButton, Alert, CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { workoutPlanApi, exerciseApi } from '../../../services/api.service';

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'] as const;
const GOALS = ['WEIGHT_LOSS','MUSCLE_GAIN','ENDURANCE','STRENGTH','GENERAL_FITNESS','REHABILITATION'];
const LEVELS = ['BEGINNER','INTERMEDIATE','ADVANCED'];
const STATUSES = ['DRAFT','ACTIVE'];

interface ExerciseRow {
  exerciseId: number | null;
  dayOfWeek: typeof DAYS[number];
  exerciseOrder: number;
  sets: number | '';
  reps: string;
  weightKg: number | '';
  restSeconds: number | '';
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  planId: number | null;
  members: Array<{ id: number; user?: any }>;
}

const todayISO = () => new Date().toISOString().split('T')[0];

const WorkoutPlanFormDialog: React.FC<Props> = ({ open, onClose, onSaved, planId, members }) => {
  const isEdit = planId != null;
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exerciseLib, setExerciseLib] = useState<any[]>([]);
  const [dayTab, setDayTab] = useState(0);

  const [form, setForm] = useState({
    memberId: '' as number | '',
    planName: '',
    goal: 'GENERAL_FITNESS',
    difficultyLevel: 'BEGINNER',
    durationWeeks: 4,
    sessionsPerWeek: 3,
    startDate: todayISO(),
    endDate: '',
    description: '',
    notes: '',
    status: 'DRAFT',
  });
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const resp = await exerciseApi.getExercises({ limit: 200 }) as any;
      if (resp.success) setExerciseLib(resp.data?.exercises || []);
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      setStep(0);
      setForm({
        memberId: '', planName: '', goal: 'GENERAL_FITNESS', difficultyLevel: 'BEGINNER',
        durationWeeks: 4, sessionsPerWeek: 3, startDate: todayISO(), endDate: '',
        description: '', notes: '', status: 'DRAFT',
      });
      setExercises([]);
      setError(null);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const resp = await workoutPlanApi.getPlanById(planId!) as any;
        if (resp.success) {
          const p = resp.data.plan;
          setForm({
            memberId: p.member?.id ?? '',
            planName: p.planName ?? '',
            goal: p.goal,
            difficultyLevel: p.difficultyLevel,
            durationWeeks: p.durationWeeks,
            sessionsPerWeek: p.sessionsPerWeek,
            startDate: p.startDate,
            endDate: p.endDate ?? '',
            description: p.description ?? '',
            notes: p.notes ?? '',
            status: p.status,
          });
          const flat: ExerciseRow[] = [];
          DAYS.forEach((d) => (p.exercisesByDay?.[d] || []).forEach((ex: any) => {
            flat.push({
              exerciseId: ex.exercise?.id,
              dayOfWeek: d,
              exerciseOrder: ex.exerciseOrder,
              sets: ex.sets ?? '',
              reps: ex.reps ?? '',
              weightKg: ex.weightKg ?? '',
              restSeconds: ex.restSeconds ?? '',
            });
          }));
          setExercises(flat);
        }
      } catch (err: any) {
        setError('Failed to load plan: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [open, planId, isEdit]);

  const setField = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const step1Valid = form.memberId !== '' && form.planName.trim().length > 0
    && form.durationWeeks > 0 && form.sessionsPerWeek > 0 && !!form.startDate;

  const addExercise = (day: typeof DAYS[number]) => {
    const order = exercises.filter((e) => e.dayOfWeek === day).length + 1;
    setExercises((arr) => [...arr, {
      exerciseId: null, dayOfWeek: day, exerciseOrder: order,
      sets: 3, reps: '10', weightKg: '', restSeconds: 60,
    }]);
  };
  const removeExercise = (idx: number) => setExercises((arr) => arr.filter((_, i) => i !== idx));
  const updateExercise = (idx: number, patch: Partial<ExerciseRow>) =>
    setExercises((arr) => arr.map((e, i) => i === idx ? { ...e, ...patch } : e));

  const submit = async () => {
    setError(null);
    if (!isEdit && exercises.length === 0) {
      setError('Add at least one exercise');
      return;
    }
    if (!isEdit && exercises.some((e) => !e.exerciseId || e.sets === '')) {
      setError('Every exercise needs an exercise and a sets value');
      return;
    }
    try {
      setSaving(true);
      if (isEdit) {
        const meta = {
          planName: form.planName, goal: form.goal, difficultyLevel: form.difficultyLevel,
          durationWeeks: form.durationWeeks, sessionsPerWeek: form.sessionsPerWeek,
          startDate: form.startDate, endDate: form.endDate || null,
          description: form.description, notes: form.notes, status: form.status,
        };
        await workoutPlanApi.updatePlan(planId!, meta);
      } else {
        const payload = {
          ...form,
          endDate: form.endDate || null,
          exercises: exercises.map((e) => ({
            exerciseId: e.exerciseId,
            dayOfWeek: e.dayOfWeek,
            exerciseOrder: e.exerciseOrder,
            sets: e.sets === '' ? null : Number(e.sets),
            reps: e.reps || null,
            weightKg: e.weightKg === '' ? null : Number(e.weightKg),
            restSeconds: e.restSeconds === '' ? null : Number(e.restSeconds),
          })),
        };
        await workoutPlanApi.createPlan(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const dayExercises = exercises.filter((e) => e.dayOfWeek === DAYS[dayTab]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Workout Plan' : 'Create Workout Plan'}</DialogTitle>
      <DialogContent dividers>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          <Step><StepLabel>Plan Info</StepLabel></Step>
          <Step><StepLabel>{isEdit ? 'Exercises (read-only)' : 'Exercises'}</StepLabel></Step>
        </Stepper>

        {step === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Member" value={form.memberId}
                onChange={(e) => setField('memberId', Number(e.target.value))}
                disabled={isEdit}>
                {members.map((m: any) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.user?.profile?.fullName || `Member #${m.id}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Plan Name" value={form.planName}
                onChange={(e) => setField('planName', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth label="Goal" value={form.goal}
                onChange={(e) => setField('goal', e.target.value)}>
                {GOALS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth label="Difficulty" value={form.difficultyLevel}
                onChange={(e) => setField('difficultyLevel', e.target.value)}>
                {LEVELS.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth label="Status" value={form.status}
                onChange={(e) => setField('status', e.target.value)}>
                {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth type="number" label="Duration (weeks)" value={form.durationWeeks}
                onChange={(e) => setField('durationWeeks', Number(e.target.value))} inputProps={{ min: 1 }} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth type="number" label="Sessions/Week" value={form.sessionsPerWeek}
                onChange={(e) => setField('sessionsPerWeek', Number(e.target.value))} inputProps={{ min: 1 }} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth type="date" label="Start Date" value={form.startDate}
                onChange={(e) => setField('startDate', e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth type="date" label="End Date" value={form.endDate}
                onChange={(e) => setField('endDate', e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Description" value={form.description}
                onChange={(e) => setField('description', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Notes" value={form.notes}
                onChange={(e) => setField('notes', e.target.value)} />
            </Grid>
          </Grid>
        )}

        {step === 1 && (
          <Box>
            {isEdit && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Exercises cannot be modified. Delete and recreate the plan to change them.
              </Alert>
            )}
            <Tabs value={dayTab} onChange={(_, v) => setDayTab(v)} variant="scrollable">
              {DAYS.map((d) => (
                <Tab key={d} label={`${d.slice(0, 3)} (${exercises.filter((e) => e.dayOfWeek === d).length})`} />
              ))}
            </Tabs>
            <Box sx={{ mt: 2 }}>
              {dayExercises.length === 0 && (
                <Typography color="text.secondary" sx={{ mb: 2 }}>Rest day — no exercises yet.</Typography>
              )}
              {dayExercises.map((ex) => {
                const idx = exercises.indexOf(ex);
                return (
                  <Grid container spacing={1} key={idx} sx={{ mb: 1, alignItems: 'center' }}>
                    <Grid item xs={12} sm={4}>
                      <Autocomplete
                        options={exerciseLib}
                        getOptionLabel={(o: any) => `${o.name} (${o.muscleGroup})`}
                        value={exerciseLib.find((o) => o.id === ex.exerciseId) || null}
                        onChange={(_, v) => updateExercise(idx, { exerciseId: v?.id ?? null })}
                        disabled={isEdit}
                        renderInput={(p) => <TextField {...p} size="small" label="Exercise" />}
                      />
                    </Grid>
                    <Grid item xs={4} sm={1.5}>
                      <TextField size="small" type="number" label="Sets" value={ex.sets}
                        onChange={(e) => updateExercise(idx, { sets: e.target.value === '' ? '' : Number(e.target.value) })}
                        disabled={isEdit} fullWidth />
                    </Grid>
                    <Grid item xs={4} sm={1.5}>
                      <TextField size="small" label="Reps" value={ex.reps}
                        onChange={(e) => updateExercise(idx, { reps: e.target.value })}
                        disabled={isEdit} fullWidth />
                    </Grid>
                    <Grid item xs={4} sm={1.5}>
                      <TextField size="small" type="number" label="Weight (kg)" value={ex.weightKg}
                        onChange={(e) => updateExercise(idx, { weightKg: e.target.value === '' ? '' : Number(e.target.value) })}
                        disabled={isEdit} fullWidth />
                    </Grid>
                    <Grid item xs={8} sm={2}>
                      <TextField size="small" type="number" label="Rest (s)" value={ex.restSeconds}
                        onChange={(e) => updateExercise(idx, { restSeconds: e.target.value === '' ? '' : Number(e.target.value) })}
                        disabled={isEdit} fullWidth />
                    </Grid>
                    <Grid item xs={4} sm={1.5}>
                      <IconButton onClick={() => removeExercise(idx)} disabled={isEdit}><DeleteIcon /></IconButton>
                    </Grid>
                  </Grid>
                );
              })}
              {!isEdit && (
                <Button startIcon={<AddIcon />} onClick={() => addExercise(DAYS[dayTab])} sx={{ mt: 1 }}>
                  Add exercise to {DAYS[dayTab]}
                </Button>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {step === 1 && <Button onClick={() => setStep(0)}>Back</Button>}
        {step === 0 && <Button variant="contained" disabled={!step1Valid} onClick={() => setStep(1)}>Next</Button>}
        {step === 1 && (
          <Button variant="contained" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : (isEdit ? 'Save' : 'Create Plan')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WorkoutPlanFormDialog;
