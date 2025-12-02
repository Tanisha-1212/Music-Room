import express from 'express';
import passport from 'passport';
import { signup, login, logout, getCurrentUser, googleAuthCallback } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateSignup, validateLogin } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/auth/error`,
  }),
  googleAuthCallback
);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

export default router;