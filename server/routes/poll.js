import express from 'express';
import { pool } from '../config/database.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { logAuditAction } from '../utils/audit.js';

const router = express.Router();

// Get poll status
router.get('/status', async (req, res) => {
  try {
    console.log('📊 Fetching poll status');
    const [settings] = await pool.execute('SELECT * FROM poll_settings WHERE id = 1');
    console.log('✅ Poll status fetched successfully');
    res.json(settings[0] || { is_active: false, is_paused: false });
  } catch (error) {
    console.error('Get poll status error:', error);
    console.log('❌ Get poll status error:', error.message);
    res.status(500).json({ error: 'Failed to get poll status' });
  }
});

// Update poll status
router.put('/status', authenticateAdmin, async (req, res) => {
  try {
    console.log('⚙️ Updating poll status by admin:', req.user.email || req.user.id, req.body);
    const { isActive, isPaused, startTime, endTime } = req.body;

    await pool.execute(
      'UPDATE poll_settings SET is_active = ?, is_paused = ?, start_time = ?, end_time = ?, paused_at = ? WHERE id = 1',
      [isActive, isPaused, startTime || null, endTime || null, isPaused ? new Date() : null]
    );

    const action = isPaused ? 'PAUSE_POLL' : isActive ? 'START_POLL' : 'STOP_POLL';
    await logAuditAction(req.user.id, 'admin', action, 'Poll status updated', req);

    console.log('✅ Poll status updated successfully:', action);
    res.json({ message: 'Poll status updated successfully' });
  } catch (error) {
    console.error('Update poll status error:', error);
    console.log('❌ Update poll status error:', error.message);
    res.status(500).json({ error: 'Failed to update poll status' });
  }
});

// Reset poll
router.post('/reset', authenticateAdmin, async (req, res) => {
  try {
    console.log('🔄 Resetting poll by admin:', req.user.email || req.user.id);
    await pool.execute('BEGIN');

    // Reset voters
    await pool.execute('UPDATE voters SET has_voted = false, vote_hash = NULL, voted_at = NULL');

    // Reset candidate vote counts
    await pool.execute('UPDATE candidates SET vote_count = 0');

    // Clear votes
    await pool.execute('DELETE FROM votes');

    // Reset poll settings
    await pool.execute('UPDATE poll_settings SET is_active = false, is_paused = false, start_time = NULL, end_time = NULL, paused_at = NULL WHERE id = 1');

    await pool.execute('COMMIT');

    await logAuditAction(req.user.id, 'admin', 'RESET_POLL', 'Poll data reset', req);

    console.log('✅ Poll reset successfully');
    res.json({ message: 'Poll reset successfully' });
  } catch (error) {
    await pool.execute('ROLLBACK');
    console.error('Reset poll error:', error);
    console.log('❌ Reset poll error:', error.message);
    res.status(500).json({ error: 'Failed to reset poll' });
  }
});

export default router;