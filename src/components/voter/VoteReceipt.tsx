import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, FileText, Hash, User, Shield, Fingerprint, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';

interface VoteReceiptProps {
  votes: any[];
  ballotId: string;
  onVoteComplete: (receipt: any) => void;
  onBack?: () => void;
}

export const VoteReceipt: React.FC<VoteReceiptProps> = ({ 
  votes, 
  ballotId,
  onVoteComplete, 
  onBack 
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [blockchainReceipt, setBlockchainReceipt] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    submitToBlockchain();
  }, []);

  const submitToBlockchain = async () => {
    setSubmitting(true);
    setError('');

    try {
      console.log('✅ Starting blockchain submission...');

      // Prepare vote data for blockchain
      const voteData = {
        voterId: user?.studentId,
        votes: votes,
        ballotId: ballotId,
        timestamp: new Date().toISOString()
      };

      console.log('📤 Submitting vote to blockchain:', {
        voterId: user?.studentId,
        ballotId: ballotId,
        voteCount: votes.length
      });

      // Submit to backend which will handle blockchain interaction
      const response = await api.post('/voting/cast-blockchain', voteData);

      // Handle response properly - remove .data since api.ts already parses it
      if (response.success) {
        setBlockchainReceipt(response.receipt);
        onVoteComplete(response.receipt);
        showToast('success', 'Vote successfully recorded on blockchain!');
        
        console.log('✅ Blockchain submission successful:', {
          ballotId: ballotId,
          transactionHash: response.receipt.transactionHash,
          blockNumber: response.receipt.blockNumber
        });
      } else {
        throw new Error(response.error || 'Failed to submit to blockchain');
      }
    } catch (error: any) {
      console.error('❌ Blockchain submission error:', error);
      
      // Handle different error types
      let errorMessage = 'Failed to submit vote to blockchain';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      showToast('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatHash = (hash: string) => {
    if (!hash) return 'N/A';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  if (submitting) {
    return (
      <div className="min-h-screen bg-white py-4 px-3 sm:px-4 lg:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="flex flex-col items-center justify-center py-8">
              <LoadingSpinner size="lg" />
              <h2 className="text-xl font-semibold text-gray-900 mt-4">
                Submitting Vote to Blockchain
              </h2>
              <p className="text-gray-600 mt-2">
                Please wait while your vote is being securely recorded...
              </p>
              
              {/* Progress steps */}
              <div className="mt-6 space-y-2 text-sm text-gray-500 w-full max-w-md">
                <div className="flex items-center justify-center space-x-2">
                  <Fingerprint className="w-4 h-4 text-blue-800" />
                  <span>Ballot ID: {formatHash(ballotId)}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-800" />
                  <span>Encrypting your vote</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Hash className="w-4 h-4 text-blue-800" />
                  <span>Creating blockchain transaction</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-800" />
                  <span>Waiting for confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <p className="text-sm text-gray-500 mb-6">
                Ballot ID: {formatHash(ballotId)}
              </p>

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
                  onClick={submitToBlockchain} 
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

  if (!blockchainReceipt) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-4 px-3 sm:px-4 lg:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 animate-fadeIn">
          <div className="card-header text-center p-6 bg-gradient-to-r from-blue-800 to-blue-900 text-white rounded-t-2xl">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Vote Successfully Cast!</h1>
            <p className="text-blue-100 mt-2">
              Your vote has been securely recorded on the Ethereum blockchain
            </p>
          </div>

          <div className="card-body p-6">
            {/* Voter Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-800" />
                Voter Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-blue-700">Student ID</p>
                  <p className="font-medium text-blue-900">{user?.studentId}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Voter Hash</p>
                  <p className="font-mono text-sm text-blue-900">
                    {formatHash(blockchainReceipt.voterHash)}
                  </p>
                </div>
              </div>
            </div>

            {/* Ballot Information */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                <Fingerprint className="w-5 h-5 mr-2 text-purple-800" />
                Ballot Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-700">Ballot ID:</span>
                  <span className="font-mono text-sm text-purple-900">
                    {formatHash(ballotId)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-700">Votes Cast:</span>
                  <span className="text-purple-900">
                    {votes.length} position{votes.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Blockchain Receipt */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-800" />
                Blockchain Receipt
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-green-700">Transaction Hash:</span>
                  <span className="font-mono text-sm text-green-900">
                    {formatHash(blockchainReceipt.transactionHash)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700">Block Number:</span>
                  <span className="font-mono text-green-900">
                    #{blockchainReceipt.blockNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700">Gas Used:</span>
                  <span className="font-mono text-green-900">
                    {blockchainReceipt.gasUsed || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700">Timestamp:</span>
                  <span className="text-green-900">
                    {new Date(blockchainReceipt.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Vote Summary */}
            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Votes</h2>
              <div className="space-y-4">
                {votes.map((vote, index) => (
                  <div key={index} className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 block mb-1">{vote.position}</span>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{vote.candidateName}</span>
                        <span className="mx-2">•</span>
                        <span>{vote.candidateParty}</span>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-800 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <h4 className="font-semibold text-blue-800">Your Vote is Secure</h4>
                  <p className="text-blue-700 mt-1">
                    This receipt proves your vote was recorded on the Ethereum blockchain. 
                    The ballot ID and transaction hash serve as cryptographic proof that cannot be altered.
                    Your identity is protected through cryptographic hashing.
                  </p>
                </div>
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
                className="bg-blue-800 hover:bg-blue-900 text-white py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2"
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
};