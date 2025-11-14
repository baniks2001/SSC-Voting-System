// contexts/AuthContext.tsx - FIXED VERSION
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../utils/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string, isAdmin?: boolean) => Promise<void>;
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
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      console.log('🔄 Initializing auth:', { 
        hasToken: !!token, 
        hasUserData: !!userData 
      });

      if (token && userData) {
        try {
          const userObj = JSON.parse(userData);
          
          // Verify token is still valid with backend
          try {
            console.log('🔐 Verifying token with backend...');
            const response = await fetch('http://localhost:5000/api/auth/verify', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              console.log('✅ Token verified, setting user');
              setUser(userObj);
            } else {
              console.warn('❌ Token verification failed, clearing auth');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
          } catch (error) {
            console.warn('❌ Token verification failed (network error), clearing auth');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          console.warn('❌ Invalid stored user data, clearing auth');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        console.log('🔐 No stored auth data found');
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (identifier: string, password: string, isAdmin = false) => {
    try {
      setLoading(true);
      console.log(`🔐 Attempting ${isAdmin ? 'admin' : 'voter'} login for:`, identifier);

      let response;
      if (isAdmin) {
        // Admin login
        response = await api.post('/auth/admin/login', {
          email: identifier,
          password: password
        });
      } else {
        // Voter login
        response = await api.post('/auth/voter/login', {
          emailOrStudentId: identifier,
          password: password
        });
      }

      const { token, user: userData } = response;

      console.log('✅ Login response received:', { 
        hasToken: !!token, 
        hasUserData: !!userData,
        userType: userData?.type,
        userRole: userData?.role
      });

      if (!token) {
        throw new Error('No authentication token received from server');
      }

      // Store auth data IMMEDIATELY
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update React state IMMEDIATELY
      setUser(userData);

      console.log(`✅ Login successful: ${userData?.type} ${userData?.email || userData?.studentId}`);
      
      // Verify token was stored correctly
      setTimeout(() => {
        const storedToken = localStorage.getItem('token');
        console.log('🔍 Token storage verification:', {
          stored: !!storedToken,
          length: storedToken?.length,
          matches: storedToken === token
        });
      }, 100);
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Clear any partial auth data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);

      // Provide user-friendly error messages
      if (error.message?.includes('401') || error.message?.includes('Invalid credentials')) {
        throw new Error('Invalid credentials. Please check your login details.');
      } else if (error.message?.includes('404') || error.message?.includes('not found')) {
        throw new Error('Account not found. Please check your login details.');
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the server. Please check your connection.');
      } else {
        throw new Error(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🔐 Logging out...');
    
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset state
    setUser(null);
    
    // Clear API queue
    api.clearQueue();
    
    console.log('✅ Logout completed');
  };

  // Check if current user is a poll monitor
  const isPollMonitor = user?.role === 'poll_monitor';

  // Debug current auth state
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Auth State Updated:', {
        user: user ? { 
          type: user.type, 
          role: user.role, 
          email: user.email,
          id: user.id 
        } : null,
        isAuthenticated: !!user,
        tokenInStorage: !!localStorage.getItem('token')
      });
    }
  }, [user]);

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