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

// Optimized request queue for local development
class LocalRequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private readonly maxConcurrent = 10; // Higher limit for local dev
  private activeRequests = 0;

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.activeRequests++;
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeRequests--;
          this.processQueue();
        }
      });
      
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    // Process multiple requests in parallel up to maxConcurrent
    const batch = [];
    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const request = this.queue.shift();
      if (request) {
        batch.push(request());
      }
    }
    
    // Wait for current batch to complete
    if (batch.length > 0) {
      await Promise.allSettled(batch);
    }
    
    this.processing = false;
    
    // Process next batch if needed
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 10);
    }
  }

  getQueueSize() {
    return this.queue.length;
  }

  getActiveRequests() {
    return this.activeRequests;
  }
}

const requestQueue = new LocalRequestQueue();

// Mock user data generator matching your backend
const createMockUser = (identifier: string, isAdmin: boolean = false) => {
  const baseId = Math.abs(identifier.split('').reduce((a, b) => a + b.charCodeAt(0), 0));
  
  if (isAdmin) {
    return {
      id: baseId,
      email: identifier,
      name: `Local Admin ${identifier.split('@')[0]}`,
      type: 'admin',
      role: identifier.includes('super') ? 'super_admin' : 'admin',
      is_active: true,
      createdAt: new Date().toISOString(),
      hasVoted: false
    };
  }

  // Voter user
  return {
    id: baseId,
    studentId: identifier,
    email: `${identifier}@student.ssc.local`,
    name: `Student ${identifier}`,
    type: 'voter',
    role: 'voter',
    yearLevel: '4th Year',
    course: 'Computer Science',
    is_active: true,
    hasVoted: false,
    createdAt: new Date().toISOString()
  };
};

// Simulated API delay for local development
const simulateApiDelay = () => new Promise(resolve => 
  setTimeout(resolve, Math.random() * 100 + 50) // 50-150ms delay
);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginStats, setLoginStats] = useState({
    totalProcessed: 0,
    queueSize: 0,
    activeRequests: 0
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const userObj = JSON.parse(userData);
          setUser(userObj);
        } catch (error) {
          console.warn('Invalid stored user data, clearing auth');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Update login stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLoginStats({
        totalProcessed: 0, // You can track this if needed
        queueSize: requestQueue.getQueueSize(),
        activeRequests: requestQueue.getActiveRequests()
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const login = async (emailOrStudentId: string, password: string, isAdmin = false) => {
    // For local development, we'll simulate login without hitting rate limits
    return requestQueue.add(async () => {
      try {
        // Simulate API call delay
        await simulateApiDelay();

        // For local development, accept any non-empty password
        if (!password.trim()) {
          throw new Error('Password is required');
        }

        // Create mock response matching your backend structure
        const mockUser = createMockUser(emailOrStudentId, isAdmin);
        
        const mockResponse = {
          user: mockUser,
          token: `mock_jwt_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          message: 'Login successful'
        };

        // Store auth data
        localStorage.setItem('token', mockResponse.token);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        setUser(mockResponse.user);

        console.log(`Local login successful: ${isAdmin ? 'Admin' : 'Voter'}`, mockUser.email || mockUser.studentId);
        
        return mockResponse;
      } catch (error: any) {
        console.error('Local login simulation error:', error);
        
        // Provide user-friendly error messages for local development
        if (!password.trim()) {
          throw new Error('Password is required for local development simulation');
        }
        
        // Simulate occasional random failures for testing
        if (Math.random() < 0.02) { // 2% chance of random failure
          throw new Error('Simulated network error - please try again');
        }
        
        throw new Error(error?.message || 'Login simulation failed');
      }
    });
  };

  const logout = () => {
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset state
    setUser(null);
    setLoading(false);
    
    console.log('Local logout completed');
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
      
      {/* Development Login Stats Indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg z-50 text-xs">
          <div className="space-y-1">
            <div>Queue: {loginStats.queueSize}</div>
            <div>Active: {loginStats.activeRequests}</div>
            <div>Max Concurrent: 10</div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};