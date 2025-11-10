import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, Mail, PauseCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePoll } from '../../contexts/PollContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface LoginFormProps {
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ isAdmin, onToggleAdmin }) => {
  const [emailOrStudentId, setEmailOrStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { pollStatus, isLoginEnabled } = usePoll();
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent login if voting is not active (only for student login)
    if (!isAdmin && !isLoginEnabled) {
      setError('Voting is currently not available. Please try again later.');
      return;
    }

    if (!emailOrStudentId || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(emailOrStudentId, password, isAdmin);
      // Blockchain status will be fetched after successful login in the dashboard
    } catch (error: any) {
      setError(error.message || 'Login failed');
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

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
                placeholder={isAdmin ? 'admin@example.com' : '2021-001'}
                required
                disabled={loading || (!isAdmin && !isLoginEnabled)}
              />
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading || (!isAdmin && !isLoginEnabled)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (!isAdmin && !isLoginEnabled)}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                onClick={onToggleAdmin}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
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