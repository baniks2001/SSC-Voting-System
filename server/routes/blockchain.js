import express from 'express';
import { ethereumService } from '../services/ethereumService.js';
import { pool } from '../config/database.js';
import { logAuditAction } from '../utils/audit.js';

const router = express.Router();

// Node configuration for decentralization
const NODE_CONFIG = {
  primary: {
    id: 'node-1',
    url: process.env.ETH_NODE_URL_1 || 'http://localhost:8545',
    priority: 1,
    active: true
  },
  backup: {
    id: 'node-2', 
    url: process.env.ETH_NODE_URL_2 || 'http://localhost:8546',
    priority: 2,
    active: true
  }
};

// Node health tracker
let nodeHealth = {
  'node-1': { healthy: true, lastCheck: Date.now(), failureCount: 0 },
  'node-2': { healthy: true, lastCheck: Date.now(), failureCount: 0 }
};

// Node management service
class DecentralizedNodeManager {
  constructor() {
    this.currentNode = NODE_CONFIG.primary;
    this.fallbackAttempted = false;
  }

  // Health check for nodes
  async checkNodeHealth(nodeConfig) {
    try {
      const startTime = Date.now();
      // Simulate health check - in real implementation, this would ping the node
      const isHealthy = Math.random() > 0.1; // 90% success rate for simulation
      
      nodeHealth[nodeConfig.id] = {
        healthy: isHealthy,
        lastCheck: Date.now(),
        responseTime: Date.now() - startTime,
        failureCount: isHealthy ? 0 : (nodeHealth[nodeConfig.id]?.failureCount || 0) + 1
      };

      return isHealthy;
    } catch (error) {
      nodeHealth[nodeConfig.id] = {
        healthy: false,
        lastCheck: Date.now(),
        failureCount: (nodeHealth[nodeConfig.id]?.failureCount || 0) + 1
      };
      return false;
    }
  }

  // Get the best available node
  async getBestNode() {
    // Check primary node first
    const primaryHealthy = await this.checkNodeHealth(NODE_CONFIG.primary);
    
    if (primaryHealthy) {
      console.log(`✅ Using primary node: ${NODE_CONFIG.primary.id}`);
      this.currentNode = NODE_CONFIG.primary;
      this.fallbackAttempted = false;
      return NODE_CONFIG.primary;
    }

    // Primary failed, try backup
    console.log(`⚠️ Primary node ${NODE_CONFIG.primary.id} unhealthy, trying backup...`);
    const backupHealthy = await this.checkNodeHealth(NODE_CONFIG.backup);
    
    if (backupHealthy) {
      console.log(`✅ Using backup node: ${NODE_CONFIG.backup.id}`);
      this.currentNode = NODE_CONFIG.backup;
      this.fallbackAttempted = true;
      return NODE_CONFIG.backup;
    }

    // Both nodes failed
    console.log('❌ All nodes are unavailable');
    throw new Error('All blockchain nodes are currently unavailable');
  }

  // Switch back to primary if it becomes healthy again
  async attemptSwitchToPrimary() {
    if (this.fallbackAttempted && this.currentNode.id === NODE_CONFIG.backup.id) {
      const primaryHealthy = await this.checkNodeHealth(NODE_CONFIG.primary);
      if (primaryHealthy) {
        console.log(`🔄 Switching back to primary node: ${NODE_CONFIG.primary.id}`);
        this.currentNode = NODE_CONFIG.primary;
        this.fallbackAttempted = false;
      }
    }
  }

  // Get current node status
  getNodeStatus() {
    return {
      currentNode: this.currentNode,
      nodeHealth,
      fallbackActive: this.fallbackAttempted
    };
  }
}

// Initialize node manager
const nodeManager = new DecentralizedNodeManager();

// Enhanced Ethereum service with node management
class DecentralizedEthereumService {
  async submitVote(voteData) {
    const node = await nodeManager.getBestNode();
    
    try {
      console.log(`📝 Submitting vote via ${node.id}...`);
      
      // Simulate different node behaviors for demonstration
      if (node.id === 'node-1') {
        // Primary node - normal operation
        return await ethereumService.submitVote(voteData);
      } else {
        // Backup node - might have slight differences
        return await ethereumService.submitVote(voteData);
      }
    } catch (error) {
      console.error(`❌ Node ${node.id} failed:`, error.message);
      
      // Mark node as unhealthy and retry with other node
      nodeHealth[node.id].healthy = false;
      nodeHealth[node.id].failureCount++;
      
      // Retry with other node if available
      if (node.id === NODE_CONFIG.primary.id && nodeHealth[NODE_CONFIG.backup.id].healthy) {
        console.log(`🔄 Retrying with backup node after primary failure...`);
        return await this.submitVote(voteData);
      }
      
      throw error;
    }
  }

  async verifyTransaction(transactionHash) {
    const node = await nodeManager.getBestNode();
    console.log(`🔍 Verifying transaction via ${node.id}...`);
    
    try {
      return await ethereumService.verifyTransaction(transactionHash);
    } catch (error) {
      console.error(`❌ Node ${node.id} verification failed:`, error.message);
      nodeHealth[node.id].healthy = false;
      
      // Retry with other node
      if (node.id === NODE_CONFIG.primary.id && nodeHealth[NODE_CONFIG.backup.id].healthy) {
        return await this.verifyTransaction(transactionHash);
      }
      throw error;
    }
  }

  async getBlockchainInfo() {
    const node = await nodeManager.getBestNode();
    
    try {
      const info = await ethereumService.getBlockchainInfo();
      
      // Enhance info with node details
      return {
        ...info,
        nodeUsed: node.id,
        nodeStatus: nodeManager.getNodeStatus()
      };
    } catch (error) {
      console.error(`❌ Node ${node.id} info fetch failed:`, error.message);
      nodeHealth[node.id].healthy = false;
      
      if (node.id === NODE_CONFIG.primary.id && nodeHealth[NODE_CONFIG.backup.id].healthy) {
        return await this.getBlockchainInfo();
      }
      throw error;
    }
  }
}

const decentralizedEthereumService = new DecentralizedEthereumService();

// Submit vote to blockchain with node failover
router.post('/cast-blockchain', async (req, res) => {
  try {
    const { voterId, votes } = req.body;

    if (!voterId || !votes || !Array.isArray(votes)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vote data'
      });
    }

    // Get voter details from database
    const [voterRows] = await pool.execute(
      'SELECT * FROM voters WHERE student_id = ?',
      [voterId]
    );

    if (voterRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Voter not found'
      });
    }

    const voter = voterRows[0];

    // Check if voter has already voted
    if (voter.has_voted) {
      return res.status(400).json({
        success: false,
        error: 'Voter has already cast a vote'
      });
    }

    // Generate voter hash for anonymity
    const timestamp = new Date().toISOString();
    const voterHash = ethereumService.generateVoterHash(voter.student_id, voter.full_name, timestamp);

    // Prepare vote data for blockchain
    const voteData = {
      voterId: voter.student_id,
      voterHash,
      votes,
      timestamp
    };

    // Submit to blockchain with failover support
    const blockchainResult = await decentralizedEthereumService.submitVote(voteData);

    if (!blockchainResult.success) {
      await logAuditAction(voter.id, 'voter', 'VOTE_FAILED', `Blockchain submission failed: ${blockchainResult.error}`, req);
      
      return res.status(500).json({
        success: false,
        error: `Blockchain submission failed: ${blockchainResult.error}`
      });
    }

    // Update database to mark voter as voted
    await pool.execute(
      'UPDATE voters SET has_voted = true, vote_hash = ?, voted_at = ? WHERE id = ?',
      [voterHash, new Date(), voter.id]
    );

    // Record each vote in the database
    for (const vote of votes) {
      await pool.execute(
        'INSERT INTO votes (voter_id, candidate_id, position, voter_hash, transaction_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [voter.id, vote.candidateId, vote.position, voterHash, blockchainResult.receipt.transactionHash, new Date()]
      );
    }

    await logAuditAction(voter.id, 'voter', 'VOTE_CAST', `Vote successfully cast via ${nodeManager.currentNode.id}`, req);

    res.json({
      success: true,
      receipt: blockchainResult.receipt,
      nodeUsed: nodeManager.currentNode.id,
      message: 'Vote successfully recorded on blockchain'
    });

  } catch (error) {
    console.error('Blockchain vote submission error:', error);
    
    const nodeStatus = nodeManager.getNodeStatus();
    await logAuditAction(voter?.id, 'voter', 'VOTE_FAILED', `All nodes failed: ${error.message}`, req);

    res.status(500).json({
      success: false,
      error: 'Failed to submit vote to blockchain',
      nodeStatus: nodeStatus.nodeHealth
    });
  }
});

// Verify transaction on blockchain with failover
router.get('/verify-transaction/:transactionHash', async (req, res) => {
  try {
    const { transactionHash } = req.params;

    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        error: 'Transaction hash is required'
      });
    }

    const verification = await decentralizedEthereumService.verifyTransaction(transactionHash);

    res.json({
      success: true,
      verification,
      nodeUsed: nodeManager.currentNode.id
    });

  } catch (error) {
    console.error('Transaction verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify transaction',
      nodeStatus: nodeManager.getNodeStatus().nodeHealth
    });
  }
});

// Get blockchain status and info with node details
router.get('/status', async (req, res) => {
  try {
    const blockchainInfo = await decentralizedEthereumService.getBlockchainInfo();

    res.json({
      success: true,
      blockchain: blockchainInfo
    });

  } catch (error) {
    console.error('Blockchain status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get blockchain status',
      nodeStatus: nodeManager.getNodeStatus().nodeHealth
    });
  }
});

// Test blockchain connection with node failover
router.get('/test-connection', async (req, res) => {
  try {
    const blockchainInfo = await decentralizedEthereumService.getBlockchainInfo();
    
    // Attempt to switch back to primary if we're on backup
    await nodeManager.attemptSwitchToPrimary();

    res.json({
      success: true,
      connected: blockchainInfo.isConnected,
      blockNumber: blockchainInfo.blockNumber,
      currentNode: nodeManager.currentNode.id,
      nodeHealth: nodeManager.getNodeStatus().nodeHealth,
      message: blockchainInfo.isConnected ? 
        `Successfully connected to Ethereum via ${nodeManager.currentNode.id}` : 
        'Not connected to Ethereum node'
    });

  } catch (error) {
    console.error('Blockchain connection test error:', error);
    res.status(500).json({
      success: false,
      connected: false,
      currentNode: nodeManager.currentNode.id,
      nodeHealth: nodeManager.getNodeStatus().nodeHealth,
      error: error.message
    });
  }
});

// Node management endpoints
router.get('/nodes/status', (req, res) => {
  res.json({
    success: true,
    ...nodeManager.getNodeStatus()
  });
});

router.post('/nodes/switch-primary', async (req, res) => {
  try {
    await nodeManager.attemptSwitchToPrimary();
    res.json({
      success: true,
      message: 'Node switch attempted',
      currentNode: nodeManager.currentNode.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;