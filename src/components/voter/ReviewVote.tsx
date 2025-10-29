import React, { useState, useCallback } from 'react';
import { User, School, Calendar, ArrowLeft, ShieldCheck, Hash, CheckCircle } from 'lucide-react';
import { Candidate } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface ReviewVoteProps {
  selectedVotes: { [position: string]: number };
  candidates: Candidate[];
  onBack: () => void;
  onConfirm: (votes: any[], ballotId: string, hashedBallotId: string) => void;
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
  const [ballotId, setBallotId] = useState<string>('');
  const [hashedBallotId, setHashedBallotId] = useState<string>('');

  // Generate secure ballot ID and its hash using Web Crypto API
  const generateSecureBallotId = useCallback(async (): Promise<{ ballotId: string; hashedBallotId: string }> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const timestamp = Date.now().toString();
    const randomSalt = crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
    const voterData = `${user.studentId}-${user.fullName}-${timestamp}-${randomSalt}`;
    
    // Generate ballot ID (shorter, readable version)
    const ballotId = `ballot_${timestamp}_${randomSalt.substring(0, 8)}`;
    
    // Generate secure hash of ballot ID for blockchain storage
    const encoder = new TextEncoder();
    const data = encoder.encode(voterData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedBallotId = `0x${hashArray.map(b => b.toString(16).padStart(2, '0')).join('')}`;
    
    return { ballotId, hashedBallotId };
  }, [user]);

  // Initialize ballot ID on component mount
  React.useEffect(() => {
    const initBallotId = async () => {
      try {
        const { ballotId, hashedBallotId } = await generateSecureBallotId();
        setBallotId(ballotId);
        setHashedBallotId(hashedBallotId);
      } catch (error) {
        console.error('Error generating ballot ID:', error);
        // Fallback generation
        const timestamp = Date.now().toString();
        const randomSalt = Math.random().toString(36).substring(2, 10);
        setBallotId(`ballot_${timestamp}_${randomSalt}`);
        setHashedBallotId(`fallback_${timestamp}_${randomSalt}`);
      }
    };

    initBallotId();
  }, [generateSecureBallotId]);

  // Get candidate details for each selected vote
  const getSelectedCandidate = (position: string) => {
    const candidateId = selectedVotes[position];
    return candidates.find(c => c.id === candidateId);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/default-avatar.png';
  };

  const handleConfirm = async () => {
    try {
      if (!hashedBallotId) {
        throw new Error('Ballot ID not properly generated');
      }

      const votes = Object.entries(selectedVotes).map(([position, candidateId]) => {
        const candidate = getSelectedCandidate(position);
        return {
          candidateId,
          position,
          candidateName: candidate?.name || 'Unknown Candidate',
          candidateParty: candidate?.party || 'No Party',
          ballotId: hashedBallotId // Use hashed version for security
        };
      });
      
      onConfirm(votes, ballotId, hashedBallotId);
    } catch (error) {
      console.error('Error preparing vote:', error);
      alert('Error preparing your vote. Please try again.');
    }
  };

  const formatBallotId = (id: string) => {
    if (!id) return 'N/A';
    // Shorter format for mobile
    if (window.innerWidth < 768) {
      return `${id.substring(0, 6)}...${id.substring(id.length - 6)}`;
    }
    return `${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
  };

  const formatHashedBallotId = (hash: string) => {
    if (!hash) return 'N/A';
    if (hash.startsWith('0x')) {
      return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
    }
    return formatBallotId(hash);
  };

  const positions = Object.keys(selectedVotes);

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
          <div className="text-gray-800 py-8">
            <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-blue-800" />
            <p className="text-lg font-semibold">User not authenticated</p>
            <p className="text-sm text-gray-600 mt-2">Please log in again to continue voting</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-4 px-3 sm:px-4 lg:px-6">
      {/* Mobile First Container */}
      <div className="max-w-6xl mx-auto">
        {/* Responsive Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 sm:mb-6 overflow-hidden">
          <div className="p-4 sm:p-6 bg-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-blue-800" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  Review Your Vote
                </h1>
                <p className="text-gray-600 text-sm sm:text-base mt-1">
                  Please verify your selections before submitting
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Voter Info & Actions */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Voter Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-800" />
                Voter Information
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Student ID</p>
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {user.studentId}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Full Name</p>
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {user.fullName}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Course & Section</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {user.course} - {user.section}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Year Level</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {user.yearLevel ? `Year ${user.yearLevel}` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Ballot ID Section */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Hash className="w-4 h-4 text-blue-800 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-700 mb-1">Ballot ID (Readable)</p>
                      <p className="font-mono text-xs text-gray-900 break-all bg-gray-50 rounded px-2 py-1">
                        {formatBallotId(ballotId)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-700 mb-1">Secure Hash (Blockchain)</p>
                      <p className="font-mono text-xs text-gray-900 break-all bg-green-50 rounded px-2 py-1">
                        {formatHashedBallotId(hashedBallotId)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        This secure hash will be recorded on the blockchain
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-gray-100 rounded-full px-4 py-2 inline-block">
                    <p className="text-sm font-semibold text-gray-800">
                      {positions.length} position{positions.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleConfirm}
                    disabled={loading || !ballotId || !hashedBallotId}
                    className="w-full bg-blue-800 hover:bg-blue-900 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Confirm & Submit Vote</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={onBack}
                    disabled={loading}
                    className="w-full bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:border-gray-300 text-gray-700 hover:text-gray-800 py-3 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-blue-800" />
                    <span>Back to Voting</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Important Notice - Mobile Only */}
            <div className="lg:hidden bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-blue-800 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Security Features</h4>
                  <ul className="text-gray-700 text-xs mt-1 space-y-1">
                    <li>• Secure SHA-256 hashing</li>
                    <li>• Blockchain immutability</li>
                    <li>• Anonymous voting</li>
                    <li>• Cryptographic proof</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Selected Candidates */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Selected Candidates Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-blue-800" />
                Your Selections
              </h2>
              
              <div className="space-y-4 sm:space-y-6">
                {positions.map((position) => {
                  const candidate = getSelectedCandidate(position);
                  return (
                    <div key={position} className="border border-gray-200 rounded-xl p-4 bg-white hover:bg-gray-50 transition-colors duration-200">
                      <h3 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg bg-gray-100 rounded-lg px-3 py-2">
                        {position}
                      </h3>
                      {candidate ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3 w-full sm:w-auto">
                            <img
                              src={candidate.image_url || '/default-avatar.png'}
                              alt={candidate.name}
                              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0 border-2 border-gray-300"
                              onError={handleImageError}
                            />
                            <div className="min-w-0 flex-1 sm:hidden">
                              <h4 className="font-semibold text-gray-900 text-sm truncate">
                                {candidate.name}
                              </h4>
                              <p className="text-gray-600 text-xs truncate">
                                {candidate.party}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0 w-full">
                            <div className="hidden sm:block">
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {candidate.name}
                              </h4>
                              <p className="text-gray-600">{candidate.party}</p>
                            </div>
                            {candidate.manifesto && (
                              <p className="text-sm text-gray-700 mt-2 line-clamp-2 bg-gray-50 rounded-lg px-3 py-2">
                                {candidate.manifesto}
                              </p>
                            )}
                          </div>
                          
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-red-500 bg-red-50 p-3 rounded-lg text-sm border border-red-200">
                          No candidate selected for this position
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Security Notice - Desktop Only */}
            <div className="hidden lg:block bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <ShieldCheck className="w-6 h-6 text-blue-800 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg mb-3">Security Features</h4>
                  <ul className="text-gray-700 text-sm space-y-2">
                    <li className="flex items-start space-x-2">
                      <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>SHA-256 Hashing:</strong> Your ballot ID is securely hashed before blockchain storage</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Blockchain Immutability:</strong> Votes cannot be altered once recorded</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Anonymous Voting:</strong> Personal information is never stored on-chain</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Cryptographic Proof:</strong> Receipt provides verifiable proof of voting</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar - Mobile Only */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="flex space-x-3">
            <button
              onClick={onBack}
              disabled={loading}
              className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4 text-blue-800" />
              <span>Back</span>
            </button>
            
            <button
              onClick={handleConfirm}
              disabled={loading || !ballotId || !hashedBallotId}
              className="flex-1 bg-blue-800 hover:bg-blue-900 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Add padding to account for fixed bottom bar on mobile */}
        <div className="lg:hidden h-20"></div>
      </div>
    </div>
  );
};