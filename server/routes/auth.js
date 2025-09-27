import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { logAuditAction } from '../utils/audit.js';

const router = express.Router();

// Voter login
router.post('/voter/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;

    if (!studentId || !password) {
      return res.status(400).json({ error: 'Student ID and password required' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM voters WHERE student_id = ? AND is_active = true',
      [studentId]
    );

    if (rows.length === 0) {
      await logAuditAction(null, 'voter', 'LOGIN_FAILED', `Failed login attempt for student ID: ${studentId}`, req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const voter = rows[0];
    const isValidPassword = await bcrypt.compare(password, voter.password);

    if (!isValidPassword) {
      await logAuditAction(voter.id, 'voter', 'LOGIN_FAILED', 'Invalid password', req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: voter.id, studentId: voter.student_id, type: 'voter' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logAuditAction(voter.id, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', req);

    res.json({
      token,
      user: {
        id: voter.id,
        studentId: voter.student_id,
        fullName: voter.full_name,
        course: voter.course,
        yearLevel: voter.year_level,
        section: voter.section,
        hasVoted: voter.has_voted,
        voteHash: voter.vote_hash,
        votedAt: voter.voted_at
      }
    });
  } catch (error) {
    console.error('Voter login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin login
// routes/auth.js - Update the admin login part
// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check for super admin
    if (email === process.env.SUPER_ADMIN_EMAIL && password === process.env.SUPER_ADMIN_PASSWORD) {
      const token = jwt.sign(
        { 
          id: 0, 
          email: email, 
          type: 'admin', 
          role: 'super_admin' 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      await logAuditAction(0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', req);

      return res.json({
        token,
        user: {
          id: 0,
          email: email,
          fullName: 'Super Administrator',
          role: 'super_admin',
          isSuperAdmin: true
        }
      });
    }

    // Check regular admin
    const [rows] = await pool.execute(
      'SELECT * FROM admins WHERE email = ? AND is_active = true',
      [email]
    );

    if (rows.length === 0) {
      await logAuditAction(null, 'admin', 'LOGIN_FAILED', `Failed login attempt for email: ${email}`, req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = rows[0];
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      await logAuditAction(admin.id, 'admin', 'LOGIN_FAILED', 'Invalid password', req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        type: 'admin', 
        role: admin.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '5h' }
    );

    await logAuditAction(admin.id, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', req);

    res.json({
      token,
      user: {
        id: admin.id,
        email: admin.email,
        fullName: admin.full_name,
        role: admin.role,
        isSuperAdmin: admin.role === 'super_admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;