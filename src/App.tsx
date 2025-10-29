import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
  const { user, isAuthenticated, loading, logout } = useAuth(); // Add logout from context
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

  if (loading) {
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

  // Admin Interface
  if (user?.email) {
    return (
      <AdminLayout 
        activeTab={activeAdminTab} 
        onTabChange={setActiveAdminTab}
        onLogout={handleLogout} // Pass logout to AdminLayout
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

  // Legacy confirmation flow (you can remove this eventually)
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

  // Main voting interface
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <CastVote 
        onVoteCast={handleVoteCast}
        onShowReceipt={handleShowReceipt}
        onLogout={handleLogout} // Pass logout handler to CastVote
      />
    </div>
  );
}

function App() {
  const { toast, hideToast } = useToast();

  return (
    <AuthProvider>
      <AppContent />
      <Toast 
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </AuthProvider>
  );
}

export default App;