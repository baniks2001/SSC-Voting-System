import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Maximize,
  Minimize,
  Play,
  Pause,
  RotateCcw,
  Users,
  Vote,
  TrendingUp,
  X,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { PollResults, PollSettings } from '../../types';
import { api } from '../../utils/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';

interface PollMonitorProps {
  isReadOnly?: boolean;
}

export const PollMonitor: React.FC<PollMonitorProps> = ({ isReadOnly = false }) => {
  const [results, setResults] = useState<PollResults | null>(null);
  const [pollSettings, setPollSettings] = useState<PollSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchData = async () => {
    try {
      const [resultsResponse, settingsResponse] = await Promise.all([
        api.get('/voting/results'),
        api.get('/poll/status')
      ]);

      setResults(resultsResponse);
      setPollSettings(settingsResponse);
    } catch (error: any) {
      showToast('error', 'Failed to fetch poll data');
    } finally {
      setLoading(false);
    }
  };

  const handlePollControl = async (action: 'start' | 'pause' | 'resume' | 'stop') => {
    if (isReadOnly) return;

    try {
      let isActive = false;
      let isPaused = false;

      switch (action) {
        case 'start':
          isActive = true;
          isPaused = false;
          break;
        case 'pause':
          isActive = true;
          isPaused = true;
          break;
        case 'resume':
          isActive = true;
          isPaused = false;
          break;
        case 'stop':
          isActive = false;
          isPaused = false;
          break;
      }

      await api.put('/poll/status', {
        isActive,
        isPaused,
        startTime: action === 'start' ? new Date().toISOString() : null,
        endTime: action === 'stop' ? new Date().toISOString() : null
      });

      showToast('success', `Poll ${action}ed successfully`);
      fetchData();
    } catch (error: any) {
      showToast('error', `Failed to ${action} poll`);
    }
  };

  const handleReset = async () => {
    if (isReadOnly) {
      showToast('warning', 'Read-only mode: Cannot reset poll');
      return;
    }

    // Enhanced confirmation dialog
    if (!window.confirm(
      '🚨 CRITICAL ACTION: Reset Poll\n\n' +
      'Are you absolutely sure you want to reset the poll?\n\n' +
      'This will:\n' +
      '• Clear ALL votes permanently\n' +
      '• Reset all candidate vote counts to zero\n' +
      '• Remove all voting history\n\n' +
      'This action cannot be undone!'
    )) {
      return;
    }

    // Set loading state specifically for reset operation
    setLoading(true);

    try {
      // The API client will throw an error if the response is not ok
      const response = await api.post('/poll/reset', {});

      // Handle different response structures
      if (response && typeof response === 'object') {
        if (response.success !== undefined) {
          // Response has success flag
          if (response.success) {
            showToast('success', response.message || 'Poll reset successfully');
          } else {
            throw new Error(response.message || 'Reset failed');
          }
        } else {
          // Plain success response
          showToast('success', 'Poll reset successfully');
        }
      } else {
        // Simple success case
        showToast('success', 'Poll reset successfully');
      }

      // Refresh data to show updated state
      await fetchData();

    } catch (error: any) {
      console.error('Reset poll error:', error);

      // Handle different error formats from your API client
      let errorMessage = 'Failed to reset poll. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.error) {
        errorMessage = error.error;
      }

      // Check for specific HTTP errors
      if (errorMessage.includes('HTTP 401')) {
        errorMessage = 'Authentication required to reset poll';
      } else if (errorMessage.includes('HTTP 403')) {
        errorMessage = 'You do not have permission to reset the poll';
      } else if (errorMessage.includes('HTTP 404')) {
        errorMessage = 'Reset endpoint not found';
      } else if (errorMessage.includes('HTTP 500')) {
        errorMessage = 'Server error during reset';
      }

      showToast('error', `Reset failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getVotePercentage = (voteCount: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  };

  const groupedCandidates = results?.candidates.reduce((acc, candidate) => {
    if (!acc[candidate.position]) {
      acc[candidate.position] = [];
    }
    acc[candidate.position].push(candidate);
    return acc;
  }, {} as Record<string, typeof results.candidates>) || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading poll monitor..." />
      </div>
    );
  }

  const content = (
    <div className="space-y-6">
      {/* Poll Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isReadOnly ? (
              <Eye className="w-6 h-6 text-blue-600" />
            ) : (
              <Monitor className="w-6 h-6 text-blue-600" />
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {isReadOnly ? 'Poll Monitor (View Only)' : 'Live Poll Monitor'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`status-indicator ${pollSettings?.is_active && !pollSettings?.is_paused ? 'status-online' : 'status-offline'}`} />
            <span className="text-sm font-medium">
              {pollSettings?.is_active
                ? pollSettings?.is_paused
                  ? 'Paused'
                  : 'Live'
                : 'Stopped'
              }
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
              disabled={isReadOnly}
            />
            <span>Auto-refresh</span>
          </label>

          <button
            onClick={toggleFullscreen}
            className="btn-secondary btn-sm flex items-center space-x-1"
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-4 h-4" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4" />
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Control Panel - Only show for non-readonly users */}
      {!isReadOnly && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Poll Controls</h2>
          </div>
          <div className="card-body">
            <div className="flex items-center justify-center space-x-4">
              {!pollSettings?.is_active ? (
                <button
                  onClick={() => handlePollControl('start')}
                  className="btn-success flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Poll</span>
                </button>
              ) : pollSettings?.is_paused ? (
                <button
                  onClick={() => handlePollControl('resume')}
                  className="btn-success flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Resume Poll</span>
                </button>
              ) : (
                <button
                  onClick={() => handlePollControl('pause')}
                  className="btn-warning flex items-center space-x-2"
                >
                  <Pause className="w-5 h-5" />
                  <span>Pause Poll</span>
                </button>
              )}

              {pollSettings?.is_active && (
                <button
                  onClick={() => handlePollControl('stop')}
                  className="btn-danger flex items-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Stop Poll</span>
                </button>
              )}

              <button
                onClick={handleReset}
                disabled={loading}
                className={`btn-danger flex items-center space-x-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-5 h-5" />
                    <span>Reset Poll</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="responsive-grid">
        <div className="stats-card stats-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Votes</p>
              <p className="text-3xl font-bold">{results?.totalVotes || 0}</p>
            </div>
            <Vote className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="stats-card stats-card-green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Candidates</p>
              <p className="text-3xl font-bold">{results?.candidates.length || 0}</p>
            </div>
            <Users className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="stats-card stats-card-purple">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Positions</p>
              <p className="text-3xl font-bold">{Object.keys(groupedCandidates).length}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Results by Position */}
      <div className="space-y-6">
        {Object.entries(groupedCandidates).map(([position, candidates]) => (
          <div key={position} className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">{position}</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {candidates
                  .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
                  .map((candidate, index) => {
                    const voteCount = candidate.vote_count || 0;
                    const percentage = getVotePercentage(voteCount, results?.totalVotes || 0);
                    const isLeading = index === 0 && voteCount > 0;

                    return (
                      <div key={candidate.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={candidate.image_url || `https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop`}
                              alt={candidate.name}
                              className="candidate-image-sm"
                            />
                            <div>
                              <p className="font-medium text-gray-900 flex items-center space-x-2">
                                <span>{candidate.name}</span>
                                {isLeading && <TrendingUp className="w-4 h-4 text-green-600" />}
                              </p>
                              <p className="text-sm text-gray-600">{candidate.party}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{voteCount}</p>
                            <p className="text-sm text-gray-600">{percentage}%</p>
                          </div>
                        </div>
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${isLeading ? 'progress-fill-green' : ''}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {results?.totalVotes === 0 && (
        <div className="card">
          <div className="card-body text-center py-12">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Votes Yet</h3>
            <p className="text-gray-600">Votes will appear here once students start voting.</p>
          </div>
        </div>
      )}

      <div className="text-center text-sm text-gray-500">
        Last updated: {results?.lastUpdated ? new Date(results.lastUpdated).toLocaleString() : 'Never'}
        {isReadOnly && <span className="ml-2 text-blue-600">• View Only Mode</span>}
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fullscreen-overlay">
        <div className="fullscreen-header">
          <h1 className="text-xl font-bold">
            {isReadOnly ? 'Poll Monitor - View Only' : 'Live Poll Monitor'} - Fullscreen
          </h1>
          <div className="fullscreen-controls">
            <div className="flex items-center space-x-2 mr-4">
              <div className={`status-indicator ${pollSettings?.is_active && !pollSettings?.is_paused ? 'status-online' : 'status-offline'}`} />
              <span className="text-sm font-medium">
                {pollSettings?.is_active
                  ? pollSettings?.is_paused
                    ? 'Paused'
                    : 'Live'
                  : 'Stopped'
                }
              </span>
            </div>
            <button
              onClick={toggleFullscreen}
              className="btn-secondary btn-sm flex items-center space-x-1"
            >
              <Minimize className="w-4 h-4" />
              <span>Exit Fullscreen</span>
            </button>
          </div>
        </div>
        <div className="fullscreen-content overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {content}
    </div>
  );
};