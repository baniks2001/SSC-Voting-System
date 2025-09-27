import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrStudentId || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(emailOrStudentId, password, isAdmin);
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

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
                disabled={loading}
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
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <span>Sign In</span>
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