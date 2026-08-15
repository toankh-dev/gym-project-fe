import axios, { AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse } from '../types';

// Create axios instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gym_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      const refreshToken = localStorage.getItem('gym_refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/refresh`, {
            refreshToken
          });

          const { tokens } = response.data.data;
          localStorage.setItem('gym_token', tokens.accessToken);
          localStorage.setItem('gym_refresh_token', tokens.refreshToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('gym_token');
          localStorage.removeItem('gym_refresh_token');
          localStorage.removeItem('gym_user');
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem('gym_token');
        localStorage.removeItem('gym_user');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

// API service class
export class ApiService {
  // Generic GET request
  static async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await apiClient.get(url, { params });
    return response.data;
  }

  // Generic POST request
  static async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await apiClient.post(url, data);
    return response.data;
  }

  // Generic PUT request
  static async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await apiClient.put(url, data);
    return response.data;
  }

  // Generic DELETE request
  static async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await apiClient.delete(url);
    return response.data;
  }

  // GET with pagination
  static async getPaginated<T>(url: string, params?: any): Promise<PaginatedResponse<T>> {
    const response = await apiClient.get(url, { params });
    return response.data;
  }

  // File upload
  static async upload(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    });

    return response.data;
  }
}

// Auth API endpoints
export const authApi = {
  login: (email: string, password: string) =>
    ApiService.post('/auth/login', { email, password }),

  register: (userData: any) =>
    ApiService.post('/auth/register', userData),

  logout: () =>
    ApiService.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    ApiService.post('/auth/refresh', { refreshToken }),

  forgotPassword: (email: string) =>
    ApiService.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string, confirmPassword: string) =>
    ApiService.post('/auth/reset-password', { token, password, confirmPassword }),

  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) =>
    ApiService.post('/auth/change-password', { currentPassword, newPassword, confirmPassword }),

  getProfile: () =>
    ApiService.get('/auth/profile'),

  updateProfile: (profileData: any) =>
    ApiService.put('/auth/profile', profileData)
};

// Member API endpoints
export const memberApi = {
  getMembers: (params?: any) =>
    ApiService.getPaginated('/members', params),

  getMemberById: (id: number) =>
    ApiService.get(`/members/${id}`),

  getMemberByCode: (memberCode: string) =>
    ApiService.get(`/members/code/${memberCode}`),

  getCurrentMember: () =>
    ApiService.get('/members/me'),

  getMemberProfile: () =>
    ApiService.get('/members/me'),

  createMember: (memberData: any) =>
    ApiService.post('/members', memberData),

  updateMember: (id: number, memberData: any) =>
    ApiService.put(`/members/${id}`, memberData),

  deleteMember: (id: number) =>
    ApiService.delete(`/members/${id}`),

  getMemberStatistics: () =>
    ApiService.get('/members/statistics'),

  assignTrainer: (id: number, trainerId: number) =>
    ApiService.put(`/members/${id}/assign-trainer`, { trainerId }),

  removeTrainer: (id: number) =>
    ApiService.delete(`/members/${id}/trainer`),

  getMembersByTrainer: (trainerId: number, params?: any) =>
    ApiService.getPaginated(`/members/trainer/${trainerId}`, params),

  getMyPreferences: () =>
    ApiService.get('/members/me/preferences'),

  updateMyPreferences: (preferences: any) =>
    ApiService.put('/members/me/preferences', preferences),

  getMyDashboard: () =>
    ApiService.get('/members/me/dashboard'),

  getMySchedules: (params?: any) =>
    ApiService.get('/members/me/schedules', params),

  getMyAttendance: (params?: any) =>
    ApiService.get('/members/me/attendance', params),

  getMyPayments: (params?: any) =>
    ApiService.get('/members/me/payments', params),

  bookSchedule: (scheduleId: number) =>
    ApiService.post(`/members/me/schedules/${scheduleId}/book`),

  cancelBooking: (scheduleId: number) =>
    ApiService.delete(`/members/me/schedules/${scheduleId}/booking`)
};

// Trainer API endpoints
export const trainerApi = {
  getTrainers: (params?: any) =>
    ApiService.getPaginated('/trainers', params),

  getActiveTrainers: (params?: any) =>
    ApiService.get('/trainers/active', params),

  getTrainerById: (id: number) =>
    ApiService.get(`/trainers/${id}`),

  getTrainerByCode: (trainerCode: string) =>
    ApiService.get(`/trainers/code/${trainerCode}`),

  getCurrentTrainer: () =>
    ApiService.get('/trainers/me'),

  getMyDashboard: () =>
    ApiService.get('/trainers/me/dashboard'),

  getMyMembers: (params?: any) =>
    ApiService.get('/trainers/me/members', params),

  getMyMemberSessions: (params?: any) =>
    ApiService.get('/trainers/me/member-sessions', params),

  createTrainer: (trainerData: any) =>
    ApiService.post('/trainers', trainerData),

  updateTrainer: (id: number, trainerData: any) =>
    ApiService.put(`/trainers/${id}`, trainerData),

  deleteTrainer: (id: number) =>
    ApiService.delete(`/trainers/${id}`),

  getTrainerStatistics: () =>
    ApiService.get('/trainers/statistics'),

  getTrainerMembers: (id: number, params?: any) =>
    ApiService.getPaginated(`/trainers/${id}/members`, params),

  getSpecializations: () =>
    ApiService.get('/trainers/specializations'),

  createSpecialization: (specializationData: any) =>
    ApiService.post('/trainers/specializations', specializationData),

  updateSpecialization: (id: number, specializationData: any) =>
    ApiService.put(`/trainers/specializations/${id}`, specializationData)
};

// Package API endpoints
export const packageApi = {
  getPackages: (params?: any) =>
    ApiService.get('/packages', params),

  getActivePackages: () =>
    ApiService.get('/packages/active'),

  getPackageById: (id: number) =>
    ApiService.get(`/packages/${id}`),

  createPackage: (packageData: any) =>
    ApiService.post('/packages', packageData),

  updatePackage: (id: number, packageData: any) =>
    ApiService.put(`/packages/${id}`, packageData),

  deletePackage: (id: number) =>
    ApiService.delete(`/packages/${id}`)
};

// Analytics API endpoints
export const analyticsApi = {
  getDashboardStats: () =>
    ApiService.get('/analytics/dashboard'),

  getRevenueStats: (params?: any) =>
    ApiService.get('/analytics/revenue', params),

  getAttendanceStats: (params?: any) =>
    ApiService.get('/analytics/attendance', params),

  getMemberGrowthStats: (params?: any) =>
    ApiService.get('/analytics/member-growth', params),

  getTrainerPerformanceStats: (params?: any) =>
    ApiService.get('/analytics/trainer-performance', params)
};

// User API endpoints
export const userApi = {
  getUsers: (params?: any) =>
    ApiService.getPaginated('/users', params),

  getUserById: (id: number) =>
    ApiService.get(`/users/${id}`),

  updateUserStatus: (id: number, status: string) =>
    ApiService.put(`/users/${id}/status`, { status }),

  getUserStatistics: () =>
    ApiService.get('/users/statistics'),

  createStaff: (staffData: any) =>
    ApiService.post('/users/staff', staffData)
};

// Upload API endpoints
export const uploadApi = {
  uploadFile: (file: File, onProgress?: (progress: number) => void) =>
    ApiService.upload('/uploads', file, onProgress),

  uploadAvatar: (file: File, onProgress?: (progress: number) => void) =>
    ApiService.upload('/uploads/avatar', file, onProgress)
};

// Schedule API endpoints
export const scheduleApi = {
  // Training Schedule endpoints
  createTrainingSchedule: (scheduleData: any) =>
    ApiService.post('/schedules/training-schedules', scheduleData),

  getTrainingSchedules: (params?: any) =>
    ApiService.getPaginated('/schedules/training-schedules', params),

  getUpcomingSchedules: (limit?: number) =>
    ApiService.get('/schedules/training-schedules/upcoming', limit ? { limit } : {}),

  getSchedulesByDate: (date: string) =>
    ApiService.get(`/schedules/training-schedules/date/${date}`),

  getTrainerSchedules: (trainerId: number, params?: any) =>
    ApiService.get(`/schedules/training-schedules/trainer/${trainerId}`, params),

  getTrainingScheduleById: (id: number) =>
    ApiService.get(`/schedules/training-schedules/${id}`),

  updateTrainingSchedule: (id: number, scheduleData: any) =>
    ApiService.put(`/schedules/training-schedules/${id}`, scheduleData),

  cancelTrainingSchedule: (id: number) =>
    ApiService.delete(`/schedules/training-schedules/${id}`),

  // Member Registration endpoints
  registerForSchedule: (scheduleId: number, memberId: number) =>
    ApiService.post(`/schedules/training-schedules/${scheduleId}/register`, { memberId }),

  cancelScheduleRegistration: (scheduleId: number, memberId: number) =>
    ApiService.delete(`/schedules/training-schedules/${scheduleId}/members/${memberId}`),

  // Attendance endpoints
  checkInMember: (memberData: any) =>
    ApiService.post('/schedules/attendance/check-in', memberData),

  checkOutMember: (memberId: number, note?: string) =>
    ApiService.put(`/schedules/attendance/check-out/${memberId}`, { note }),

  getAttendanceLogs: (params?: any) =>
    ApiService.getPaginated('/schedules/attendance/logs', params),

  getTodayAttendance: () =>
    ApiService.get('/schedules/attendance/today'),

  getAttendanceStatistics: (startDate: string, endDate: string) =>
    ApiService.get('/schedules/attendance/statistics', { startDate, endDate }),

  // Member-specific schedule endpoints
  getMemberSchedules: (memberId: number, params?: any) =>
    ApiService.get(`/schedules/member/${memberId}/schedules`, params),

  getMemberAttendance: (memberId: number, params?: any) =>
    ApiService.get(`/schedules/member/${memberId}/attendance`, params),

  // Trainer-specific schedule endpoints
  getMyTrainerSchedules: (params?: any) =>
    ApiService.get('/schedules/trainer/my-schedules', params),

  updateScheduleStatus: (scheduleId: number, status: string) =>
    ApiService.put(`/schedules/training-schedules/${scheduleId}/status`, { status })
};

// Subscription Management APIs
export const subscriptionApi = {
  // Admin/Staff endpoints
  getSubscriptions: (params?: any) =>
    ApiService.getPaginated('/subscriptions', params),

  getSubscriptionById: (id: number) =>
    ApiService.get(`/subscriptions/${id}`),

  createSubscription: (subscriptionData: any) =>
    ApiService.post('/subscriptions', subscriptionData),

  updateSubscription: (id: number, updates: any) =>
    ApiService.put(`/subscriptions/${id}`, updates),

  cancelSubscription: (id: number, reason?: string) =>
    ApiService.put(`/subscriptions/${id}/cancel`, { reason }),

  renewSubscription: (id: number, renewalData: any) =>
    ApiService.post(`/subscriptions/${id}/renew`, renewalData),

  getSubscriptionStatistics: (params?: any) =>
    ApiService.get('/subscriptions/statistics', params),

  // Member endpoints
  getMemberSubscriptions: (memberId: number, includeExpired?: boolean) =>
    ApiService.get(`/subscriptions/member/${memberId}`, { includeExpired }),

  getCurrentMemberSubscription: () =>
    ApiService.get('/subscriptions/my/current'),

  // Member self-service subscription
  subscribeToPlan: (subscriptionData: any) =>
    ApiService.post('/subscriptions', subscriptionData),

  paySubscription: (id: number, paymentData?: any) =>
    ApiService.post(`/subscriptions/${id}/pay`, paymentData || {})
};

// Payment API endpoints
export const paymentApi = {
  // Get all payments with filters and pagination
  getPayments: (params?: string) =>
    ApiService.getPaginated(`/payments${params || ''}`),

  // Get payment by ID
  getPaymentById: (id: number) =>
    ApiService.get(`/payments/${id}`),

  // Create new payment
  createPayment: (paymentData: any) =>
    ApiService.post('/payments', paymentData),

  // Update payment status
  updateStatus: (id: number, statusData: any) =>
    ApiService.put(`/payments/${id}/status`, statusData),

  // Get member payments
  getMemberPayments: (memberId: number, params?: any) =>
    ApiService.getPaginated(`/payments/member/${memberId}`, params),

  // Get current member's payments
  getMyPayments: (params?: any) =>
    ApiService.get('/payments/my-payments', params),

  // Get payment statistics
  getStatistics: (params?: any) =>
    ApiService.get('/payments/statistics', params),

  // Simulate payment (for testing)
  simulatePayment: (simulationData: any) =>
    ApiService.post('/payments/simulate', simulationData),

  // Process subscription payment
  processSubscriptionPayment: (paymentData: any) =>
    ApiService.post('/payments/subscription/process', paymentData)
};

// Progress API endpoints
export const progressApi = {
  // Member progress management
  getCurrentMemberProgress: () =>
    ApiService.get('/progress/my/current'),

  updateMemberProgress: (progressData: any) =>
    ApiService.put('/progress/my-progress', progressData),

  getMemberProgress: (memberId: number) =>
    ApiService.get(`/progress/member/${memberId}`),

  updateMemberProgressByAdmin: (memberId: number, progressData: any) =>
    ApiService.put(`/progress/member/${memberId}`, progressData),

  // Workout logging
  logWorkout: (workoutData: any) =>
    ApiService.post('/progress/workout-log', workoutData),

  getWorkoutHistory: (params?: any) =>
    ApiService.get('/progress/workout-history', params),

  getMemberWorkoutHistory: (memberId: number, params?: any) =>
    ApiService.get(`/progress/member/${memberId}/workout-history`, params),

  // Statistics and insights
  getProgressStatistics: (period?: string) =>
    ApiService.get('/progress/statistics', period ? { period } : {}),

  getMemberProgressStats: (memberId: number) =>
    ApiService.get(`/progress/member/${memberId}/statistics`),

  getWorkoutAnalytics: (params?: any) =>
    ApiService.get('/progress/workout-analytics', params),

  // Exercise management
  getExercises: (params?: any) =>
    ApiService.get('/progress/exercises', params),

  getExerciseById: (id: number) =>
    ApiService.get(`/progress/exercises/${id}`),

  createExercise: (exerciseData: any) =>
    ApiService.post('/progress/exercises', exerciseData),

  updateExercise: (id: number, exerciseData: any) =>
    ApiService.put(`/progress/exercises/${id}`, exerciseData),

  deleteExercise: (id: number) =>
    ApiService.delete(`/progress/exercises/${id}`)
};

// Health check
export const healthApi = {
  check: () =>
    ApiService.get('/health')
};

// Dashboard API
export const dashboardApi = {
  getDashboard: () => ApiService.get('/dashboard'),
};

// Reports APIs
export const reportApi = {
  getRevenue: (months = 12) => ApiService.get('/reports/revenue', { months }),
  getMembership: (months = 12) => ApiService.get('/reports/membership', { months }),
  getAttendance: (days = 30) => ApiService.get('/reports/attendance', { days }),
  getTrainerPerformance: () => ApiService.get('/reports/trainer-performance'),
  getScheduleAnalytics: () => ApiService.get('/reports/schedule-analytics'),
};

export const workoutPlanApi = {
  getPlans: (params?: any) => ApiService.getPaginated('/workout-plans', params),
  getPlanById: (id: number) => ApiService.get(`/workout-plans/${id}`),
  createPlan: (data: any) => ApiService.post('/workout-plans', data),
  updatePlan: (id: number, data: any) => ApiService.put(`/workout-plans/${id}`, data),
  deletePlan: (id: number) => ApiService.delete(`/workout-plans/${id}`),
};

export const exerciseApi = {
  getExercises: (params?: any) => ApiService.get('/exercises', params),
};

export default apiClient;