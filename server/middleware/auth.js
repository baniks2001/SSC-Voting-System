// middleware/auth.js - Modified for local network (no authentication)
import { pool } from '../config/database.js';

// Mock user data for local development
const createLocalUser = (type = 'voter') => {
  const baseUser = {
    id: 1,
    email: 'localuser@ssc.local',
    name: 'Local Development User',
    type: type,
    role: type === 'admin' ? 'admin' : 'voter'
  };

  // For admin routes, add admin-specific properties
  if (type === 'admin') {
    return {
      ...baseUser,
      role: 'admin',
      is_active: true
    };
  }

  return baseUser;
};

export const authenticateToken = (req, res, next) => {
  // Local network - automatically create authenticated user
  console.log('Local network access - authentication bypassed');
  
  // Check if admin route to determine user type
  const isAdminRoute = req.originalUrl.includes('/admin') || 
                       req.originalUrl.includes('/super-admin');
  
  const userType = isAdminRoute ? 'admin' : 'voter';
  req.user = createLocalUser(userType);
  
  next();
};

export const authenticateAdmin = async (req, res, next) => {
  try {
    console.log('Local network - admin authentication bypassed');
    
    // Create mock admin user
    req.user = createLocalUser('admin');
    req.admin = {
      id: 1,
      email: 'admin@ssc.local',
      role: 'admin',
      is_active: true
    };
    
    next();
  } catch (error) {
    console.error('Local admin auth error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

export const authenticateSuperAdmin = (req, res, next) => {
  console.log('Local network - super admin authentication bypassed');
  
  // Create mock super admin user
  req.user = {
    id: 0,
    email: 'superadmin@ssc.local',
    name: 'Local Super Admin',
    type: 'admin',
    role: 'super_admin'
  };
  
  req.admin = {
    id: 0,
    email: 'superadmin@ssc.local',
    role: 'super_admin',
    is_active: true
  };
  
  next();
};

export const authenticateVoter = async (req, res, next) => {
  try {
    console.log('Local network - voter authentication bypassed');
    
    // Create mock voter user
    req.user = createLocalUser('voter');
    
    next();
  } catch (error) {
    console.error('Local voter auth error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Additional helper for development
export const simulateUserSwitch = (req, res, next) => {
  // This middleware allows simulating different users during development
  const userType = req.headers['x-user-type'] || 'voter'; // Use header to simulate different users
  const userId = req.headers['x-user-id'] || (userType === 'admin' ? 1 : 1);
  
  req.user = {
    id: parseInt(userId),
    email: `${userType}${userId}@ssc.local`,
    name: `Local ${userType} ${userId}`,
    type: userType,
    role: userType
  };
  
  if (userType === 'admin') {
    req.admin = {
      id: parseInt(userId),
      email: `${userType}${userId}@ssc.local`,
      role: userId === '0' ? 'super_admin' : 'admin',
      is_active: true
    };
  }
  
  console.log(`Simulating user: ${userType} ID: ${userId}`);
  next();
};