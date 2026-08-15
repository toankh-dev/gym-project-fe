// User & Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  role: Role;
  profile: UserProfile;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Role {
  id: number;
  name: 'ADMIN' | 'STAFF' | 'TRAINER' | 'MEMBER';
  description: string;
}

export interface UserProfile {
  id: number;
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  avatarUrl?: string;
  address?: string;
  bio?: string;
}

// Member Types
export interface Member {
  id: number;
  user: User;
  memberCode: string;
  joinDate: string;
  membershipStatus: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';
  currentSubscription?: Subscription;
  subscriptions?: Subscription[];
  assignedTrainerId?: number;
  assignedTrainer?: Trainer;
  profile: MemberProfile;
  note?: string;
}

export interface MemberProfile {
  id: number;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  bodyFatPercent?: number;
  muscleMassKg?: number;
  fitnessGoal?: string;
  trainingLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  healthCondition?: string;
  medicalNote?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

// Trainer Types
export interface Trainer {
  id: number;
  user: User;
  trainerCode: string;
  experienceYears: number;
  ratingAvg: number;
  status: 'ACTIVE' | 'INACTIVE';
  profile: TrainerProfile;
  specializations: Specialization[];
}

export interface TrainerProfile {
  id: number;
  certificate?: string;
  certificatesDetail?: string;
  education?: string;
  skills?: string;
  workExperience?: string;
  introduction?: string;
  trainingPhilosophy?: string;
  achievements?: string;
  availableTime?: string;
  facebookUrl?: string;
  instagramUrl?: string;
}

export interface Specialization {
  id: number;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

// Package & Subscription Types
export interface MembershipPackage {
  id: number;
  name: string;
  durationMonths: number;
  price: number;
  description?: string;
  benefits?: string;
  maxSessions?: number;
  allowTrainer: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Subscription {
  id: number;
  member: Member;
  package: MembershipPackage;
  startDate: string;
  endDate: string;
  actualPrice: number;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  renewalReminderSent: boolean;
  registeredBy?: User;
}

// Schedule Types
export interface TrainingSchedule {
  id: number;
  title: string;
  trainer: Trainer;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  room?: string;
  maxMembers: number;
  scheduleType: 'PERSONAL' | 'GROUP';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  description?: string;
  registeredMembers: ScheduleMember[];
}

export interface ScheduleMember {
  id: number;
  schedule: TrainingSchedule;
  member: Member;
  status: 'REGISTERED' | 'ATTENDED' | 'ABSENT' | 'CANCELLED';
  registeredAt: string;
}

// Payment Types
export interface Payment {
  id: number;
  paymentCode: string;
  member: Member;
  subscription?: Subscription;
  paymentMethod: string;
  amount: number;
  paymentDate: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  transactionRef?: string;
  note?: string;
  createdBy?: User;
}

// Exercise & Workout Types
export interface Exercise {
  id: number;
  name: string;
  muscleGroup?: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  description?: string;
  instruction?: string;
  videoUrl?: string;
  imageUrl?: string;
}

export interface WorkoutPlan {
  id: number;
  member: Member;
  trainer: Trainer;
  title: string;
  goal?: string;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  description?: string;
  exercises: WorkoutPlanExercise[];
}

export interface WorkoutPlanExercise {
  id: number;
  exercise: Exercise;
  dayOfWeek?: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  sets?: number;
  reps?: number;
  durationMinutes?: number;
  restSeconds?: number;
  note?: string;
  orderIndex: number;
}

// Progress Types
export interface WorkoutProgressLog {
  id: number;
  member: Member;
  trainer?: Trainer;
  workoutPlan?: WorkoutPlan;
  logDate: string;
  weightKg?: number;
  bmi?: number;
  bodyFatPercent?: number;
  muscleMassKg?: number;
  completedExercises: number;
  totalExercises: number;
  caloriesBurned?: number;
  performanceNote?: string;
  trainerNote?: string;
  memberNote?: string;
}

// Attendance Types
export interface AttendanceLog {
  id: number;
  member: Member;
  schedule?: TrainingSchedule;
  checkinTime: string;
  checkoutTime?: string;
  attendanceType: 'ONLINE' | 'OFFLINE';
  status: 'CHECKED_IN' | 'CHECKED_OUT' | 'ABSENT';
  note?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}

// Dashboard Stats Types
export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalTrainers: number;
  monthlyRevenue: number;
  todayAttendance: number;
  pendingPayments: number;
}

export interface RevenueChart {
  month: string;
  revenue: number;
  newMembers: number;
}