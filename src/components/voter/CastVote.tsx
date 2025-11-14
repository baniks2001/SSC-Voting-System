import React, { useState, useEffect } from 'react';
import { Vote, Users, CheckCircle, ArrowRight, User, LogOut } from 'lucide-react';
import { Candidate, Position } from '../../types';
import { api } from '../../utils/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';
import { ReviewVote } from './ReviewVote';

interface CastVoteProps {
  onVoteCast: (receipt: any) => void;
  onShowReceipt: (votes: any[]) => void;
  onLogout: () => void;
}

export const CastVote: React.FC<CastVoteProps> = ({ onVoteCast, onShowReceipt, onLogout }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedVotes, setSelectedVotes] = useState<{ [position: string]: number[] }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [candidatesResponse, positionsResponse] = await Promise.all([
        api.get('/candidates'),
        api.get('/positions')
      ]);
      setCandidates(candidatesResponse);
      setPositions(positionsResponse.sort((a: Position, b: Position) => a.order - b.order));
    } catch (error: any) {
      showToast('error', 'Failed to load voting data');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSelect = (position: string, candidateId: number, maxVotes: number) => {
    setSelectedVotes(prev => {
      const currentSelected = prev[position] || [];

      // If candidate is already selected, remove it
      if (currentSelected.includes(candidateId)) {
        return {
          ...prev,
          [position]: currentSelected.filter(id => id !== candidateId)
        };
      }

      // If max votes reached, don't add new selection
      if (currentSelected.length >= maxVotes) {
        showToast('warning', `You can only select up to ${maxVotes} candidate(s) for ${position}`);
        return prev;
      }

      // Add new selection
      return {
        ...prev,
        [position]: [...currentSelected, candidateId]
      };
    });
  };

  const handleReviewVote = () => {
    // Check if all positions have at least the minimum required selections
    const hasAllRequiredSelections = positions.every(position => {
      const selectedForPosition = selectedVotes[position.name] || [];
      return selectedForPosition.length > 0;
    });

    if (!hasAllRequiredSelections) {
      showToast('warning', 'Please select at least one candidate for each position');
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
    onLogout();
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const getSelectedCountForPosition = (positionName: string) => {
    return (selectedVotes[positionName] || []).length;
  };

  const getMaxVotesForPosition = (positionName: string) => {
    const position = positions.find(p => p.name === positionName);
    return position?.maxVotes || 1;
  };

  const isCandidateSelected = (position: string, candidateId: number) => {
    return (selectedVotes[position] || []).includes(candidateId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <LoadingSpinner size="lg" text="Loading voting data..." />
        </div>
      </div>
    );
  }

  // In CastVote.tsx, update the ReviewVote usage:
  if (showReview) {
    return (
      <ReviewVote
        selectedVotes={selectedVotes}
        candidates={candidates}
        positions={positions}
        onBack={handleBackToVoting}
        onVoteCast={onVoteCast} // Change from onConfirm to onVoteCast
        onLogout={onLogout} // Add this prop
        loading={submitting}
      />
    );
  }

  const totalSelected = Object.values(selectedVotes).reduce((sum, votes) => sum + votes.length, 0);
  const totalPossible = positions.reduce((sum, position) => sum + position.maxVotes, 0);

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
                  <p className="text-gray-600">Select candidates for each position</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-50 rounded-lg px-3 py-2">
                  <span className="text-sm font-semibold text-blue-800">
                    {totalSelected} of {totalPossible} selected
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
          {positions.map((position) => {
            const positionCandidates = candidates.filter(candidate => candidate.position === position.name);
            const selectedCount = getSelectedCountForPosition(position.name);
            const maxVotes = getMaxVotesForPosition(position.name);

            return (
              <div key={position.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Position Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-800" />
                      <h2 className="text-lg font-semibold text-gray-900">{position.name}</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                        {selectedCount}/{maxVotes} selected
                      </span>
                      {selectedCount === maxVotes && (
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                          Maximum reached
                        </span>
                      )}
                      <span className="text-sm text-gray-600">
                        {positionCandidates.length} candidate(s)
                      </span>
                    </div>
                  </div>
                  {maxVotes > 1 && (
                    <p className="text-sm text-gray-600 mt-2">
                      You can select up to {maxVotes} candidate(s) for this position
                    </p>
                  )}
                </div>

                {/* Candidates */}
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {positionCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        onClick={() => handleCandidateSelect(position.name, candidate.id, maxVotes)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${isCandidateSelected(position.name, candidate.id)
                            ? 'border-blue-800 bg-blue-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-gray-500" />
                          </div>
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
                            {isCandidateSelected(position.name, candidate.id) && (
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
                {totalSelected} of {totalPossible} total selections made
              </p>
              {positions.every(position => {
                const selected = selectedVotes[position.name] || [];
                return selected.length > 0;
              }) && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    ✓ Ready to submit your vote
                  </p>
                )}
            </div>
            <button
              onClick={handleReviewVote}
              className="flex items-center space-x-2 bg-blue-800 hover:bg-blue-900 text-white py-3 px-5 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!positions.every(position => {
                const selected = selectedVotes[position.name] || [];
                return selected.length > 0;
              })}
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
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg transition-all duration-200 font-medium"
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