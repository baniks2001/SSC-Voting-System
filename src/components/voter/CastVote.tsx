import React, { useState, useEffect } from 'react';
import { Vote, Users, CheckCircle, ArrowRight, User, LogOut } from 'lucide-react';
import { Candidate } from '../../types';
import { api } from '../../utils/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';
import { ReviewVote } from './ReviewVote';

interface CastVoteProps {
  onVoteCast: (receipt: any) => void;
  onShowReceipt: (votes: any[]) => void;
  onLogout: () => void; // This will navigate back to App.tsx
}

export const CastVote: React.FC<CastVoteProps> = ({ onVoteCast, onShowReceipt, onLogout }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedVotes, setSelectedVotes] = useState<{ [position: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/candidates');
      setCandidates(response);
    } catch (error: any) {
      showToast('error', 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  // Get unique positions from candidates data
  const positions = [...new Set(candidates.map(c => c.position))];

  const handleCandidateSelect = (position: string, candidateId: number) => {
    setSelectedVotes(prev => {
      // If already selected, unselect it
      if (prev[position] === candidateId) {
        const newVotes = { ...prev };
        delete newVotes[position];
        return newVotes;
      }
      // Otherwise select it
      return {
        ...prev,
        [position]: candidateId
      };
    });
  };

  const handleReviewVote = () => {
    // Check if all positions have selections based on available candidates
    const positionsWithCandidates = positions.filter(position => 
      candidates.some(candidate => candidate.position === position)
    );
    
    if (Object.keys(selectedVotes).length !== positionsWithCandidates.length) {
      showToast('warning', 'Please select a candidate for each position');
      return;
    }
    setShowReview(true);
  };

  const handleBackToVoting = () => {
    setShowReview(false);
  };

  const handleConfirmVote = (votes: any[]) => {
    onShowReceipt(votes);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    // This will trigger the parent component to navigate back to App.tsx
    onLogout();
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <LoadingSpinner size="lg" text="Loading candidates..." />
        </div>
      </div>
    );
  }

  // Show Review Screen
  if (showReview) {
    return (
      <ReviewVote
        selectedVotes={selectedVotes}
        candidates={candidates}
        onBack={handleBackToVoting}
        onConfirm={handleConfirmVote}
        loading={submitting}
      />
    );
  }

  // Calculate positions that actually have candidates
  const positionsWithCandidates = positions.filter(position => 
    candidates.some(candidate => candidate.position === position)
  );

  return (
    <div className="min-h-screen bg-white py-4 px-3 sm:px-4 lg:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="p-4 sm:p-6 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Vote className="w-6 h-6 text-blue-800" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Cast Your Vote</h1>
                  <p className="text-gray-600">Select one candidate for each position</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-50 rounded-lg px-3 py-2">
                  <span className="text-sm font-semibold text-blue-800">
                    {Object.keys(selectedVotes).length} of {positionsWithCandidates.length} selected
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 py-2 px-4 rounded-lg transition-all duration-200 font-medium text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Candidates Grid */}
        <div className="space-y-6">
          {positionsWithCandidates.map((position) => {
            const positionCandidates = candidates.filter(candidate => candidate.position === position);
            const selectedCandidateId = selectedVotes[position];
            
            return (
              <div key={position} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Position Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-800" />
                      <h2 className="text-lg font-semibold text-gray-900">{position}</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedCandidateId && (
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                          Selected ✓
                        </span>
                      )}
                      <span className="text-sm text-gray-600">
                        {positionCandidates.length} candidate(s)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Candidates */}
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {positionCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        onClick={() => handleCandidateSelect(position, candidate.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                          selectedVotes[position] === candidate.id
                            ? 'border-blue-800 bg-blue-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={candidate.image_url || '/default-avatar.png'}
                            alt={candidate.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                            onError={(e) => {
                              e.currentTarget.src = '/default-avatar.png';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                              {candidate.name}
                            </h3>
                            <p className="text-gray-600 text-xs sm:text-sm truncate">
                              {candidate.party}
                            </p>
                            {candidate.manifesto && (
                              <p className="text-gray-700 text-xs mt-1 line-clamp-1">
                                {candidate.manifesto}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {selectedVotes[position] === candidate.id && (
                              <div className="w-6 h-6 bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Section */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-600">
                {Object.keys(selectedVotes).length} of {positionsWithCandidates.length} positions selected
              </p>
              {Object.keys(selectedVotes).length === positionsWithCandidates.length && (
                <p className="text-xs text-green-600 font-medium mt-1">
                  ✓ Ready to submit your vote
                </p>
              )}
            </div>
            <button
              onClick={handleReviewVote}
              disabled={Object.keys(selectedVotes).length !== positionsWithCandidates.length}
              className="w-full sm:w-auto bg-blue-800 hover:bg-blue-900 disabled:bg-gray-400 text-white py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Review Vote</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to logout? Your vote selections will be lost.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 btn-secondary py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-all duration-200 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};