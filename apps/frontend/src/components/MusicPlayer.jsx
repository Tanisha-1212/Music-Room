import {useState, useEffect} from 'react';
import socketService from '../services/socket'
import { Play, Pause, SkipForward, Music } from 'lucide-react';

const MusicPlayer = ({ room }) => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(room.isPlaying);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Get current song from playlist
  useEffect(() => {
    if (room.currentSong && room.playlist) {
      const song = room.playlist.find(s => s._id === room.currentSong);
      setCurrentSong(song);
    }
  }, [room.currentSong, room.playlist]);

  // YouTube player options - HIDDEN VIDEO
  const opts = {
    height: '0',           // ← Hide video
    width: '0',            // ← Hide video
    playerVars: {
      autoplay: 0,
      controls: 0,         // ← Hide YouTube controls
    },
  };

  // When player is ready
  const onReady = (event) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
  };

  // Update progress bar
  useEffect(() => {
    if (!player || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(player.getCurrentTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [player, isPlaying]);

  // Play button handler
  const handlePlay = () => {
    if (player) {
      player.playVideo();
      socketService.play(room._id, currentSong._id, player.getCurrentTime());
      setIsPlaying(true);
    }
  };

  // Pause button handler
  const handlePause = () => {
    if (player) {
      player.pauseVideo();
      socketService.pause(room._id, player.getCurrentTime());
      setIsPlaying(false);
    }
  };

  // Skip button handler
  const handleSkip = () => {
    socketService.skip(room._id);
  };

  // Seek handler (progress bar click)
  const handleSeek = (e) => {
    if (!player || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    player.seekTo(newTime, true);
    socketService.seek(room._id, newTime);
    setCurrentTime(newTime);
  };

  // Listen for socket events
  useEffect(() => {
    socketService.onPlay((data) => {
      if (player) {
        player.seekTo(data.position, true);
        player.playVideo();
        setIsPlaying(true);
      }
    });

    socketService.onPause((data) => {
      if (player) {
        player.seekTo(data.position, true);
        player.pauseVideo();
        setIsPlaying(false);
      }
    });

    socketService.onSeek((data) => {
      if (player) {
        player.seekTo(data.position, true);
        setCurrentTime(data.position);
      }
    });

    socketService.onSkip((data) => {
      // Room data will update, causing re-render
    });

    return () => {
      socketService.removeAllListeners('playback-play');
      socketService.removeAllListeners('playback-pause');
      socketService.removeAllListeners('playback-seek');
      socketService.removeAllListeners('playback-skip');
    };
  }, [player]);

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Extract YouTube video ID
  const getVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  if (!currentSong) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">🎵 Now Playing</h2>
        <div className="bg-linear-to-br from-[#6495ED]/10 to-[#6495ED]/5 rounded-lg p-12">
          <div className="text-center">
            <Music className="w-16 h-16 text-[#6495ED] mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
              No song playing
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Add songs to the playlist to start listening
            </p>
          </div>
        </div>
      </div>
    );
  }

  const videoId = getVideoId(currentSong.url);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-6">🎵 Now Playing</h2>
      
      {/* Hidden YouTube Player (Audio Only) */}
      {videoId && (
        <div className="hidden">
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={onReady}
          />
        </div>
      )}

      {/* Album Art / Thumbnail */}
      <div className="flex items-center space-x-6 mb-6">
        <img
          src={currentSong.thumbnail}
          alt={currentSong.title}
          className="w-24 h-24 rounded-lg object-cover shadow-lg"
        />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {currentSong.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {currentSong.artist}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div 
          className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer overflow-hidden"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-[#6495ED] transition-all"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handlePause}
          disabled={!isPlaying}
          className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Pause"
        >
          <Pause className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>

        <button
          onClick={handlePlay}
          disabled={isPlaying}
          className="p-5 rounded-full bg-[#6495ED] text-white hover:bg-[#4169E1] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          title="Play"
        >
          <Play className="w-8 h-8" />
        </button>

        <button
          onClick={handleSkip}
          className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          title="Skip"
        >
          <SkipForward className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer;