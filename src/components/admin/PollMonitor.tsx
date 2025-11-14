import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Monitor,
  Maximize,
  Minimize,
  Users,
  Vote,
  TrendingUp,
  AlertTriangle,
  Eye,
  RefreshCw,
  Download,
  Clock
} from 'lucide-react';
import { PollSettings } from '../../types';
import { api } from '../../utils/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';

interface PollMonitorProps {
  isReadOnly?: boolean;
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  position: string;
  position_name?: string;
  vote_count?: number;
}

export const PollMonitor: React.FC<PollMonitorProps> = ({ isReadOnly = false }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [pollSettings, setPollSettings] = useState<PollSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToast();

  // Optimized data fetching
  const fetchData = useCallback(async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      
      // Use Promise.allSettled to prevent complete failure if one endpoint fails
      const [candidatesResponse, resultsResponse, settingsResponse] = await Promise.allSettled([
        api.get('/candidates'),
        api.get('/voting/results'),
        api.get('/poll/status')
      ]);

      // Process candidates
      if (candidatesResponse.status === 'fulfilled') {
        const sqlCandidates = Array.isArray(candidatesResponse.value) 
          ? candidatesResponse.value 
          : candidatesResponse.value?.candidates || candidatesResponse.value?.data || [];
        setCandidates(sqlCandidates);
      }

      // Process results
      if (resultsResponse.status === 'fulfilled') {
        const resultsData = resultsResponse.value;
        let totalVotesCount = 0;
        const candidateVoteCounts: { [candidateId: string]: number } = {};

        if (resultsData && resultsData.success) {
          totalVotesCount = resultsData.totalVotes || 0;
          if (resultsData.candidates && Array.isArray(resultsData.candidates)) {
            resultsData.candidates.forEach((candidate: any) => {
              if (candidate.id && candidate.vote_count !== undefined) {
                candidateVoteCounts[candidate.id] = candidate.vote_count;
              }
            });
          }
        }

        setTotalVotes(totalVotesCount);
        setCandidates(prev => prev.map(candidate => ({
          ...candidate,
          vote_count: candidateVoteCounts[candidate.id] || 0
        })));
      }

      // Process settings
      if (settingsResponse.status === 'fulfilled') {
        setPollSettings(settingsResponse.value);
      }

    } catch (error: any) {
      console.error('Failed to fetch poll data:', error);
      showToast('error', 'Failed to fetch poll data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing, showToast]);

  // Optimized useEffect with cleanup
  useEffect(() => {
    fetchData();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchData, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchData]);

  // Export votes functionality
  const exportVotes = useCallback(() => {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        totalVotes,
        candidates: candidates.map(candidate => ({
          id: candidate.id,
          name: candidate.name,
          party: candidate.party,
          position: candidate.position_name || candidate.position,
          votes: candidate.vote_count || 0,
          percentage: totalVotes > 0 ? ((candidate.vote_count || 0) / totalVotes * 100).toFixed(2) : '0.00'
        })),
        pollStatus: {
          isActive: pollSettings?.is_active,
          isPaused: pollSettings?.is_paused,
          startTime: pollSettings?.start_time,
          endTime: pollSettings?.end_time
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `poll-results-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('success', 'Votes exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('error', 'Failed to export votes');
    }
  }, [candidates, totalVotes, pollSettings, showToast]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Memoized vote percentage calculation
  const getVotePercentage = useCallback((voteCount: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  }, []);

  // Memoized candidate grouping
  const groupedCandidates = useMemo(() => 
    candidates.reduce((acc, candidate) => {
      const position = candidate.position_name || candidate.position || 'Unknown Position';
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(candidate);
      return acc;
    }, {} as Record<string, Candidate[]>),
    [candidates]
  );

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
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="btn-secondary btn-sm flex items-center space-x-1"
          >
            {refreshing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Refresh</span>
          </button>

          <button
            onClick={exportVotes}
            className="btn-success btn-sm flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

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
                <span>Exit</span>
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

      {/* Statistics */}
      <div className="responsive-grid">
        <div className="stats-card stats-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Votes</p>
              <p className="text-3xl font-bold">{totalVotes || 0}</p>
            </div>
            <Vote className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="stats-card stats-card-green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Candidates</p>
              <p className="text-3xl font-bold">{candidates.length || 0}</p>
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

        <div className="stats-card stats-card-indigo">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100">Current Time</p>
              <p className="text-2xl font-bold text-indigo-100">
                {new Date().toLocaleTimeString()}
              </p>
              <p className="text-indigo-200 text-xs mt-1">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <Clock className="w-10 h-10 text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Results by Position */}
      <div className="space-y-6">
        {Object.entries(groupedCandidates).map(([position, positionCandidates]) => (
          <div key={position} className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">{position}</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {positionCandidates
                  .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
                  .map((candidate, index) => {
                    const voteCount = candidate.vote_count || 0;
                    const percentage = getVotePercentage(voteCount, totalVotes || 0);
                    const isLeading = index === 0 && voteCount > 0;

                    return (
                      <div key={candidate.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-500" />
                              </div>
                            </div>
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

      {candidates.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-12">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Candidates Found</h3>
            <p className="text-gray-600">Please add candidates to start the poll.</p>
          </div>
        </div>
      )}

      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date().toLocaleString()}
        {isReadOnly && <span className="ml-2 text-blue-600">• View Only Mode</span>}
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fullscreen-overlay">
        <div className="fullscreen-header">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">
              {isReadOnly ? 'Poll Monitor - View Only' : 'Live Poll Monitor'} - Fullscreen
            </h1>
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
          <div className="fullscreen-controls">
            <button
              onClick={exportVotes}
              className="btn-success btn-sm flex items-center space-x-1 mr-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={toggleFullscreen}
              className="btn-secondary btn-sm flex items-center space-x-1"
            >
              <Minimize className="w-4 h-4" />
              <span>Exit</span>
            </button>
          </div>
        </div>
        <div className="fullscreen-content overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return <div>{content}</div>;
};