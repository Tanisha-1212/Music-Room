import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import connectDatabase from './config/db.js';
import { setupSocketHandlers } from './sockets/socketHandler.js'; // We'll build this next

const PORT = parseInt(process.env.PORT) || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

const startServer = async () => {
  try {
    // 1. Connect to database
    await connectDatabase();
    console.log('✅ Database connected');

    // 2. Create Express app
    const app = createApp();

    // 3. Create HTTP server
    const httpServer = createServer(app);

    // 4. Initialize Socket.io
    const io = new Server(httpServer, {
      cors: {
        origin: CORS_ORIGIN,
        credentials: true,
      },
    });

    // 5. Setup socket event handlers (we'll build this next)
    setupSocketHandlers(io);

    // 6. Make io accessible in routes (optional)
    app.set('io', io);

    // 7. Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Socket.io ready for connections`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();