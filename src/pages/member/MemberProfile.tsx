import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Switch,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera,
  FitnessCenter,
  Timeline,
  Person,
  Security,
  Notifications,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { memberApi, progressApi, authApi } from "../../services/api.service";

// Notification preference toggles (key matches MemberPreference model field)
const NOTIFICATION_PREFS: { key: string; label: string }[] = [
  { key: "notifyEmail", label: "Email Notifications" },
  { key: "notifySms", label: "SMS Notifications" },
  { key: "notifyPush", label: "Push Notifications" },
  { key: "notifyWorkoutReminders", label: "Workout Reminders" },
  { key: "notifySubscriptionExpiry", label: "Subscription Expiry Alerts" },
  { key: "notifyTrainerMessages", label: "Trainer Messages" },
];

// Privacy preference toggles (boolean fields only; visibility handled separately)
const PRIVACY_PREFS: { key: string; label: string }[] = [
  { key: "showProgress", label: "Show Progress to Others" },
  { key: "showStats", label: "Show Stats to Others" },
];

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const MemberProfile: React.FC = () => {
  const { user, setUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editData, setEditData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "OTHER",
    address: "",
    bio: "",
  });

  const [memberData, setMemberData] = useState<any>(null);
  const [fitnessProfile, setFitnessProfile] = useState<any>(null);
  const [progressHistory, setProgressHistory] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>(null);
  const [savingPref, setSavingPref] = useState(false);

  // Load member profile data. Each call is wrapped so a single failure
  // does not blank the whole page.
  const loadProfileData = async () => {
    setLoading(true);
    setError(null);

    // Edit form always seeded from auth user so the fields aren't empty.
    setEditData({
      fullName: user?.profile?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dateOfBirth: user?.profile?.dateOfBirth || "",
      gender: user?.profile?.gender || "OTHER",
      address: user?.profile?.address || "",
      bio: user?.profile?.bio || "",
    });

    try {
      const memberResponse = await memberApi.getMemberProfile();
      if (memberResponse.success) {
        const data = memberResponse.data as any;
        setMemberData(data.member || data);
      }
    } catch (err) {
      console.error("member profile load failed", err);
    }

    try {
      const progressResponse = await progressApi.getCurrentMemberProgress();
      if (progressResponse.success) {
        const progressData = progressResponse.data as any;
        setFitnessProfile(progressData.profile ?? progressData);
      }
    } catch (err) {
      console.error("fitness profile load failed", err);
    }

    try {
      const dashResp = (await memberApi.getMyDashboard()) as any;
      if (dashResp.success) {
        setProgressHistory(dashResp.data?.recentWorkouts || []);
      }
    } catch (err) {
      console.error("workout history load failed", err);
    }

    try {
      const prefResponse = await memberApi.getMyPreferences();
      if (prefResponse.success) {
        const prefData = prefResponse.data as any;
        setPreferences(prefData.preferences || prefData);
      }
    } catch (err) {
      console.error("preferences load failed", err);
    }

    setLoading(false);
  };

  // Toggle a notification or privacy preference and persist it
  const handlePreferenceToggle = async (key: string, value: any) => {
    if (!preferences) return;

    // Optimistic update
    const previous = preferences;
    setPreferences({ ...preferences, [key]: value });
    setSavingPref(true);

    try {
      const response = await memberApi.updateMyPreferences({ [key]: value });
      if (response.success) {
        const prefData = response.data as any;
        setPreferences(prefData.preferences || prefData);
      }
    } catch (err: any) {
      // Revert on failure
      setPreferences(previous);
      setError(
        "Failed to update preference: " + (err.message || "Unknown error"),
      );
    } finally {
      setSavingPref(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Update profile via API
      const response = await authApi.updateProfile(editData);

      if (response.success) {
        // Update user context with new data
        const respData = response.data as any;
        setUser(respData.user);
        setIsEditing(false);
        // Reload profile data to get updated info
        await loadProfileData();
      }
    } catch (err: any) {
      setError("Failed to update profile: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data
    setEditData({
      fullName: user?.profile?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dateOfBirth: user?.profile?.dateOfBirth || "",
      gender: user?.profile?.gender || "OTHER",
      address: user?.profile?.address || "",
      bio: user?.profile?.bio || "",
    });
    setIsEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Container maxWidth="lg">
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Profile Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={user?.profile?.avatarUrl}
                  sx={{ width: 120, height: 120 }}
                >
                  {user?.profile?.fullName?.charAt(0) || "M"}
                </Avatar>
                <IconButton
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                  size="small"
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                {user?.profile?.fullName}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                <Chip
                  label={`Member ID: ${memberData?.memberCode || "Loading..."}`}
                  color="primary"
                />
                <Chip
                  label={memberData?.membershipStatus || "Loading..."}
                  color="success"
                />
                <Chip
                  label={fitnessProfile?.trainingLevel || "BEGINNER"}
                  color="info"
                />
              </Box>
              <Typography variant="body1" color="text.secondary">
                Member since:{" "}
                {memberData?.joinDate
                  ? new Date(memberData.joinDate).toLocaleDateString()
                  : "Loading..."}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Assigned Trainer:{" "}
                {memberData?.assignedTrainer?.user?.profile?.fullName ||
                  "Not assigned"}
              </Typography>
            </Grid>
            <Grid item>
              {!isEditing ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<Person />} label="Personal Info" />
            <Tab icon={<FitnessCenter />} label="Fitness Profile" />
            <Tab icon={<Timeline />} label="Progress History" />
            <Tab icon={<Security />} label="Settings" />
          </Tabs>
        </Box>

        {/* Personal Information Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3} p={4}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={editData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={editData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={editData.gender}
                      label="Gender"
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                    >
                      <MenuItem value="MALE">Male</MenuItem>
                      <MenuItem value="FEMALE">Female</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={editData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    disabled={!isEditing}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={2}
                    value={editData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    multiline
                    rows={3}
                    value={editData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Emergency Contact
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {fitnessProfile?.emergencyContactName || "Not provided"}
                  </Typography>
                  <Typography variant="body2">
                    Phone:{" "}
                    {fitnessProfile?.emergencyContactPhone || "Not provided"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Fitness Profile Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3} p={4}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Current Body Metrics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
                    <Typography
                      variant="h4"
                      color="primary.main"
                      fontWeight={700}
                    >
                      {fitnessProfile?.heightCm || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Height (cm)
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
                    <Typography
                      variant="h4"
                      color="success.main"
                      fontWeight={700}
                    >
                      {fitnessProfile?.weightKg || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Weight (kg)
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
                    <Typography
                      variant="h4"
                      color="warning.main"
                      fontWeight={700}
                    >
                      {fitnessProfile?.bmi || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      BMI
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
                    <Typography variant="h4" color="info.main" fontWeight={700}>
                      {fitnessProfile?.bodyFatPercent || "N/A"}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Body Fat
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }} fontWeight={600}>
                Fitness Goals & Health Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Fitness Goal"
                    value={fitnessProfile?.fitnessGoal || ""}
                    multiline
                    rows={2}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Health Condition"
                    value={fitnessProfile?.healthCondition || ""}
                    multiline
                    rows={2}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Medical Notes"
                    value={fitnessProfile?.medicalNote || ""}
                    multiline
                    rows={2}
                    disabled
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Body Metrics
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  {(() => {
                    const heightCm = fitnessProfile?.heightCm ?? null;
                    const weightKg = fitnessProfile?.weightKg ?? null;
                    const bmi =
                      heightCm && weightKg
                        ? Math.round((weightKg / (heightCm / 100) ** 2) * 10) /
                          10
                        : null;
                    return (
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Height
                          </Typography>
                          <Typography variant="h6">
                            {heightCm ? `${heightCm} cm` : "—"}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Weight
                          </Typography>
                          <Typography variant="h6">
                            {weightKg ? `${weightKg} kg` : "—"}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            BMI
                          </Typography>
                          <Typography variant="h6">
                            {bmi !== null ? bmi : "—"}
                          </Typography>
                        </Grid>
                      </Grid>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Progress History Tab */}
        <TabPanel value={tabValue} index={2}>
          <div style={{ padding: 16 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Recent Workout History
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Exercise</TableCell>
                    <TableCell align="right">Sets</TableCell>
                    <TableCell align="right">Reps</TableCell>
                    <TableCell align="right">Weight (kg)</TableCell>
                    <TableCell align="right">Calories</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {progressHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">
                          No workout history yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    progressHistory.map((row: any) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          {row.workoutDate
                            ? new Date(row.workoutDate).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {row.exercise?.name || row.exerciseName || "-"}
                        </TableCell>
                        <TableCell align="right">
                          {row.setsCompleted ?? "-"}
                        </TableCell>
                        <TableCell align="right">
                          {row.repsCompleted ?? "-"}
                        </TableCell>
                        <TableCell align="right">
                          {row.weightUsedKg ?? "-"}
                        </TableCell>
                        <TableCell align="right">
                          {row.caloriesBurned ?? "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom fontWeight={600} p={4}>
            Account Settings
          </Typography>

          {!preferences ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3} p={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  <Notifications sx={{ mr: 1, verticalAlign: "middle" }} />
                  Notification Preferences
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    {NOTIFICATION_PREFS.map(({ key, label }) => (
                      <Box
                        key={key}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2">{label}</Typography>
                        <Switch
                          checked={!!preferences[key]}
                          onChange={(e) =>
                            handlePreferenceToggle(key, e.target.checked)
                          }
                          disabled={savingPref}
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  <Security sx={{ mr: 1, verticalAlign: "middle" }} />
                  Privacy Settings
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    {/* Profile visibility select */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Profile Visibility
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={
                            preferences.profileVisibility || "MEMBERS_ONLY"
                          }
                          onChange={(e) =>
                            handlePreferenceToggle(
                              "profileVisibility",
                              e.target.value,
                            )
                          }
                          disabled={savingPref}
                        >
                          <MenuItem value="PUBLIC">Public</MenuItem>
                          <MenuItem value="MEMBERS_ONLY">Members Only</MenuItem>
                          <MenuItem value="PRIVATE">Private</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    {PRIVACY_PREFS.map(({ key, label }) => (
                      <Box
                        key={key}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2">{label}</Typography>
                        <Switch
                          checked={!!preferences[key]}
                          onChange={(e) =>
                            handlePreferenceToggle(key, e.target.checked)
                          }
                          disabled={savingPref}
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>
      </Card>
    </Container>
  );
};

export default MemberProfile;
