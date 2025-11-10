import React, { useState, useEffect } from 'react';
import { Users, Vote, UserCheck, Activity, Download, Cpu, Play, Pause, StopCircle, RotateCcw, RefreshCw } from 'lucide-react';
import { DashboardStats, AuditLog } from '../../types';
import { api } from '../../utils/api';
import { usePoll, PollStatus } from '../../contexts/PollContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [blockchainInfo, setBlockchainInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [pollLoading, setPollLoading] = useState(false);
  const [fetchBlockchain, setFetchBlockchain] = useState(false);

  const { pollStatus, updatePollStatus, refreshPollStatus, loading: pollStatusLoading } = usePoll();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardResponse, blockchainResponse] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/voting/blockchain-status').catch(() => null)
      ]);

      setStats(dashboardResponse);
      setBlockchainInfo(blockchainResponse);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePollControl = async (action: PollStatus) => {
    setPollLoading(true);
    try {
      await updatePollStatus(action);
      
      // Refresh dashboard data to get updated stats
      await fetchDashboardData();
      
      // Show success message
      const actionMessages = {
        'active': 'Voting started successfully! Students can now login and vote.',
        'paused': 'Voting paused successfully! Student login is now disabled.',
        'finished': 'Voting finished successfully! The poll is now closed.',
        'not_started': 'Poll reset successfully! Voting is not started.'
      };
      
      console.log(actionMessages[action]);
      
      // Show alert to user
      alert(actionMessages[action]);
    } catch (error: any) {
      console.error('Failed to update poll status:', error);
      alert(`Failed to update poll status: ${error.message}`);
    } finally {
      setPollLoading(false);
    }
  };

  const handleResetPoll = async () => {
    if (!window.confirm('Are you sure you want to reset the poll? This will clear all votes and reset everything!')) {
      return;
    }

    setPollLoading(true);
    try {
      await api.post('/poll/reset');
      await updatePollStatus('not_started');
      await fetchDashboardData();
      alert('Poll reset successfully! All votes have been cleared.');
    } catch (error: any) {
      console.error('Failed to reset poll:', error);
      alert(`Failed to reset poll: ${error.message}`);
    } finally {
      setPollLoading(false);
    }
  };

  const getPollStatusColor = (status: PollStatus) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'finished': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPollStatusDescription = (status: PollStatus) => {
    switch (status) {
      case 'active':
        return 'Students can login and vote. Voting is currently active.';
      case 'paused':
        return 'Voting is temporarily paused. Students cannot login until voting resumes.';
      case 'finished':
        return 'Voting has ended. No more votes can be cast.';
      case 'not_started':
        return 'Voting has not started yet. Students cannot login.';
      default:
        return '';
    }
  };

  const getAuditIconColor = (action: string) => {
    if (action.includes('LOGIN')) return 'bg-blue-500';
    if (action.includes('CREATE')) return 'bg-green-500';
    if (action.includes('UPDATE')) return 'bg-yellow-500';
    if (action.includes('DELETE')) return 'bg-red-500';
    if (action.includes('VOTE')) return 'bg-purple-500';
    return 'bg-gray-500';
  };

  const exportAuditLogs = async () => {
    if (!stats?.auditLogs.length) return;

    setExporting(true);
    try {
      // Create CSV content
      const headers = ['Timestamp', 'Action', 'User Type', 'User ID', 'Details'];
      const csvContent = [
        headers.join(','),
        ...stats.auditLogs.map(log => [
          `"${new Date(log.created_at).toLocaleString()}"`,
          `"${log.action.replace(/_/g, ' ')}"`,
          `"${log.user_type}"`,
          `"${log.user_id || 'N/A'}"`,
          `"${log.details?.replace(/"/g, '""') || 'N/A'}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      alert('Failed to export audit logs. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load dashboard data</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of the voting system</p>
        </div>
        <button
          onClick={refreshPollStatus}
          disabled={pollStatusLoading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${pollStatusLoading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Poll Controls */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Poll Controls</h2>
        </div>
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Current Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPollStatusColor(pollStatus)}`}>
                {pollStatus.replace('_', ' ').toUpperCase()}
              </span>
              {pollStatusLoading && (
                <LoadingSpinner size="sm" />
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handlePollControl('active')}
                disabled={pollLoading || pollStatus === 'active'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {pollLoading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Start Voting
              </button>

              <button
                onClick={() => handlePollControl('paused')}
                disabled={pollLoading || pollStatus === 'paused' || pollStatus === 'finished' || pollStatus === 'not_started'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {pollLoading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <Pause className="w-4 h-4 mr-2" />
                )}
                Pause Voting
              </button>

              <button
                onClick={() => handlePollControl('finished')}
                disabled={pollLoading || pollStatus === 'finished'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {pollLoading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <StopCircle className="w-4 h-4 mr-2" />
                )}
                Finish Voting
              </button>

              <button
                onClick={handleResetPoll}
                disabled={pollLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {pollLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <RotateCcw className="w-4 h-4 mr-2" />
                )}
                Reset Poll
              </button>
            </div>
          </div>
          
          {/* Status Description */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-medium mb-1">
              Current Status: {pollStatus.replace('_', ' ').toUpperCase()}
            </p>
            <p className="text-sm text-blue-700">
              {getPollStatusDescription(pollStatus)}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              <strong>Student Login Status:</strong> {pollStatus === 'active' ? 'ENABLED' : 'DISABLED'}
            </p>
            <p className="text-xs text-blue-600">
              <strong>API Connected:</strong> Real-time synchronization with backend
            </p>
          </div>
        </div>
      </div>

      {/* Blockchain Status */}
      {blockchainInfo && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Cpu className="w-5 h-5 mr-2 text-indigo-600" />
              Blockchain Network Status
            </h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 text-sm font-medium">Network Status</p>
                    <p className={`text-lg font-bold ${blockchainInfo.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {blockchainInfo.isConnected ? 'Connected' : 'Disconnected'}
                    </p>
                  </div>
                  <Cpu className={`w-8 h-8 ${blockchainInfo.isConnected ? 'text-green-500' : 'text-red-500'}`} />
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div>
                  <p className="text-purple-800 text-sm font-medium">Connected Nodes</p>
                  <p className="text-lg font-bold text-purple-600">
                    {blockchainInfo.connectedNodes || 0}/{blockchainInfo.totalNodes || 0}
                  </p>
                </div>
                <p className="text-xs text-purple-600 mt-1">Active blockchain nodes</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div>
                  <p className="text-green-800 text-sm font-medium">Current Block</p>
                  <p className="text-lg font-bold text-green-600">
                    #{blockchainInfo.blockNumber || 'N/A'}
                  </p>
                </div>
                <p className="text-xs text-green-600 mt-1">Latest block number</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div>
                  <p className="text-orange-800 text-sm font-medium">Storage Mode</p>
                  <p className="text-lg font-bold text-orange-600">
                    {blockchainInfo.simulationMode ? 'Simulation' : 'Live'}
                  </p>
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  {blockchainInfo.simulationMode ? 'Test environment' : 'Production'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="responsive-grid">
        <div className="stats-card stats-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Voters</p>
              <p className="text-2xl font-bold">{stats.totalVoters}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="stats-card stats-card-green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Votes</p>
              <p className="text-2xl font-bold">{stats.totalVotes}</p>
              {blockchainInfo && (
                <p className="text-green-200 text-xs mt-1">
                  {blockchainInfo.simulationMode ? 'Simulation Mode' : 'On Blockchain'}
                </p>
              )}
            </div>
            <UserCheck className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="stats-card stats-card-purple">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Candidates</p>
              <p className="text-2xl font-bold">{stats.totalCandidates}</p>
            </div>
            <Vote className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="stats-card stats-card-orange">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Turnout Rate</p>
              <p className="text-2xl font-bold">
                {stats.totalVoters > 0 
                  ? Math.round((stats.totalVotes / stats.totalVoters) * 100)
                  : 0}%
              </p>
            </div>
            <Activity className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <button
            onClick={exportAuditLogs}
            disabled={exporting || !stats?.auditLogs?.length}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {exporting ? (
              <div className="mr-2">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export CSV
          </button>
        </div>
        <div className="card-body">
          {!stats?.auditLogs?.length ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats.auditLogs.map((log: AuditLog) => (
                <div key={log.id} className="audit-entry">
                  <div className={`audit-icon ${getAuditIconColor(log.action)}`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {log.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                    {log.details && (
                      <p className="text-sm text-gray-600 truncate">{log.details}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {log.user_type} {log.user_id && `(ID: ${log.user_id})`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};