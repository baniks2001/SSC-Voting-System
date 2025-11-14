import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, Mail, PauseCircle, CheckCircle, UserX, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePoll } from '../../contexts/PollContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface LoginFormProps {
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

type ErrorType = 'general' | 'account_not_found' | 'invalid_password' | 'network' | '';

export const LoginForm: React.FC<LoginFormProps> = ({ isAdmin, onToggleAdmin }) => {
  const [emailOrStudentId, setEmailOrStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState<ErrorType>('');

  const { login } = useAuth();
  const { pollStatus, isLoginEnabled } = usePoll();

  // Error configuration with proper typing
  const errorConfig = {
    account_not_found: {
      icon: <UserX className="w-5 h-5" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      title: 'Account Not Found'
    },
    invalid_password: {
      icon: <AlertCircle className="w-5 h-5" />,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-800',
      title: 'Incorrect Password'
    },
    network: {
      icon: <AlertCircle className="w-5 h-5" />,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
      title: 'Connection Issue'
    },
    general: {
      icon: <AlertCircle className="w-5 h-5" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      title: 'Error'
    }
  } as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error states
    setError('');
    setErrorType('');

    // Prevent login if voting is not active (only for student login)
    if (!isAdmin && !isLoginEnabled) {
      setError('Voting is currently not available. Please try again later.');
      setErrorType('general');
      return;
    }

    if (!emailOrStudentId.trim() || !password.trim()) {
      setError('Please fill in all fields');
      setErrorType('general');
      return;
    }

    // Validate student ID format for voter login
    if (!isAdmin) {
      const studentIdRegex = /^\d{4}-\d{3}$/; // Format: YYYY-NNN
      if (!studentIdRegex.test(emailOrStudentId.trim())) {
        setError('Please enter a valid Student ID (format: YYYY-NNN)');
        setErrorType('general');
        return;
      }
    }

    // Validate email format for admin login
    if (isAdmin) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailOrStudentId.trim())) {
        setError('Please enter a valid email address');
        setErrorType('general');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      await login(emailOrStudentId.trim(), password, isAdmin);
      // Login success - the AuthContext will handle redirection
    } catch (error: unknown) {
      // Handle different types of errors safely
      let errorMessage = 'Login failed. Please try again.';
      let detectedErrorType: ErrorType = 'general';

      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('account not found') || 
            errorMsg.includes('not found') ||
            errorMsg.includes('404') ||
            errorMsg.includes('invalid credentials')) {
          detectedErrorType = 'account_not_found';
          errorMessage = `No ${isAdmin ? 'admin account' : 'student account'} found with this ${isAdmin ? 'email' : 'Student ID'}. Please check your details and try again.`;
        } else if (errorMsg.includes('invalid password') || 
                   errorMsg.includes('401') ||
                   errorMsg.includes('invalid credentials')) {
          detectedErrorType = 'invalid_password';
          errorMessage = 'The password you entered is incorrect. Please try again.';
        } else if (errorMsg.includes('network error') || 
                   errorMsg.includes('failed to fetch') ||
                   errorMsg.includes('connection') ||
                   errorMsg.includes('timeout')) {
          detectedErrorType = 'network';
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (errorMsg.includes('inactive')) {
          detectedErrorType = 'general';
          errorMessage = 'Your account is currently inactive. Please contact an administrator.';
        } else {
          // Use the actual error message if available
          errorMessage = error.message || errorMessage;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String((error as any).message);
      }

      setErrorType(detectedErrorType);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    switch (pollStatus) {
      case 'paused':
        return {
          message: 'Voting is currently paused',
          icon: <PauseCircle className="w-6 h-6 text-yellow-600" />,
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
        };
      case 'finished':
        return {
          message: 'Voting has ended',
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          color: 'bg-green-50 border-green-200 text-green-800'
        };
      case 'not_started':
        return {
          message: 'Voting has not started yet',
          icon: <PauseCircle className="w-6 h-6 text-gray-600" />,
          color: 'bg-gray-50 border-gray-200 text-gray-800'
        };
      default:
        return null;
    }
  };

  // Error message component with different styles based on error type
  const renderErrorMessage = () => {
    if (!error || !errorType) return null;

    // Use type assertion to fix the TypeScript error
    const config = errorConfig[errorType as keyof typeof errorConfig] || errorConfig.general;

    return (
      <div className={`${config.bgColor} ${config.borderColor} ${config.textColor} border rounded-lg p-4 mb-4 animate-fadeIn`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {config.icon}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">
              {config.title}
            </h4>
            <p className="text-sm opacity-90">
              {error}
            </p>
            {errorType === 'account_not_found' && (
              <div className="mt-2 text-xs opacity-80">
                <p className="font-medium">Tips:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Check that your {isAdmin ? 'email address' : 'Student ID'} is correct</li>
                  <li>Make sure you're using the {isAdmin ? 'admin' : 'student'} login</li>
                  {!isAdmin && <li>Student ID should be in format: YYYY-NNN (e.g., 2024-001)</li>}
                  <li>Contact your administrator if you believe this is an error</li>
                </ul>
              </div>
            )}
            {errorType === 'invalid_password' && (
              <div className="mt-2 text-xs opacity-80">
                <p>• Make sure Caps Lock is off</p>
                <p>• Check for typing mistakes</p>
                <p>• Contact administrator if you forgot your password</p>
              </div>
            )}
            {errorType === 'network' && (
              <div className="mt-2 text-xs opacity-80">
                <p>• Check your internet connection</p>
                <p>• Verify the server is running</p>
                <p>• Try again in a few moments</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Admin Secret Button */}
      {!isAdmin && (
        <div
          className="admin-secret-btn"
          onClick={onToggleAdmin}
          title="Admin Login"
        />
      )}

      <div className="card max-w-md w-full animate-fadeIn">
        <div className="card-header text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <img 
              src="../../src/assets/logo.png"
              alt="Logo"
              className="w-82 h-82 rounded-full"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Admin Login' : 'Student Voting Login'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isAdmin ? 'Access the admin dashboard' : 'Cast your vote securely'}
          </p>
        </div>

        <div className="card-body">
          {/* Voting Status Banner */}
          {!isAdmin && statusInfo && (
            <div className={`${statusInfo.color} border rounded-lg p-4 mb-4 flex items-center space-x-3`}>
              {statusInfo.icon}
              <div>
                <p className="font-medium">{statusInfo.message}</p>
                <p className="text-sm opacity-90">
                  {pollStatus === 'paused' && 'Please wait for voting to resume'}
                  {pollStatus === 'finished' && 'Thank you for participating'}
                  {pollStatus === 'not_started' && 'Please wait for voting to start'}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {renderErrorMessage()}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">
                {isAdmin ? (
                  <>
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 inline mr-2" />
                    Student ID
                  </>
                )}
              </label>
              <input
                type={isAdmin ? 'email' : 'text'}
                value={emailOrStudentId}
                onChange={(e) => setEmailOrStudentId(e.target.value)}
                className="form-input"
                placeholder={isAdmin ? 'admin@example.com' : '2024-001'}
                pattern={!isAdmin ? '\\d{4}-\\d{3}' : undefined}
                title={!isAdmin ? 'Student ID format: YYYY-NNN (e.g., 2024-001)' : undefined}
                required
                disabled={loading || (!isAdmin && !isLoginEnabled)}
              />
              {!isAdmin && (
                <p className="text-xs text-gray-500 mt-1">
                  Format: YYYY-NNN (e.g., 2024-001)
                </p>
              )}
            </div>

            <div>
              <label className="form-label">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pr-12"
                  placeholder="Enter your password"
                  required
                  disabled={loading || (!isAdmin && !isLoginEnabled)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || (!isAdmin && !isLoginEnabled)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (!isAdmin && !isLoginEnabled)}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <span>
                    {!isAdmin && !isLoginEnabled ? 'Login Disabled' : 'Sign In'}
                  </span>
                </>
              )}
            </button>
          </form>

          {isAdmin && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onToggleAdmin}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                ← Back to Student Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};