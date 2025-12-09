import * as exhibitService from '../services/exhibitService.js';
import { sendSuccess, sendError, sendNotFound, sendNoContent } from '../utils/responses.js';

/**
 * Exhibit Controller
 * Handles HTTP requests for exhibit operations
 */

/**
 * View exhibit information
 * GET /exhibits/:exhibit_id
 */
export const viewExhibitInfo = async (req, res) => {
  try {
    const { exhibit_id } = req.params;
    const { mode } = req.query;
    
    const exhibit = await exhibitService.getExhibitById(exhibit_id, mode);
    
    if (!exhibit) {
      return sendNotFound(res, 'Exhibit not found');
    }
    
  const response = {
    exhibit_id: exhibit.exhibitId,
    title: exhibit.title,
    name: exhibit.name,
    rating: exhibit.averageRating,
    location: exhibit.location,
    features: exhibit.features,
    status: exhibit.status,
    description: exhibit.description,
    audioGuideUrl: exhibit.audioGuideUrl,
  };
    
    return sendSuccess(res, response, 'Exhibit information retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get audio guide for exhibit
 * GET /exhibits/:exhibit_id/audio
 */
export const getAudioGuide = async (req, res) => {
  try {
    const { exhibit_id } = req.params;
    const { mode } = req.query;
    
    const audioInfo = await exhibitService.getAudioGuide(exhibit_id, mode);
    
    if (!audioInfo) {
      return sendNotFound(res, 'Exhibit not found');
    }
    
    if (!audioInfo.available) {
      return sendError(res, audioInfo.message, 402);
    }
    
    // In a real application, send the actual audio file
    return sendSuccess(res, { audioUrl: audioInfo.url }, 'Audio guide retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Rate an exhibit
 * POST /exhibits/:exhibit_id/ratings
 */
export const rateExhibit = async (req, res) => {
  try {
    const { exhibit_id } = req.params;
    const { rating } = req.body;
    
    // verifyToken middleware ensures req.user exists
    const userId = req.user.id || req.user.userId || req.user._id;
    
    if (!userId) {
      return sendError(res, 'User authentication required', 401);
    }
    
    const exhibit = await exhibitService.rateExhibit(exhibit_id, userId, rating);
    
    if (!exhibit) {
      return sendNotFound(res, 'Exhibit not found');
    }
    
    return sendNoContent(res);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Search for exhibits
 * GET /exhibits/search
 */
export const searchExhibits = async (req, res) => {
  try {
    const { exhibit_term, category, mode } = req.query;
    
    if (!exhibit_term) {
      return sendError(res, 'Search term is required', 400);
    }
    
    const exhibits = await exhibitService.searchExhibits(exhibit_term, category, mode);
    
    if (exhibits.length === 0) {
      return sendNotFound(res, 'No exhibits found matching the search criteria');
    }
    
    return sendSuccess(res, exhibits, 'Exhibits retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Download exhibit information
 * GET /downloads/exhibits/:exhibit_id
 */
export const downloadExhibitInfo = async (req, res) => {
  try {
    const { exhibit_id } = req.params;
    
    const exhibit = await exhibitService.getExhibitById(exhibit_id);
    
    if (!exhibit) {
      return sendNotFound(res, 'Exhibit not found');
    }
    
    // In a real application, return a ZIP file
    return sendSuccess(res, { 
      downloadUrl: `/downloads/exhibits/${exhibit_id}.zip`,
      exhibit_id: Number(exhibit_id)
    }, 'Exhibit download link generated');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
