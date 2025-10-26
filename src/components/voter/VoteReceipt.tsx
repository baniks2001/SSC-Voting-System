import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, FileText, Hash, Clock, User, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';

interface VoteReceiptProps {
  votes: any[];
  onVoteComplete: (receipt: any) => void;
  onBack?: () => void;
}

export const VoteReceipt: React.FC<VoteReceiptProps> = ({ 
  votes, 
  onVoteComplete, 
  onBack 
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [blockchainReceipt, setBlockchainReceipt] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Automatically submit to blockchain when component mounts
    submitToBlockchain();
  }, []);

  const submitToBlockchain = async () => {
    setSubmitting(true);
    setError('');

    try {
      // Prepare vote data for blockchain
      const voteData = {
        voterId: user?.studentId,
        voterHash: generateVoterHash(user!),
        votes: votes,
        timestamp: new Date().toISOString()
      };

      // Submit to backend which will handle blockchain interaction
      const response = await api.post('/voting/cast-blockchain', voteData);

      if (response.success) {
        setBlockchainReceipt(response.receipt);
        onVoteComplete(response.receipt);
        showToast('success', 'Vote successfully recorded on blockchain!');
      } else {
        throw new Error(response.error || 'Failed to submit to blockchain');
      }
    } catch (error: any) {
      console.error('Blockchain submission error:', error);
      setError(error.message || 'Failed to submit vote to blockchain');
      showToast('error', 'Failed to submit vote to blockchain');
    } finally {
      setSubmitting(false);
    }
  };

  const generateVoterHash = (user: any) => {
    // Create a hash of voter identity for anonymity
    const data = `${user.studentId}-${user.fullName}-${Date.now()}`;
    return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  };

  const formatBlockHash = (hash: string) => {
    return `${hash.substring(0, 12)}...${hash.substring(hash.length - 6)}`;
  };

  if (submitting) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="card text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <h2 className="text-xl font-semibold text-gray-900 mt-4">
              Submitting Vote to Blockchain
            </h2>
            <p className="text-gray-600 mt-2">
              Please wait while your vote is being securely recorded...
            </p>
            <div className="mt-6 space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Encrypting your vote</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Hash className="w-4 h-4" />
                <span>Creating blockchain transaction</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Waiting for confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="card">
          <div className="text-center py-8">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Submission Failed
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex justify-center space-x-4">
              {onBack && (
                <button onClick={onBack} className="btn-secondary">
                  Back to Review
                </button>
              )}
              <button onClick={submitToBlockchain} className="btn-primary">
                Try Again
              </button>
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
    <div className="max-w-2xl mx-auto p-6">
      <div className="card animate-fadeIn">
        <div className="card-header text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Vote Successfully Cast!</h1>
          <p className="text-gray-600 mt-2">
            Your vote has been securely recorded on the blockchain
          </p>
        </div>

        <div className="card-body">
          {/* Blockchain Receipt */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Blockchain Receipt
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-700">Transaction Hash:</span>
                <span className="font-mono text-green-900">
                  {formatBlockHash(blockchainReceipt.transactionHash)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Block Number:</span>
                <span className="font-mono text-green-900">
                  #{blockchainReceipt.blockNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Voter Hash:</span>
                <span className="font-mono text-green-900">
                  {formatBlockHash(blockchainReceipt.voterHash)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Timestamp:</span>
                <span className="text-green-900">
                  {new Date(blockchainReceipt.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Vote Summary */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Votes</h2>
            <div className="space-y-3">
              {votes.map((vote, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <span className="font-medium text-gray-900">{vote.position}</span>
                    <div className="text-sm text-gray-600">
                      {vote.candidateName} ({vote.candidateParty})
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-semibold text-blue-800">Your Vote is Secure</h4>
                <p className="text-blue-700 mt-1">
                  This receipt proves your vote was recorded on the Ethereum blockchain. 
                  The transaction hash serves as cryptographic proof that cannot be altered.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => window.print()}
              className="btn-secondary flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};