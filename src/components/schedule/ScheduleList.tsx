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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Avatar,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as RegisterIcon,
  CheckCircle as CheckInIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { scheduleApi, trainerApi } from '../../services/api.service';
import { TrainingSchedule, Trainer } from '../../types';
import { getApiErrorMessage } from '../../utils/errorHandler';

interface ScheduleListProps {
  isTrainer?: boolean;
  trainerId?: number;
}

interface ScheduleFormData {
  className: string;
  startDate: string;
  startTime: string;
  endTime: string;
  location: string;
  maxCapacity: number;
  classType: string;
  description: string;
}

const emptyForm: ScheduleFormData = {
  className: '',
  startDate: new Date().toISOString().split('T')[0],
  startTime: '08:00',
  endTime: '09:00',
  location: '',
  maxCapacity: 10,
  classType: 'GROUP_CLASS',
  description: '',
};

const ScheduleList: React.FC<ScheduleListProps> = ({ isTrainer = false, trainerId }) => {
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Form state
  const [formData, setFormData] = useState<ScheduleFormData>({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Register member dialog state
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [registerScheduleId, setRegisterScheduleId] = useState<number | null>(null);
  const [myMembers, setMyMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [registering, setRegistering] = useState(false);

  // Check in dialog state
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [checkInScheduleId, setCheckInScheduleId] = useState<number | null>(null);
  const [checkInMembers, setCheckInMembers] = useState<any[]>([]);
  const [selectedCheckInMemberId, setSelectedCheckInMemberId] = useState<string>('');
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, [selectedDate, trainerId]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (isTrainer && trainerId) {
        response = await scheduleApi.getTrainerSchedules(trainerId);
      } else {
        response = await scheduleApi.getSchedulesByDate(selectedDate);
      }

      if (response.success) {
        setSchedules((response.data as any)?.schedules || response.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'GROUP' ? <GroupIcon /> : <PersonIcon />;
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAvailableSlots = (schedule: any) => {
    const enrolled = Number(schedule.currentEnrollment ?? 0);
    const capacity = Number(schedule.maxCapacity ?? schedule.maxMembers ?? 0);
    return Math.max(0, capacity - enrolled);
  };

  const handleRegisterMember = async (scheduleId: number) => {
    setRegisterScheduleId(scheduleId);
    setSelectedMemberId('');
    setFormError(null);
    setRegisterDialogOpen(true);

    // Load trainer's assigned members
    try {
      setMembersLoading(true);
      const resp = await trainerApi.getMyMembers({ limit: 100 }) as any;
      const members = resp.data?.members || resp.data || [];
      setMyMembers(members);
    } catch (err: any) {
      setFormError(getApiErrorMessage(err, 'Không thể tải danh sách hội viên'));
    } finally {
      setMembersLoading(false);
    }
  };

  const confirmRegister = async () => {
    if (!registerScheduleId || !selectedMemberId) return;
    try {
      setRegistering(true);
      setFormError(null);
      const resp = await scheduleApi.registerForSchedule(registerScheduleId, Number(selectedMemberId)) as any;
      if (resp.success) {
        setRegisterDialogOpen(false);
        fetchSchedules();
      }
    } catch (err: any) {
      setFormError(getApiErrorMessage(err, 'Không thể đăng ký hội viên'));
    } finally {
      setRegistering(false);
    }
  };

  const handleCheckIn = (scheduleId: number) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;

    // Lọc ra danh sách hội viên đã đăng ký nhưng chưa điểm danh hoặc chỉ hiển thị tất cả
    const registered = schedule.registeredMembers?.map((rm: any) => ({
      ...rm.member,
      attendanceStatus: rm.status // REGISTERED, ATTENDED, v.v.
    })) || [];

    setCheckInMembers(registered);
    setCheckInScheduleId(scheduleId);
    setSelectedCheckInMemberId('');
    setFormError(null);
    setCheckInDialogOpen(true);
  };

  const confirmCheckIn = async () => {
    if (!checkInScheduleId || !selectedCheckInMemberId) return;
    try {
      setCheckingIn(true);
      setFormError(null);
      
      const payload = {
        memberId: Number(selectedCheckInMemberId),
        scheduleId: checkInScheduleId,
        attendanceType: 'TRAINING_SESSION' // or GROUP_CLASS depending on schedule type, but we can send a default
      };

      const resp = await scheduleApi.checkInMember(payload) as any;
      if (resp.success) {
        setCheckInDialogOpen(false);
        fetchSchedules(); // reload list
      }
    } catch (err: any) {
      setFormError(getApiErrorMessage(err, 'Không thể điểm danh hội viên'));
    } finally {
      setCheckingIn(false);
    }
  };

  // --- Form handlers ---
  const handleOpenCreate = () => {
    setFormData({ ...emptyForm });
    setEditingId(null);
    setFormError(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (schedule: any) => {
    setFormData({
      className: schedule.className || schedule.title || '',
      startDate: (schedule.startDate || schedule.scheduleDate || '').slice(0, 10),
      startTime: (schedule.startTime || '08:00').slice(0, 5),
      endTime: (schedule.endTime || '09:00').slice(0, 5),
      location: schedule.location || schedule.room || '',
      maxCapacity: Number(schedule.maxCapacity ?? schedule.maxMembers ?? 10),
      classType: schedule.classType || schedule.scheduleType || 'GROUP',
      description: schedule.description || '',
    });
    setEditingId(schedule.id);
    setFormError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormError(null);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxCapacity' ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.className.trim()) {
      setFormError('Vui lòng nhập tên lớp');
      return;
    }
    if (!formData.startDate) {
      setFormError('Vui lòng chọn ngày');
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      setFormError('Vui lòng chọn giờ bắt đầu và kết thúc');
      return;
    }
    if (formData.startTime >= formData.endTime) {
      setFormError('Giờ kết thúc phải sau giờ bắt đầu');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

      const payload: any = {
        className: formData.className.trim(),
        startDate: formData.startDate,
        endDate: formData.startDate, // same day
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location.trim() || undefined,
        maxCapacity: formData.maxCapacity,
        classType: formData.classType,
        description: formData.description.trim() || undefined,
        dayOfWeek: dayNames[new Date(formData.startDate).getDay()],
      };

      // If trainer is creating for themselves, auto-attach trainerId
      if (isTrainer && trainerId) {
        payload.trainerId = trainerId;
      }

      let response: any;
      if (editingId) {
        response = await scheduleApi.updateTrainingSchedule(editingId, payload);
      } else {
        response = await scheduleApi.createTrainingSchedule(payload);
      }

      if (response.success) {
        handleCloseDialog();
        fetchSchedules();
      }
    } catch (err: any) {
      setFormError(getApiErrorMessage(err, editingId ? 'Không thể cập nhật lịch tập' : 'Không thể tạo lịch tập'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSchedule = async (scheduleId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch tập này?')) return;
    try {
      const resp = await scheduleApi.cancelTrainingSchedule(scheduleId) as any;
      if (resp.success) {
        fetchSchedules();
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Không thể hủy lịch tập'));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
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
              {isTrainer ? 'My Training Schedules' : 'Training Schedules'}
            </Typography>

            <Box display="flex" gap={2} alignItems="center">
              {!isTrainer && (
                <TextField
                  type="date"
                  label="Select Date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              )}

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
                disabled={isTrainer && !trainerId}
              >
                Tạo lịch tập
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {schedules.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              No schedules found for the selected {isTrainer ? 'trainer' : 'date'}.
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    {!isTrainer && <TableCell>Trainer</TableCell>}
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedules.map((schedule: any) => (
                    <TableRow key={schedule.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {schedule.className || schedule.title}
                          </Typography>
                          {schedule.description && (
                            <Typography variant="caption" color="text.secondary">
                              {schedule.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      {!isTrainer && (
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar
                              src={schedule.trainer?.user?.profile?.avatarUrl}
                              sx={{ width: 32, height: 32 }}
                            >
                              {schedule.trainer?.user?.profile?.fullName?.[0]}
                            </Avatar>
                            <Typography variant="body2">
                              {schedule.trainer?.user?.profile?.fullName}
                            </Typography>
                          </Box>
                        </TableCell>
                      )}

                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(schedule.startDate || schedule.scheduleDate)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={getTypeIcon(schedule.classType || schedule.scheduleType)}
                          label={schedule.classType || schedule.scheduleType}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {schedule.location || schedule.room || 'Not specified'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box>
                          <Typography variant="body2" component="span">
                            {schedule.currentEnrollment ?? 0}
                            /{schedule.maxCapacity ?? schedule.maxMembers ?? 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {getAvailableSlots(schedule)} available
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={schedule.status}
                          color={getStatusColor(schedule.status) as any}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Edit Schedule">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEdit(schedule)}
                              disabled={schedule.status === 'COMPLETED' || schedule.status === 'CANCELLED'}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          {schedule.status === 'SCHEDULED' && (
                            <>
                              <Tooltip title="Register Member">
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => handleRegisterMember(schedule.id)}
                                >
                                  <RegisterIcon />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Check In">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleCheckIn(schedule.id)}
                                >
                                  <CheckInIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}

                          <Tooltip title="Cancel Schedule">
                            <IconButton
                              size="small"
                              color="error"
                              disabled={schedule.status === 'COMPLETED' || schedule.status === 'CANCELLED'}
                              onClick={() => handleCancelSchedule(schedule.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Schedule Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Chỉnh sửa lịch tập' : 'Tạo lịch tập mới'}</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }} onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Tên lớp / buổi tập"
                name="className"
                value={formData.className}
                onChange={handleChange}
                fullWidth
                required
                placeholder="VD: Yoga buổi sáng, PT session..."
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                type="date"
                label="Ngày tập"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                type="time"
                label="Giờ bắt đầu"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                type="time"
                label="Giờ kết thúc"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Phòng / Địa điểm"
                name="location"
                value={formData.location}
                onChange={handleChange}
                fullWidth
                placeholder="VD: Studio A, Phòng Gym chính..."
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                type="number"
                label="Sức chứa tối đa"
                name="maxCapacity"
                value={formData.maxCapacity}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 1, max: 50 }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                select
                label="Loại buổi tập"
                name="classType"
                value={formData.classType}
                onChange={handleChange}
                fullWidth
                required
                SelectProps={{ native: true }}
              >
                <option value="GROUP_CLASS">Nhóm</option>
                <option value="PERSONAL_TRAINING">Cá nhân (PT)</option>
                <option value="WORKSHOP">Workshop</option>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Mô tả"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                placeholder="Mô tả nội dung buổi tập..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : editingId ? 'Cập nhật' : 'Tạo lịch tập'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Register Member Dialog */}
      <Dialog open={registerDialogOpen} onClose={() => setRegisterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Đăng ký hội viên vào lịch tập</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }} onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}
          {membersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : myMembers.length === 0 ? (
            <Alert severity="info" sx={{ mt: 1 }}>
              Bạn chưa có hội viên nào được phân công. Liên hệ admin để được phân công hội viên.
            </Alert>
          ) : (
            <TextField
              select
              label="Chọn hội viên"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              fullWidth
              required
              sx={{ mt: 2 }}
              SelectProps={{ native: true }}
            >
              <option value="">-- Chọn hội viên --</option>
              {myMembers.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.user?.profile?.fullName || m.memberCode || `Member #${m.id}`}
                </option>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegisterDialogOpen(false)} disabled={registering}>Hủy</Button>
          <Button
            variant="contained"
            onClick={confirmRegister}
            disabled={registering || !selectedMemberId}
          >
            {registering ? <CircularProgress size={24} /> : 'Đăng ký'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Check In Dialog */}
      <Dialog open={checkInDialogOpen} onClose={() => setCheckInDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Điểm danh hội viên</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }} onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}
          {checkInMembers.length === 0 ? (
            <Alert severity="info" sx={{ mt: 1 }}>
              Chưa có hội viên nào đăng ký vào lịch tập này.
            </Alert>
          ) : (
            <TextField
              select
              label="Chọn hội viên để điểm danh"
              value={selectedCheckInMemberId}
              onChange={(e) => setSelectedCheckInMemberId(e.target.value)}
              fullWidth
              required
              sx={{ mt: 2 }}
              SelectProps={{ native: true }}
            >
              <option value="">-- Chọn hội viên --</option>
              {checkInMembers.map((m: any) => (
                <option key={m.id} value={m.id} disabled={m.attendanceStatus === 'ATTENDED'}>
                  {m.user?.profile?.fullName || m.memberCode || `Member #${m.id}`} 
                  {m.attendanceStatus === 'ATTENDED' ? ' (Đã điểm danh)' : ''}
                </option>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckInDialogOpen(false)} disabled={checkingIn}>Hủy</Button>
          <Button
            variant="contained"
            color="success"
            onClick={confirmCheckIn}
            disabled={checkingIn || !selectedCheckInMemberId}
          >
            {checkingIn ? <CircularProgress size={24} /> : 'Điểm danh'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScheduleList;