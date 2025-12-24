/**
 * Mock Data for MusePath Backend
 *
 * Purpose:
 * - Provide deterministic in-memory data for tests and local development
 * - Mirror key fields and shapes used by the MongoDB models so services
 *   and controllers can operate transparently in "mock mode"
 *
 * Notes:
 * - Keep this file minimal and representative; tests rely on stable IDs.
 * - When adding new fields, update services that read mock objects.
 */

export * from './mockUsers.js';
export * from './mockExhibits.js';
export * from './mockMaps.js';
export * from './mockDestinations.js';
export * from './mockCoordinates.js';
export * from './mockRoutes.js';
export * from './mockNotifications.js';
