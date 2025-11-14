import express from 'express';
import { pool } from '../config/database.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { logAuditAction } from '../utils/audit.js';

const router = express.Router();

// Super admin verification middleware
const verifySuperAdmin = (req, res, next) => {
  const { superAdminPassword } = req.body;
  
  if (!superAdminPassword) {
    return res.status(401).json({ error: 'Super admin password required' });
  }

  // Verify against environment super admin password
  if (superAdminPassword !== process.env.SUPER_ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Invalid super admin password' });
  }

  next();
};

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

// Reset poll - requires super admin
router.post('/reset', authenticateAdmin, verifySuperAdmin, async (req, res) => {
  try {
    console.log('🔄 Resetting poll by super admin:', req.user.email || req.user.id);
    await pool.execute('BEGIN');

    // Preserve blockchain data - don't touch blockchain tables
    console.log('🔒 Preserving blockchain data...');

    // Reset voters but preserve blockchain-related data
    await pool.execute('UPDATE voters SET has_voted = false, voted_at = NULL WHERE has_voted = true');

    // Reset candidate vote counts
    await pool.execute('UPDATE candidates SET vote_count = 0');

    // Clear votes table but keep blockchain transaction references
    await pool.execute('DELETE FROM votes');

    // Reset poll settings
    await pool.execute('UPDATE poll_settings SET is_active = false, is_paused = false, start_time = NULL, end_time = NULL, paused_at = NULL WHERE id = 1');

    await pool.execute('COMMIT');

    await logAuditAction(req.user.id, 'admin', 'RESET_POLL', 'Poll data reset with blockchain preservation', req);

    console.log('✅ Poll reset successfully - Blockchain data preserved');
    res.json({ 
      success: true,
      message: 'Poll reset successfully. Blockchain data preserved.' 
    });
  } catch (error) {
    await pool.execute('ROLLBACK');
    console.error('Reset poll error:', error);
    console.log('❌ Reset poll error:', error.message);
    res.status(500).json({ error: 'Failed to reset poll' });
  }
});

// Finish poll - requires super admin
router.post('/finished', authenticateAdmin, verifySuperAdmin, async (req, res) => {
  try {
    console.log('🏁 Finishing poll by super admin:', req.user.email || req.user.id);
    
    await pool.execute(
      'UPDATE poll_settings SET is_active = false, is_paused = false WHERE id = 1'
    );

    await logAuditAction(req.user.id, 'admin', 'FINISH_POLL', 'Poll finished by super admin', req);

    console.log('✅ Poll finished successfully');
    res.json({ 
      success: true,
      message: 'Poll finished successfully' 
    });
  } catch (error) {
    console.error('Finish poll error:', error);
    console.log('❌ Finish poll error:', error.message);
    res.status(500).json({ error: 'Failed to finish poll' });
  }
});

// Not started poll - requires super admin
router.post('/not_started', authenticateAdmin, verifySuperAdmin, async (req, res) => {
  try {
    console.log('⏸️ Setting poll to not started by super admin:', req.user.email || req.user.id);
    
    await pool.execute(
      'UPDATE poll_settings SET is_active = false, is_paused = false, start_time = NULL, end_time = NULL WHERE id = 1'
    );

    await logAuditAction(req.user.id, 'admin', 'RESET_POLL_STATUS', 'Poll status reset to not started by super admin', req);

    console.log('✅ Poll status reset to not started');
    res.json({ 
      success: true,
      message: 'Poll status reset to not started' 
    });
  } catch (error) {
    console.error('Reset poll status error:', error);
    console.log('❌ Reset poll status error:', error.message);
    res.status(500).json({ error: 'Failed to reset poll status' });
  }
});

export default router;