import React, { useState } from 'react';
import { Box, Container, Typography, Tabs, Tab, Paper } from '@mui/material';
import RevenueReport from './reports/RevenueReport';
import MembershipReport from './reports/MembershipReport';
import AttendanceReport from './reports/AttendanceReport';
import TrainerPerformanceReport from './reports/TrainerPerformanceReport';

const AdminReports: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>Reports & Analytics</Typography>
        <Typography variant="body1" color="text.secondary">
          Detailed reports across revenue, membership, attendance, and trainer performance.
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
          <Tab label="Revenue" />
          <Tab label="Membership" />
          <Tab label="Attendance" />
          <Tab label="Trainer Performance" />
        </Tabs>
      </Paper>

      <Box>
        {tab === 0 && <RevenueReport />}
        {tab === 1 && <MembershipReport />}
        {tab === 2 && <AttendanceReport />}
        {tab === 3 && <TrainerPerformanceReport />}
      </Box>
    </Container>
  );
};

export default AdminReports;
