export interface User {
  id: number;
  email?: string;
  studentId?: string;
  fullName: string;
  course?: string;
  yearLevel?: number;
  section?: string;
  role?: string;
  hasVoted?: boolean;
  voteHash?: string;
  votedAt?: string;
  isSuperAdmin?: boolean;
  blockchainReceiptId?: string; // NEW: Add blockchain receipt ID
  blockchainTxHash?: string;    // NEW: Add blockchain transaction hash
}

export interface Candidate {
  id: number;
  name: string;
  party: string;
  position: string;
  image_url?: string;
  vote_count?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Voter {
  id: number;
  student_id: string;
  full_name: string;
  course: string;
  year_level: number;
  section: string;
  has_voted: boolean;
  vote_hash?: string;
  voted_at?: string;
  created_at: string;
  blockchain_receipt_id?: string;    // NEW: Blockchain receipt ID
  blockchain_tx_hash?: string;       // NEW: Blockchain transaction hash
  blockchain_verified?: boolean;     // NEW: Verification status
}

export interface Admin {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'auditor' | 'poll_monitor';
  created_at: string;
  is_active: boolean;
}

export interface Vote {
  candidateId: number;
  candidateName: string;
  party: string;
  position: string;
}

export interface VoteReceipt {
  voteHash: string;
  votedAt: string;
  votes: Vote[];
  timestamp: string;
  blockchainVerified: boolean;
  blockchainReceiptId?: string;      // NEW
  blockchainTxHash?: string;         // NEW
}

// NEW: Blockchain-specific types
export interface BlockchainVote {
  studentId: string;
  receiptId: string;
  votes: string;
  timestamp: number;
  transactionHash: string;
  blockNumber?: number;
}

export interface VoteVerification {
  studentId: string;
  receiptId: string;
  votes: string;
  timestamp: number;
  verified: boolean;
  blockNumber?: number;
  transactionHash?: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_type: 'admin' | 'voter' | 'system';
  action: string;
  details?: string;
  ip_address?: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export interface DashboardStats {
  totalVoters: number;
  totalCandidates: number;
  totalVotes: number;
  auditLogs: AuditLog[];
}

export interface PollSettings {
  id: number;
  is_active: boolean;
  is_paused: boolean;
  start_time?: string;
  end_time?: string;
  paused_at?: string;
}

export interface PollResults {
  candidates: Candidate[];
  totalVotes: number;
  lastUpdated: string;
}

export interface ExportOptions {
  studentId: boolean;
  fullName: boolean;
  course: boolean;
  yearLevel: boolean;
  section: boolean;
  hasVoted: boolean;
  votedAt: boolean;
  createdAt: boolean;
  password: boolean;
  blockchainVerified?: boolean;      // NEW: Add blockchain verification status
  blockchainTxHash?: boolean;        // NEW: Add blockchain transaction hash
}