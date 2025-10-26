import React, { useState, useEffect } from 'react';
import { Vote, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { Candidate } from '../../types';
import { api } from '../../utils/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';
import { ReviewVote } from './ReviewVote';

interface CastVoteProps {
  onVoteCast: (receipt: any) => void;
  onShowReceipt: (votes: any[]) => void;
}

export const CastVote: React.FC<CastVoteProps> = ({ onVoteCast, onShowReceipt }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedVotes, setSelectedVotes] = useState<{ [position: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
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

  const positions = [...new Set(candidates.map(c => c.position))];

  const handleCandidateSelect = (position: string, candidateId: number) => {
    setSelectedVotes(prev => ({
      ...prev,
      [position]: candidateId
    }));
  };

  const handleReviewVote = () => {
    if (Object.keys(selectedVotes).length !== positions.length) {
      showToast('warning', 'Please select a candidate for each position');
      return;
    }
    setShowReview(true);
  };

  const handleBackToVoting = () => {
    setShowReview(false);
  };

  const handleConfirmVote = (votes: any[]) => {
    // Pass the votes to the receipt component for blockchain submission
    onShowReceipt(votes);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading candidates..." />
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

  // Show Voting Screen (rest of your existing CastVote JSX)
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card animate-fadeIn">
        <div className="card-header">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Vote className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Cast Your Vote</h1>
              <p className="text-gray-600">Select one candidate for each position</p>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="space-y-8">
            {positions.map((position) => (
              <div key={position} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">{position}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidates
                    .filter(candidate => candidate.position === position)
                    .map((candidate) => (
                      <div
                        key={candidate.id}
                        onClick={() => handleCandidateSelect(position, candidate.id)}
                        className={`vote-card ${
                          selectedVotes[position] === candidate.id
                            ? 'vote-card-selected'
                            : ''
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={candidate.image_url || `https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop`}
                            alt={candidate.name}
                            className="candidate-image"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                            <p className="text-sm text-gray-600">{candidate.party}</p>
                          </div>
                          {selectedVotes[position] === candidate.id && (
                            <CheckCircle className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Selected: {Object.keys(selectedVotes).length} of {positions.length} positions
              </div>
              <button
                onClick={handleReviewVote}
                disabled={Object.keys(selectedVotes).length !== positions.length}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Review Vote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};