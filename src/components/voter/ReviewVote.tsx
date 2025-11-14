import React, { useState, useCallback } from 'react';
import { User, ArrowLeft, ShieldCheck, Hash, CheckCircle } from 'lucide-react';
import { Candidate, Position } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { api } from '../../utils/api';
import { VoteReceipt } from './VoteReceipt';

interface ReviewVoteProps {
  selectedVotes: { [position: string]: number[] };
  candidates: Candidate[];
  positions: Position[];
  onBack: () => void;
  onVoteCast: (receipt: any) => void;
  onLogout: () => void;
  loading?: boolean;
}

export const ReviewVote: React.FC<ReviewVoteProps> = ({
  selectedVotes,
  candidates,
  positions,
  onBack,
  onVoteCast,
  onLogout,
  loading = false
}) => {
  const { user } = useAuth();
  const [ballotId, setBallotId] = useState<string>('');
  const [hashedBallotId, setHashedBallotId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [submittedVotes, setSubmittedVotes] = useState<any[]>([]);

  // Generate cryptographically secure random string
  const generateSecureRandom = (length: number): string => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  // Generate unique and secure ballot ID with timestamp and random data
  const generateSecureBallotId = useCallback(async (): Promise<{ ballotId: string; hashedBallotId: string }> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate unique components
    const timestamp = Date.now().toString(36); // Base36 for shorter representation
    const randomPart1 = generateSecureRandom(8); // 8 bytes = 16 hex chars
    const randomPart2 = generateSecureRandom(4); // 4 bytes = 8 hex chars
    const voterSalt = generateSecureRandom(2); // 2 bytes = 4 hex chars

    // Create unique ballot ID with multiple entropy sources
    const uniqueBallotId = `vote_${timestamp}_${randomPart1}_${randomPart2}_${voterSalt}`;
    
    // Create data for hashing with additional entropy
    const hashData = `${user.studentId}-${user.fullName}-${timestamp}-${randomPart1}-${randomPart2}-${voterSalt}-${Date.now()}-${Math.random()}`;
    
    // Generate SHA-256 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(hashData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const secureHashedBallotId = `0x${hashArray.map(b => b.toString(16).padStart(2, '0')).join('')}`;
    
    console.log('🔐 Generated secure ballot IDs:', {
      readableId: uniqueBallotId,
      hashedId: `${secureHashedBallotId.substring(0, 16)}...`,
      components: {
        timestamp,
        randomParts: `${randomPart1.substring(0, 4)}...${randomPart2.substring(0, 4)}...`,
        voterSalt: voterSalt.substring(0, 4)
      }
    });

    return { 
      ballotId: uniqueBallotId, 
      hashedBallotId: secureHashedBallotId 
    };
  }, [user]);

  // Initialize secure ballot IDs on component mount
  React.useEffect(() => {
    let isMounted = true;

    const initSecureBallotId = async () => {
      try {
        console.log('🔄 Generating secure ballot IDs...');
        const { ballotId: newBallotId, hashedBallotId: newHashedBallotId } = await generateSecureBallotId();
        
        if (isMounted) {
          setBallotId(newBallotId);
          setHashedBallotId(newHashedBallotId);
          console.log('✅ Secure ballot IDs generated successfully');
        }
      } catch (error) {
        console.error('❌ Error generating secure ballot ID:', error);
        
        if (isMounted) {
          // Fallback generation with maximum entropy
          const timestamp = Date.now().toString(36);
          const fallbackRandom1 = Math.random().toString(36).substring(2, 15);
          const fallbackRandom2 = Math.random().toString(36).substring(2, 15);
          const fallbackSalt = Math.random().toString(36).substring(2, 6);
          
          const fallbackBallotId = `vote_${timestamp}_${fallbackRandom1}_${fallbackRandom2}_${fallbackSalt}`;
          const fallbackHashedId = `0x${Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0')).join('')}_fallback`;
          
          setBallotId(fallbackBallotId);
          setHashedBallotId(fallbackHashedId);
          console.warn('⚠️ Using fallback ballot ID generation');
        }
      }
    };

    initSecureBallotId();

    return () => {
      isMounted = false;
    };
  }, [generateSecureBallotId]);

  const getSelectedCandidates = (position: string) => {
    const candidateIds = selectedVotes[position] || [];
    return candidateIds.map(candidateId => 
      candidates.find(c => c.id === candidateId)
    ).filter(Boolean) as Candidate[];
  };

  const handleConfirm = async () => {
    try {
      if (!hashedBallotId || !ballotId) {
        throw new Error('Secure ballot IDs not properly generated');
      }

      // Validate ballot ID uniqueness components
      if (!ballotId.includes('_') || ballotId.split('_').length < 4) {
        throw new Error('Invalid ballot ID format');
      }

      setIsSubmitting(true);

      // First, mark the voter as voted in the SQL database with ballot ID
      try {
        console.log('🔄 Marking voter as voted in SQL database...');
        const markVotedResponse = await api.post('/voting/mark-voted', {
          studentId: user?.studentId,
          ballotId: ballotId // Add ballotId here
        });

        if (!markVotedResponse.success) {
          throw new Error(markVotedResponse.error || 'Failed to update voter status');
        }
        
        console.log('✅ Voter marked as voted in SQL database with ballot ID:', ballotId);
      } catch (error) {
        console.error('❌ Failed to mark voter as voted:', error);
        throw new Error('Failed to update your voting status. Please try again.');
      }

      // Prepare votes for submission
      const votes = Object.entries(selectedVotes).flatMap(([position, candidateIds]) => {
        return candidateIds.map(candidateId => {
          const candidate = candidates.find(c => c.id === candidateId);
          return {
            candidateId,
            position,
            candidateName: candidate?.name || 'Unknown Candidate',
            candidateParty: candidate?.party || 'No Party',
            ballotId: hashedBallotId // Use secure hash for blockchain
          };
        });
      });

      console.log('📋 Prepared votes for submission:', {
        ballotId: ballotId,
        hashedBallotId: `${hashedBallotId.substring(0, 16)}...`,
        voteCount: votes.length,
        positions: Object.keys(selectedVotes).length
      });

      // Store votes for receipt display
      setSubmittedVotes(votes);
      
      // Show receipt component which will handle blockchain submission
      setShowReceipt(true);
      
    } catch (error) {
      console.error('❌ Error preparing vote:', error);
      alert(error.message || 'Error preparing your vote. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleVoteComplete = (receipt: any) => {
    // Pass the receipt back to CastVote component
    onVoteCast(receipt);
  };

  const handleBackFromReceipt = () => {
    setShowReceipt(false);
    setIsSubmitting(false);
  };

  const formatBallotId = (id: string) => {
    if (!id) return 'Generating...';
    if (window.innerWidth < 768) {
      return `${id.substring(0, 10)}...${id.substring(id.length - 6)}`;
    }
    return `${id.substring(0, 12)}...${id.substring(id.length - 8)}`;
  };

  const formatHashedBallotId = (hash: string) => {
    if (!hash) return 'Generating...';
    if (hash.startsWith('0x')) {
      if (window.innerWidth < 768) {
        return `${hash.substring(0, 12)}...${hash.substring(hash.length - 8)}`;
      }
      return `${hash.substring(0, 16)}...${hash.substring(hash.length - 8)}`;
    }
    return formatBallotId(hash);
  };

  const isConfirmDisabled = loading || isSubmitting || !ballotId || !hashedBallotId || ballotId === 'Generating...';

  // Show VoteReceipt if vote is being submitted or was successfully submitted
  if (showReceipt) {
    return (
      <VoteReceipt
        votes={submittedVotes}
        ballotId={ballotId}
        hashedBallotId={hashedBallotId}
        onVoteComplete={handleVoteComplete}
        onBack={handleBackFromReceipt}
      />
    );
  }

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
      <div className="max-w-6xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
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

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Hash className="w-4 h-4 text-blue-800 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-700 mb-1">Unique Ballot ID</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-mono text-xs text-gray-900 break-all bg-gray-50 rounded px-2 py-1 flex-1">
                          {formatBallotId(ballotId)}
                        </p>
                        {!ballotId && (
                          <LoadingSpinner size="xs" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Timestamp + cryptographically secure random data
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-700 mb-1">Secure Hash (Blockchain)</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-mono text-xs text-gray-900 break-all bg-green-50 rounded px-2 py-1 flex-1">
                          {formatHashedBallotId(hashedBallotId)}
                        </p>
                        {!hashedBallotId && (
                          <LoadingSpinner size="xs" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        SHA-256 hash for blockchain immutability
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-gray-100 rounded-full px-4 py-2 inline-block">
                    <p className="text-sm font-semibold text-gray-800">
                      {Object.keys(selectedVotes).length} position{Object.keys(selectedVotes).length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleConfirm}
                    disabled={isConfirmDisabled}
                    className="w-full bg-blue-800 hover:bg-blue-900 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
                  >
                    {(loading || isSubmitting) ? (
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
                    disabled={loading || isSubmitting}
                    className="w-full bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:border-gray-300 text-gray-700 hover:text-gray-800 py-3 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-blue-800" />
                    <span>Back to Voting</span>
                  </button>
                </div>

                {isConfirmDisabled && ballotId && hashedBallotId && (
                  <div className="text-center">
                    <p className="text-xs text-green-600 bg-green-50 rounded-lg p-2">
                      ✓ Secure ballot IDs generated and ready for submission
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:hidden bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-blue-800 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Security Features</h4>
                  <ul className="text-gray-700 text-xs mt-1 space-y-1">
                    <li>• Cryptographically secure ballot ID</li>
                    <li>• SHA-256 hashing for blockchain</li>
                    <li>• Multiple entropy sources</li>
                    <li>• Guaranteed uniqueness</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-blue-800" />
                Your Selections
              </h2>
              
              <div className="space-y-4 sm:space-y-6">
                {positions.map((position) => {
                  const selectedCandidates = getSelectedCandidates(position.name);
                  const maxVotes = position.maxVotes || 1;
                  
                  return (
                    <div key={position.id} className="border border-gray-200 rounded-xl p-4 bg-white hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg bg-gray-100 rounded-lg px-3 py-2">
                          {position.name}
                        </h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                          {selectedCandidates.length}/{maxVotes} selected
                        </span>
                      </div>
                      
                      {selectedCandidates.length > 0 ? (
                        <div className="space-y-3">
                          {selectedCandidates.map((candidate) => (
                            <div key={candidate.id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 bg-white rounded-lg border border-gray-200">
                              <div className="flex items-center space-x-3 w-full sm:w-auto">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-6 h-6 text-gray-500" />
                                </div>
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
                          ))}
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

            <div className="hidden lg:block bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <ShieldCheck className="w-6 h-6 text-blue-800 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg mb-3">Secure Ballot Generation</h4>
                  <ul className="text-gray-700 text-sm space-y-2">
                    <li className="flex items-start space-x-2">
                      <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Cryptographic Entropy:</strong> Multiple secure random sources prevent collisions</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>SHA-256 Hashing:</strong> Your ballot ID is securely hashed for blockchain storage</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Guaranteed Uniqueness:</strong> Timestamp + multiple random components ensure no duplicates</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Blockchain Ready:</strong> Secure hash format compatible with Ethereum blockchain</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="flex space-x-3">
            <button
              onClick={onBack}
              disabled={loading || isSubmitting}
              className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4 text-blue-800" />
              <span>Back</span>
            </button>
            
            <button
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              className="flex-1 bg-blue-800 hover:bg-blue-900 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {(loading || isSubmitting) ? (
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

        <div className="lg:hidden h-20"></div>
      </div>
    </div>
  );
};