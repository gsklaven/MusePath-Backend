import Exhibit from '../models/Exhibit.js';
import { isMockDataMode } from '../config/database.js';
import { mockExhibits } from '../data/mockData.js';
import { sanitizeSearchTerm } from '../utils/helpers.js';

/**
 * Searches for exhibits based on a search term and/or category.
 * The search is performed in a case-insensitive manner across the exhibit's title, description, keywords, and categories.
 * The function adapts its search strategy based on whether the application is in mock data mode or connected to a MongoDB database.
 *
 * @param {string} term - The search term to look for. The term is sanitized before use.
 * @param {string} category - An optional category to filter the search results.
 * @param {string} [_='online'] - The access mode. Currently not used in the logic but available for future enhancements.
 * @returns {Promise<Array>} A promise that resolves to an array of exhibit objects that match the search criteria.
 */
export const searchExhibits = async (term, category, _ = 'online') => {
  // Sanitize the search term to prevent injection attacks and format it for searching.
  const searchTerm = term ? sanitizeSearchTerm(term) : null;
  
  if (isMockDataMode()) {
    // --- MOCK DATA MODE ---
    let results = [...mockExhibits];
    
    // Filter results based on the search term.
    if (searchTerm) {
      results = results.filter(exhibit => 
        exhibit.title.toLowerCase().includes(searchTerm) ||
        exhibit.description.toLowerCase().includes(searchTerm) ||
        exhibit.keywords.some(k => k.toLowerCase().includes(searchTerm)) ||
        exhibit.category.some(c => c.toLowerCase().includes(searchTerm))
      );
    }
    
    // Further filter results by category if one is provided.
    if (category) {
      const cat = category.toLowerCase();
      results = results.filter(exhibit => 
        exhibit.category.some(c => c.toLowerCase().includes(cat))
      );
    }
    return results;
  }
  
  // --- MONGODB MODE ---
  const query = {};
  
  // If a search term is provided, build a query to search across multiple fields.
  if (searchTerm) {
    query.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },       // Case-insensitive regex search on title
      { description: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive regex search on description
      { keywords: { $in: [new RegExp(searchTerm, 'i')] } }      // Case-insensitive search within the keywords array
    ];
  }
  
  // If a category is provided, add it to the query.
  if (category) {
    query.category = { $in: [new RegExp(category, 'i')] }; // Case-insensitive search within the category array
  }
  
  // Execute the query against the Exhibit collection.
  return await Exhibit.find(query);
};