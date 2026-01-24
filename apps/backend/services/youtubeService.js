import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Validate API key on startup
if (!YOUTUBE_API_KEY) {
  console.error('⚠️ WARNING: YOUTUBE_API_KEY is not set in environment variables');
}

// Search for music/audio on YouTube
export const searchMusic = async (query, maxResults = 10, options = {}) => {
  try {
    if (!YOUTUBE_API_KEY) {
      const error = new Error('YouTube API key not configured');
      error.code = 'ERR_INVALID_API_KEY';
      throw error;
    }

    // ✅ Build search query with audio preference
    const searchQuery = options.audioOnly !== false 
      ? `${query} audio` 
      : query;

    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: searchQuery, // ✅ Prioritize audio results
        type: 'video',
        videoCategoryId: '10', // Music category only
        videoDefinition: 'any', // Include all quality levels
        videoEmbeddable: 'true', // Only embeddable videos
        maxResults: Math.min(maxResults, 50), // YouTube API max is 50
        key: YOUTUBE_API_KEY,
      },
    });

    // Handle empty results
    if (!response.data.items || response.data.items.length === 0) {
      return [];
    }

    // Get video IDs to fetch duration
    const videoIds = response.data.items
      .filter(item => item.id.videoId) // Filter out invalid items
      .map((item) => item.id.videoId)
      .join(',');
    
    if (!videoIds) {
      return [];
    }

    // Get full video details including duration
    const detailsResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'contentDetails,statistics',
        id: videoIds,
        key: YOUTUBE_API_KEY,
      },
    });

    // Combine search results with duration
    const videos = response.data.items
      .filter(item => item.id.videoId)
      .map((item, index) => {
        const details = detailsResponse.data.items[index];
        
        // Skip if details not found
        if (!details) {
          return null;
        }

        const duration = parseDuration(details.contentDetails.duration);
        
        // ✅ Filter by duration if specified
        const minDuration = options.minDuration || 30; // Default: 30 seconds
        const maxDuration = options.maxDuration || 900; // Default: 15 minutes
        
        if (duration < minDuration || duration > maxDuration) {
          return null;
        }
        
        return {
          videoId: item.id.videoId,
          title: cleanTitle(item.snippet.title),
          artist: item.snippet.channelTitle,
          thumbnail: getBestThumbnail(item.snippet.thumbnails),
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          duration, // in seconds
          viewCount: parseInt(details.statistics?.viewCount || 0),
          publishedAt: item.snippet.publishedAt
        };
      })
      .filter(video => video !== null); // Remove null entries

    return videos;
  } catch (error) {
    console.error('YouTube search error:', error.response?.data || error.message);
    
    // Handle quota exceeded
    if (error.response?.status === 403 && 
        error.response?.data?.error?.errors?.[0]?.reason === 'quotaExceeded') {
      const quotaError = new Error('YouTube API quota exceeded');
      quotaError.code = 'ERR_QUOTA_EXCEEDED';
      throw quotaError;
    }
    
    // Handle invalid API key
    if (error.response?.status === 400 && 
        error.response?.data?.error?.errors?.[0]?.reason === 'keyInvalid') {
      const keyError = new Error('Invalid YouTube API key');
      keyError.code = 'ERR_INVALID_API_KEY';
      throw keyError;
    }
    
    throw new Error('Failed to search music on YouTube');
  }
};

// Get audio/music details by video ID or URL
export const getMusicDetails = async (videoIdOrUrl) => {
  try {
    if (!YOUTUBE_API_KEY) {
      const error = new Error('YouTube API key not configured');
      error.code = 'ERR_INVALID_API_KEY';
      throw error;
    }

    // Extract video ID if URL is provided
    const videoId = videoIdOrUrl.includes('youtube.com') || videoIdOrUrl.includes('youtu.be')
      ? extractVideoId(videoIdOrUrl)
      : videoIdOrUrl;

    if (!videoId) {
      throw new Error('Invalid YouTube URL or video ID');
    }

    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoId,
        key: YOUTUBE_API_KEY,
      },
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = response.data.items[0];
    const duration = parseDuration(video.contentDetails.duration);

    return {
      videoId: video.id,
      title: cleanTitle(video.snippet.title),
      artist: video.snippet.channelTitle,
      thumbnail: getBestThumbnail(video.snippet.thumbnails),
      url: `https://www.youtube.com/watch?v=${video.id}`,
      duration,
      viewCount: parseInt(video.statistics?.viewCount || 0),
      likeCount: parseInt(video.statistics?.likeCount || 0),
      publishedAt: video.snippet.publishedAt,
      description: video.snippet.description
    };
  } catch (error) {
    console.error('YouTube music details error:', error.response?.data || error.message);
    
    // Handle quota exceeded
    if (error.response?.status === 403) {
      const quotaError = new Error('YouTube API quota exceeded');
      quotaError.code = 'ERR_QUOTA_EXCEEDED';
      throw quotaError;
    }
    
    throw new Error('Failed to get music details');
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Parse ISO 8601 duration (PT4M33S) to seconds
const parseDuration = (duration) => {
  try {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    
    if (!match) {
      return 0;
    }
    
    const hours = parseInt((match[1] || '0').replace('H', '')) || 0;
    const minutes = parseInt((match[2] || '0').replace('M', '')) || 0;
    const seconds = parseInt((match[3] || '0').replace('S', '')) || 0;
    
    return hours * 3600 + minutes * 60 + seconds;
  } catch (error) {
    console.error('Duration parse error:', error);
    return 0;
  }
};

// Extract video ID from YouTube URL
export const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/v\/)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

// Format duration from seconds to MM:SS or HH:MM:SS
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Clean video title (remove common YouTube title patterns)
const cleanTitle = (title) => {
  return title
    .replace(/\(Official.*?\)/gi, '')
    .replace(/\[Official.*?\]/gi, '')
    .replace(/\(Official\)/gi, '')
    .replace(/\[Official\]/gi, '')
    .replace(/Official Video/gi, '')
    .replace(/Official Audio/gi, '')
    .replace(/\(.*?Music Video\)/gi, '')
    .replace(/\[.*?Music Video\]/gi, '')
    .trim();
};

// Get best available thumbnail
const getBestThumbnail = (thumbnails) => {
  if (!thumbnails) {
    return 'https://via.placeholder.com/320x180?text=No+Thumbnail';
  }

  // Priority: maxres > high > medium > default
  return thumbnails.maxres?.url ||
         thumbnails.high?.url ||
         thumbnails.medium?.url ||
         thumbnails.default?.url ||
         'https://via.placeholder.com/320x180?text=No+Thumbnail';
};