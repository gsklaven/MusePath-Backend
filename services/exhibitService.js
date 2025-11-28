import Exhibit from '../models/Exhibit.js';
import { isMockDataMode } from '../config/database.js';
import { mockExhibits } from '../data/mockData.js';
import { sanitizeSearchTerm, calculateAverageRating } from '../utils/helpers.js';

/**
 * Exhibit Service
 * Business logic for exhibit operations
 */

/**
 * Get exhibit by ID
 * @param {number} exhibitId - Exhibit ID
 * @param {string} mode - Access mode (online/offline)
 * @returns {Promise<Object>} Exhibit object
 */
export const getExhibitById = async (exhibitId, mode = 'online') => {
  if (isMockDataMode()) {
    const exhibit = mockExhibits.find(e => e.exhibitId === Number(exhibitId));
    if (exhibit && mode === 'offline' && exhibit.audioGuideUrl) {
      // In offline mode, audio might not be available
      return { ...exhibit, audioGuideUrl: null };
    }
    return exhibit || null;
  }
  
  return await Exhibit.findOne({ exhibitId: Number(exhibitId) });
};

/**
 * Search exhibits
 * @param {string} term - Search term
 * @param {string} category - Category filter
 * @param {string} mode - Access mode
 * @returns {Promise<Array>} Array of exhibits
 */
export const searchExhibits = async (term, category, mode = 'online') => {
  const searchTerm = sanitizeSearchTerm(term);
  
  if (isMockDataMode()) {
    let results = mockExhibits;
    
    if (searchTerm) {
      results = results.filter(exhibit => 
        exhibit.title.toLowerCase().includes(searchTerm) ||
        exhibit.description.toLowerCase().includes(searchTerm) ||
        exhibit.keywords.some(k => k.toLowerCase().includes(searchTerm)) ||
        exhibit.category.some(c => c.toLowerCase().includes(searchTerm))
      );
    }
    
    if (category) {
      const cat = category.toLowerCase();
      results = results.filter(exhibit => 
        exhibit.category.some(c => c.toLowerCase().includes(cat))
      );
    }
    
    return results.map(e => ({
      exhibit_id: e.exhibitId,
      title: e.title
    }));
  }
  
  const query = {};
  
  if (searchTerm) {
    query.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { keywords: { $in: [new RegExp(searchTerm, 'i')] } }
    ];
  }
  
  if (category) {
    query.category = { $in: [new RegExp(category, 'i')] };
  }
  
  const exhibits = await Exhibit.find(query).select('exhibitId title');
  return exhibits.map(e => ({
    exhibit_id: e.exhibitId,
    title: e.title
  }));
};

/**
 * Rate exhibit
 * @param {number} exhibitId - Exhibit ID
 * @param {number} userId - User ID
 * @param {number} rating - Rating value
 * @returns {Promise<Object>} Updated exhibit
 */
export const rateExhibit = async (exhibitId, userId, rating) => {
  if (isMockDataMode()) {
    const exhibit = mockExhibits.find(e => e.exhibitId === Number(exhibitId));
    if (exhibit) {
      exhibit.ratings.set(Number(userId), Number(rating));
      exhibit.averageRating = calculateAverageRating(exhibit.ratings);
      exhibit.updatedAt = new Date();
    }
    return exhibit;
  }
  
  const exhibit = await Exhibit.findOne({ exhibitId: Number(exhibitId) });
  if (exhibit) {
    exhibit.ratings.set(Number(userId).toString(), Number(rating));
    const ratingsArray = Array.from(exhibit.ratings.values());
    exhibit.averageRating = ratingsArray.reduce((a, b) => a + b, 0) / ratingsArray.length;
    await exhibit.save();
  }
  return exhibit;
};

/**
 * Get audio guide for exhibit
 * @param {number} exhibitId - Exhibit ID
 * @param {string} mode - Access mode
 * @returns {Promise<Object>} Audio guide info
 */
export const getAudioGuide = async (exhibitId, mode) => {
  if (isMockDataMode()) {
    const exhibit = mockExhibits.find(e => e.exhibitId === Number(exhibitId));
    if (!exhibit) return null;
    
    if (mode === 'offline') {
      return { available: false, message: 'Audio guide not available offline' };
    }
    
    return { available: true, url: exhibit.audioGuideUrl };
  }
  
  const exhibit = await Exhibit.findOne({ exhibitId: Number(exhibitId) });
  if (!exhibit) return null;
  
  if (mode === 'offline') {
    return { available: false, message: 'Audio guide not available offline' };
  }
  
  return { available: true, url: exhibit.audioGuideUrl };
};

/**
 * Get all exhibits
 * @returns {Promise<Array>} Array of exhibits
 */
export const getAllExhibits = async () => {
  if (isMockDataMode()) {
    return mockExhibits;
  }
  
  return await Exhibit.find();
};
