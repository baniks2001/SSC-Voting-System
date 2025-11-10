import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Eye,
  RefreshCw,
  Cpu,
  Download
} from 'lucide-react';
import { PollResults, PollSettings } from '../../types';
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
  image_url?: string;
  vote_count?: number;
}

interface BlockchainNode {
  url: string;
  priority: number;
  isActive: boolean;
  lastChecked: number;
}

export const PollMonitor: React.FC<PollMonitorProps> = ({ isReadOnly = false }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [pollSettings, setPollSettings] = useState<PollSettings | null>(null);
  const [blockchainInfo, setBlockchainInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [nodes, setNodes] = useState<BlockchainNode[]>([
    { url: '/voting/results', priority: 1, isActive: true, lastChecked: Date.now() },
    { url: '/voting/fallback-results', priority: 2, isActive: true, lastChecked: Date.now() }
  ]);
  const { showToast } = useToast();

  // Memoized blockchain node configuration
  const blockchainNodes = useMemo(() => [
    { url: '/voting/results', priority: 1 },
    { url: '/voting/fallback-results', priority: 2 }
  ], []);

  // Optimized data fetching with failover
  const fetchBlockchainData = useCallback(async (nodeIndex: number): Promise<any> => {
    const node = blockchainNodes[nodeIndex];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await api.get(node.url, { signal: controller.signal });
      clearTimeout(timeoutId);

      // Update node status
      setNodes(prev => prev.map((n, i) => 
        i === nodeIndex ? { ...n, isActive: true, lastChecked: Date.now() } : n
      ));

      return response;
    } catch (error) {
      console.warn(`Node ${nodeIndex} failed:`, error);
      
      // Mark node as inactive
      setNodes(prev => prev.map((n, i) => 
        i === nodeIndex ? { ...n, isActive: false, lastChecked: Date.now() } : n
      ));

      // Try next node if available
      const nextNodeIndex = (nodeIndex + 1) % blockchainNodes.length;
      if (nextNodeIndex !== nodeIndex) {
        showToast('warning', `Switching to backup node ${nextNodeIndex + 1}`);
        return await fetchBlockchainData(nextNodeIndex);
      }

      throw new Error('All blockchain nodes failed');
    }
  }, [blockchainNodes, showToast]);

  // Optimized data fetching with performance improvements
  const fetchData = useCallback(async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      
      // Use Promise.allSettled to prevent complete failure if one endpoint fails
      const [candidatesResponse, blockchainResultsResponse, settingsResponse] = await Promise.allSettled([
        api.get('/candidates'),
        fetchBlockchainData(currentNodeIndex),
        api.get('/poll/status')
      ]);

      // Process candidates
      if (candidatesResponse.status === 'fulfilled') {
        const sqlCandidates = Array.isArray(candidatesResponse.value) 
          ? candidatesResponse.value 
          : candidatesResponse.value?.candidates || candidatesResponse.value?.data || [];
        setCandidates(sqlCandidates);
      }

      // Process blockchain results
      if (blockchainResultsResponse.status === 'fulfilled') {
        const blockchainData = blockchainResultsResponse.value;
        let blockchainVotes = 0;
        const candidateVoteCounts: { [candidateId: string]: number } = {};

        if (blockchainData && blockchainData.success) {
          blockchainVotes = blockchainData.totalVotes || 0;
          if (blockchainData.candidates && Array.isArray(blockchainData.candidates)) {
            blockchainData.candidates.forEach((candidate: any) => {
              if (candidate.id && candidate.vote_count !== undefined) {
                candidateVoteCounts[candidate.id] = candidate.vote_count;
              }
            });
          }
        }

        setTotalVotes(blockchainVotes);
        setCandidates(prev => prev.map(candidate => ({
          ...candidate,
          vote_count: candidateVoteCounts[candidate.id] || 0
        })));
      }

      // Process settings
      if (settingsResponse.status === 'fulfilled') {
        setPollSettings(settingsResponse.value);
      }

      // Fetch blockchain status separately to not block main data
      api.get('/voting/blockchain-status')
        .then(setBlockchainInfo)
        .catch(() => setBlockchainInfo(null));

    } catch (error: any) {
      console.error('Failed to fetch poll data:', error);
      showToast('error', 'Failed to fetch poll data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing, currentNodeIndex, fetchBlockchainData, showToast]);

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

  // Memoized poll control handler
  const handlePollControl = useCallback(async (action: 'start' | 'pause' | 'resume' | 'stop') => {
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
      console.error(`Failed to ${action} poll:`, error);
      showToast('error', `Failed to ${action} poll`);
    }
  }, [isReadOnly, showToast, fetchData]);

  // Optimized reset handler
  const handleReset = useCallback(async () => {
    if (isReadOnly) {
      showToast('warning', 'Read-only mode: Cannot reset poll');
      return;
    }

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

    setLoading(true);

    try {
      const response = await api.post('/poll/reset', {});

      if (response && typeof response === 'object' && response.success !== undefined) {
        if (response.success) {
          showToast('success', response.message || 'Poll reset successfully');
        } else {
          throw new Error(response.message || 'Reset failed');
        }
      } else {
        showToast('success', 'Poll reset successfully');
      }

      await fetchData();

    } catch (error: any) {
      console.error('Reset poll error:', error);
      let errorMessage = 'Failed to reset poll. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.error) {
        errorMessage = error.error;
      }

      showToast('error', `Reset failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [isReadOnly, showToast, fetchData]);

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
          isPaused: pollSettings?.is_paused
        },
        blockchainInfo: {
          connectedNodes: blockchainInfo?.connectedNodes,
          totalNodes: blockchainInfo?.totalNodes,
          currentBlock: blockchainInfo?.blockNumber,
          simulationMode: blockchainInfo?.simulationMode
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
  }, [candidates, totalVotes, pollSettings, blockchainInfo, showToast]);

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

      {/* Blockchain Status with Failover Info */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Cpu className="w-5 h-5 mr-2 text-indigo-600" />
            Blockchain Network Status
            {nodes.some(node => !node.isActive) && (
              <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                Failover Active
              </span>
            )}
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-800 text-sm font-medium">Network</p>
                  <p className={`text-lg font-bold ${blockchainInfo?.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {blockchainInfo?.isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
                <Cpu className={`w-6 h-6 ${blockchainInfo?.isConnected ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div>
                <p className="text-purple-800 text-sm font-medium">Active Node</p>
                <p className="text-lg font-bold text-purple-600">
                  Node {currentNodeIndex + 1}
                </p>
              </div>
              <p className="text-xs text-purple-600 mt-1">
                {nodes[currentNodeIndex]?.isActive ? 'Primary' : 'Backup'}
              </p>
            </div>

            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div>
                <p className="text-green-800 text-sm font-medium">Connected Nodes</p>
                <p className="text-lg font-bold text-green-600">
                  {blockchainInfo?.connectedNodes || 0}/{blockchainInfo?.totalNodes || 0}
                </p>
              </div>
              <p className="text-xs text-green-600 mt-1">Active nodes</p>
            </div>

            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div>
                <p className="text-orange-800 text-sm font-medium">Current Block</p>
                <p className="text-lg font-bold text-orange-600">
                  #{blockchainInfo?.blockNumber || 'N/A'}
                </p>
              </div>
              <p className="text-xs text-orange-600 mt-1">Latest block</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div>
                <p className="text-red-800 text-sm font-medium">Total Nodes</p>
                <p className="text-lg font-bold text-red-600">
                  {blockchainInfo?.totalNodes || 0}
                </p>
              </div>
              <p className="text-xs text-red-600 mt-1">Active nodes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="responsive-grid">
        <div className="stats-card stats-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Votes</p>
              <p className="text-3xl font-bold">{totalVotes || 0}</p>
              {blockchainInfo && (
                <p className="text-blue-200 text-xs mt-1">
                  {blockchainInfo.simulationMode ? 'Simulation Mode' : 'On Blockchain'}
                </p>
              )}
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
              <p className="text-indigo-100">Blockchain Nodes</p>
              <p className="text-3xl font-bold">
                {blockchainInfo ? `${blockchainInfo.connectedNodes || 0}/${blockchainInfo.totalNodes || 0}` : '0/0'}
              </p>
              <p className="text-indigo-200 text-xs mt-1">Connected</p>
            </div>
            <Cpu className="w-10 h-10 text-indigo-200" />
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
                            <img
                              src={candidate.image_url || `https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop`}
                              alt={candidate.name}
                              className="candidate-image-sm"
                              loading="lazy"
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
        {blockchainInfo && (
          <span className="ml-2 text-indigo-600">
            • {blockchainInfo.simulationMode ? 'Blockchain Simulation' : 'Live Blockchain'}
          </span>
        )}
        {nodes.some(node => !node.isActive) && (
          <span className="ml-2 text-yellow-600">• Failover Active</span>
        )}
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
              {blockchainInfo && (
                <div className="flex items-center space-x-1 text-sm">
                  <Cpu className={`w-4 h-4 ${blockchainInfo.isConnected ? 'text-green-500' : 'text-red-500'}`} />
                  <span>{blockchainInfo.connectedNodes || 0} Nodes</span>
                </div>
              )}
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