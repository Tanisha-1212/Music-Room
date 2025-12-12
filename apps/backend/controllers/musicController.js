import * as youtubeService from '../services/youtubeService.js';

export const searchMusic = async (req, res) => {
  try {
    const { q, limit } = req.query; // q = query string

    // Validate
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Call YouTube service
    const results = await youtubeService.searchMusic(q, parseInt(limit) || 10);

    return res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: {
        results
      }
    });

  } catch (error) {
    console.error('Music search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search music',
      error: error.message
    });
  }
};

export const getMusicDetails = async (req, res) => {
  try {
    const { videoId } = req.params;

    // Validate
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Video ID is required'
      });
    }

    // Call YouTube service
    const details = await youtubeService.getMusicDetails(videoId);

    return res.status(200).json({
      success: true,
      message: 'Music details fetched successfully',
      data: {
        video: details
      }
    });

  } catch (error) {
    console.error('Get music details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get music details',
      error: error.message
    });
  }
};