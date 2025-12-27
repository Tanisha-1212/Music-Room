import express from 'express';
const router = express.Router();
import{
    register,
    login,
    logout,
    getCurrentUser,
    googleAuth,
    googleAuthCallback,
    changePassword,
    deleteAccount
} from '../controllers/authController.js';

import {authenticate} from '../middleware/auth.js';
import passport  from 'passport';

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticate, logout);

router.get("/me", authenticate, getCurrentUser);

// Google OAuth routes
router.get('/google', googleAuth);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`,
    session: false // NO SESSION
  }),
  googleAuthCallback
);

router.post('/changePassword', changePassword);

router.delete('/deleteAccount', deleteAccount);

export default router;