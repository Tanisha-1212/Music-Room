import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  searchMusic,
  getMusicDetails
} from '../controllers/musicController.js';

const router = express.Router();

// @route   GET /api/music/search?q=query&limit=10
// @desc    Search for music on YouTube
// @access  Private
router.get('/search', authenticate, searchMusic);

// @route   GET /api/music/:videoId
// @desc    Get detailed information about a specific video
// @access  Private
router.get('/:videoId', authenticate, getMusicDetails);

export default router;