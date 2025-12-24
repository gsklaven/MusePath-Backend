/**
 * Middleware Exports
 * 
 * Centralizes all middleware imports/exports to provide a single entry point.
 * This simplifies imports in the main application file.
 */

// Third-party middleware
export { default as cors } from 'cors';
export { default as helmet } from 'helmet';
export { default as compression } from 'compression';
export { default as rateLimit } from 'express-rate-limit';
export { default as cookieParser } from 'cookie-parser';
export { default as mongoSanitize } from 'express-mongo-sanitize';

// Custom middleware
export { errorHandler, notFoundHandler } from './errorHandler.js';
export { getLogger } from './logger.js';