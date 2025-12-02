import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Search for music/audio on YouTube
export const searchMusic = async (query, maxResults = 10) => {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        videoCategoryId: '10', // Music category only
        maxResults,
        key: YOUTUBE_API_KEY,
      },
    });

    // Get video IDs to fetch duration
    const videoIds = response.data.items.map((item) => item.id.videoId).join(',');
    
    // Get full video details including duration
    const detailsResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'contentDetails',
        id: videoIds,
        key: YOUTUBE_API_KEY,
      },
    });

    // Combine search results with duration
    const videos = response.data.items.map((item, index) => {
      const duration = parseDuration(detailsResponse.data.items[index].contentDetails.duration);
      
      return {
        videoId: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        duration, // in seconds
      };
    });

    return videos;
  } catch (error) {
    console.error('YouTube search error:', error.response?.data || error.message);
    throw new Error('Failed to search music on YouTube');
  }
};

// Get audio/music details by video ID or URL
export const getMusicDetails = async (videoIdOrUrl) => {
  try {
    // Extract video ID if URL is provided
    const videoId = videoIdOrUrl.includes('youtube.com') || videoIdOrUrl.includes('youtu.be')
      ? extractVideoId(videoIdOrUrl)
      : videoIdOrUrl;

    if (!videoId) {
      throw new Error('Invalid YouTube URL or video ID');
    }

    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails',
        id: videoId,
        key: YOUTUBE_API_KEY,
      },
    });

    if (response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = response.data.items[0];
    const duration = parseDuration(video.contentDetails.duration);

    return {
      videoId: video.id,
      title: video.snippet.title,
      artist: video.snippet.channelTitle,
      thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      duration,
    };
  } catch (error) {
    console.error('YouTube music details error:', error.response?.data || error.message);
    throw new Error('Failed to get music details');
  }
};

// Parse ISO 8601 duration (PT4M33S) to seconds
const parseDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  const hours = parseInt((match[1] || '0').replace('H', '')) || 0;
  const minutes = parseInt((match[2] || '0').replace('M', '')) || 0;
  const seconds = parseInt((match[3] || '0').replace('S', '')) || 0;
  
  return hours * 3600 + minutes * 60 + seconds;
};

// Extract video ID from YouTube URL
export const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};

// Format duration from seconds to MM:SS or HH:MM:SS
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};