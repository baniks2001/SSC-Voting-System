import express from 'express';
import crypto from 'crypto';
import { pool } from '../config/database.js';
import { authenticateVoter } from '../middleware/auth.js';
import { blockchain } from '../utils/blockchain.js';
import { logAuditAction } from '../utils/audit.js';
import { ethereumService } from '../services/ethereumService.js';

const router = express.Router();

// Submit vote to Ethereum blockchain
router.post('/cast-blockchain', async (req, res) => {
  try {
    console.log('🔗 Blockchain vote submission attempt');
    const { voterId, votes, timestamp } = req.body;

    if (!voterId || !votes || !Array.isArray(votes)) {
      console.log('❌ Invalid vote data for blockchain submission');
      return res.status(400).json({
        success: false,
        error: 'Invalid vote data: voterId and votes array are required'
      });
    }

    console.log('📥 Received blockchain vote submission:', {
      voterId,
      voteCount: votes.length,
      timestamp
    });

    // Get voter details from database
    const [voterRows] = await pool.execute(
      'SELECT * FROM voters WHERE student_id = ?',
      [voterId]
    );

    if (voterRows.length === 0) {
      console.log('❌ Voter not found for blockchain submission:', voterId);
      return res.status(404).json({
        success: false,
        error: 'Voter not found'
      });
    }

    const voter = voterRows[0];

    // Check if voter has already voted
    if (voter.has_voted) {
      console.log('❌ Voter already voted (blockchain):', voterId);
      return res.status(400).json({
        success: false,
        error: 'Voter has already cast a vote'
      });
    }

    // Test blockchain connection first
    const blockchainInfo = await ethereumService.getBlockchainInfo();
    if (!blockchainInfo.isConnected) {
      console.log('❌ Blockchain node not connected');
      return res.status(500).json({
        success: false,
        error: 'Blockchain node is not connected. Please check if geth is running.'
      });
    }

    console.log('✅ Blockchain connection verified:', {
      networkId: blockchainInfo.networkId,
      blockNumber: blockchainInfo.blockNumber,
      accounts: blockchainInfo.accounts
    });

    // Prepare vote data for blockchain
    const voteData = {
      voterId: voter.student_id,
      votes: votes,
      timestamp: timestamp || new Date().toISOString()
    };

    console.log('⛓️  Submitting vote to Ethereum blockchain...');

    // Submit to Ethereum blockchain
    const blockchainResult = await ethereumService.submitVote(voteData);

    if (!blockchainResult.success) {
      console.log('❌ Blockchain submission failed:', blockchainResult.error);
      return res.status(500).json({
        success: false,
        error: `Blockchain submission failed: ${blockchainResult.error}`
      });
    }

    console.log('✅ Vote successfully submitted to blockchain:', {
      transactionHash: blockchainResult.receipt.transactionHash,
      blockNumber: blockchainResult.receipt.blockNumber
    });

    // Update database to mark voter as voted
    await pool.execute(
      'UPDATE voters SET has_voted = true, vote_hash = ?, voted_at = ? WHERE id = ?',
      [blockchainResult.receipt.voterHash, new Date(), voter.id]
    );

    // Record the vote in the votes table
    for (const vote of votes) {
      await pool.execute(
        'INSERT INTO votes (voter_id, candidate_id, position, voter_hash, transaction_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [voter.id, vote.candidateId, vote.position, blockchainResult.receipt.voterHash, blockchainResult.receipt.transactionHash, new Date()]
      );
    }

    // Update candidate vote counts
    for (const vote of votes) {
      await pool.execute(
        'UPDATE candidates SET vote_count = vote_count + 1 WHERE id = ?',
        [vote.candidateId]
      );
    }

    await logAuditAction(voter.id, 'voter', 'BLOCKCHAIN_VOTE_CAST', 
      `Vote cast on Ethereum blockchain. TX: ${blockchainResult.receipt.transactionHash}`, req);

    console.log('🎉 Blockchain vote process completed successfully for voter:', voterId);

    res.json({
      success: true,
      receipt: blockchainResult.receipt,
      message: 'Vote successfully recorded on Ethereum blockchain'
    });

  } catch (error) {
    console.error('❌ Blockchain vote submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit vote to blockchain: ' + error.message
    });
  }
});

// Cast vote (original method)
router.post('/cast', authenticateVoter, async (req, res) => {
  try {
    console.log('🗳️ Vote casting attempt by voter ID:', req.user.id);
    const { votes } = req.body;
    const voterId = req.user.id;

    // Check if voter has already voted
    const [voterCheck] = await pool.execute(
      'SELECT has_voted FROM voters WHERE id = ?',
      [voterId]
    );

    if (voterCheck[0].has_voted) {
      console.log('❌ Vote casting failed - Voter already voted, ID:', req.user.id);
      return res.status(400).json({ error: 'You have already voted' });
    }

    // Validate votes
    if (!votes || !Array.isArray(votes) || votes.length === 0) {
      console.log('❌ Vote casting failed - Invalid vote data from voter ID:', req.user.id);
      return res.status(400).json({ error: 'Invalid vote data' });
    }

    // Prepare vote data for blockchain
    const voteData = {
      voterId,
      votes,
      timestamp: Date.now(),
      voterHash: crypto.createHash('sha256').update(`${voterId}-${Date.now()}`).digest('hex')
    };

    // Add to blockchain
    const block = blockchain.addVoteToBlockchain(voteData);

    // Update database
    await pool.execute('BEGIN');

    try {
      // Mark voter as voted
      await pool.execute(
        'UPDATE voters SET has_voted = true, vote_hash = ?, voted_at = NOW() WHERE id = ?',
        [block.hash, voterId]
      );

      // Add vote to blockchain table
      await pool.execute(
        'INSERT INTO votes (block_hash, previous_hash, voter_id, vote_data, nonce, timestamp, merkle_root) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [block.hash, block.previousHash, voterId, JSON.stringify(voteData), block.nonce, block.timestamp, block.merkleRoot]
      );

      // Update candidate vote counts
      for (const vote of votes) {
        await pool.execute(
          'UPDATE candidates SET vote_count = vote_count + 1 WHERE id = ?',
          [vote.candidateId]
        );
      }

      await pool.execute('COMMIT');

      await logAuditAction(voterId, 'voter', 'CAST_VOTE', `Vote cast with hash: ${block.hash}`, req);

      console.log('✅ Vote cast successfully by voter ID:', req.user.id, 'Block hash:', block.hash);
      res.json({
        message: 'Vote cast successfully',
        blockHash: block.hash,
        receipt: {
          voterId,
          voteHash: block.hash,
          votes,
          timestamp: new Date(block.timestamp).toISOString()
        }
      });

    } catch (error) {
      await pool.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Cast vote error:', error);
    console.log('❌ Cast vote error for voter ID:', req.user.id, error.message);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
});

// Get vote receipt
router.get('/receipt', authenticateVoter, async (req, res) => {
  try {
    console.log('🧾 Fetching vote receipt for voter ID:', req.user.id);
    const voterId = req.user.id;

    const [voterData] = await pool.execute(
      'SELECT vote_hash, voted_at, has_voted FROM voters WHERE id = ?',
      [voterId]
    );

    if (!voterData[0].has_voted) {
      console.log('❌ No vote record found for voter ID:', req.user.id);
      return res.status(404).json({ error: 'No vote record found' });
    }

    // Get vote from blockchain
    const voteHash = voterData[0].vote_hash;
    const voteData = blockchain.getVoteByHash(voteHash);

    if (!voteData) {
      console.log('❌ Vote data not found in blockchain for voter ID:', req.user.id);
      return res.status(404).json({ error: 'Vote data not found in blockchain' });
    }

    // Get candidate details
    const candidateIds = voteData.votes.map(v => v.candidateId);
    const [candidates] = await pool.execute(
      `SELECT id, name, party, position FROM candidates WHERE id IN (${candidateIds.map(() => '?').join(',')})`,
      candidateIds
    );

    const receipt = {
      voteHash,
      votedAt: voterData[0].voted_at,
      votes: voteData.votes.map(vote => {
        const candidate = candidates.find(c => c.id === vote.candidateId);
        return {
          candidateId: vote.candidateId,
          candidateName: candidate?.name || 'Unknown',
          party: candidate?.party || 'Unknown',
          position: candidate?.position || 'Unknown'
        };
      }),
      timestamp: new Date(voteData.timestamp).toISOString(),
      blockchainVerified: true
    };

    console.log('✅ Vote receipt fetched successfully for voter ID:', req.user.id);
    res.json(receipt);
  } catch (error) {
    console.error('Get receipt error:', error);
    console.log('❌ Get receipt error for voter ID:', req.user.id, error.message);
    res.status(500).json({ error: 'Failed to get vote receipt' });
  }
});

// Poll results
router.get('/results', async (req, res) => {
  try {
    console.log('📊 Fetching poll results');
    const [candidates] = await pool.execute(
      'SELECT id, name, party, position, vote_count, image_url FROM candidates WHERE is_active = true ORDER BY position, vote_count DESC'
    );

    const [totalVotes] = await pool.execute(
      'SELECT COUNT(*) as count FROM voters WHERE has_voted = true'
    );

    console.log('✅ Poll results fetched successfully, total votes:', totalVotes[0].count);
    res.json({
      candidates,
      totalVotes: totalVotes[0].count,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get results error:', error);
    console.log('❌ Get results error:', error.message);
    res.status(500).json({ error: 'Failed to get results' });
  }
});

export default router;