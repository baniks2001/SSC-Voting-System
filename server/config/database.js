import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_voting_system',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 20, // Increased connection limit
  queueLimit: 100, // Increased queue limit
  acquireTimeout: 30000, // 30 seconds acquire timeout
  timeout: 60000, // 60 seconds timeout
  reconnect: true,
  // Connection pool settings to prevent leaks
  idleTimeout: 60000, // Close idle connections after 60 seconds
  maxIdle: 10, // Maximum number of idle connections
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
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
  console.log(`📊 Database connections - Active: ${stats.active}, Idle: ${stats.idle}, Queue: ${stats.queue}`);
}, 60000); // Log every minute