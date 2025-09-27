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
  const { user, isAuthenticated, loading } = useAuth();
  const { showToast } = useToast();
  
  // Auth state
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  // Admin state
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  
  // Voter state
  const [voteReceipt, setVoteReceipt] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // Check if admin param exists in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setShowAdminLogin(true);
    }
  }, []);

  const handleVoteCast = (receipt: any) => {
    setVoteReceipt(receipt);
    setShowConfirmation(true);
  };

  const handleVoteConfirm = async () => {
    try {
      // In a real implementation, you might want to finalize the vote here
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

  // Voter Interface
  if (user?.hasVoted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <VoteReceipt receipt={user as any} />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <CastVote onVoteCast={handleVoteCast} />
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