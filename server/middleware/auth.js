// middleware/auth.js
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export const authenticateAdmin = async (req, res, next) => {
  try {
    // First verify the token
    authenticateToken(req, res, async () => {
      if (req.user.type !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      // For super admin (id: 0)
      if (req.user.id === 0 && req.user.role === 'super_admin') {
        return next();
      }

      // For regular admins, verify they exist and are active
      const [admins] = await pool.execute(
        'SELECT id, email, role, is_active FROM admins WHERE id = ? AND is_active = true',
        [req.user.id]
      );

      if (admins.length === 0) {
        return res.status(401).json({ error: 'Admin account not found or inactive' });
      }

      req.admin = admins[0];
      next();
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

export const authenticateSuperAdmin = (req, res, next) => {
  // Check if user is super admin (either from token or from database)
  const isSuperAdmin = req.user.role === 'super_admin' || 
                      (req.user.id === 0 && req.user.type === 'admin') ||
                      (req.admin && req.admin.role === 'super_admin');

  if (!isSuperAdmin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  
  next();
};

export const authenticateVoter = async (req, res, next) => {
  try {
    authenticateToken(req, res, async () => {
      if (req.user.type !== 'voter') {
        return res.status(403).json({ error: 'Voter access required' });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
};