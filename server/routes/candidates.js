import express from 'express';
import { pool } from '../config/database.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { logAuditAction } from '../utils/audit.js';

const router = express.Router();

// Get all candidates
router.get('/', async (req, res) => {
  try {
    console.log('🗳️ Fetching active candidates for voting');
    const [rows] = await pool.execute(
      'SELECT * FROM candidates WHERE is_active = true ORDER BY position, name'
    );
    console.log('✅ Active candidates fetched, count:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error('Get candidates error:', error);
    console.log('❌ Get candidates error:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Get candidates for admin
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    console.log('👥 Fetching all candidates for admin:', req.user.email || req.user.id);
    const [rows] = await pool.execute(
      'SELECT * FROM candidates ORDER BY created_at DESC'
    );
    console.log('✅ All candidates fetched for admin, count:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error('Get candidates error:', error);
    console.log('❌ Get candidates for admin error:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Create candidate
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    console.log('➕ Creating new candidate:', req.body.name, 'by admin:', req.user.email || req.user.id);
    const { name, party, position, imageUrl } = req.body;

    if (!name || !party || !position) {
      return res.status(400).json({ error: 'Name, party, and position are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO candidates (name, party, position, image_url) VALUES (?, ?, ?, ?)',
      [name, party, position, imageUrl || null]
    );

    await logAuditAction(req.user.id, 'admin', 'CREATE_CANDIDATE', `Created candidate: ${name}`, req);

    console.log('✅ Candidate created successfully:', name);
    res.status(201).json({ id: result.insertId, message: 'Candidate created successfully' });
  } catch (error) {
    console.error('Create candidate error:', error);
    console.log('❌ Create candidate error for:', req.body.name, error.message);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

// Update candidate
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    console.log('✏️ Updating candidate ID:', req.params.id, 'by admin:', req.user.email || req.user.id);
    const { id } = req.params;
    const { name, party, position, imageUrl } = req.body;

    await pool.execute(
      'UPDATE candidates SET name = ?, party = ?, position = ?, image_url = ? WHERE id = ?',
      [name, party, position, imageUrl || null, id]
    );

    await logAuditAction(req.user.id, 'admin', 'UPDATE_CANDIDATE', `Updated candidate ID: ${id}`, req);

    console.log('✅ Candidate updated successfully, ID:', id);
    res.json({ message: 'Candidate updated successfully' });
  } catch (error) {
    console.error('Update candidate error:', error);
    console.log('❌ Update candidate error for ID:', req.params.id, error.message);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

// Delete candidate
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    console.log('🗑️ Deactivating candidate ID:', req.params.id, 'by admin:', req.user.email || req.user.id);
    const { id } = req.params;

    await pool.execute('UPDATE candidates SET is_active = false WHERE id = ?', [id]);

    await logAuditAction(req.user.id, 'admin', 'DELETE_CANDIDATE', `Deactivated candidate ID: ${id}`, req);

    console.log('✅ Candidate deactivated successfully, ID:', id);
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Delete candidate error:', error);
    console.log('❌ Delete candidate error for ID:', req.params.id, error.message);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

export default router;