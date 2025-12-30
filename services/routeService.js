import { isMockDataMode } from '../config/database.js';
import { mockRoutes } from '../data/mockData.js';
import Route from '../models/Route.js';
import { DEFAULT_WALKING_SPEED } from '../config/constants.js';

import * as services from './index.js';
import * as helpers from '../utils/helpers.js';

/**
 * Route Service
 * This service encapsulates the business logic for creating, retrieving, and managing routes within the application.
 * It handles both standard and personalized route calculations.
 */

/**
 * Calculates a new route based on a user's starting location and a desired destination.
 *
 * @param {object} routeData - The necessary data to calculate the route.
 * @param {number} routeData.user_id - The ID of the user requesting the route.
 * @param {number} routeData.destination_id - The ID of the destination.
 * @param {number} routeData.startLat - The starting latitude.
 * @param {number} routeData.startLng - The starting longitude.
 * @returns {Promise<object>} A promise that resolves to a summary of the calculated route.
 * @throws {Error} If the destination is not found.
 */
export const calculateRoute = async (routeData) => {
  const { user_id, destination_id, startLat, startLng } = routeData;
  
  // Fetch the destination details to get its coordinates.
  const destination = await services.getDestinationById(destination_id);
  if (!destination) {
    throw new Error('Destination not found');
  }
  
  const startTime = Date.now();
  
  // Calculate the geographical distance between the start and end points.
  const distance = helpers.calculateDistance(
    startLat, 
    startLng, 
    destination.coordinates.lat, 
    destination.coordinates.lng
  );
  
  // Estimate the travel time based on the distance and a default walking speed.
  const estimatedTime = helpers.calculateEstimatedTime(distance, DEFAULT_WALKING_SPEED);
  
  // Generate a unique ID for the new route.
  const routeId = isMockDataMode() 
    ? helpers.generateUniqueId(mockRoutes, 'routeId')
    : await generateNextRouteId();
  
  // Construct the new route object with all calculated details.
  const newRoute = {
    routeId,
    userId: Number(user_id),
    destinationId: Number(destination_id),
    startCoordinates: { lat: startLat, lng: startLng },
    endCoordinates: destination.coordinates,
    path: helpers.generatePath({ lat: startLat, lng: startLng }, destination.coordinates),
    instructions: helpers.generateInstructions(distance),
    stops: [],
    distance: Math.round(distance * 10) / 10,
    estimatedTime,
    arrivalTime: helpers.calculateArrivalTime(estimatedTime),
    calculationTime: Math.round((Date.now() - startTime) / 1000),
    isPersonalized: false,
    mapUrl: '/maps/1/route.png', // A mock URL for the map visual.
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Save the new route to the appropriate data store.
  if (isMockDataMode()) {
    mockRoutes.push(newRoute);
  } else {
    const route = new Route(newRoute);
    await route.save();
  }
  
  // Return a summary of the created route.
  return {
    route_id: routeId,
    user_id: Number(user_id),
    destination_id: Number(destination_id),
    calculationTime: newRoute.calculationTime
  };
};

/**
 * Retrieves the details of a specific route.
 * Optionally recalculates the estimated time based on a provided walking speed.
 *
 * @param {number} routeId - The ID of the route to retrieve.
 * @param {number} [walkingSpeed] - An optional walking speed in km/h to adjust the time estimate.
 * @returns {Promise<object|null>} A promise that resolves to the route details, or null if not found.
 */
export const getRouteDetails = async (routeId, walkingSpeed) => {
  let route;
  if (isMockDataMode()) {
    // --- MOCK DATA MODE ---
    route = mockRoutes.find(r => r.routeId === Number(routeId));
  } else {
    // --- MONGODB MODE ---
    route = await Route.findOne({ routeId: Number(routeId) });
  }

  if (!route) return null;
  
  let estimatedTime = route.estimatedTime;
  // If a custom walking speed is provided, recalculate the estimated travel time.
  if (walkingSpeed) {
    estimatedTime = helpers.calculateEstimatedTime(route.distance, Number(walkingSpeed));
  }
  
  // Format and return the public-facing route details.
  return {
    route_id: route.routeId,
    estimatedTime,
    arrivalTime: helpers.calculateArrivalTime(estimatedTime),
    distance: route.distance,
    path: route.path.map(p => `${p.lat},${p.lng}`),
    instructions: route.instructions
  };
};

/**
 * Updates a route to include additional stops.
 * NOTE: This is a simplified implementation for demonstration purposes.
 *
 * @param {number} routeId - The ID of the route to update.
 * @param {object} updateData - The data for the update, including stops to add.
 * @param {Array} [updateData.addStops] - An array of stops to add to the route.
 * @returns {Promise<object|null>} A promise resolving to the result of the update, or null if the route is not found.
 */
export const updateRouteStops = async (routeId, updateData) => {
  const route = isMockDataMode()
    ? mockRoutes.find(r => r.routeId === Number(routeId))
    : await Route.findOne({ routeId: Number(routeId) });

  if (!route) return null;
  
  // A simple calculation to adjust estimated time. A real implementation would be more complex.
  const newEstimatedTime = route.estimatedTime + (updateData.addStops?.length || 0) * 120; // Adds 2 minutes per stop.
  
  return {
    route_id: route.routeId,
    stopsUpdated: true,
    newEstimatedTime
  };
};

/**
 * Recalculates an existing route.
 * NOTE: This is a stub function. A real implementation would perform a full recalculation.
 *
 * @param {number} routeId - The ID of the route to recalculate.
 * @returns {Promise<object|null>} A promise that resolves to the recalculated route summary, or null if the original route is not found.
 */
export const recalculateRoute = async (routeId) => {
  const routeDetails = await getRouteDetails(routeId);
  if (!routeDetails) return null;
  
  // This implementation returns a simplified, hardcoded response.
  return {
    route_id: Number(routeId),
    user_id: 1, // Default user
    destination_id: 1, // Default destination
    calculationTime: 2 // A static calculation time.
  };
};

/**
 * Retrieves the user ID of the owner of a given route.
 *
 * @param {number} routeId - The ID of the route.
 * @returns {Promise<number|null>} A promise that resolves to the user ID, or null if the route is not found.
 */
export const getRouteOwner = async (routeId) => {
  const route = isMockDataMode()
    ? mockRoutes.find(r => r.routeId === Number(routeId))
    : await Route.findOne({ routeId: Number(routeId) });
  
  return route ? Number(route.userId) : null;
};

/**
 * Deletes a route from the system.
 *
 * @param {number} routeId - The ID of the route to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deletion was successful, false otherwise.
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
 * Generates a personalized route for a user based on their preferences.
 * The route includes exhibits that match the user's preferred categories.
 *
 * @param {number} userId - The ID of the user for whom to generate the route.
 * @returns {Promise<object>} A promise that resolves to the personalized route object.
 * @throws {Error} If the user has no preferences or if no matching exhibits can be found.
 */
export const generatePersonalizedRoute = async (userId) => {
  const user = await services.getUserById(userId);
  
  // Ensure the user exists and has preferences set for personalization.
  if (!user || !user.personalizationAvailable || !user.preferences || user.preferences.length === 0) {
    throw new Error('Cannot generate personalized route - missing user preferences');
  }
  
  const exhibits = await services.getAllExhibits();
  
  // Filter exhibits to find those that match the user's preferences.
  const matchingExhibits = exhibits.filter(exhibit => 
    exhibit.category.some(cat => 
      user.preferences.some(pref => 
        cat.toLowerCase().includes(pref.toLowerCase())
      )
    )
  ).slice(0, 5); // Limit the number of stops to a reasonable amount.
  
  // Handle the edge case where no exhibits match the user's preferences.
  if (matchingExhibits.length === 0) {
    throw new Error('No matching exhibits found for user preferences');
  }
  
  const routeId = isMockDataMode() 
    ? helpers.generateUniqueId(mockRoutes, 'routeId')
    : await generateNextRouteId();
  
  // Calculate a simple estimated duration for the personalized tour.
  const estimatedDuration = matchingExhibits.length * 10; // e.g., 10 minutes per exhibit.
  
  return {
    route_id: routeId,
    exhibits: matchingExhibits.map(e => e.exhibitId),
    estimated_duration: `${estimatedDuration} minutes`,
    map_url: '/maps/1/personalized_route.png',
    starting_point: 40.7610, // Example coordinate
    ending_point: 40.7618    // Example coordinate
  };
};

/**
 * Generates the next sequential route ID for a new route in the database.
 * This is only used when not in mock data mode.
 *
 * @returns {Promise<number>} The next available route ID.
 */
const generateNextRouteId = async () => {
  // Find the last route and increment its ID.
  const lastRoute = await Route.findOne().sort({ routeId: -1 });
  return lastRoute ? lastRoute.routeId + 1 : 1;
};
