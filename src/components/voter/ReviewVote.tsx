import React from 'react';
import { User, School, Calendar, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Candidate } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface ReviewVoteProps {
  selectedVotes: { [position: string]: number };
  candidates: Candidate[];
  onBack: () => void;
  onConfirm: (votes: any[]) => void;
  loading?: boolean;
}

export const ReviewVote: React.FC<ReviewVoteProps> = ({
  selectedVotes,
  candidates,
  onBack,
  onConfirm,
  loading = false
}) => {
  const { user } = useAuth();

  // Get candidate details for each selected vote
  const getSelectedCandidate = (position: string) => {
    const candidateId = selectedVotes[position];
    return candidates.find(c => c.id === candidateId);
  };

  const positions = Object.keys(selectedVotes);

  const handleConfirm = () => {
    const votes = Object.entries(selectedVotes).map(([position, candidateId]) => ({
      candidateId,
      position,
      candidateName: getSelectedCandidate(position)?.name,
      candidateParty: getSelectedCandidate(position)?.party
    }));
    onConfirm(votes);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card animate-fadeIn">
        <div className="card-header">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Review Your Vote</h1>
              <p className="text-gray-600">Please verify your selections before submitting</p>
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Voter Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">Voter Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-700">Student ID</p>
                  <p className="font-medium text-blue-900">{user?.studentId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-700">Full Name</p>
                  <p className="font-medium text-blue-900">{user?.fullName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <School className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-700">Course & Section</p>
                  <p className="font-medium text-blue-900">
                    {user?.course} - {user?.section}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-700">Year Level</p>
                  <p className="font-medium text-blue-900">
                    {user?.yearLevel ? `Year ${user.yearLevel}` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Candidates */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Selections</h2>
            
            {positions.map((position) => {
              const candidate = getSelectedCandidate(position);
              return (
                <div key={position} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">{position}</h3>
                  {candidate ? (
                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={candidate.image_url || `https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop`}
                        alt={candidate.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-lg">{candidate.name}</h4>
                        <p className="text-gray-600">{candidate.party}</p>
                        {candidate.manifesto && (
                          <p className="text-sm text-gray-500 mt-1">{candidate.manifesto}</p>
                        )}
                      </div>
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-500 bg-red-50 p-3 rounded-lg">
                      No candidate selected for this position
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Important Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800">Important Notice</h4>
                <ul className="text-yellow-700 text-sm mt-1 space-y-1">
                  <li>• Once submitted, your vote cannot be changed or revoked</li>
                  <li>• Your vote is anonymous and securely encrypted</li>
                  <li>• Verify all selections are correct before confirming</li>
                  <li>• You will receive a voting receipt after submission</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <button
                onClick={onBack}
                disabled={loading}
                className="btn-secondary flex items-center justify-center space-x-2 sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Voting</span>
              </button>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="text-sm text-gray-600 text-center sm:text-right">
                  {positions.length} position{positions.length !== 1 ? 's' : ''} selected
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="btn-primary flex items-center justify-center space-x-2 sm:w-auto min-w-[140px]"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm & Submit Vote</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};