import express from 'express';
import { searchMusicVideos, getMusicInfo } from '../controllers/musicController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All music routes require authentication
router.use(authenticate);

// Search music
router.get('/search', searchMusicVideos);

// Get music details
router.get('/details/:videoId', getMusicInfo);

export default router;