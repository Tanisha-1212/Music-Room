import express from 'express';
const router = express.Router();
import {
    createRoom ,
    joinRoom,
    leaveRoom,
    getMyRooms,
    getRoomDetails,
    deleteRoom,
    addSongToPlaylist,
    removeSongFromPlaylist
} from '../controllers/roomController.js';

import {authenticate} from '../middleware/auth.js';

router.post('/', authenticate, createRoom);
router.post('/join', authenticate, joinRoom);
router.post('/leave/:roomCode', authenticate, leaveRoom);

router.get('/my-rooms', authenticate, getMyRooms);
router.get('/:roomId', authenticate, getRoomDetails);

router.delete('/:roomId', authenticate, deleteRoom);

router.post('/:roomId/playlist', authenticate, addSongToPlaylist);
router.delete('/:roomId/playlist/:songId', authenticate, removeSongFromPlaylist);

export default router;