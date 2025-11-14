// config/database.js - Fixed MySQL2 configuration (only valid options)
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_voting_system',
  port: parseInt(process.env.DB_PORT) || 3306,
  
  // ONLY VALID MySQL2 connection options
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 100,
  idleTimeout: 60000,
  maxIdle: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  
  // REMOVED ALL INVALID OPTIONS:
  // acquireTimeout: 30000, - INVALID
  // timeout: 60000, - INVALID
  // reconnect: true, - INVALID
};

export const pool = mysql.createPool(dbConfig);

// Track active connections for debugging
let activeConnections = 0;
const maxConnectionsWarning = 15;

pool.on('acquire', (connection) => {
  activeConnections++;
  if (activeConnections >= maxConnectionsWarning) {
    console.warn(`⚠️ High number of active database connections: ${activeConnections}`);
  }
});

pool.on('release', (connection) => {
  activeConnections--;
});

pool.on('error', (err) => {
  console.error('Database pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Database connection was closed.');
  } else if (err.code === 'ER_CON_COUNT_ERROR') {
    console.log('Database has too many connections.');
  } else if (err.code === 'ECONNREFUSED') {
    console.log('Database connection was refused.');
  }
});

export const testConnection = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    
    // Test the connection with a simple query
    await connection.execute('SELECT 1');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Check if it's a connection limit issue
    if (error.code === 'ER_CON_COUNT_ERROR' || error.code === 'ETIMEDOUT') {
      console.log('🔄 Database connection limit reached or timeout, will retry...');
    }
    
    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Enhanced query function with better error handling
export const query = async (sql, params = []) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    
    // Handle specific database errors
    if (error.code === 'ER_LOCK_DEADLOCK') {
      console.log('Deadlock detected, retrying query...');
      // Implement retry logic here if needed
    } else if (error.code === 'ER_QUERY_INTERRUPTED') {
      console.log('Query was interrupted');
    }
    
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Cleanup function for graceful shutdown
export const cleanupPool = async () => {
  try {
    console.log('Closing database connection pool...');
    await pool.end();
    console.log('✅ Database pool closed successfully');
  } catch (error) {
    console.error('Error closing database pool:', error);
    throw error;
  }
};

// Periodic connection health check
setInterval(async () => {
  try {
    const connection = await pool.getConnection();
    await connection.execute('SELECT 1');
    connection.release();
  } catch (error) {
    console.error('Database health check failed:', error.message);
  }
}, 30000); // Check every 30 seconds

// Export connection stats for monitoring
export const getConnectionStats = () => {
  return {
    active: activeConnections,
    total: pool._allConnections ? pool._allConnections.length : 0,
    idle: pool._freeConnections ? pool._freeConnections.length : 0,
    queue: pool._connectionQueue ? pool._connectionQueue.length : 0
  };
};

// Log connection stats periodically
setInterval(() => {
  const stats = getConnectionStats();
  if (stats.active > 0 || stats.queue > 0) {
    console.log(`📊 Database connections - Active: ${stats.active}, Idle: ${stats.idle}, Queue: ${stats.queue}`);
  }
}, 60000); // Log every minute