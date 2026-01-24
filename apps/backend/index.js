import dotenv from 'dotenv';
dotenv.config();
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import connectDatabase from './config/db.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';
import passport from 'passport';
import './config/passport.js';

const PORT = parseInt(process.env.PORT) || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

const startServer = async () => {
  try {
    // 1. Connect to database
    await connectDatabase();
    console.log('✅ Database connected');

    console.log('📋 Loaded Passport strategies:', Object.keys(passport._strategies));
    if (!passport._strategies.google) {
      console.error('❌ Google strategy NOT loaded!');
      console.error('Check your passport.js file and environment variables');
    }

    // 2. Create Express app
    const app = createApp();

    // 3. Create HTTP server
    const httpServer = createServer(app);

    // 4. Initialize Socket.io with proper configuration
    const io = new Server(httpServer, {
      cors: {
        origin: CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true, // Enable compatibility with older clients
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    console.log('🔌 Socket.IO configured for origin:', CORS_ORIGIN);

    // 5. Setup socket event handlers
    setupSocketHandlers(io);

    // 6. Make io accessible in routes
    app.set('io', io);

    // Add middleware to attach io to requests
    app.use((req, res, next) => {
      req.io = io;
      next();
    });

    // 7. Start server
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Socket.io ready for connections`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 CORS enabled for: ${CORS_ORIGIN}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();