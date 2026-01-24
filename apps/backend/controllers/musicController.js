import * as youtubeService from '../services/youtubeService.js';

// @desc    Search for music on YouTube
// @route   GET /api/music/search?q=query&limit=10
// @access  Private
export const searchMusic = async (req, res) => {
  try {
    const { q, limit } = req.query;

    // Validate query
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Validate and sanitize limit
    const searchLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 50); // Between 1-50

    // ✅ Pass options for audio filtering
    const searchOptions = {
      audioOnly: true, // Prioritize audio results
      minDuration: 30, // Minimum 30 seconds
      maxDuration: 900 // Maximum 15 minutes (songs)
    };

    // Call YouTube service with options
    const results = await youtubeService.searchMusic(q.trim(), searchLimit, searchOptions);

    // Check if results exist
    if (!results || results.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No results found',
        data: {
          results: []
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: {
        results,
        query: q,
        count: results.length
      }
    });

  } catch (error) {
    console.error('Music search error:', error);
    
    // Handle specific YouTube API errors
    if (error.code === 'ERR_INVALID_API_KEY') {
      return res.status(500).json({
        success: false,
        message: 'YouTube API configuration error'
      });
    }

    if (error.code === 'ERR_QUOTA_EXCEEDED') {
      return res.status(503).json({
        success: false,
        message: 'YouTube API quota exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to search music',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get detailed information about a specific video
// @route   GET /api/music/:videoId
// @access  Private
export const getMusicDetails = async (req, res) => {
  try {
    const { videoId } = req.params;

    // Validate video ID format (YouTube video IDs are typically 11 characters)
    if (!videoId || videoId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Video ID is required'
      });
    }

    // Basic YouTube video ID validation (alphanumeric, underscore, hyphen, 11 chars)
    const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/;
    if (!videoIdRegex.test(videoId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid YouTube video ID format'
      });
    }

    // Call YouTube service
    const details = await youtubeService.getMusicDetails(videoId);

    // Check if video exists
    if (!details) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Music details fetched successfully',
      data: {
        video: details
      }
    });

  } catch (error) {
    console.error('Get music details error:', error);

    // Handle specific errors
    if (error.message?.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Video not found or unavailable'
      });
    }

    if (error.code === 'ERR_QUOTA_EXCEEDED') {
      return res.status(503).json({
        success: false,
        message: 'YouTube API quota exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to get music details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};