// routes/room.js
import express from 'express';
import {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoomDetails,
    addSongToPlaylist,
    removeSongFromPlaylist,
    skipSong,
    updatePlayback
} from '../controllers/roomController.js';

import {authenticate} from '../middleware/auth.js';

const router = express.Router();

router.post('/create', authenticate, createRoom);
router.post('/join', authenticate, joinRoom);
router.post('/:roomCode/leave', authenticate, leaveRoom);
router.get('/:roomCode', authenticate, getRoomDetails);
router.post('/:roomCode/playlist/add', authenticate, addSongToPlaylist);
router.delete('/:roomCode/playlist/:songId', authenticate, removeSongFromPlaylist);
router.post('/:roomCode/skip', authenticate, skipSong);
router.put('/:roomCode/playback', authenticate, updatePlayback);

export default router;