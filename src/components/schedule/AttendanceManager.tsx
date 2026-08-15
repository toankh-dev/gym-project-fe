import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Autocomplete,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  CheckCircle as CheckInIcon,
  ExitToApp as CheckOutIcon,
  Schedule as ScheduleIcon,
  Today as TodayIcon,
  Assessment as StatsIcon
} from '@mui/icons-material';
import { scheduleApi, memberApi } from '../../services/api.service';
import { AttendanceLog, Member, TrainingSchedule } from '../../types';

const AttendanceManager: React.FC = () => {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceLog[]>([]);
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCheckInDialog, setOpenCheckInDialog] = useState(false);
  const [openCheckOutDialog, setOpenCheckOutDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<TrainingSchedule | null>(null);
  const [attendanceType, setAttendanceType] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [checkoutNote, setCheckoutNote] = useState('');
  const [viewMode, setViewMode] = useState<'today' | 'history'>('today');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date()
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (viewMode === 'today') {
      fetchTodayAttendance();
    } else {
      fetchAttendanceHistory();
    }
  }, [viewMode, dateRange]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // Fetch today's schedules and members
      const [schedulesRes, membersRes] = await Promise.all([
        scheduleApi.getUpcomingSchedules(20),
        memberApi.getMembers({ limit: 100, status: 'ACTIVE' })
      ]);

      if (schedulesRes.success) {
        setSchedules((schedulesRes.data as any)?.schedules || schedulesRes.data || []);
      }

      if (membersRes.success) {
        setMembers((membersRes.data as any)?.members || membersRes.data || []);
      }

      await fetchTodayAttendance();
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await scheduleApi.getTodayAttendance();
      if (response.success) {
        setTodayAttendance((response.data as any)?.attendanceLogs || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch today attendance:', err);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      const response = await scheduleApi.getAttendanceLogs({
        startDate: dateRange.startDate.toISOString().split('T')[0],
        endDate: dateRange.endDate.toISOString().split('T')[0],
        limit: 50
      });

      if (response.success) {
        setAttendanceLogs((response.data as any)?.attendanceLogs || response.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance history');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedMember) return;

    try {
      const checkInData = {
        memberId: selectedMember.id,
        scheduleId: selectedSchedule?.id,
        attendanceType
      };

      const response = await scheduleApi.checkInMember(checkInData);

      if (response.success) {
        setOpenCheckInDialog(false);
        setSelectedMember(null);
        setSelectedSchedule(null);
        await fetchTodayAttendance();

        // Show success message
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (memberId: number) => {
    try {
      const response = await scheduleApi.checkOutMember(memberId, checkoutNote);

      if (response.success) {
        setOpenCheckOutDialog(false);
        setCheckoutNote('');
        await fetchTodayAttendance();

        // Show success message
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Check-out failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CHECKED_IN':
        return 'success';
      case 'CHECKED_OUT':
        return 'primary';
      case 'ABSENT':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('vi-VN');
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (checkinTime: string, checkoutTime?: string) => {
    if (!checkoutTime) return 'In progress';

    const checkin = new Date(checkinTime);
    const checkout = new Date(checkoutTime);
    const durationMs = checkout.getTime() - checkin.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const currentData = viewMode === 'today' ? todayAttendance : attendanceLogs;
  const checkedInMembers = todayAttendance.filter(log => log.status === 'CHECKED_IN');

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
            <Typography variant="h5" gutterBottom>
              <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Attendance Management
            </Typography>

            <Box display="flex" gap={2} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={viewMode === 'today'}
                    onChange={(e) => setViewMode(e.target.checked ? 'today' : 'history')}
                  />
                }
                label="Today View"
              />

              <Button
                variant="contained"
                startIcon={<CheckInIcon />}
                onClick={() => setOpenCheckInDialog(true)}
              >
                Check In Member
              </Button>
            </Box>
          </Box>

          {/* Quick Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <TodayIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h4" color="primary">
                    {checkedInMembers.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Currently In Gym
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <StatsIcon color="info" sx={{ fontSize: 40 }} />
                  <Typography variant="h4" color="info.main">
                    {todayAttendance.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Date Range Picker for History Mode */}
          {viewMode === 'history' && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <TextField
                  type="date"
                  label="Start Date"
                  value={dateRange.startDate.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  type="date"
                  label="End Date"
                  value={dateRange.endDate.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </Grid>
          )}

          {/* Attendance Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>Check-in Time</TableCell>
                  <TableCell>Check-out Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Schedule</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body1" color="text.secondary" py={4}>
                        No attendance records found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            src={log.member?.user?.profile?.avatarUrl}
                            sx={{ width: 32, height: 32 }}
                          >
                            {log.member?.user?.profile?.fullName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {log.member?.user?.profile?.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {log.member?.memberCode}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {formatTime(log.checkinTime)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {log.checkoutTime ? formatTime(log.checkoutTime) : '-'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {calculateDuration(log.checkinTime, log.checkoutTime)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={log.attendanceType}
                          variant="outlined"
                          size="small"
                          color={log.attendanceType === 'ONLINE' ? 'primary' : 'default'}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {log.schedule?.title || 'General workout'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={log.status}
                          color={getStatusColor(log.status) as any}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        {log.status === 'CHECKED_IN' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CheckOutIcon />}
                            onClick={() => {
                              setSelectedMember(log.member);
                              setOpenCheckOutDialog(true);
                            }}
                          >
                            Check Out
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Check-in Dialog */}
      <Dialog open={openCheckInDialog} onClose={() => setOpenCheckInDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Check In Member</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={members}
                getOptionLabel={(member) => `${member.user.profile.fullName} (${member.memberCode})`}
                value={selectedMember}
                onChange={(_, member) => setSelectedMember(member)}
                renderInput={(params) => (
                  <TextField {...params} label="Select Member" required />
                )}
                renderOption={(props, member) => (
                  <Box component="li" {...props} display="flex" alignItems="center" gap={1}>
                    <Avatar
                      src={member.user.profile.avatarUrl}
                      sx={{ width: 32, height: 32 }}
                    >
                      {member.user.profile.fullName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{member.user.profile.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.memberCode}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                options={schedules}
                getOptionLabel={(schedule) => `${schedule.title} - ${formatTime(schedule.startTime)}`}
                value={selectedSchedule}
                onChange={(_, schedule) => setSelectedSchedule(schedule)}
                renderInput={(params) => (
                  <TextField {...params} label="Training Schedule (Optional)" />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Attendance Type</InputLabel>
                <Select
                  value={attendanceType}
                  onChange={(e) => setAttendanceType(e.target.value as 'ONLINE' | 'OFFLINE')}
                >
                  <MenuItem value="ONLINE">Online</MenuItem>
                  <MenuItem value="OFFLINE">Offline</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCheckInDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCheckIn} disabled={!selectedMember}>
            Check In
          </Button>
        </DialogActions>
      </Dialog>

      {/* Check-out Dialog */}
      <Dialog open={openCheckOutDialog} onClose={() => setOpenCheckOutDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Check Out Member</DialogTitle>
        <DialogContent>
          {selectedMember && (
            <Box sx={{ mt: 2 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar src={selectedMember.user.profile.avatarUrl}>
                  {selectedMember.user.profile.fullName[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedMember.user.profile.fullName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedMember.memberCode}
                  </Typography>
                </Box>
              </Box>

              <TextField
                label="Note (Optional)"
                fullWidth
                multiline
                rows={3}
                value={checkoutNote}
                onChange={(e) => setCheckoutNote(e.target.value)}
                placeholder="Add any notes about the workout session..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCheckOutDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => selectedMember && handleCheckOut(selectedMember.id)}
          >
            Check Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceManager;