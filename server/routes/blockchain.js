import express from 'express';
import { ethereumService } from '../services/ethereumService.js';
import { pool } from '../config/database.js';
import { logAuditAction } from '../utils/audit.js';

const router = express.Router();

// Submit vote to blockchain
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

    // Submit to blockchain
    const blockchainResult = await ethereumService.submitVote(voteData);

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

    await logAuditAction(voter.id, 'voter', 'VOTE_CAST', 'Vote successfully cast on blockchain', req);

    res.json({
      success: true,
      receipt: blockchainResult.receipt,
      message: 'Vote successfully recorded on blockchain'
    });

  } catch (error) {
    console.error('Blockchain vote submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit vote to blockchain'
    });
  }
});

// Verify transaction on blockchain
router.get('/verify-transaction/:transactionHash', async (req, res) => {
  try {
    const { transactionHash } = req.params;

    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        error: 'Transaction hash is required'
      });
    }

    const verification = await ethereumService.verifyTransaction(transactionHash);

    res.json({
      success: true,
      verification
    });

  } catch (error) {
    console.error('Transaction verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify transaction'
    });
  }
});

// Get blockchain status and info
router.get('/status', async (req, res) => {
  try {
    const blockchainInfo = await ethereumService.getBlockchainInfo();

    res.json({
      success: true,
      blockchain: blockchainInfo
    });

  } catch (error) {
    console.error('Blockchain status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get blockchain status'
    });
  }
});

// Test blockchain connection
router.get('/test-connection', async (req, res) => {
  try {
    const blockchainInfo = await ethereumService.getBlockchainInfo();

    res.json({
      success: true,
      connected: blockchainInfo.isConnected,
      blockNumber: blockchainInfo.blockNumber,
      message: blockchainInfo.isConnected ? 
        'Successfully connected to Ethereum node' : 
        'Not connected to Ethereum node'
    });

  } catch (error) {
    console.error('Blockchain connection test error:', error);
    res.status(500).json({
      success: false,
      connected: false,
      error: error.message
    });
  }
});

export default router;