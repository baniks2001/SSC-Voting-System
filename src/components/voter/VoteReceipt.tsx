import React from 'react';
import { Receipt, CheckCircle, Calendar, Hash, LogOut } from 'lucide-react';
import { VoteReceipt as VoteReceiptType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface VoteReceiptProps {
  receipt: VoteReceiptType;
  showConfirmation?: boolean;
  onConfirm?: () => void;
  onBack?: () => void;
}

export const VoteReceipt: React.FC<VoteReceiptProps> = ({ 
  receipt, 
  showConfirmation = false,
  onConfirm,
  onBack 
}) => {
  const { logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="receipt-container animate-fadeIn">
        <div className="receipt-header">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Receipt className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Vote Receipt</h1>
          <p className="text-sm text-gray-600 mt-1">
            {showConfirmation ? 'Please review your selections' : 'Your vote has been recorded'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Vote Successfully Cast</span>
          </div>

          <div className="space-y-3">
            <div className="receipt-item">
              <span className="font-medium text-gray-700">Vote Hash:</span>
              <span className="text-xs text-gray-600 font-mono break-all">
                {receipt.voteHash}
              </span>
            </div>

            <div className="receipt-item">
              <span className="font-medium text-gray-700">Date & Time:</span>
              <span className="text-sm text-gray-600">
                {new Date(receipt.votedAt).toLocaleString()}
              </span>
            </div>

            <div className="receipt-item">
              <span className="font-medium text-gray-700">Blockchain Status:</span>
              <span className={`badge ${receipt.blockchainVerified ? 'badge-success' : 'badge-warning'}`}>
                {receipt.blockchainVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Your Selections:</h3>
            <div className="space-y-3">
              {receipt.votes.map((vote, index) => (
                <div key={index} className="receipt-item">
                  <div>
                    <p className="font-medium text-gray-700">{vote.position}</p>
                    <p className="text-sm text-gray-600">{vote.party}</p>
                  </div>
                  <p className="text-sm text-gray-900">{vote.candidateName}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Hash className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Blockchain Security</p>
                <p>Your vote is secured using blockchain technology and cannot be altered or deleted.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          {showConfirmation ? (
            <div className="flex space-x-3">
              <button onClick={onBack} className="flex-1 btn-secondary">
                Back to Vote
              </button>
              <button onClick={onConfirm} className="flex-1 btn-primary">
                Confirm Vote
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={logout}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Thank you for participating in the election!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};