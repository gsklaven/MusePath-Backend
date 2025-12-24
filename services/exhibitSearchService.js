import Exhibit from '../models/Exhibit.js';
import { isMockDataMode } from '../config/database.js';
import { mockExhibits } from '../data/mockData.js';
import { sanitizeSearchTerm } from '../utils/helpers.js';

/**
 * Search exhibits
 * @param {string} term - Search term
 * @param {string} category - Category filter
 * @param {string} mode - Access mode
 * @returns {Promise<Array>} Array of exhibits
 */
export const searchExhibits = async (term, category, _ = 'online') => {
  const searchTerm = term ? sanitizeSearchTerm(term) : null;
  
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
    return results;
  }
  
  const query = {};
  if (searchTerm) {
    query.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { keywords: { $in: [new RegExp(searchTerm, 'i')] } }
    ];
  }
  if (category) query.category = { $in: [new RegExp(category, 'i')] };
  return await Exhibit.find(query);
};