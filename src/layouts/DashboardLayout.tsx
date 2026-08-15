import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  FitnessCenter as FitnessCenterIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Group as GroupIcon,
  LocalOffer as LocalOfferIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { roleColors } from '../theme';
import { subscriptionApi } from '../services/api.service';

const drawerWidth = 240;

interface DashboardLayoutProps {
  userRole: Role['name'];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ userRole }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // For MEMBER role: check subscription status to conditionally show Schedules
  useEffect(() => {
    if (userRole !== 'MEMBER') return;
    subscriptionApi.getCurrentMemberSubscription()
      .then((resp: any) => {
        const sub = resp.data?.subscription ?? resp.data;
        setHasActiveSubscription(sub?.status === 'ACTIVE');
      })
      .catch(() => setHasActiveSubscription(false));
  }, [userRole]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleProfileMenuClose();
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        text: 'Dashboard',
        path: `/${userRole.toLowerCase()}/dashboard`,
        icon: <DashboardIcon />,
      },
      {
        text: 'Profile',
        path: `/${userRole.toLowerCase()}/profile`,
        icon: <PersonIcon />,
      },
    ];

    switch (userRole) {
      case 'MEMBER':
        return [
          ...baseItems,
          ...(hasActiveSubscription ? [{
            text: 'My Schedules',
            path: '/member/schedules',
            icon: <ScheduleIcon />,
          }] : []),
          {
            text: 'Progress Tracking',
            path: '/member/progress',
            icon: <TimelineIcon />,
          },
          {
            text: 'Subscription',
            path: '/member/subscription',
            icon: <LocalOfferIcon />,
          },
          {
            text: 'Attendance',
            path: '/member/attendance',
            icon: <CheckCircleIcon />,
          },
        ];

      case 'TRAINER':
        return [
          ...baseItems,
          {
            text: 'My Members',
            path: '/trainer/members',
            icon: <GroupIcon />,
          },
          {
            text: 'Schedules',
            path: '/trainer/schedules',
            icon: <ScheduleIcon />,
          },
          {
            text: 'Workout Plans',
            path: '/trainer/workouts',
            icon: <FitnessCenterIcon />,
          },
        ];

      case 'ADMIN':
      case 'STAFF':
        return [
          ...baseItems,
          {
            text: 'Members',
            path: '/admin/members',
            icon: <PeopleIcon />,
          },
          {
            text: 'Trainers',
            path: '/admin/trainers',
            icon: <FitnessCenterIcon />,
          },
          {
            text: 'Packages',
            path: '/admin/packages',
            icon: <LocalOfferIcon />,
          },
          {
            text: 'Schedules',
            path: '/admin/schedules',
            icon: <ScheduleIcon />,
          },
          {
            text: 'Payments',
            path: '/admin/payments',
            icon: <CreditCardIcon />,
          },
          {
            text: 'Reports',
            path: '/admin/reports',
            icon: <AssessmentIcon />,
          },
        ];

      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();
  const currentRoleColor = roleColors[userRole];

  const drawer = (
    <Box>
      {/* Logo */}
      <Toolbar
        sx={{
          background: `linear-gradient(135deg, ${currentRoleColor.primary} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
        }}
      >
        <FitnessCenterIcon sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap>
          GymFit Pro
        </Typography>
      </Toolbar>

      {/* User Info */}
      <Box sx={{ p: 2, bgcolor: currentRoleColor.background }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={user?.profile?.avatarUrl}
            sx={{ width: 40, height: 40, bgcolor: currentRoleColor.primary }}
          >
            {user?.profile?.fullName?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.profile?.fullName || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {userRole}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ py: 1 }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive}
                sx={{
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: currentRoleColor.background,
                    color: currentRoleColor.primary,
                    '& .MuiListItemIcon-root': {
                      color: currentRoleColor.primary,
                    },
                  },
                  '&:hover': {
                    backgroundColor: `${currentRoleColor.background}80`,
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigationItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>

          {/* Notifications */}
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Profile Menu */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="profile-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => { navigate(`/${userRole.toLowerCase()}/profile`); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          My Profile
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="navigation folders"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;