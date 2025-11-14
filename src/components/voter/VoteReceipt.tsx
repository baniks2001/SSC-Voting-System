import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, FileText, Hash, User, Shield, Fingerprint, RefreshCw, Lock, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';

interface VoteReceiptProps {
  votes: any[];
  ballotId: string;
  hashedBallotId: string;
  onVoteComplete: (receipt: any) => void;
  onBack?: () => void;
}

export const VoteReceipt: React.FC<VoteReceiptProps> = ({ 
  votes, 
  ballotId,
  hashedBallotId,
  onVoteComplete, 
  onBack 
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(true);
  const [blockchainReceipt, setBlockchainReceipt] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const hasStartedSubmission = useRef(false);

  useEffect(() => {
    if (!hasStartedSubmission.current && votes && ballotId && hashedBallotId) {
      hasStartedSubmission.current = true;
      console.log('🚀 Starting blockchain submission with votes:', votes);
      submitToBlockchain();
    }
  }, [votes, ballotId, hashedBallotId]);

  const submitToBlockchain = async () => {
    try {
      console.log('📤 Preparing vote data for submission...');
      
      const voteData = {
        voterId: user?.studentId,
        votes: votes,
        ballotId: hashedBallotId,
        timestamp: new Date().toISOString()
      };

      console.log('🎯 Sending to /voting/cast-blockchain...');
      
      const response = await api.post('/voting/cast-blockchain', voteData);
      
      console.log('📨 Raw backend response:', response);

      // Check if response exists and has success property
      if (response && response.success === true) {
        console.log('✅ Backend returned success!');
        
        // Use the receipt from backend response
        const receipt = response.receipt || response.voteReceipt || {
          transactionHash: `simulated_tx_${Date.now()}`,
          blockNumber: '0',
          timestamp: new Date().toISOString(),
          node: 'simulation',
          simulated: true
        };

        console.log('💾 Setting receipt data:', receipt);
        
        // Update state to show success
        setBlockchainReceipt(receipt);
        setSubmitting(false);
        
        // Call the completion callback
        if (onVoteComplete) {
          onVoteComplete(receipt);
        }
        
        showToast('success', 'Vote successfully recorded!');
        
      } else {
        // Handle case where success is false or response structure is different
        const errorMessage = response?.error || 'Unknown backend error';
        console.error('❌ Backend returned error:', errorMessage);
        throw new Error(errorMessage);
      }

    } catch (error: any) {
      console.error('❌ Submission caught error:', error);
      
      let errorMessage = 'Failed to submit vote';
      
      // Try different ways to extract error message
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.error('❌ Final error to display:', errorMessage);
      
      setError(errorMessage);
      setSubmitting(false);
      showToast('error', errorMessage);
    }
  };

  const formatHash = (hash: string) => {
    if (!hash) return 'N/A';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  const formatHashedBallotId = (hash: string) => {
    if (!hash) return 'N/A';
    if (hash.startsWith('0x')) {
      return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
    }
    return formatHash(hash);
  };

  const formatFullHash = (hash: string) => {
    if (!hash) return 'N/A';
    if (window.innerWidth < 768) {
      return `${hash.substring(0, 12)}...${hash.substring(hash.length - 12)}`;
    }
    return hash;
  };

  const getBlockchainTimestamp = () => {
    if (blockchainReceipt?.timestamp) {
      return new Date(blockchainReceipt.timestamp);
    }
    return new Date();
  };

  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      })
    };
  };

  // Group votes by position for better display
  const groupedVotes = votes?.reduce((acc, vote) => {
    if (!acc[vote.position]) {
      acc[vote.position] = [];
    }
    acc[vote.position].push(vote);
    return acc;
  }, {} as { [key: string]: any[] });

  // DEBUG: Log current state
  console.log('🔍 VoteReceipt State:', {
    submitting,
    blockchainReceipt: blockchainReceipt ? 'SET' : 'NOT SET',
    error,
    votesCount: votes?.length,
    ballotId,
    hashedBallotId: hashedBallotId ? 'SET' : 'NOT SET'
  });

  // Show SUCCESS state if we have a receipt
  if (blockchainReceipt) {
    const blockchainTime = getBlockchainTimestamp();
    const { date, time } = formatDateTime(blockchainTime);

    console.log('🎉 Rendering SUCCESS receipt with data:', blockchainReceipt);

    return (
      <div className="min-h-screen bg-white py-4 px-3 sm:px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 animate-fadeIn">
            {/* Header */}
            <div className="card-header text-center p-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-2xl">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Vote Successfully Cast!</h1>
              <p className="text-green-100 mt-2">
                {blockchainReceipt.simulated 
                  ? 'Vote recorded in simulation mode (Blockchain simulation)' 
                  : 'Your vote has been cryptographically secured on the Ethereum blockchain'
                }
              </p>
            </div>

            <div className="card-body p-6">
              {/* Voting Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-green-800" />
                  Voting Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-green-700 font-medium">Student ID</p>
                      <p className="font-semibold text-green-900">{user?.studentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Total Positions Voted</p>
                      <p className="font-semibold text-green-900">
                        {Object.keys(groupedVotes || {}).length} position{Object.keys(groupedVotes || {}).length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-green-700" />
                      <div>
                        <p className="text-sm text-green-700 font-medium">Date Submitted</p>
                        <p className="font-semibold text-green-900">{date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-700" />
                      <div>
                        <p className="text-sm text-green-700 font-medium">Time Submitted</p>
                        <p className="font-semibold text-green-900">{time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ballot Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <Fingerprint className="w-5 h-5 mr-2 text-blue-800" />
                  Ballot Identification
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-blue-700 font-medium mb-1">Unique Ballot ID</p>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="font-mono text-sm text-blue-900 break-all">
                          {ballotId}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Human-readable identifier for your reference
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 font-medium mb-1">Secure Hash (Blockchain)</p>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="font-mono text-sm text-blue-900 break-all">
                          {formatFullHash(hashedBallotId)}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          SHA-256 hash stored on blockchain
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-blue-700 font-medium mb-1">Transaction Hash</p>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="font-mono text-sm text-blue-900 break-all">
                          {formatFullHash(blockchainReceipt.transactionHash)}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Blockchain transaction ID
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-blue-700 font-medium mb-1">Block Number</p>
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <p className="font-mono text-sm text-blue-900">
                            #{blockchainReceipt.blockNumber}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700 font-medium mb-1">Status</p>
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <p className={`font-semibold text-sm ${
                            blockchainReceipt.simulated ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {blockchainReceipt.simulated ? 'SIMULATION' : 'CONFIRMED'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Candidates */}
              <div className="border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Your Selected Candidates
                </h2>
                <div className="space-y-6">
                  {Object.entries(groupedVotes || {}).map(([position, positionVotes]) => (
                    <div key={position} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <h3 className="font-semibold text-gray-900 text-lg mb-3 bg-gray-100 rounded-lg px-4 py-2">
                        {position}
                      </h3>
                      <div className="space-y-3">
                        {positionVotes.map((vote, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-5 h-5 text-green-800" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-base">
                                    {vote.candidateName}
                                  </h4>
                                  <p className="text-gray-600 text-sm">
                                    {vote.candidateParty}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="text-sm text-gray-500 font-medium">Selected</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => window.print()}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FileText className="w-4 h-4 text-blue-800" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Finish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show ERROR state
  if (error) {
    return (
      <div className="min-h-screen bg-white py-4 px-3 sm:px-4 lg:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Submission Failed
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="text-sm text-gray-500 mb-6 space-y-2">
                <p>Ballot ID: {formatHash(ballotId)}</p>
                <p>Secure Hash: {formatHashedBallotId(hashedBallotId)}</p>
                <p>Vote Count: {votes?.length || 0}</p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                {onBack && (
                  <button 
                    onClick={onBack} 
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>← Back to Review</span>
                  </button>
                )}
                <button 
                  onClick={() => {
                    setError('');
                    setSubmitting(true);
                    submitToBlockchain();
                  }} 
                  className="bg-blue-800 hover:bg-blue-900 text-white py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show LOADING state (default)
  return (
    <div className="min-h-screen bg-white py-4 px-3 sm:px-4 lg:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="flex flex-col items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <h2 className="text-xl font-semibold text-gray-900 mt-4">
              Securing Your Vote on Blockchain
            </h2>
            <p className="text-gray-600 mt-2">
              Please wait while your vote is being cryptographically secured...
            </p>
            
            {/* Progress steps */}
            <div className="mt-6 space-y-2 text-sm text-gray-500 w-full max-w-md">
              <div className="flex items-center justify-center space-x-2">
                <Fingerprint className="w-4 h-4 text-blue-800" />
                <span>Ballot ID: {formatHash(ballotId)}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Lock className="w-4 h-4 text-green-600" />
                <span>Secure Hash: {formatHashedBallotId(hashedBallotId)}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-4 h-4 text-blue-800" />
                <span>Encrypting {votes?.length || 0} vote(s)</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Hash className="w-4 h-4 text-blue-800" />
                <span>Creating blockchain transaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};