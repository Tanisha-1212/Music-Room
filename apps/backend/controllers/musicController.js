import { searchMusic, getMusicDetails } from '../services/youtubeService.js';

// @desc    Search for music on YouTube
// @route   GET /api/music/search?q=query
export const searchMusicVideos = async (req, res) => {
  try {
    const { q, limit } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const maxResults = parseInt(limit) || 10;
    const results = await searchMusic(q, maxResults);

    res.status(200).json({
      success: true,
      data: {
        query: q,
        count: results.length,
        results,
      },
    });
  } catch (error) {
    console.error('Search music error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search music',
      error: error.message,
    });
  }
};

// @desc    Get music details by video ID or URL
// @route   GET /api/music/details/:videoId
export const getMusicInfo = async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Video ID is required',
      });
    }

    const musicDetails = await getMusicDetails(videoId);

    res.status(200).json({
      success: true,
      data: musicDetails,
    });
  } catch (error) {
    console.error('Get music details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get music details',
      error: error.message,
    });
  }
};