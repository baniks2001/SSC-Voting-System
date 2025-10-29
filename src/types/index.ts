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
  blockchainReceiptId?: string;
  blockchainTxHash?: string;
  blockchainVerified?: boolean;      // NEW: Add verification status
  blockchainNode?: string;           // NEW: Which node processed the vote
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
  blockchain_receipt_id?: string;
  blockchain_tx_hash?: string;
  blockchain_verified?: boolean;
  blockchain_node?: string;          // NEW: Which blockchain node processed this
  last_verified_at?: string;         // NEW: Last verification timestamp
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
  blockchainReceiptId?: string;
  blockchainTxHash?: string;
  blockchainNode?: string;           // NEW: Which node processed this
  blockNumber?: number;              // NEW: Block number on chain
  gasUsed?: string;                  // NEW: Gas used for transaction
}

// NEW: Enhanced Blockchain types
export interface BlockchainVote {
  studentId: string;
  receiptId: string;
  votes: string;
  timestamp: number;
  transactionHash: string;
  blockNumber?: number;
  node: string;                      // NEW: Which node processed this
  gasUsed?: string;                  // NEW: Gas used
  status: 'confirmed' | 'pending' | 'failed'; // NEW: Transaction status
}

export interface VoteVerification {
  studentId: string;
  receiptId: string;
  votes: string;
  timestamp: number;
  verified: boolean;
  blockNumber?: number;
  transactionHash?: string;
  node?: string;                     // NEW: Which node was verified
  confirmations?: number;            // NEW: Number of confirmations
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
  blockchain_tx_hash?: string;       // NEW: Associated blockchain transaction
}

export interface DashboardStats {
  totalVoters: number;
  totalCandidates: number;
  totalVotes: number;
  auditLogs: AuditLog[];
  blockchainStats?: {                // NEW: Blockchain-specific stats
    totalBlockchainVotes: number;
    connectedNodes: number;
    totalNodes: number;
    lastBlockNumber: number;
    simulationMode: boolean;
  };
}

export interface PollSettings {
  id: number;
  is_active: boolean;
  is_paused: boolean;
  start_time?: string;
  end_time?: string;
  paused_at?: string;
  blockchain_enabled?: boolean;      // NEW: Whether blockchain is enabled
}

// Enhanced PollResults with better blockchain info
export interface PollResults {
  candidates: Candidate[];
  totalVotes: number;
  lastUpdated: string;
  blockchainInfo?: {
    isConnected: boolean;
    node: string;
    blockNumber: string;
    simulationMode: boolean;
    connectedNodes: number;
    totalNodes: number;
    networkId?: number;              // NEW: Network/Chain ID
    accountStatus?: {                // NEW: Account information
      address: string;
      balance: string;
      unlocked: boolean;
    };
    contractDeployed?: boolean;      // NEW: Whether contract is deployed
  };
}

export interface BlockchainNode {
  name: string;
  url: string;
  connected: boolean;
  account: string;
  lastBlock: number;
  chainId?: number;                  // NEW: Chain ID
  balance?: string;                  // NEW: Account balance
  peerCount?: number;                // NEW: Number of peers
  isSyncing?: boolean;               // NEW: Sync status
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
  blockchainVerified?: boolean;
  blockchainTxHash?: boolean;
  blockchainNode?: boolean;          // NEW: Which node processed
  blockchainReceiptId?: boolean;     // NEW: Receipt ID
}

// NEW: Blockchain Network Status
export interface BlockchainNetworkStatus {
  isConnected: boolean;
  networkId: number;
  blockNumber: string;
  accounts: string[];
  accountStatus: {
    unlocked: boolean;
    balance: string;
    address: string;
  };
  node: string;
  contractDeployed: boolean;
  simulationMode: boolean;
  storageType: 'fully_decentralized' | 'hybrid' | 'centralized';
  nodes: BlockchainNode[];
  totalNodes: number;
  connectedNodes: number;
}

// NEW: Blockchain Transaction Receipt
export interface BlockchainReceipt {
  transactionHash: string;
  blockNumber: string;
  voterHash: string;
  gasUsed: string;
  timestamp: string;
  node: string;
  simulated: boolean;
  ballotId?: string;
  status?: 'success' | 'failed' | 'pending';
}

// NEW: Blockchain Vote Submission Result
export interface BlockchainVoteResult {
  success: boolean;
  receipt: BlockchainReceipt;
  node?: string;
  simulated?: boolean;
  message?: string;
  voteReceipt?: {
    ballotId: string;
    transactionHash: string;
    blockNumber: string;
    timestamp: string;
    voterHash: string;
  };
}

// NEW: Vote data for blockchain submission
export interface BlockchainVoteData {
  voterId: string;
  votes: Vote[];
  timestamp: string;
  ballotId: string;
  voterHash: string;
}

// NEW: Error types for blockchain operations
export interface BlockchainError {
  code: string;
  message: string;
  node?: string;
  transactionHash?: string;
}

// NEW: Election results from blockchain
export interface BlockchainElectionResults {
  results: {
    [position: string]: {
      [candidateId: string]: {
        candidateId: string;
        voteCount: number;
      };
    };
  };
  totalVotes: number;
  voteData: BlockchainVote[];
  lastBlockNumber: number;
}

// NEW: Verification result
export interface VerificationResult {
  exists: boolean;
  details: BlockchainVote | null;
  confirmations: number;
  verified: boolean;
  node?: string;
}

// NEW: Node status for monitoring
export interface NodeStatus {
  name: string;
  url: string;
  connected: boolean;
  account: string;
  lastBlock: number;
  chainId?: number;
  balance?: string;
  peerCount?: number;
  isSyncing?: boolean;
  responseTime?: number; // in ms
  lastError?: string;
}

// NEW: Multi-node status
export interface MultiNodeStatus {
  nodes: NodeStatus[];
  totalNodes: number;
  connectedNodes: number;
  primaryNode?: string;
  loadBalancing: 'round-robin' | 'priority' | 'fallback';
}