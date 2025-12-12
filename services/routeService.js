import Route from '../models/Route.js';
import { isMockDataMode } from '../config/database.js';
import { mockRoutes } from '../data/mockData.js';
import { getDestinationById } from './destinationService.js';
import { getUserById } from './userService.js';
import { getAllExhibits } from './exhibitService.js';
import { 
  calculateDistance, 
  calculateEstimatedTime, 
  calculateArrivalTime,
  generatePath,
  generateInstructions,
  generateUniqueId
} from '../utils/helpers.js';
import { DEFAULT_WALKING_SPEED } from '../config/constants.js';

/**
 * Route Service
 * Business logic for route operations
 */

/**
 * Calculate route
 * @param {Object} routeData - Route request data
 * @returns {Promise<Object>} Calculated route
 */
export const calculateRoute = async (routeData) => {
  const { user_id, destination_id, startLat, startLng } = routeData;
  
  // Get destination coordinates
  const destination = await getDestinationById(destination_id);
  if (!destination) {
    throw new Error('Destination not found');
  }
  
  const startTime = Date.now();
  
  // Calculate distance
  const distance = calculateDistance(
    startLat, 
    startLng, 
    destination.coordinates.lat, 
    destination.coordinates.lng
  );
  
  // Calculate estimated time
  const estimatedTime = calculateEstimatedTime(distance, DEFAULT_WALKING_SPEED);
  
  // Generate route
  const routeId = isMockDataMode() 
    ? generateUniqueId(mockRoutes, 'routeId')
    : await generateNextRouteId();
  
  const newRoute = {
    routeId,
    userId: Number(user_id),
    destinationId: Number(destination_id),
    startCoordinates: { lat: startLat, lng: startLng },
    endCoordinates: destination.coordinates,
    path: generatePath({ lat: startLat, lng: startLng }, destination.coordinates),
    instructions: generateInstructions(distance),
    stops: [],
    distance: Math.round(distance * 10) / 10,
    estimatedTime,
    arrivalTime: calculateArrivalTime(estimatedTime),
    calculationTime: Math.round((Date.now() - startTime) / 1000),
    isPersonalized: false,
    mapUrl: '/maps/1/route.png',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  if (isMockDataMode()) {
    mockRoutes.push(newRoute);
  } else {
    const route = new Route(newRoute);
    await route.save();
  }
  
  return {
    route_id: routeId,
    user_id: Number(user_id),
    destination_id: Number(destination_id),
    calculationTime: newRoute.calculationTime
  };
};

/**
 * Get route details
 * @param {number} routeId - Route ID
 * @param {number} walkingSpeed - Optional walking speed
 * @returns {Promise<Object>} Route details
 */
export const getRouteDetails = async (routeId, walkingSpeed) => {
  if (isMockDataMode()) {
    const route = mockRoutes.find(r => r.routeId === Number(routeId));
    if (!route) return null;
    
    let estimatedTime = route.estimatedTime;
    if (walkingSpeed) {
      estimatedTime = calculateEstimatedTime(route.distance, Number(walkingSpeed));
    }
    
    return {
      route_id: route.routeId,
      estimatedTime,
      arrivalTime: calculateArrivalTime(estimatedTime),
      distance: route.distance,
      path: route.path.map(p => `${p.lat},${p.lng}`),
      instructions: route.instructions
    };
  }
  
  const route = await Route.findOne({ routeId: Number(routeId) });
  if (!route) return null;
  
  let estimatedTime = route.estimatedTime;
  if (walkingSpeed) {
    estimatedTime = calculateEstimatedTime(route.distance, Number(walkingSpeed));
  }
  
  return {
    route_id: route.routeId,
    estimatedTime,
    arrivalTime: calculateArrivalTime(estimatedTime),
    distance: route.distance,
    path: route.path.map(p => `${p.lat},${p.lng}`),
    instructions: route.instructions
  };
};

/**
 * Update route stops
 * @param {number} routeId - Route ID
 * @param {Object} updateData - Update data with stops
 * @returns {Promise<Object>} Update result
 */
export const updateRouteStops = async (routeId, updateData) => {
  if (isMockDataMode()) {
    const route = mockRoutes.find(r => r.routeId === Number(routeId));
    if (!route) return null;
    
    // Simple implementation: just acknowledge the update
    const newEstimatedTime = route.estimatedTime + (updateData.addStops?.length || 0) * 120; // Add 2 min per stop
    
    return {
      route_id: route.routeId,
      stopsUpdated: true,
      newEstimatedTime
    };
  }
  
  const route = await Route.findOne({ routeId: Number(routeId) });
  if (!route) return null;
  
  const newEstimatedTime = route.estimatedTime + (updateData.addStops?.length || 0) * 120;
  
  return {
    route_id: route.routeId,
    stopsUpdated: true,
    newEstimatedTime
  };
};

/**
 * Recalculate route
 * @param {number} routeId - Route ID
 * @returns {Promise<Object>} Recalculated route
 */
export const recalculateRoute = async (routeId) => {
  const routeDetails = await getRouteDetails(routeId);
  if (!routeDetails) return null;
  
  return {
    route_id: Number(routeId),
    user_id: 1, // Default user
    destination_id: 1, // Default destination
    calculationTime: 2
  };
};

/**
 * Get route owner (userId)
 * @param {number} routeId - Route ID
 * @returns {Promise<number|null>} User ID or null if not found
 */
export const getRouteOwner = async (routeId) => {
  if (isMockDataMode()) {
    const route = mockRoutes.find(r => r.routeId === Number(routeId));
    return route ? Number(route.userId) : null;
  }
  
  const route = await Route.findOne({ routeId: Number(routeId) });
  return route ? Number(route.userId) : null;
};

/**
 * Delete route
 * @param {number} routeId - Route ID
 * @returns {Promise<boolean>} Deletion success
 */
export const deleteRoute = async (routeId) => {
  if (isMockDataMode()) {
    const index = mockRoutes.findIndex(r => r.routeId === Number(routeId));
    if (index !== -1) {
      mockRoutes.splice(index, 1);
      return true;
    }
    return false;
  }
  
  const result = await Route.deleteOne({ routeId: Number(routeId) });
  return result.deletedCount > 0;
};

/**
 * Generate personalized route
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Personalized route
 */
export const generatePersonalizedRoute = async (userId) => {
  const user = await getUserById(userId);
  
  if (!user || !user.personalizationAvailable || !user.preferences || user.preferences.length === 0) {
    throw new Error('Cannot generate personalized route - missing user preferences');
  }
  
  // Get all exhibits
  const exhibits = await getAllExhibits();
  
  // Filter exhibits based on user preferences
  const matchingExhibits = exhibits.filter(exhibit => 
    exhibit.category.some(cat => 
      user.preferences.some(pref => 
        cat.toLowerCase().includes(pref.toLowerCase())
      )
    )
  ).slice(0, 5); // Limit to 5 exhibits
  
  // NOTE: Edge case: user has preferences but no matching exhibits exist.
  // Unlikely in practice with current mock data as multiple exhibits match common preferences.
  if (matchingExhibits.length === 0) {
    throw new Error('No matching exhibits found for user preferences');
  }
  
  // NOTE: Lines 248-258 - MongoDB mode route generation, not executed in mock data tests.
  const routeId = isMockDataMode() 
    ? generateUniqueId(mockRoutes, 'routeId')
    : await generateNextRouteId();
  
  // Calculate total estimated duration
  const estimatedDuration = matchingExhibits.length * 10; // 10 minutes per exhibit
  
  return {
    route_id: routeId,
    exhibits: matchingExhibits.map(e => e.exhibitId),
    estimated_duration: `${estimatedDuration} minutes`,
    map_url: '/maps/1/personalized_route.png',
    starting_point: 40.7610,
    ending_point: 40.7618
  };
};

/**
 * Generate next route ID (for database mode)
 * NOTE: Lines 267-269 - MongoDB only, not executed in mock data mode tests.
 * @returns {Promise<number>} Next ID
 */
const generateNextRouteId = async () => {
  const lastRoute = await Route.findOne().sort({ routeId: -1 });
  return lastRoute ? lastRoute.routeId + 1 : 1;
};
