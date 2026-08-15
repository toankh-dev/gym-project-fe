import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { trainerApi } from '../../services/api.service';
import ScheduleList from '../../components/schedule/ScheduleList';
import MemberSessionsPanel from './MemberSessionsPanel';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trainer-schedule-tabpanel-${index}`}
      aria-labelledby={`trainer-schedule-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `trainer-schedule-tab-${index}`,
    'aria-controls': `trainer-schedule-tabpanel-${index}`,
  };
}

const TrainerSchedules: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [trainerProfile, setTrainerProfile] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role?.name === 'TRAINER') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [profileResp, dashResp] = await Promise.all([
        trainerApi.getCurrentTrainer() as Promise<any>,
        trainerApi.getMyDashboard() as Promise<any>,
      ]);
      if (profileResp.success) {
        setTrainerProfile(profileResp.data?.trainer || profileResp.data);
      }
      if (dashResp.success) {
        setDashboard(dashResp.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trainer profile');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !trainerProfile) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">
          {error || 'Unable to load trainer profile. Please contact support.'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <ScheduleIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          My Training Schedules
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your training sessions and view your schedule.
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {dashboard?.stats?.sessionsThisWeek ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sessions This Week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {dashboard?.stats?.totalMembers ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assigned Members
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {(dashboard?.stats?.avgRating ?? 0).toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Rating
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="trainer schedule tabs"
          >
            <Tab
              icon={<ScheduleIcon />}
              label="My Schedules"
              {...a11yProps(0)}
            />
            <Tab
              icon={<PeopleIcon />}
              label="Member Sessions"
              {...a11yProps(1)}
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <ScheduleList isTrainer={true} trainerId={trainerProfile.id} />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <MemberSessionsPanel />
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default TrainerSchedules;