import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as AttendanceIcon,
  Assessment as StatsIcon,
} from '@mui/icons-material';
import ScheduleList from '../../components/schedule/ScheduleList';
import AttendanceManager from '../../components/schedule/AttendanceManager';
import ScheduleAnalytics from '../../components/schedule/ScheduleAnalytics';

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
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
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
    id: `schedule-tab-${index}`,
    'aria-controls': `schedule-tabpanel-${index}`,
  };
}

const AdminSchedules: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <ScheduleIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Schedule Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage training schedules, member registrations, and attendance tracking.
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="schedule management tabs"
            variant="fullWidth"
          >
            <Tab
              icon={<ScheduleIcon />}
              label="Training Schedules"
              {...a11yProps(0)}
            />
            <Tab
              icon={<AttendanceIcon />}
              label="Attendance Management"
              {...a11yProps(1)}
            />
            <Tab
              icon={<StatsIcon />}
              label="Reports & Analytics"
              {...a11yProps(2)}
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <ScheduleList />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <AttendanceManager />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <ScheduleAnalytics />
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdminSchedules;