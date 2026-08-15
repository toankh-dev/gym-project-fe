import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on app start
    const loadUserFromStorage = () => {
      try {
        const savedUser = localStorage.getItem('gym_user');
        const savedToken = localStorage.getItem('gym_token');

        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          // Verify token is still valid by checking profile
          authApi.getProfile()
            .then((response) => {
              if (response.success) {
                setUser((response.data as any)?.user);
                localStorage.setItem('gym_user', JSON.stringify((response.data as any)?.user));
              }
            })
            .catch(() => {
              // Token is invalid, clear storage
              localStorage.removeItem('gym_user');
              localStorage.removeItem('gym_token');
              localStorage.removeItem('gym_refresh_token');
              setUser(null);
            });
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
        localStorage.removeItem('gym_user');
        localStorage.removeItem('gym_token');
        localStorage.removeItem('gym_refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await authApi.login(email, password);
      console.log("response::: ", response)
      if (response.success && response.data) {
        const { user, tokens } = response.data as any;

        setUser(user);
        localStorage.setItem('gym_user', JSON.stringify(user));
        localStorage.setItem('gym_token', tokens.accessToken);
        localStorage.setItem('gym_refresh_token', tokens.refreshToken);
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Login failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout API to blacklist token
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call result
      setUser(null);
      localStorage.removeItem('gym_user');
      localStorage.removeItem('gym_token');
      localStorage.removeItem('gym_refresh_token');
    }
  };

  const register = async (userData: any): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await authApi.register(userData);

      if (response.success && response.data) {
        const { user, tokens } = response.data as any;

        setUser(user);
        localStorage.setItem('gym_user', JSON.stringify(user));
        localStorage.setItem('gym_token', tokens.accessToken);
        localStorage.setItem('gym_refresh_token', tokens.refreshToken);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Registration failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};