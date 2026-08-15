import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import PackagesPage from './pages/public/PackagesPage';
import TrainersPage from './pages/public/TrainersPage';
import ContactPage from './pages/public/ContactPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Member Pages
import MemberDashboard from './pages/member/MemberDashboard';
import MemberProfile from './pages/member/MemberProfile';
import MemberSchedules from './pages/member/MemberSchedules';
import MemberProgress from './pages/member/MemberProgress';
import MemberSubscription from './pages/member/MemberSubscription';
import MemberAttendance from './pages/member/MemberAttendance';

// Trainer Pages
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import TrainerProfile from './pages/trainer/TrainerProfile';
import TrainerMembers from './pages/trainer/TrainerMembers';
import TrainerSchedules from './pages/trainer/TrainerSchedules';
import TrainerWorkouts from './pages/trainer/TrainerWorkouts';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMembers from './pages/admin/AdminMembers';
import AdminTrainers from './pages/admin/AdminTrainers';
import AdminStaff from './pages/admin/AdminStaff';
import AdminPackages from './pages/admin/AdminPackages';
import AdminSchedules from './pages/admin/AdminSchedules';
import AdminPayments from './pages/admin/AdminPayments';
import AdminReports from './pages/admin/AdminReports';
import AdminProfile from './pages/admin/AdminProfile';

// Layout Components
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="packages" element={<PackagesPage />} />
                <Route path="trainers" element={<TrainersPage />} />
                <Route path="contact" element={<ContactPage />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route index element={<Navigate to="/auth/login" replace />} />
              </Route>

              {/* Member Dashboard Routes */}
              <Route path="/member" element={
                <ProtectedRoute allowedRoles={['MEMBER']}>
                  <DashboardLayout userRole="MEMBER" />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/member/dashboard" replace />} />
                <Route path="dashboard" element={<MemberDashboard />} />
                <Route path="profile" element={<MemberProfile />} />
                <Route path="schedules" element={<MemberSchedules />} />
                <Route path="progress" element={<MemberProgress />} />
                <Route path="subscription" element={<MemberSubscription />} />
                <Route path="attendance" element={<MemberAttendance />} />
              </Route>

              {/* Trainer Dashboard Routes */}
              <Route path="/trainer" element={
                <ProtectedRoute allowedRoles={['TRAINER']}>
                  <DashboardLayout userRole="TRAINER" />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/trainer/dashboard" replace />} />
                <Route path="dashboard" element={<TrainerDashboard />} />
                <Route path="profile" element={<TrainerProfile />} />
                <Route path="members" element={<TrainerMembers />} />
                <Route path="schedules" element={<TrainerSchedules />} />
                <Route path="workouts" element={<TrainerWorkouts />} />
              </Route>

              {/* Admin Dashboard Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <DashboardLayout userRole="ADMIN" />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="members" element={<AdminMembers />} />
                <Route path="trainers" element={<AdminTrainers />} />
                <Route path="staff" element={<AdminStaff />} />
                <Route path="packages" element={<AdminPackages />} />
                <Route path="schedules" element={<AdminSchedules />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="reports" element={<AdminReports />} />
              </Route>

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;