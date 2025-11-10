import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PollProvider, usePoll } from './contexts/PollContext';
import { LoginForm } from './components/auth/LoginForm';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { Toast, useToast } from './components/common/Toast';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './components/admin/Dashboard';
import { AdminManagement } from './components/admin/AdminManagement';
import { CandidateManagement } from './components/admin/CandidateManagement';
import { VoterManagement } from './components/admin/VoterManagement';
import { PollMonitor } from './components/admin/PollMonitor';
import { CastVote } from './components/voter/CastVote';
import { VoteReceipt } from './components/voter/VoteReceipt';
import './styles/globals.css';
import './styles/components.css';

function AppContent() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { pollStatus, isLoginEnabled, loading: pollLoading } = usePoll();
  const { showToast } = useToast();
  
  // Auth state
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  // Admin state
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  
  // Voter state
  const [voteReceipt, setVoteReceipt] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [pendingVotes, setPendingVotes] = useState<any[]>([]);

  useEffect(() => {
    // Check if admin param exists in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setShowAdminLogin(true);
    }
  }, []);

  // Handle logout from CastVote component
  const handleLogout = () => {
    logout();
    showToast('success', 'Successfully logged out');
  };

  // Handle when user confirms vote in ReviewVote
  const handleShowReceipt = (votes: any[]) => {
    setPendingVotes(votes);
    setShowReceipt(true);
  };

  // Handle blockchain submission completion from VoteReceipt
  const handleVoteComplete = (receipt: any) => {
    setVoteReceipt(receipt);
    setShowReceipt(false);
    // Update user context to mark as voted if needed
    showToast('success', 'Vote successfully recorded on blockchain!');
  };

  // Handle back from VoteReceipt to ReviewVote
  const handleBackToReview = () => {
    setShowReceipt(false);
    setPendingVotes([]);
  };

  // Legacy function for backward compatibility
  const handleVoteCast = (receipt: any) => {
    setVoteReceipt(receipt);
    setShowConfirmation(true);
  };

  const handleVoteConfirm = async () => {
    try {
      setShowConfirmation(false);
      showToast('success', 'Vote confirmed and recorded!');
    } catch (error: any) {
      showToast('error', 'Failed to confirm vote');
    }
  };

  const handleBackToVote = () => {
    setShowConfirmation(false);
    setVoteReceipt(null);
  };

  if (loading || (pollLoading && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginForm 
        isAdmin={showAdminLogin}
        onToggleAdmin={() => setShowAdminLogin(!showAdminLogin)}
      />
    );
  }

  // Admin Interface - Check if user has email (admin users) and NOT a voter
  if (user?.email && user?.type !== 'voter' && user?.role !== 'voter') {
    return (
      <AdminLayout 
        activeTab={activeAdminTab} 
        onTabChange={setActiveAdminTab}
        onLogout={handleLogout}
      >
        {activeAdminTab === 'dashboard' && <Dashboard />}
        {activeAdminTab === 'admins' && (
          <AdminManagement />
        )}
        {activeAdminTab === 'candidates' && (
          <CandidateManagement />
        )}
        {activeAdminTab === 'voters' && (
          <VoterManagement />
        )}
        {activeAdminTab === 'monitor' && (
          <PollMonitor />
        )}
      </AdminLayout>
    );
  }

  // Voter has already voted - Show receipt
  if (user?.hasVoted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <VoteReceipt receipt={user as any} />
      </div>
    );
  }

  // Check if voting is allowed for students (non-admin users)
  // Only show voting interface if poll is active
  if (!isLoginEnabled) {
    console.log('🚫 Voting disabled - Poll status:', pollStatus, 'Login enabled:', isLoginEnabled);
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="card-header">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <img 
                src="../../src/assets/logo.png"
                alt="Logo"
                className="w-82 h-82 rounded-full"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Voting Status</h1>
            <p className="text-sm text-gray-600 mt-1">
              Real-time API Status: {pollLoading ? 'Loading...' : 'Connected'}
            </p>
          </div>
          <div className="card-body">
            {pollStatus === 'paused' && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-6 rounded-lg mb-4">
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-lg">Voting is Paused</p>
                    <p className="text-sm mt-1">Please wait for voting to resume</p>
                    <p className="text-xs mt-2 text-yellow-700">
                      Admin has temporarily paused voting
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {pollStatus === 'finished' && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-6 rounded-lg mb-4">
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-lg">Voting Has Ended</p>
                    <p className="text-sm mt-1">Thank you for your participation</p>
                    <p className="text-xs mt-2 text-green-700">
                      The voting period has concluded
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {pollStatus === 'not_started' && (
              <div className="bg-gray-50 border border-gray-200 text-gray-800 px-4 py-6 rounded-lg mb-4">
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-lg">Voting Not Started</p>
                    <p className="text-sm mt-1">Please wait for voting to begin</p>
                    <p className="text-xs mt-2 text-gray-700">
                      Admin will start voting soon
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Debug info for development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 font-mono">
                  Debug: Status={pollStatus}, LoginEnabled={isLoginEnabled.toString()}
                </p>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show VoteReceipt for blockchain submission
  if (showReceipt && pendingVotes.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <VoteReceipt 
          votes={pendingVotes}
          onVoteComplete={handleVoteComplete}
          onBack={handleBackToReview}
        />
      </div>
    );
  }

  // Legacy confirmation flow
  if (showConfirmation && voteReceipt) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <VoteReceipt 
          receipt={voteReceipt}
          showConfirmation={true}
          onConfirm={handleVoteConfirm}
          onBack={handleBackToVote}
        />
      </div>
    );
  }

  // Main voting interface - Show if voting is active and user hasn't voted
  console.log('✅ Student voting interface - Poll active, login enabled');
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <CastVote 
        onVoteCast={handleVoteCast}
        onShowReceipt={handleShowReceipt}
        onLogout={handleLogout}
      />
    </div>
  );
}

function App() {
  const { toast, hideToast } = useToast();

  return (
    <PollProvider>
      <AuthProvider>
        <AppContent />
        <Toast 
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      </AuthProvider>
    </PollProvider>
  );
}

export default App;