import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { testConnection, cleanupPool } from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import candidatesRoutes from './routes/candidates.js';
import votersRoutes from './routes/voters.js';
import votingRoutes from './routes/voting.js';
import pollRoutes from './routes/poll.js';
import coursesRoutes from './routes/courses.js';
import blockchainRoutes from './routes/blockchain.js';

// Load .env from server folder; if not found, attempt to load from project root
const envLoadResult = dotenv.config();
if (envLoadResult.error) {
  const projectRootEnv = path.resolve(process.cwd(), '..', '.env');
  dotenv.config({ path: projectRootEnv });
}

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));

// Rate limiting - more generous to prevent blocking legitimate requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // increased from 100 to prevent legitimate traffic from being blocked
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parser with limits to prevent memory issues
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb'
}));

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000, () => { // 30 second timeout
    res.status(408).json({ error: 'Request timeout' });
  });
  res.setTimeout(30000, () => {
    res.status(408).json({ error: 'Response timeout' });
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/voters', votersRoutes);
app.use('/api/voting', votingRoutes);
app.use('/api/poll', pollRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/blockchain', blockchainRoutes);

// Enhanced health check with database status
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: dbStatus ? 'connected' : 'disconnected',
      memory: {
        used: process.memoryUsage().heapUsed / 1024 / 1024,
        total: process.memoryUsage().heapTotal / 1024 / 1024
      }
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Graceful shutdown endpoint (for manual intervention if needed)
app.post('/api/graceful-shutdown', (req, res) => {
  res.json({ message: 'Initiating graceful shutdown' });
  console.log('🔄 Manual graceful shutdown initiated');
  process.exit(0);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  
  // Handle memory-related errors
  if (err.message && err.message.includes('heap')) {
    console.error('Memory error detected, consider increasing Node.js memory limit');
    return res.status(500).json({ 
      error: 'Server is experiencing high load. Please try again later.' 
    });
  }
  
  res.status(500).json({ 
    error: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log
});

// Global uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit for database errors, only for critical errors
  if (error.code && error.code.includes('ECONNREFUSED')) {
    console.log('Database connection error, but keeping server running');
    return;
  }
  process.exit(1);
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received, starting graceful shutdown...`);
  
  // Close server first to stop accepting new requests
  server.close((err) => {
    if (err) {
      console.error('Error closing server:', err);
      process.exit(1);
    }
    
    console.log('✅ Server closed');
    
    // Cleanup database connections
    cleanupPool().then(() => {
      console.log('✅ Database connections closed');
      process.exit(0);
    }).catch((error) => {
      console.error('Error closing database connections:', error);
      process.exit(1);
    });
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.log('⚠️ Forcing shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
let server;
const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your database configuration.');
      // Don't exit immediately, try to reconnect
      setTimeout(startServer, 5000); // Retry after 5 seconds
      return;
    }

    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API Documentation: http://localhost:${PORT}/api/health`);
      console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Log memory usage periodically
      setInterval(() => {
        const memoryUsage = process.memoryUsage();
        console.log(`💾 Memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
      }, 60000); // Log every minute
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    // Retry after delay
    setTimeout(startServer, 5000);
  }
};

startServer();