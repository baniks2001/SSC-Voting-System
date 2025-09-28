// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../utils/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, isAdmin?: boolean) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isPollMonitor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (emailOrStudentId: string, password: string, isAdmin = false) => {
    try {
      const endpoint = isAdmin ? '/auth/admin/login' : '/auth/voter/login';
      const payload = isAdmin 
        ? { email: emailOrStudentId, password }
        : { studentId: emailOrStudentId, password };

      const response = await api.post(endpoint, payload);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Check if current user is a poll monitor
  const isPollMonitor = user?.role === 'poll_monitor';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
        isPollMonitor
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};