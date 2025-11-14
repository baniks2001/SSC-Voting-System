import express from 'express';
import crypto from 'crypto';
import { ethereumService } from '../services/ethereumService.js';
import { logAuditAction } from '../utils/audit.js';
import { pool } from '../config/database.js';

const router = express.Router();

// BigInt serialization helper function
function serializeBigInt(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(item => serializeBigInt(item));
  }

  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeBigInt(value);
    }
    return result;
  }

  return obj;
}

// Get candidates from SQL database
async function getCandidatesFromSQL() {
  try {
    const [candidates] = await pool.execute(`
      SELECT id, name, party, position, vote_count, is_active
      FROM candidates 
      WHERE is_active = 1
      ORDER BY position, name
    `);
    return candidates;
  } catch (error) {
    console.error('Error fetching candidates from SQL:', error);
    return [];
  }
}

// Get unique positions from candidates
async function getPositionsFromCandidates() {
  try {
    const [positions] = await pool.execute(`
      SELECT DISTINCT position 
      FROM candidates 
      WHERE is_active = 1 
      ORDER BY position
    `);
    return positions.map(p => p.position);
  } catch (error) {
    console.error('Error fetching positions from candidates:', error);
    return [];
  }
}

// Poll results from blockchain votes + SQL candidates
router.get('/results', async (req, res) => {
  try {
    console.log('📊 Fetching poll results (Blockchain votes + SQL candidates)');

    const [blockchainResults, sqlCandidates, uniquePositions] = await Promise.all([
      ethereumService.getElectionResults(),
      getCandidatesFromSQL(),
      getPositionsFromCandidates()
    ]);

    console.log('📋 Data retrieved:', {
      blockchainVotes: blockchainResults.totalVotes,
      sqlCandidates: sqlCandidates.length,
      uniquePositions: uniquePositions.length
    });

    const candidateMap = new Map();
    sqlCandidates.forEach(candidate => {
      candidateMap.set(candidate.id, {
        id: candidate.id,
        name: candidate.name,
        party: candidate.party,
        position: candidate.position,
        vote_count: 0
      });
    });

    let totalVotes = 0;

    if (blockchainResults.voteData && Array.isArray(blockchainResults.voteData)) {
      blockchainResults.voteData.forEach(vote => {
        if (vote.votes && Array.isArray(vote.votes)) {
          vote.votes.forEach(v => {
            const candidateId = v.candidateId;
            if (candidateMap.has(candidateId)) {
              candidateMap.get(candidateId).vote_count++;
              totalVotes++;
            }
          });
        }
      });
    }

    const groupedCandidates = {};
    candidateMap.forEach(candidate => {
      const positionName = candidate.position;
      if (!groupedCandidates[positionName]) {
        groupedCandidates[positionName] = [];
      }
      groupedCandidates[positionName].push(candidate);
    });

    Object.keys(groupedCandidates).forEach(position => {
      groupedCandidates[position].sort((a, b) => b.vote_count - a.vote_count);
    });

    console.log('✅ Results calculated successfully:', {
      totalVotes,
      positions: Object.keys(groupedCandidates).length,
      candidates: sqlCandidates.length
    });

    const response = serializeBigInt({
      success: true,
      totalVotes: totalVotes,
      candidates: Array.from(candidateMap.values()),
      positions: Object.keys(groupedCandidates),
      resultsByPosition: groupedCandidates,
      source: 'blockchain_votes_sql_candidates',
      lastUpdated: new Date().toISOString()
    });

    res.json(response);

  } catch (error) {
    console.error('Get poll results error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get poll results: ' + error.message
    });
  }
});

// Submit vote to Ethereum blockchain (Fixed - No duplicate check before submission)
router.post('/cast-blockchain', async (req, res) => {
  try {
    console.log('🔗 Fully decentralized blockchain vote submission');
    const { voterId, votes, timestamp, ballotId } = req.body;

    if (!voterId || !votes || !Array.isArray(votes)) {
      console.log('❌ Invalid vote data for blockchain submission');
      return res.status(400).json({
        success: false,
        error: 'Invalid vote data: voterId and votes array are required'
      });
    }

    console.log('📥 Received decentralized vote submission:', {
      voterId,
      voteCount: votes.length,
      timestamp,
      ballotId: ballotId
    });

    for (const vote of votes) {
      if (!vote.candidateId || !vote.position) {
        console.error('❌ Vote missing required fields:', vote);
        return res.status(400).json({
          success: false,
          error: `Vote missing candidateId or position`
        });
      }
    }

    const blockchainInfo = await ethereumService.getBlockchainInfo();
    if (!blockchainInfo.isConnected && !blockchainInfo.simulationMode) {
      console.log('❌ No blockchain nodes connected');
      return res.status(500).json({
        success: false,
        error: 'Blockchain network unavailable. Please ensure nodes are running.'
      });
    }

    console.log('✅ Blockchain network status:', {
      node: blockchainInfo.node,
      blockNumber: blockchainInfo.blockNumber,
      account: blockchainInfo.accountStatus?.address,
      balance: blockchainInfo.accountStatus?.balance,
      simulationMode: blockchainInfo.simulationMode
    });

    // Prepare vote data for blockchain
    const voteData = {
      voterId: voterId,
      votes: votes,
      timestamp: timestamp || new Date().toISOString(),
      ballotId: ballotId,
      voterHash: crypto.createHash('sha256')
        .update(`${voterId}-${Date.now()}-${Math.random().toString(36)}`)
        .digest('hex')
    };

    console.log('⛓️ Submitting to decentralized blockchain network...');

    // Submit to Ethereum blockchain (fully decentralized)
    const blockchainResult = await ethereumService.submitVote(voteData);

    if (!blockchainResult.success) {
      console.log('❌ Blockchain submission failed:', blockchainResult.error);
      return res.status(500).json({
        success: false,
        error: `Blockchain submission failed: ${blockchainResult.error}`
      });
    }

    console.log('✅ Vote successfully recorded on decentralized blockchain:', {
      transactionHash: blockchainResult.receipt.transactionHash,
      blockNumber: blockchainResult.receipt.blockNumber,
      node: blockchainResult.receipt.node,
      simulated: blockchainResult.receipt.simulated
    });

    await logAuditAction(voterId, 'voter', 'DECENTRALIZED_VOTE_CAST',
      `Vote cast on decentralized Ethereum blockchain. TX: ${blockchainResult.receipt.transactionHash} (Node: ${blockchainResult.receipt.node})`, req);

    console.log('🎉 Fully decentralized blockchain vote process completed successfully for voter:', voterId);

    const response = serializeBigInt({
      success: true,
      receipt: blockchainResult.receipt,
      node: blockchainResult.receipt.node,
      simulated: blockchainResult.receipt.simulated,
      message: `Vote successfully recorded ${blockchainResult.receipt.simulated ? 'in simulation mode' : 'on decentralized Ethereum blockchain'} (Node: ${blockchainResult.receipt.node})`,
      voteReceipt: {
        ballotId: voteData.ballotId,
        transactionHash: blockchainResult.receipt.transactionHash,
        blockNumber: blockchainResult.receipt.blockNumber,
        timestamp: voteData.timestamp,
        voterHash: voteData.voterHash
      }
    });

    res.json(response);

  } catch (error) {
    console.error('❌ Decentralized blockchain vote submission error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to submit vote to decentralized blockchain network: ' + error.message
    });
  }
});

// Get vote from blockchain (fully decentralized)
router.get('/blockchain-vote/:ballotId', async (req, res) => {
  try {
    const { ballotId } = req.params;
    console.log('🔍 Retrieving vote from decentralized blockchain:', ballotId);

    const voteData = await ethereumService.getVoteFromBlockchain(ballotId);

    if (!voteData) {
      return res.status(404).json({
        success: false,
        error: 'Vote not found on blockchain'
      });
    }

    const response = serializeBigInt({
      success: true,
      vote: voteData,
      source: 'decentralized_blockchain'
    });

    res.json(response);

  } catch (error) {
    console.error('❌ Get decentralized blockchain vote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve vote from decentralized blockchain: ' + error.message
    });
  }
});

// Get vote receipt from blockchain
router.get('/receipt/:voterId', async (req, res) => {
  try {
    const { voterId } = req.params;
    console.log('🧾 Fetching vote receipt from blockchain for voter:', voterId);

    const voterVotes = await ethereumService.getVotesByVoter(voterId);

    if (!voterVotes || voterVotes.length === 0) {
      console.log('❌ No vote record found for voter:', voterId);
      return res.status(404).json({
        success: false,
        error: 'No vote record found on blockchain'
      });
    }

    const latestVote = voterVotes[0];

    const receipt = serializeBigInt({
      success: true,
      voterId: voterId,
      voteHash: latestVote.transactionHash,
      ballotId: latestVote.ballotId,
      votedAt: new Date(latestVote.timestamp).toISOString(),
      votes: latestVote.votes,
      blockNumber: latestVote.blockNumber,
      blockchainVerified: true,
      node: latestVote.node,
      source: 'decentralized_blockchain'
    });

    console.log('✅ Vote receipt fetched successfully from blockchain for voter:', voterId);
    res.json(receipt);
  } catch (error) {
    console.error('Get blockchain receipt error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get vote receipt from blockchain: ' + error.message
    });
  }
});

// Verify vote on blockchain
router.get('/verify/:ballotId', async (req, res) => {
  try {
    const { ballotId } = req.params;
    console.log('🔎 Verifying vote on blockchain:', ballotId);

    const verification = await ethereumService.verifyVoteOnBlockchain(ballotId);

    const response = serializeBigInt({
      success: true,
      verified: verification.exists,
      ballotId: ballotId,
      details: verification.details,
      blockchainConfirmations: verification.confirmations,
      source: 'decentralized_blockchain'
    });

    res.json(response);

  } catch (error) {
    console.error('Verify vote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify vote on blockchain: ' + error.message
    });
  }
});

// Blockchain status endpoint (Multi-Node Decentralized)
router.get('/blockchain-status', async (req, res) => {
  try {
    console.log('🔍 Checking decentralized multi-node blockchain status...');

    const blockchainInfo = await ethereumService.getBlockchainInfo();

    const nodesStatus = ethereumService.nodes.map(node => ({
      name: node.name,
      connected: node.isConnected,
      url: node.rpcUrl,
      account: node.account,
      lastBlock: node.lastBlock || 0,
      chainId: node.chainId
    }));

    const response = serializeBigInt({
      success: true,
      ...blockchainInfo,
      nodes: nodesStatus,
      totalNodes: nodesStatus.length,
      connectedNodes: nodesStatus.filter(node => node.connected).length,
      storageType: 'fully_decentralized'
    });

    res.json(response);
  } catch (error) {
    console.error('Blockchain status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get blockchain status: ' + error.message,
      isConnected: false,
      simulationMode: true,
      connectedNodes: 0,
      totalNodes: 0,
      nodes: []
    });
  }
});

// Get all votes from blockchain (for results calculation)
router.get('/blockchain-votes', async (req, res) => {
  try {
    console.log('📋 Retrieving all votes from decentralized blockchain');

    const allVotes = await ethereumService.getAllVotesFromBlockchain();

    const response = serializeBigInt({
      success: true,
      totalVotes: allVotes.length,
      votes: allVotes,
      source: 'decentralized_blockchain'
    });

    res.json(response);
  } catch (error) {
    console.error('Get all blockchain votes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve votes from blockchain: ' + error.message,
      votes: [],
      totalVotes: 0
    });
  }
});

// Simple blockchain health check endpoint
router.get('/blockchain-health', async (req, res) => {
  try {
    const blockchainInfo = await ethereumService.getBlockchainInfo();

    const response = serializeBigInt({
      success: true,
      status: blockchainInfo.isConnected ? 'healthy' : 'unhealthy',
      connected: blockchainInfo.isConnected,
      simulationMode: blockchainInfo.simulationMode,
      blockNumber: blockchainInfo.blockNumber,
      timestamp: new Date().toISOString()
    });

    res.json(response);
  } catch (error) {
    res.json({
      success: false,
      status: 'unhealthy',
      connected: false,
      simulationMode: true,
      error: error.message
    });
  }
});

// Get blockchain nodes details
router.get('/blockchain-nodes', async (req, res) => {
  try {
    const nodesDetails = await Promise.all(
      ethereumService.nodes.map(async (node) => {
        try {
          const blockNumber = await node.web3.eth.getBlockNumber();
          const balance = await node.web3.eth.getBalance(node.account);
          const peerCount = await node.web3.eth.net.getPeerCount();

          return serializeBigInt({
            name: node.name,
            url: node.rpcUrl,
            connected: node.isConnected,
            account: node.account,
            balance: node.web3.utils.fromWei(balance, 'ether'),
            blockNumber: blockNumber,
            peerCount: peerCount,
            chainId: node.chainId
          });
        } catch (error) {
          return {
            name: node.name,
            url: node.rpcUrl,
            connected: false,
            error: error.message
          };
        }
      })
    );

    res.json({
      success: true,
      nodes: nodesDetails
    });
  } catch (error) {
    console.error('Get nodes details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get node details: ' + error.message
    });
  }
});

// Mark voter as voted in SQL database
router.post('/mark-voted', async (req, res) => {
  try {
    const { studentId, ballotId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }

    console.log('🔄 Marking voter as voted in SQL database:', { studentId, ballotId });

    const [result] = await pool.execute(
      'UPDATE voters SET has_voted = true, voted_at = NOW(), ballot_id = ? WHERE student_id = ?',
      [ballotId || null, studentId]
    );

    if (result.affectedRows === 0) {
      console.log('❌ Voter not found:', studentId);
      return res.status(404).json({
        success: false,
        error: 'Voter not found'
      });
    }

    console.log('✅ Voter marked as voted successfully:', { studentId, ballotId });

    res.json({
      success: true,
      message: 'Voter status updated successfully',
      ballotId: ballotId
    });

  } catch (error) {
    console.error('❌ Mark voted error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update voter status: ' + error.message
    });
  }
});

export default router;