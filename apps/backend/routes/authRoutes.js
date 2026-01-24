import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
  deleteAccount,
  googleAuth,
  googleAuthCallback
} from '../controllers/authController.js';

const router = express.Router();


// @route   POST /api/auth/register
// @desc    Register a new user with email/password
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user with email/password
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth flow
// @access  Public
router.get('/google', googleAuth);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback (redirects to frontend)
// @access  Public
router.get('/google/callback', 
  // Passport middleware handles the OAuth exchange
  (req, res, next) => {
    const passport = require('passport');
    passport.authenticate('google', { 
      session: false,
      failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
    })(req, res, next);
  },
  googleAuthCallback
);


// @route   GET /api/auth/me
// @desc    Get current authenticated user
// @access  Private
router.get('/me', authenticate, getCurrentUser);

// @route   POST /api/auth/logout
// @desc    Logout current user (clears cookie)
// @access  Private
router.post('/logout', authenticate, logout);

// @route   PUT /api/auth/change-password
// @desc    Change user password (not for Google users)
// @access  Private
router.put('/change-password', authenticate, changePassword);

// @route   DELETE /api/auth/account
// @desc    Delete user account permanently
// @access  Private
router.delete('/account', authenticate, deleteAccount);

export default router;