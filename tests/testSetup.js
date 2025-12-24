import { isMockDataMode } from '../config/database.js';
import { mockExhibits } from '../data/mockData.js';

/**
 * Seed test data into database
 */
export const seedTestData = async () => {
	try {
		if (!isMockDataMode()) {
			const Exhibit = (await import('../models/Exhibit.js')).default;
			await Exhibit.deleteMany({});
			
			const docs = mockExhibits.map(e => ({
				exhibitId: e.exhibitId,
				title: e.title,
				name: e.name || e.title,
				category: e.category || [],
				description: e.description || '',
				location: e.location || '',
				ratings: Object.fromEntries(e.ratings || new Map()),
				averageRating: e.averageRating || 0,
				audioGuideUrl: e.audioGuideUrl || null,
				keywords: e.keywords || [],
				features: e.features || []
			}));
			
			if (docs.length > 0) await Exhibit.insertMany(docs);
		}
	} catch (seedErr) {
		console.warn('Warning: seeding exhibits failed', seedErr.message);
	}
};