import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import musicRoutes from './routes/musicRoutes.js';
import roomRoutes from './routes/roomRoutes.js';

export const createApp = () => {
  const app = express();

  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  // backend/app.js or server.js
  const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ['http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Initialize Passport
  app.use(passport.initialize());

  // Compression middleware
  app.use(compression());

  // Logging middleware
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // ✅ ADD THIS: Root endpoint
  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'Music Room API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        rooms: '/api/rooms',
        music: '/api/music'
      },
      documentation: 'https://github.com/Tanisha-1212/Music-Room'
    });
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/rooms', roomRoutes);
  app.use('/api/music', musicRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  });

  return app;
};