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
}

// types.ts
export interface AuditLog {
  id: number;
  user_id?: number;
  user_type: 'admin' | 'voter' | 'system';
  action: string;
  details?: string;
  ip_address?: string;
  created_at: string;
  user_name?: string;  // Add this
  user_email?: string; // Add this
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

interface ExportOptions {
  studentId: boolean;
  fullName: boolean;
  course: boolean;
  yearLevel: boolean;
  section: boolean;
  hasVoted: boolean;
  votedAt: boolean;
  createdAt: boolean;
  password: boolean;
}

// Initial state should match these keys exactly
const [ExportOptions] = useState<ExportOptions>({
  studentId: true,
  fullName: true,
  course: true,
  yearLevel: true,
  section: true,
  hasVoted: true,
  votedAt: false,
  createdAt: false,
  password: true
});

function useState<T>(arg0: { studentId: boolean; fullName: boolean; course: boolean; yearLevel: boolean; section: boolean; hasVoted: boolean; votedAt: boolean; createdAt: boolean; password: boolean; }): [any] {
  throw new Error("Function not implemented.");
}
