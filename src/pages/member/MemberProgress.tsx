import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fab
} from '@mui/material';
import {
  FitnessCenter as FitnessCenterIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as WorkoutIcon,
  Timeline as TimelineIcon,
  Add as AddIcon,
  Edit as EditIcon,
  MonitorWeight as WeightIcon,
  Height as HeightIcon,
  LocalFireDepartment as CaloriesIcon
} from '@mui/icons-material';
import { progressApi } from '../../services/api.service';

interface MemberProgressData {
  id: number;
  heightCm?: number;
  weightKg?: number;
  bodyFatPercent?: number;
  muscleMassKg?: number;
  fitnessGoal?: string;
  trainingLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  healthCondition?: string;
  medicalNote?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  updatedAt: string;
}

interface WorkoutLog {
  id: number;
  exerciseId: number;
  exerciseName: string;
  workoutDate: string;
  setsCompleted?: number;
  repsCompleted?: number;
  weightUsedKg?: number;
  durationMinutes?: number;
  caloriesBurned?: number;
  difficultyRating?: number;
  notes?: string;
}

interface ProgressStatistics {
  totalWorkouts: number;
  totalCalories: number;
  averageRating: number;
  favoriteExercise?: string;
  weeklyProgress: Array<{
    date: string;
    workouts: number;
    calories: number;
  }>;
}

interface Exercise {
  id: number;
  name: string;
  category: string;
  muscleGroup: string;
  difficultyLevel: string;
}

const MemberProgress: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [progress, setProgress] = useState<MemberProgressData | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);
  const [statistics, setStatistics] = useState<ProgressStatistics | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);

  // Form states
  const [progressForm, setProgressForm] = useState({
    heightCm: '',
    weightKg: '',
    bodyFatPercent: '',
    muscleMassKg: '',
    fitnessGoal: '',
    trainingLevel: 'BEGINNER',
    healthCondition: '',
    medicalNote: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  const [workoutForm, setWorkoutForm] = useState({
    exerciseId: '',
    workoutDate: new Date().toISOString().split('T')[0],
    setsCompleted: '',
    repsCompleted: '',
    weightUsedKg: '',
    durationMinutes: '',
    caloriesBurned: '',
    difficultyRating: '',
    notes: ''
  });

  // Fetch data — single endpoint returns { member, profile, workoutLogs, summary, currentMetrics }
  const fetchProgress = async () => {
    try {
      const response = await progressApi.getCurrentMemberProgress();
      const data = response.data as any;
      const profile = data?.profile || {};

      // Page expects a flat object with heightCm/weightKg/etc. at the top level.
      const flatProfile = {
        ...profile,
        heightCm: profile.heightCm !== null && profile.heightCm !== undefined ? Number(profile.heightCm) : null,
        weightKg: profile.weightKg !== null && profile.weightKg !== undefined ? Number(profile.weightKg) : null,
        bodyFatPercent: profile.bodyFatPercent !== null && profile.bodyFatPercent !== undefined ? Number(profile.bodyFatPercent) : null,
        muscleMassKg: profile.muscleMassKg !== null && profile.muscleMassKg !== undefined ? Number(profile.muscleMassKg) : null,
      };
      setProgress(flatProfile);

      setProgressForm({
        heightCm: flatProfile.heightCm?.toString() || '',
        weightKg: flatProfile.weightKg?.toString() || '',
        bodyFatPercent: flatProfile.bodyFatPercent?.toString() || '',
        muscleMassKg: flatProfile.muscleMassKg?.toString() || '',
        fitnessGoal: flatProfile.fitnessGoal || '',
        trainingLevel: flatProfile.trainingLevel || 'BEGINNER',
        healthCondition: flatProfile.healthCondition || '',
        medicalNote: flatProfile.medicalNote || '',
        emergencyContactName: flatProfile.emergencyContactName || '',
        emergencyContactPhone: flatProfile.emergencyContactPhone || ''
      });

      // Workout history is inlined on the same endpoint.
      setWorkoutHistory((data?.workoutLogs || []) as WorkoutLog[]);

      // Summary doubles as our statistics block.
      const summary = data?.summary || {};
      setStatistics({
        totalWorkouts: Number(summary.totalWorkouts || 0),
        totalCalories: Number(summary.avgCaloriesPerSession || 0) * Number(summary.totalWorkouts || 0),
        averageRating: 0,
        mostFrequentExercise: summary.mostFrequentExercise || null,
        lastWorkout: summary.lastWorkout || null,
        weeklyFrequency: Number(data?.weeklyFrequency || 0),
      } as any);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const fetchExercises = async () => {
    try {
      const response = await progressApi.getExercises({ limit: 100 });
      setExercises((response.data as Exercise[]) || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  useEffect(() => {
    fetchProgress();
    fetchExercises();
  }, []);

  const handleUpdateProgress = async () => {
    try {
      setLoading(true);
      const formData: any = {};

      Object.entries(progressForm).forEach(([key, value]) => {
        if (value !== '') {
          if (['heightCm', 'weightKg', 'bodyFatPercent', 'muscleMassKg'].includes(key)) {
            formData[key] = parseFloat(value as string);
          } else {
            formData[key] = value;
          }
        }
      });

      await progressApi.updateMemberProgress(formData);
      setProgressDialogOpen(false);
      fetchProgress();
      alert('Progress updated successfully!');
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  const handleLogWorkout = async () => {
    try {
      setLoading(true);
      const formData: any = {
        exerciseId: parseInt(workoutForm.exerciseId),
        workoutDate: workoutForm.workoutDate
      };

      // Add optional numeric fields
      ['setsCompleted', 'repsCompleted', 'weightUsedKg', 'durationMinutes', 'caloriesBurned'].forEach(field => {
        const value = workoutForm[field as keyof typeof workoutForm];
        if (value && value !== '') {
          formData[field] = parseInt(value as string);
        }
      });

      // Add difficulty rating
      if (workoutForm.difficultyRating && workoutForm.difficultyRating !== '') {
        formData.difficultyRating = workoutForm.difficultyRating;
      }

      // Add notes
      if (workoutForm.notes.trim()) {
        formData.notes = workoutForm.notes.trim();
      }

      await progressApi.logWorkout(formData);
      setWorkoutDialogOpen(false);

      // Reset form
      setWorkoutForm({
        exerciseId: '',
        workoutDate: new Date().toISOString().split('T')[0],
        setsCompleted: '',
        repsCompleted: '',
        weightUsedKg: '',
        durationMinutes: '',
        caloriesBurned: '',
        difficultyRating: '',
        notes: ''
      });

      fetchProgress();
      alert('Workout logged successfully!');
    } catch (error) {
      console.error('Error logging workout:', error);
      alert('Failed to log workout');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getBMI = () => {
    if (progress?.heightCm && progress?.weightKg) {
      const heightM = progress.heightCm / 100;
      return (progress.weightKg / (heightM * heightM)).toFixed(1);
    }
    return 'N/A';
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Underweight', color: 'info' as const };
    if (bmi < 25) return { text: 'Normal', color: 'success' as const };
    if (bmi < 30) return { text: 'Overweight', color: 'warning' as const };
    return { text: 'Obese', color: 'error' as const };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Progress Tracking
      </Typography>

      <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Progress Overview" icon={<TrendingUpIcon />} />
        <Tab label="Workout History" icon={<WorkoutIcon />} />
        <Tab label="Statistics" icon={<TimelineIcon />} />
      </Tabs>

      {currentTab === 0 && (
        <Grid container spacing={3}>
          {/* Current Progress Card */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Current Progress</Typography>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setProgressDialogOpen(true)}
                  >
                    Update Progress
                  </Button>
                </Box>

                {progress ? (
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <WeightIcon color="primary" sx={{ fontSize: 32 }} />
                        <Typography variant="h6">{progress.weightKg || 'N/A'} kg</Typography>
                        <Typography variant="body2" color="text.secondary">Weight</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <HeightIcon color="primary" sx={{ fontSize: 32 }} />
                        <Typography variant="h6">{progress.heightCm || 'N/A'} cm</Typography>
                        <Typography variant="body2" color="text.secondary">Height</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6">{getBMI()}</Typography>
                        <Typography variant="body2" color="text.secondary">BMI</Typography>
                        {progress.weightKg && progress.heightCm && (
                          <Chip
                            label={getBMIStatus(parseFloat(getBMI())).text}
                            color={getBMIStatus(parseFloat(getBMI())).color}
                            size="small"
                          />
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6">{progress.bodyFatPercent || 'N/A'}%</Typography>
                        <Typography variant="body2" color="text.secondary">Body Fat</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mt: 2 }}>Training Level</Typography>
                      <Chip
                        label={progress.trainingLevel}
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                    </Grid>
                    {progress.fitnessGoal && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Fitness Goal</Typography>
                        <Typography variant="body2">{progress.fitnessGoal}</Typography>
                      </Grid>
                    )}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    No progress data available. Click "Update Progress" to add your information.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Quick Stats</Typography>
                {statistics ? (
                  <List dense>
                    <ListItem>
                      <ListItemIcon><FitnessCenterIcon /></ListItemIcon>
                      <ListItemText
                        primary="Total Workouts"
                        secondary={statistics.totalWorkouts}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CaloriesIcon /></ListItemIcon>
                      <ListItemText
                        primary="Total Calories"
                        secondary={`${statistics.totalCalories} kcal`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Average Rating"
                        secondary={`${statistics.averageRating}/5 stars`}
                      />
                    </ListItem>
                    {statistics.favoriteExercise && (
                      <ListItem>
                        <ListItemText
                          primary="Favorite Exercise"
                          secondary={statistics.favoriteExercise}
                        />
                      </ListItem>
                    )}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No workout data available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Workout History</Typography>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Exercise</TableCell>
                    <TableCell>Sets</TableCell>
                    <TableCell>Reps</TableCell>
                    <TableCell>Weight (kg)</TableCell>
                    <TableCell>Duration (min)</TableCell>
                    <TableCell>Calories</TableCell>
                    <TableCell>Rating</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workoutHistory.map((workout) => (
                    <TableRow key={workout.id}>
                      <TableCell>{formatDate(workout.workoutDate)}</TableCell>
                      <TableCell>{workout.exerciseName}</TableCell>
                      <TableCell>{workout.setsCompleted || '-'}</TableCell>
                      <TableCell>{workout.repsCompleted || '-'}</TableCell>
                      <TableCell>{workout.weightUsedKg || '-'}</TableCell>
                      <TableCell>{workout.durationMinutes || '-'}</TableCell>
                      <TableCell>{workout.caloriesBurned || '-'}</TableCell>
                      <TableCell>
                        {workout.difficultyRating && (
                          <Typography variant="body2">
                            {'★'.repeat(workout.difficultyRating)}{'☆'.repeat(5 - workout.difficultyRating)}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {workoutHistory.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No workout history available. Log your first workout to get started!
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {currentTab === 2 && (
        <Grid container spacing={3}>
          {statistics && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {statistics.totalWorkouts}
                    </Typography>
                    <Typography variant="body2">Total Workouts</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {statistics.totalCalories}
                    </Typography>
                    <Typography variant="body2">Total Calories Burned</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {statistics.averageRating.toFixed(1)}/5
                    </Typography>
                    <Typography variant="body2">Average Difficulty</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {statistics.favoriteExercise || 'N/A'}
                    </Typography>
                    <Typography variant="body2">Favorite Exercise</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      )}

      {/* Floating Action Button for Logging Workout */}
      <Fab
        color="primary"
        aria-label="log workout"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setWorkoutDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Update Progress Dialog */}
      <Dialog
        open={progressDialogOpen}
        onClose={() => setProgressDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Update Progress</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Height (cm)"
                type="number"
                value={progressForm.heightCm}
                onChange={(e) => setProgressForm(prev => ({ ...prev, heightCm: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Weight (kg)"
                type="number"
                value={progressForm.weightKg}
                onChange={(e) => setProgressForm(prev => ({ ...prev, weightKg: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Body Fat (%)"
                type="number"
                value={progressForm.bodyFatPercent}
                onChange={(e) => setProgressForm(prev => ({ ...prev, bodyFatPercent: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Muscle Mass (kg)"
                type="number"
                value={progressForm.muscleMassKg}
                onChange={(e) => setProgressForm(prev => ({ ...prev, muscleMassKg: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fitness Goal"
                multiline
                rows={2}
                value={progressForm.fitnessGoal}
                onChange={(e) => setProgressForm(prev => ({ ...prev, fitnessGoal: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Training Level</InputLabel>
                <Select
                  value={progressForm.trainingLevel}
                  onChange={(e) => setProgressForm(prev => ({ ...prev, trainingLevel: e.target.value as any }))}
                >
                  <MenuItem value="BEGINNER">Beginner</MenuItem>
                  <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                  <MenuItem value="ADVANCED">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgressDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateProgress} variant="contained" disabled={loading}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Log Workout Dialog */}
      <Dialog
        open={workoutDialogOpen}
        onClose={() => setWorkoutDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Log Workout</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Exercise</InputLabel>
                <Select
                  value={workoutForm.exerciseId}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, exerciseId: e.target.value }))}
                >
                  {exercises.map((exercise) => (
                    <MenuItem key={exercise.id} value={exercise.id}>
                      {exercise.name} ({exercise.category})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Workout Date"
                type="date"
                value={workoutForm.workoutDate}
                onChange={(e) => setWorkoutForm(prev => ({ ...prev, workoutDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Sets Completed"
                type="number"
                value={workoutForm.setsCompleted}
                onChange={(e) => setWorkoutForm(prev => ({ ...prev, setsCompleted: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Reps Completed"
                type="number"
                value={workoutForm.repsCompleted}
                onChange={(e) => setWorkoutForm(prev => ({ ...prev, repsCompleted: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Weight Used (kg)"
                type="number"
                value={workoutForm.weightUsedKg}
                onChange={(e) => setWorkoutForm(prev => ({ ...prev, weightUsedKg: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={workoutForm.durationMinutes}
                onChange={(e) => setWorkoutForm(prev => ({ ...prev, durationMinutes: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Calories Burned"
                type="number"
                value={workoutForm.caloriesBurned}
                onChange={(e) => setWorkoutForm(prev => ({ ...prev, caloriesBurned: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Difficulty Rating</InputLabel>
                <Select
                  value={workoutForm.difficultyRating}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, difficultyRating: e.target.value }))}
                >
                  <MenuItem value="1">1 - Very Easy</MenuItem>
                  <MenuItem value="2">2 - Easy</MenuItem>
                  <MenuItem value="3">3 - Moderate</MenuItem>
                  <MenuItem value="4">4 - Hard</MenuItem>
                  <MenuItem value="5">5 - Very Hard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={workoutForm.notes}
                onChange={(e) => setWorkoutForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkoutDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleLogWorkout}
            variant="contained"
            disabled={loading || !workoutForm.exerciseId}
          >
            Log Workout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MemberProgress;