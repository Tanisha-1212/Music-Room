import express from 'express';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomDetails,
  getMyRooms,
  deleteRoom,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from '../controllers/roomController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Room management
router.post('/', createRoom);
router.post('/join', joinRoom);
router.get('/my-rooms', getMyRooms);
router.get('/:roomId', getRoomDetails);
router.post('/:roomId/leave', leaveRoom);
router.delete('/:roomId', deleteRoom);

// Playlist management
router.post('/:roomId/playlist', addSongToPlaylist);
router.delete('/:roomId/playlist/:songId', removeSongFromPlaylist);

export default router;