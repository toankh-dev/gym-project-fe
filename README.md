# GymFit Pro - Gym Management System

A comprehensive gym management system built with React TypeScript and Material-UI.

## 🚀 Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Demo Accounts

Use these credentials to test different user roles:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gym.com | password |
| Trainer | trainer@gym.com | password |
| Member | member@gym.com | password |

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components
│   ├── forms/          # Form components
│   ├── tables/         # Table components
│   └── charts/         # Chart components
├── contexts/           # React contexts (Auth, Theme, etc.)
├── hooks/              # Custom React hooks
├── layouts/            # Layout components
│   ├── PublicLayout.tsx
│   ├── AuthLayout.tsx
│   └── DashboardLayout.tsx
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── public/         # Public pages
│   ├── member/         # Member dashboard pages
│   ├── trainer/        # Trainer dashboard pages
│   └── admin/          # Admin dashboard pages
├── services/           # API services
├── theme/              # Material-UI theme configuration
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🎨 Features

### ✅ Completed Features
- [x] Authentication system with role-based access
- [x] Responsive layouts for all screen sizes
- [x] Material-UI design system
- [x] Multi-role dashboard navigation
- [x] TypeScript type safety

### 🚧 Work In Progress
- [ ] Member management system
- [ ] Trainer scheduling system
- [ ] Payment processing
- [ ] Progress tracking
- [ ] Admin analytics dashboard

## 🔐 User Roles & Permissions

### Member
- View personal dashboard
- Manage profile and subscription
- Book training sessions
- Track fitness progress
- Check attendance history

### Trainer
- Manage assigned members
- Create workout plans
- Schedule training sessions
- Track member progress

### Admin/Staff
- Manage all users (members, trainers, staff)
- Manage membership packages
- Process payments
- Generate reports and analytics
- System configuration

## 🎨 Design System

### Color Palette
- **Primary**: Orange (#FF6B35) - Energetic gym theme
- **Secondary**: Dark Blue-Gray (#2E3440) - Professional contrast
- **Success**: Green (#4CAF50)
- **Error**: Red (#F44336)
- **Warning**: Orange (#FF9800)

### Role-Specific Colors
- **Admin**: Purple (#9C27B0)
- **Staff**: Blue (#2196F3)
- **Trainer**: Green (#4CAF50)
- **Member**: Orange (#FF6B35)

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🛠️ Technology Stack

### Frontend
- **React** 18.2+ - UI library
- **TypeScript** - Type safety
- **Material-UI (MUI)** 5.11+ - Design system
- **React Router** 6.8+ - Routing
- **React Hook Form** - Form handling
- **Recharts** - Data visualization

### Development Tools
- **React Scripts** - Build tools
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🔄 Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## 📊 Development Status

**Current Progress: 40% Complete**

- [x] Project setup and architecture
- [x] Authentication system
- [x] Layout components and routing
- [x] TypeScript type definitions
- [x] Material-UI theme setup
- [ ] Database integration (Backend)
- [ ] API development (Backend)
- [ ] Feature implementation
- [ ] Testing and deployment

## 🚀 Next Steps

1. **Backend Development**
   - Setup Node.js/Express server
   - Implement JWT authentication
   - Create REST API endpoints
   - Connect to MySQL database

2. **Feature Development**
   - Member dashboard functionality
   - Trainer management system
   - Admin analytics and reports
   - Payment processing simulation

3. **Testing & Deployment**
   - Unit and integration tests
   - Production deployment
   - Performance optimization

## 📝 License

This project is for educational purposes as part of the Web Programming course at Posts and Telecommunications Institute of Technology.

---

**GymFit Pro** - Your fitness journey starts here! 🏋️‍♂️💪