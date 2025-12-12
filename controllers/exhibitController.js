import * as exhibitService from '../services/exhibitService.js';
import { sendSuccess, sendError, sendNotFound, sendNoContent } from '../utils/responses.js';
import { validateExhibitId, validateMode } from '../utils/validators.js';

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
    if (!validateExhibitId(exhibit_id)) {
      return sendError(res, 'Invalid exhibit ID format', 400);
    }
    if (mode && !validateMode(mode)) {
      return sendError(res, 'Invalid mode value', 400);
    }
    const exhibit = await exhibitService.getExhibitById(Number(exhibit_id), mode);
    if (!exhibit) {
      return sendNotFound(res, 'Exhibit not found');
    }
    const response = {
      exhibitId: exhibit.exhibitId,
      title: exhibit.title,
      name: exhibit.name,
      category: exhibit.category,
      rating: exhibit.averageRating,
      location: exhibit.location,
      features: exhibit.features,
      status: exhibit.status,
      description: exhibit.description,
      historicalInfo: exhibit.historicalInfo,
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
    if (!validateExhibitId(exhibit_id)) {
      return sendError(res, 'Invalid exhibit ID format', 400);
    }
    if (mode && !validateMode(mode)) {
      return sendError(res, 'Invalid mode value', 400);
    }
    const audioInfo = await exhibitService.getAudioGuide(Number(exhibit_id), mode);
    if (!audioInfo) {
      return sendNotFound(res, 'Exhibit not found');
    }
    if (!audioInfo.available) {
      return sendError(res, audioInfo.message, 402);
    }
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
    if (!validateExhibitId(exhibit_id)) {
      return sendError(res, 'Invalid exhibit ID format', 400);
    }
    // verifyToken middleware ensures req.user exists
    const userId = req.user.id || req.user.userId || req.user._id;
    if (!userId) {
      return sendError(res, 'User authentication required', 401);
    }
    const exhibit = await exhibitService.rateExhibit(Number(exhibit_id), userId, rating);
    if (!exhibit) {
      return sendNotFound(res, 'Exhibit not found');
    }
    return sendSuccess(res, { exhibitId: exhibit.exhibitId, rating, averageRating: exhibit.averageRating }, 'Exhibit rated successfully', 201);
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
    const { keyword, exhibit_term, category, mode } = req.query;
    
    // Support both 'keyword' and 'exhibit_term' parameters
    const searchTerm = keyword || exhibit_term;
    
    const exhibits = await exhibitService.searchExhibits(searchTerm, category, mode);
    
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
    if (!validateExhibitId(exhibit_id)) {
      return sendError(res, 'Invalid exhibit ID format', 400);
    }
    const exhibit = await exhibitService.getExhibitById(Number(exhibit_id));
    if (!exhibit) {
      return sendNotFound(res, 'Exhibit not found');
    }
    // Return full exhibit details for offline download
    return sendSuccess(res, {
      ...exhibit,
      exhibitId: exhibit.exhibitId,
      downloadUrl: `/downloads/exhibits/${exhibit_id}.zip`
    }, 'Exhibit information retrieved for download');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Create a new exhibit
 * POST /exhibits
 */
export const createExhibit = async (req, res) => {
  try {
    const exhibitData = req.body;
    
    const exhibit = await exhibitService.createExhibit(exhibitData);
    
    return sendSuccess(res, { exhibitId: exhibit.exhibitId }, 'Exhibit created successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Delete an exhibit
 * DELETE /exhibits/:exhibit_id
 */
export const deleteExhibit = async (req, res) => {
  try {
    const { exhibit_id } = req.params;
    if (!validateExhibitId(exhibit_id)) {
      return sendError(res, 'Invalid exhibit ID format', 400);
    }
    const result = await exhibitService.deleteExhibit(Number(exhibit_id));
    if (!result) {
      return sendNotFound(res, 'Exhibit not found');
    }
    return sendNoContent(res);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
