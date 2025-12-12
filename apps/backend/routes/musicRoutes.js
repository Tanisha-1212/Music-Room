import express from 'express';
const router = express.Router();
import {
    searchMusic,
    getMusicDetails
} from '../controllers/musicController.js';

import {authenticate} from '../middleware/auth.js';

router.get('/search', authenticate, searchMusic);
router.get('/details/:videoId', authenticate, getMusicDetails);

export default router;